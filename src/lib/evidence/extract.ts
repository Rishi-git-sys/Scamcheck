// ==============================================================================
// Evidence Extraction — deterministic regex-based extraction from raw text
// Upgraded in Phase 17 for advanced entity & offer-letter intelligence
// ==============================================================================

import {
  EvidenceType,
  OpportunityEvidence,
  EvidenceSourceType,
  EvidenceExtractionResult,
  EvidenceQuality,
} from "./types";
import { cleanOcrText } from "./ocr-clean";

// ─── Regex Patterns ────────────────────────────────────────────────────────────

const EMAIL_REGEX = /\b[a-zA-Z0-9._%+\-]+@(?:[a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,10}\b/g;

// Phone: international (+91...) or 10-digit
const PHONE_REGEX = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3,5}\)?[\s.-]?)(?:\d{3,4}[\s.-]?\d{3,4})/g;

// URLs
const URL_REGEX = /https?:\/\/[^\s"'<>)\]]+/g;

// Telegram: @username (not part of an email address)
const TELEGRAM_REGEX = /(?:^|[\s,;:(])@([A-Za-z0-9_]{4,32})\b/g;

// UPI ID pattern: string@bank
const UPI_REGEX = /\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b/g;

// ─── Payment Phrases & Fee Types ─────────────────────────────────────────────

const STRONG_PAYMENT_PHRASES = [
  "registration fee",
  "application fee",
  "processing fee",
  "security deposit",
  "training fee",
  "pay to apply",
  "payment required",
  "pay before joining",
  "deposit required",
  "wire transfer",
  "pay ₹",
  "pay rs.",
  "pay rs ",
  "₹999",
  "₹500",
  "₹1000",
  "₹2000",
  "₹1,000",
  "₹2,000",
  "₹5,000",
  "refundable deposit",
  "refundable registration fee",
  "non-refundable",
];

const PAYMENT_AMOUNT_PATTERNS = [
  /₹\s?([\d,]+)/i,
  /rs\.?\s?([\d,]+)/i,
  /\$\s?([\d,]+)/i,
  /([\d,]+)\s*(?:inr|rupees)/i,
];

// ─── Urgency Phrases ─────────────────────────────────────────────────────────

const URGENCY_PHRASES = [
  "limited seats",
  "act now",
  "apply immediately",
  "urgent hiring",
  "last chance",
  "offer expires",
  "only today",
  "today only",
  "hurry",
  "fast cash",
  "limited time",
  "immediate joining",
  "limited vacancies",
];

// ─── Evidence Type Keywords ──────────────────────────────────────────────────

const OFFER_LETTER_PATTERNS = [
  "offer letter",
  "you have been selected",
  "congratulations",
  "we are pleased to offer",
  "pleased to inform you",
  "selected for the position",
  "joining date",
  "date of joining",
  "offer of employment",
  "appointment letter",
  "terms of employment",
];

const INTERNSHIP_PATTERNS = [
  "internship",
  "intern",
  "stipend",
  "training program",
  "summer program",
  "winter internship",
  "project-based",
];

const JOB_PATTERNS = [
  "full-time",
  "full time",
  "job opening",
  "job opportunity",
  "we are hiring",
  "immediate opening",
  "ctc",
  "annual package",
  "lpa",
  "we are looking for",
  "job description",
  "permanent position",
];

const RECRUITER_MESSAGE_PATTERNS = [
  "contact me",
  "contact us on telegram",
  "contact us on whatsapp",
  "message me",
  "dm me",
  "dm us",
  "reach out",
  "respond to this",
  "reply to this",
  "hr team",
  "recruiter",
  "our team will reach",
];

const COMPANY_PATTERNS = [
  "company profile",
  "about us",
  "our services",
  "established in",
  "founded in",
  "headquartered",
  "our team",
  "our mission",
];

// ─── Job Title / Role Patterns ────────────────────────────────────────────────

const JOB_TITLE_LABEL_PATTERNS = [
  /\b(?:role|job|position|internship|vacancy|opening|designation|hiring for|looking for)\s*[:\-]\s*([^\r\n]{2,60})/i,
  /\b(?:as a|as an)\s+([A-Z][A-Za-z\/\s\-]{2,40})/i,
  /\b([A-Z][A-Za-z\/\s\-]{2,40}\s+(?:intern|developer|engineer|analyst|manager|designer|associate|executive|consultant|specialist))\b/i,
];

// ─── Salary / Stipend Patterns ────────────────────────────────────────────────

const SALARY_PATTERNS = [
  /(?:salary|ctc|package|compensation)\s*[:\-]?\s*([^\r\n]{1,40})/i,
  /₹\s?[\d,\.]+(?:\s*(?:per month|per annum|\/month|lpa|lakhs?))?/i,
  /\$\s?[\d,\.]+(?:\s*(?:per month|per hour|per week|per year))?/i,
  /(?:stipend)\s*[:\-]?\s*([^\r\n]{1,40})/i,
];

// ─── Company Name Patterns ────────────────────────────────────────────────────

const COMPANY_NAME_PATTERNS = [
  /\b(?:company|organization|employer|firm)\s*[:\-]\s*([^\r\n]{1,60})/i,
  /\bat\s+([A-Z][A-Za-z0-9\s&\-\.]{1,50}?)(?:\s*[,\.\(]|\r?\n|$)/,
  /\bfrom\s+([A-Z][A-Za-z0-9\s&\-\.]{1,50}?)(?:\s*[,\.\(]|\r?\n|$)/,
  /([A-Z][A-Za-z0-9\s&\-\.]{1,50}?)\s+is\s+hiring/i,
  /([A-Z][A-Za-z0-9\s&\-\.]{1,50}?)\s+(?:pvt|ltd|llc|inc|limited|technologies|tech|solutions|corp)/i,
];

// ─── Recruiter Name Patterns ──────────────────────────────────────────────────

const RECRUITER_NAME_PATTERNS = [
  /\b(?:recruiter|hr|contact person)\s*[:\-]\s*([^\r\n]{2,40})/i,
  /\bmy name is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
  /\bI am\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s+(?:HR|recruiter|hiring)/i,
  /\b(?:regards|sincerely|best regards)\s*,\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
];

// ─── Offer Letter Specific Patterns ──────────────────────────────────────────

const JOINING_DATE_PATTERNS = [
  /(?:date of joining|joining date|start date|commencement date)\s*[:\-]?\s*([^\r\n,]{4,35})/i,
  /(?:report on|join on|start on)\s+([A-Za-z0-9\s,]{4,30})/i,
];

const WORK_LOCATION_PATTERNS = [
  /(?:work location|location|place of work|base location)\s*[:\-]?\s*([^\r\n,]{2,40})/i,
  /\b(remote|work from home|hybrid|on-site|onsite)\b/i,
];

const CANDIDATE_NAME_PATTERNS = [
  /\b(?:dear|to|candidate)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
  /\bcongratulations\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractAll(regex: RegExp, text: string): string[] {
  const flags = regex.flags.includes("g") ? regex.flags : regex.flags + "g";
  const re = new RegExp(regex.source, flags);
  const matches = text.match(re);
  return matches ? Array.from(new Set(matches)) : [];
}

function lc(text: string): string {
  return text.toLowerCase();
}

// ─── Evidence Type Classification ────────────────────────────────────────────

function classifyEvidenceType(text: string): EvidenceType {
  const lower = lc(text);

  const offerScore = OFFER_LETTER_PATTERNS.filter((p) => lower.includes(p)).length;
  const internshipScore = INTERNSHIP_PATTERNS.filter((p) => lower.includes(p)).length;
  const jobScore = JOB_PATTERNS.filter((p) => lower.includes(p)).length;
  const recruiterScore = RECRUITER_MESSAGE_PATTERNS.filter((p) => lower.includes(p)).length;
  const companyScore = COMPANY_PATTERNS.filter((p) => lower.includes(p)).length;

  const scores: [EvidenceType, number][] = [
    ["offer_letter", offerScore * 3],
    ["internship", internshipScore * 2],
    ["job", jobScore * 2],
    ["recruiter_message", recruiterScore * 1],
    ["company", companyScore * 1],
  ];

  scores.sort((a, b) => b[1] - a[1]);

  const top = scores[0];
  if (top[1] === 0) return "unknown";

  return top[0];
}

// ─── Contact Method Detection ─────────────────────────────────────────────────

function detectContactMethod(text: string): string | undefined {
  const lower = lc(text);
  if (lower.includes("telegram")) return "Telegram";
  if (lower.includes("whatsapp")) return "WhatsApp";
  if (lower.includes("linkedin")) return "LinkedIn";
  if (lower.includes("discord")) return "Discord";
  if (lower.includes("instagram")) return "Instagram";
  if (lower.includes("facebook")) return "Facebook";
  if (lower.includes("phone") || lower.includes("call us") || lower.includes("call me") || lower.includes("sms")) return "Phone";
  if (lower.includes("gmail") || lower.includes("email") || lower.includes("mail us") || lower.includes("mail me")) return "Email";
  return undefined;
}

// ─── Salary Extraction ─────────────────────────────────────────────────────────

function extractSalary(text: string): { salaryText?: string; stipendText?: string } {
  for (const pattern of SALARY_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const val = match[0].trim();
      if (lc(text).includes("stipend")) return { stipendText: val };
      return { salaryText: val };
    }
  }
  return {};
}

// ─── Payment Amount & Fee Type Extraction ────────────────────────────────────

export function extractPaymentAmount(text: string): string | undefined {
  const lower = lc(text);
  const hasPaymentContext =
    STRONG_PAYMENT_PHRASES.some((p) => lower.includes(p)) ||
    ["fee", "pay", "charge", "deposit", "cost", "price"].some((w) => lower.includes(w));

  if (!hasPaymentContext) return undefined;

  for (const pattern of PAYMENT_AMOUNT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  return undefined;
}

function extractPaymentFeeType(text: string): string | undefined {
  const lower = lc(text);
  if (lower.includes("registration fee")) return "registration";
  if (lower.includes("processing fee") || lower.includes("processing charge")) return "processing";
  if (lower.includes("security deposit")) return "security deposit";
  if (lower.includes("training fee")) return "training";
  if (lower.includes("application fee")) return "application";
  return undefined;
}

// ─── Company Name Extraction ─────────────────────────────────────────────────

function extractCompanyName(text: string): string | undefined {
  for (const pattern of COMPANY_NAME_PATTERNS) {
    const match = pattern.exec(text);
    if (match?.[1]) {
      const name = match[1].trim();
      const skipWords = ["the", "a", "an", "our", "we", "this", "that", "your", "my"];
      if (name.length >= 2 && !skipWords.includes(lc(name))) {
        return name;
      }
    }
  }
  return undefined;
}

// ─── Job Title Extraction ─────────────────────────────────────────────────────

function extractJobTitle(text: string): string | undefined {
  for (const pattern of JOB_TITLE_LABEL_PATTERNS) {
    const match = pattern.exec(text);
    if (match?.[1]) {
      const title = match[1].trim().replace(/\s+/g, " ");
      if (title.length >= 3 && title.length <= 60) return title;
    }
  }
  return undefined;
}

// ─── Recruiter Name Extraction ────────────────────────────────────────────────

function extractRecruiterName(text: string): string | undefined {
  for (const pattern of RECRUITER_NAME_PATTERNS) {
    const match = pattern.exec(text);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

// ─── Offer Letter Entities Extraction ────────────────────────────────────────

function extractOfferLetterEntities(text: string) {
  let joiningDate: string | undefined;
  for (const p of JOINING_DATE_PATTERNS) {
    const match = p.exec(text);
    if (match?.[1]) {
      joiningDate = match[1].trim();
      break;
    }
  }

  let workLocation: string | undefined;
  for (const p of WORK_LOCATION_PATTERNS) {
    const match = p.exec(text);
    if (match?.[1]) {
      workLocation = match[1].trim();
      break;
    }
  }

  let candidateName: string | undefined;
  for (const p of CANDIDATE_NAME_PATTERNS) {
    const match = p.exec(text);
    if (match?.[1]) {
      const cand = match[1].trim();
      if (!["applicant", "sir", "madam", "team", "all"].includes(cand.toLowerCase())) {
        candidateName = cand;
        break;
      }
    }
  }

  return { joiningDate, workLocation, candidateName };
}

// ─── Suspicious Phrase Detection ─────────────────────────────────────────────

function detectSuspiciousPhrases(text: string): string[] {
  const lower = lc(text);
  const found: string[] = [];

  for (const phrase of [...STRONG_PAYMENT_PHRASES, ...URGENCY_PHRASES]) {
    if (lower.includes(phrase)) found.push(phrase);
  }

  return Array.from(new Set(found));
}

// ─── Payment Detection ────────────────────────────────────────────────────────

function detectPaymentRequested(text: string): boolean | null {
  const lower = lc(text);

  // Check for explicit negation: "no registration fee", "no fee is required", "no payment required", etc.
  const negationPatterns = [
    /no\s+(?:registration|processing|application|training)?\s*(?:fee|payment|deposit|charge)s?\s*(?:is|are)?\s*(?:required|needed|mandatory|asked)/i,
    /no\s+(?:fee|payment|charge)s?\s*(?:is|are)?\s*required/i,
    /without\s+(?:any\s+)?(?:fee|payment|charge|cost)/i,
    /free\s+of\s+(?:charge|cost)/i,
    /zero\s+(?:fee|cost|charges)/i,
  ];

  const isNegated = negationPatterns.some((pattern) => pattern.test(lower));
  if (isNegated) {
    return false;
  }

  const strongSignals = STRONG_PAYMENT_PHRASES.filter((p) => lower.includes(p));
  if (strongSignals.length >= 1) return true;

  const ambiguousSignals = ["payment", "fee", "money", "transfer", "amount"];
  const ambiguous = ambiguousSignals.filter((p) => lower.includes(p));
  if (ambiguous.length >= 2) return null;

  return false;
}

// ─── Evidence Quality Calculation ────────────────────────────────────────────

function calculateEvidenceQuality(
  text: string,
  definedFieldsCount: number,
  ocrConfidence?: number
): EvidenceQuality {
  const cleanLen = text.replace(/[\s\p{P}]/gu, "").length;

  if (cleanLen < 15 || (definedFieldsCount === 0 && cleanLen < 40)) {
    return "insufficient";
  }

  if (ocrConfidence !== undefined && ocrConfidence < 40) {
    return "low";
  }

  if (definedFieldsCount >= 3 && cleanLen >= 80) {
    return "high";
  }

  if (definedFieldsCount >= 1 || cleanLen >= 40) {
    return "medium";
  }

  return "low";
}

// ─── Main Extraction Function ────────────────────────────────────────────────

export function extractEvidenceFromText(
  rawText: string,
  sourceType: EvidenceSourceType = "text",
  ocrConfidence?: number
): EvidenceExtractionResult {
  const { cleanedText } = cleanOcrText(rawText);
  const text = cleanedText.trim();

  if (!text || text.length < 5) {
    return {
      evidence: {
        sourceType,
        evidenceType: "unknown",
        rawText: text,
        evidenceQuality: "insufficient",
      },
      notes: ["Input text is empty or too short for analysis."],
    };
  }

  const notes: string[] = [];

  // Extract structured contact entities
  const emails = extractAll(EMAIL_REGEX, text);
  const recruiterEmail = emails.length > 0 ? emails[0] : undefined;

  const phones = extractAll(PHONE_REGEX, text).filter((p) => p.replace(/\D/g, "").length >= 10);
  const phoneNumber = phones.length > 0 ? phones[0] : undefined;

  const detectedUrls = extractAll(URL_REGEX, text);
  const linkedinUrl = detectedUrls.find((u) => u.toLowerCase().includes("linkedin.com/in/"));

  // Extract Telegram handles (ignoring email domain matches)
  const telegramMatches = Array.from(text.matchAll(TELEGRAM_REGEX))
    .map((m) => m[1])
    .filter((username) => !emails.some((email) => email.toLowerCase().includes("@" + username.toLowerCase())));
  const telegramUsername = telegramMatches.length > 0 ? telegramMatches[0] : undefined;

  // Extract UPI handles
  const upiMatches = extractAll(UPI_REGEX, text).filter(
    (u) =>
      !emails.includes(u) &&
      (u.includes("@ok") || u.includes("@upi") || u.includes("@paytm") || u.includes("@ybl") || u.includes("@ibl"))
  );
  const upiId = upiMatches.length > 0 ? upiMatches[0] : undefined;

  // Extract job/internship details
  const companyName = extractCompanyName(text);
  const jobTitle = extractJobTitle(text);
  const recruiterName = extractRecruiterName(text);
  const { salaryText, stipendText } = extractSalary(text);
  const contactMethod = detectContactMethod(text);

  // Extract Offer Letter specifics
  const { joiningDate, workLocation, candidateName } = extractOfferLetterEntities(text);

  // Payment detection
  const paymentRequested = detectPaymentRequested(text);
  const paymentAmount = extractPaymentAmount(text);
  const paymentFeeType = extractPaymentFeeType(text);

  // Suspicious phrases
  const suspiciousPhrases = detectSuspiciousPhrases(text);

  // Evidence type
  const evidenceType = classifyEvidenceType(text);

  // Count defined fields for quality scoring
  const definedFields = [
    companyName,
    jobTitle,
    recruiterEmail,
    phoneNumber,
    telegramUsername,
    salaryText || stipendText,
    paymentRequested === true ? "payment" : undefined,
    joiningDate,
  ].filter(Boolean);

  const evidenceQuality = calculateEvidenceQuality(text, definedFields.length, ocrConfidence);

  const extractionConfidence: "high" | "medium" | "low" =
    definedFields.length >= 3 ? "high" : definedFields.length >= 1 ? "medium" : "low";

  if (evidenceType === "offer_letter") {
    notes.push("Document classified as an offer or selection letter.");
  }
  if (paymentRequested) {
    notes.push(`Payment request identified${paymentAmount ? ` (${paymentAmount})` : ""}.`);
  }
  if (telegramUsername) {
    notes.push(`Telegram handle @${telegramUsername} detected as contact channel.`);
  }

  const evidence: OpportunityEvidence = {
    sourceType,
    evidenceType,
    rawText: text,
    companyName,
    jobTitle,
    recruiterName,
    recruiterEmail,
    phoneNumber,
    telegramUsername,
    linkedinUrl,
    upiId,
    salaryText,
    stipendText,
    paymentRequested,
    paymentAmount,
    paymentFeeType,
    contactMethod,
    candidateName,
    joiningDate,
    workLocation,
    detectedUrls,
    suspiciousPhrases,
    extractionConfidence,
    evidenceQuality,
    ocrConfidence,
  };

  return { evidence, notes };
}
