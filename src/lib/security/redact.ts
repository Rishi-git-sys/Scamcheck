// ==============================================================================
// Sensitive Data Redaction Utility
// Redacts Aadhaar, PAN, Bank Accounts, UPI PINs, CVV, OTP, and Passwords
// ==============================================================================

export interface RedactionResult {
  redactedText: string;
  hasRedactions: boolean;
  redactedCategories: string[];
}

// Patterns for sensitive financial & identity identifiers
const SENSITIVE_PATTERNS: { name: string; regex: RegExp; replacement: string }[] = [
  // 1. Aadhaar Number (12 digits, space/hyphen separated or continuous)
  {
    name: "Aadhaar",
    regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    replacement: "[REDACTED-AADHAAR]",
  },
  // 2. PAN Card (5 letters, 4 digits, 1 letter)
  {
    name: "PAN",
    regex: /\b[A-Z]{5}\d{4}[A-Z]\b/gi,
    replacement: "[REDACTED-PAN]",
  },
  // 3. Indian / International Bank Account Numbers (9 to 18 continuous digits in banking context)
  {
    name: "Bank Account",
    regex: /(?:account|acc|a\/c|acct)[\s#:.-]*(\d{9,18})\b/gi,
    replacement: "account: [REDACTED-ACCOUNT-NUMBER]",
  },
  // 4. Credit / Debit Card Numbers (13 to 19 digits formatted or unformatted)
  {
    name: "Card Number",
    regex: /\b(?:\d{4}[-\s]?){3}\d{1,4}\b/g,
    replacement: "[REDACTED-CARD-NUMBER]",
  },
  // 5. CVV (3 or 4 digits near cvv/cvc keyword)
  {
    name: "CVV",
    regex: /(?:cvv|cvc|security code)[\s#:.-]*(\d{3,4})\b/gi,
    replacement: "CVV: [REDACTED-CVV]",
  },
  // 6. OTP / PIN (4 to 8 digit codes near otp/pin keyword)
  {
    name: "OTP/PIN",
    regex: /(?:otp|pin|passcode|verification code)[\s#:.-]*(\d{4,8})\b/gi,
    replacement: "OTP: [REDACTED-OTP]",
  },
  // 7. Passwords in clear text (e.g. password: xyz)
  {
    name: "Password",
    regex: /(?:password|passwd|pwd)[\s#:.-]*([^\s,;]+)/gi,
    replacement: "password: [REDACTED-PASSWORD]",
  },
];

/**
 * Redact sensitive identity and financial data from input text before passing to external AI or logging.
 */
export function redactSensitiveData(text: string): RedactionResult {
  if (!text || typeof text !== "string") {
    return { redactedText: "", hasRedactions: false, redactedCategories: [] };
  }

  let redacted = text;
  const categoriesFound = new Set<string>();

  for (const { name, regex, replacement } of SENSITIVE_PATTERNS) {
    const re = new RegExp(regex.source, regex.flags);
    if (re.test(redacted)) {
      categoriesFound.add(name);
      redacted = redacted.replace(re, replacement);
    }
  }

  return {
    redactedText: redacted,
    hasRedactions: categoriesFound.size > 0,
    redactedCategories: Array.from(categoriesFound),
  };
}

/**
 * Redacts an object containing arbitrary evidence fields.
 */
export function redactEvidenceObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;

  const result: any = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = redactSensitiveData(value).redactedText;
    } else if (value && typeof value === "object") {
      result[key] = redactEvidenceObject(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
