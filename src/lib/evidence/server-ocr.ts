// ==============================================================================
// Server-Side OCR Engine for ScamCheck
// Explicit absolute workerPath, corePath, local traineddata, and 20s timeout
// ==============================================================================

import path from "path";
import fs from "fs";
import { cleanOcrText } from "./ocr-clean";

export interface ServerOcrResult {
  extractedText: string;
  originalOcrText: string;
  confidence?: number;
  status: "processed" | "low_text" | "ocr_error" | "timeout";
  message?: string;
  meaningfulCharCount: number;
}

const OCR_TIMEOUT_MS = 20_000; // 20-second hard timeout

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
 * Validate image buffer magic bytes to ensure file is a valid image.
 */
export function validateImageBuffer(buffer: Buffer): { valid: boolean; format?: string; error?: string } {
  if (!buffer || buffer.length < 16) {
    return { valid: false, error: "The image file is empty or corrupted." };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { valid: true, format: "image/png" };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, format: "image/jpeg" };
  }

  // WEBP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer.length >= 12
  ) {
    const riffType = buffer.subarray(8, 12).toString("ascii");
    if (riffType === "WEBP") {
      return { valid: true, format: "image/webp" };
    }
  }

  // BMP: BM
  if (buffer[0] === 0x42 && buffer[1] === 0x4d) {
    return { valid: true, format: "image/bmp" };
  }

  return {
    valid: false,
    error: "This image format isn't supported. Please upload a PNG, JPG, JPEG, or WEBP image.",
  };
}

/**
 * Perform server-side OCR on an image buffer with explicit local paths and 20s timeout.
 */
export async function performServerOcr(
  imageBuffer: Buffer | ArrayBuffer | Uint8Array,
  mimeType?: string
): Promise<ServerOcrResult> {
  console.log("[OCR-WORKER-01] performServerOcr entered");

  const buf = Buffer.isBuffer(imageBuffer)
    ? imageBuffer
    : imageBuffer instanceof ArrayBuffer
    ? Buffer.from(imageBuffer)
    : Buffer.from(imageBuffer.buffer, imageBuffer.byteOffset, imageBuffer.byteLength);

  // Validate buffer magic bytes before calling Tesseract
  const validation = validateImageBuffer(buf);
  if (!validation.valid) {
    console.log("[OCR-WORKER] validation failed:", validation.error);
    return {
      extractedText: "",
      originalOcrText: "",
      status: "ocr_error",
      message: validation.error || "This image format isn't supported.",
      meaningfulCharCount: 0,
    };
  }

  console.log(`[OCR-WORKER] image validated (format: ${validation.format}, size: ${buf.length} bytes)`);

  let worker: any = null;
  let isTimedOut = false;

  const timeoutPromise = new Promise<ServerOcrResult>((resolve) => {
    const timer = setTimeout(() => {
      isTimedOut = true;
      console.error(`[OCR-WORKER] timeout triggered after ${OCR_TIMEOUT_MS}ms`);
      resolve({
        extractedText: "",
        originalOcrText: "",
        status: "timeout",
        message: "Screenshot analysis timed out. Please try again or paste the text manually.",
        meaningfulCharCount: 0,
      });
    }, OCR_TIMEOUT_MS);

    if (typeof timer.unref === "function") {
      timer.unref();
    }
  });

  const ocrExecutionPromise = (async (): Promise<ServerOcrResult> => {
    try {
      console.log("[OCR-WORKER-02] before createWorker");
      const { createWorker } = await import("tesseract.js");

      const cwd = process.cwd();
      const workerPath = path.resolve(cwd, "node_modules/tesseract.js/src/worker-script/node/index.js");
      const corePath = path.resolve(cwd, "node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js");
      const localTrainedData = path.resolve(cwd, "eng.traineddata");

      const workerOptions: any = {};
      if (fs.existsSync(workerPath)) {
        workerOptions.workerPath = workerPath;
      }
      if (fs.existsSync(corePath)) {
        workerOptions.corePath = corePath;
      }
      if (fs.existsSync(localTrainedData)) {
        workerOptions.langPath = cwd;
        workerOptions.cachePath = cwd;
        workerOptions.gzip = false;
      }

      worker = await createWorker("eng", 1, workerOptions);
      console.log("[OCR-WORKER-03] after createWorker");

      if (isTimedOut) {
        return {
          extractedText: "",
          originalOcrText: "",
          status: "timeout",
          message: "Screenshot analysis timed out.",
          meaningfulCharCount: 0,
        };
      }

      console.log("[OCR-WORKER-04] before worker.recognize");
      const ret = await worker.recognize(buf);
      console.log("[OCR-WORKER-05] after worker.recognize");

      const rawText = ret?.data?.text || "";
      const confidence = typeof ret?.data?.confidence === "number" ? Math.round(ret.data.confidence) : undefined;

      const cleanResult = cleanOcrText(rawText);

      // Check if meaningful text was recovered
      if (cleanResult.meaningfulCharCount < 10) {
        console.log(`[OCR-WORKER] low text detected (${cleanResult.meaningfulCharCount} meaningful chars)`);
        return {
          extractedText: cleanResult.cleanedText,
          originalOcrText: rawText,
          confidence,
          status: "low_text",
          message: "We couldn't extract enough text from this screenshot.",
          meaningfulCharCount: cleanResult.meaningfulCharCount,
        };
      }

      console.log(`[OCR-WORKER] success: ${cleanResult.meaningfulCharCount} meaningful characters extracted`);
      return {
        extractedText: cleanResult.cleanedText,
        originalOcrText: rawText,
        confidence,
        status: "processed",
        meaningfulCharCount: cleanResult.meaningfulCharCount,
      };
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err);
      console.error("[OCR-WORKER] error during execution:", errorMsg);

      return {
        extractedText: "",
        originalOcrText: "",
        status: "ocr_error",
        message: "Screenshot uploaded, but analysis failed. You can paste the text manually or try again.",
        meaningfulCharCount: 0,
      };
    } finally {
      if (worker) {
        try {
          console.log("[OCR-WORKER-06] before worker.terminate");
          await worker.terminate();
          console.log("[OCR-WORKER-07] after worker.terminate");
        } catch {
          // Ignore worker terminate cleanup errors
        }
      }
    }
  })();

  return Promise.race([ocrExecutionPromise, timeoutPromise]);
}
