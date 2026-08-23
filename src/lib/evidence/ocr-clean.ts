// ==============================================================================
// OCR Text Cleaning and Normalization
// Normalizes raw OCR output without destructive rewriting.
// Preserves emails, URLs, phone numbers, currency symbols, and Telegram handles.
// ==============================================================================

export interface OcrCleanResult {
  cleanedText: string;
  originalText: string;
  characterCount: number;
  wordCount: number;
  meaningfulCharCount: number;
}

/**
 * Normalizes raw OCR output:
 * - Strips non-printable control characters
 * - Normalizes line breaks (converts \r\n to \n, caps consecutive newlines to 2)
 * - Fixes common OCR email splits (e.g. "name @ domain . com" -> "name@domain.com")
 * - Fixes common OCR URL splits (e.g. "https : //" -> "https://")
 * - Normalizes spacing within lines while preserving indentation/line breaks
 * - Preserves currency symbols (₹, $, Rs., INR) and phone numbers
 */
export function cleanOcrText(rawText: string): OcrCleanResult {
  if (!rawText) {
    return {
      cleanedText: "",
      originalText: "",
      characterCount: 0,
      wordCount: 0,
      meaningfulCharCount: 0,
    };
  }

  let text = rawText;

  // 1. Remove non-printable control characters (except \n, \t, \r)
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");

  // 2. Standardize line endings
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 3. Fix common OCR artifacts around emails: "foo @ bar . com" -> "foo@bar.com"
  text = text.replace(
    /\b([a-zA-Z0-9._%+\-]+)\s*@\s*([a-zA-Z0-9\-]+)\s*\.\s*(com|org|net|edu|gov|io|in|co|ai|me|tech|dev|app|info|biz|online|[a-z]{2,4})\b/gi,
    "$1@$2.$3"
  );

  // 4. Fix common OCR artifacts around URLs: "https : / / " -> "https://"
  text = text.replace(/https?\s*:\s*\/\s*\/\s*/gi, (match) => {
    return match.toLowerCase().startsWith("https") ? "https://" : "http://";
  });

  // 5. Fix common OCR artifacts around Telegram handles: "@ username" -> "@username"
  text = text.replace(/@\s+([A-Za-z0-9_]{4,32})/g, "@$1");

  // 6. Fix common currency spacing: "₹ 999" -> "₹999", "Rs . 999" -> "Rs. 999"
  text = text.replace(/₹\s+(\d+)/g, "₹$1");
  text = text.replace(/Rs\s*\.\s*(\d+)/gi, "Rs. $1");

  // 7. Clean up per-line whitespace
  const lines = text.split("\n").map((line) => {
    // Replace multiple horizontal spaces/tabs with single space
    return line.replace(/[ \t]+/g, " ").trim();
  });

  // 8. Collapse 3+ consecutive empty lines into at most 2
  const cleanedLines: string[] = [];
  let emptyLineCount = 0;

  for (const line of lines) {
    if (line.length === 0) {
      emptyLineCount++;
      if (emptyLineCount <= 2) {
        cleanedLines.push("");
      }
    } else {
      emptyLineCount = 0;
      cleanedLines.push(line);
    }
  }

  const cleanedText = cleanedLines.join("\n").trim();
  const meaningfulChars = cleanedText.replace(/[\s\p{P}]/gu, "");
  const words = cleanedText.split(/\s+/).filter(Boolean);

  return {
    cleanedText,
    originalText: rawText,
    characterCount: cleanedText.length,
    wordCount: words.length,
    meaningfulCharCount: meaningfulChars.length,
  };
}
