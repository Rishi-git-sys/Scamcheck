// ==============================================================================
// Real Screenshot OCR & Client-side Preprocessing
// ==============================================================================

import { cleanOcrText } from "./ocr-clean";

export interface OcrProgress {
  status: string;
  progress: number; // 0 to 1
}

export interface ScreenshotOcrResult {
  extractedText: string;
  originalOcrText: string;
  confidence?: number;
  status: "processed" | "low_text" | "ocr_error" | "failed";
  message?: string;
  meaningfulCharCount: number;
}

/**
 * Safe error message normalizer to prevent undefined logs.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    if ("message" in error && typeof (error as any).message === "string") {
      return (error as any).message;
    }
    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown error object";
    }
  }
  return "Unknown OCR error";
}

/**
 * Validate a screenshot file before processing.
 */
export function validateScreenshotFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "Please select an image file." };
  }

  if (file.size === 0) {
    return { valid: false, error: "The selected file is empty. Please upload a valid image." };
  }

  const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

  const ext = file.name ? file.name.split(".").pop()?.toLowerCase() : "";
  const DISALLOWED_EXTENSIONS = ["svg", "pdf", "exe", "html", "htm", "xml", "js", "sh", "bat"];
  if (ext && DISALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: "SVG, PDF, executable, and script files are not permitted.",
    };
  }

  if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: "This image format isn't supported. Please upload a PNG, JPG, JPEG, or WEBP image.",
    };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: "Image is too large. Maximum allowed size is 5 MB.",
    };
  }

  return { valid: true };
}

/**
 * Client-side lightweight image preprocessing via Canvas.
 * - Resizes extremely large images (> 2000px) proportionally to improve OCR speed & memory.
 * - Applies grayscale and contrast adjustment for better OCR character recognition.
 */
export async function preprocessImage(imageFile: File | Blob): Promise<Blob> {
  // If not in browser environment (e.g. unit tests / SSR), return raw blob
  if (typeof window === "undefined" || typeof document === "undefined") {
    return imageFile;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(imageFile);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const maxDim = 2000;
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(imageFile);
        return;
      }

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Contrast & Grayscale optimization
      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const contrast = 1.15;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const adjusted = factor * (gray - 128) + 128;
          const clamped = Math.min(255, Math.max(0, adjusted));

          data[i] = clamped;
          data[i + 1] = clamped;
          data[i + 2] = clamped;
        }
        ctx.putImageData(imgData, 0, 0);
      } catch {
        // If image data manipulation fails (e.g. cross-origin/tainted), proceed with clean canvas
      }

      canvas.toBlob(
        (blob) => {
          resolve(blob || imageFile);
        },
        "image/png"
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(imageFile);
    };

    img.src = objectUrl;
  });
}

/**
 * Execute client-side OCR using Tesseract.js with full lifecycle cleanup and safe error handling.
 */
export async function performScreenshotOcr(
  imageSource: File | Blob | string,
  onProgress?: (progress: OcrProgress) => void
): Promise<ScreenshotOcrResult> {
  let worker: any = null;

  try {
    onProgress?.({ status: "Reading screenshot...", progress: 0.1 });

    const { createWorker } = await import("tesseract.js");

    onProgress?.({ status: "Initializing OCR engine...", progress: 0.25 });

    worker = await createWorker("eng", 1, {
      logger: (m: any) => {
        if (m.status === "recognizing text") {
          const p = 0.3 + (m.progress || 0) * 0.6;
          onProgress?.({ status: "Extracting text...", progress: Math.min(0.9, p) });
        }
      },
    });

    onProgress?.({ status: "Extracting text from image...", progress: 0.4 });

    const ret = await worker.recognize(imageSource);
    const rawText = ret?.data?.text || "";
    const confidence = typeof ret?.data?.confidence === "number" ? Math.round(ret.data.confidence) : undefined;

    onProgress?.({ status: "Analyzing evidence...", progress: 0.95 });

    const cleanResult = cleanOcrText(rawText);

    if (cleanResult.meaningfulCharCount < 10) {
      return {
        extractedText: cleanResult.cleanedText,
        originalOcrText: rawText,
        confidence,
        status: "low_text",
        message: "We couldn't extract enough text from this screenshot.",
        meaningfulCharCount: cleanResult.meaningfulCharCount,
      };
    }

    return {
      extractedText: cleanResult.cleanedText,
      originalOcrText: rawText,
      confidence,
      status: "processed",
      meaningfulCharCount: cleanResult.meaningfulCharCount,
    };
  } catch (err: unknown) {
    const errorMsg = getErrorMessage(err);
    console.error("[screenshot-ocr] OCR execution failed:", errorMsg);
    return {
      extractedText: "",
      originalOcrText: "",
      status: "ocr_error",
      message: "Screenshot analysis is temporarily unavailable. You can paste the text manually or try again.",
      meaningfulCharCount: 0,
    };
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // Ignore worker terminate errors
      }
    }
  }
}

/**
 * Backward-compatible wrapper for analyzeScreenshot.
 */
export async function analyzeScreenshot(imageSource: File | Blob | string) {
  return performScreenshotOcr(imageSource);
}
