// ==============================================================================
// OpportunityEvidence — the unified evidence structure for all input modes
// Extended in Phase 17 for advanced entity & offer-letter intelligence
// ==============================================================================

export type EvidenceSourceType = "url" | "screenshot" | "text";

export type EvidenceType =
  | "job"
  | "internship"
  | "offer_letter"
  | "recruiter_message"
  | "company"
  | "unknown";

export type EvidenceQuality = "high" | "medium" | "low" | "insufficient";

export interface OpportunityEvidence {
  sourceType: EvidenceSourceType;
  evidenceType: EvidenceType;

  rawText?: string;
  sourceUrl?: string;

  companyName?: string;
  jobTitle?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  phoneNumber?: string;
  whatsAppNumber?: string;
  telegramUsername?: string;
  linkedinUrl?: string;
  upiId?: string;
  salaryText?: string;
  stipendText?: string;
  paymentRequested?: boolean | null;
  paymentAmount?: string;
  paymentFeeType?: string; // e.g., 'registration', 'processing', 'security deposit', 'training'
  contactMethod?: string;
  jobDescription?: string;

  // Offer Letter specific structured fields
  candidateName?: string;
  joiningDate?: string;
  workLocation?: string;
  department?: string;
  documentsRequested?: string[];
  clauses?: string[];

  detectedUrls?: string[];
  suspiciousPhrases?: string[];

  // Extraction & OCR metadata
  extractionConfidence?: "high" | "medium" | "low";
  evidenceQuality?: EvidenceQuality;
  ocrConfidence?: number;
}

export interface EvidenceExtractionResult {
  evidence: OpportunityEvidence;
  notes: string[];
}
