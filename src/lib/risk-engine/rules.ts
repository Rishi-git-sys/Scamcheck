import { OpportunityInput, RiskSignal } from "./types";

export interface EvaluatedRuleResult {
  signal?: RiskSignal;
  recommendation?: string;
}

// 1. Payment requested rule
export function checkPaymentRequested(input: OpportunityInput): EvaluatedRuleResult {
  if (input.paymentRequested === true) {
    return {
      signal: {
        id: "payment-requested",
        title: "Payment requested",
        description:
          "The opportunity appears to require payment before employment or internship placement.",
        severity: "high",
        points: 35,
      },
      recommendation: "Do not pay registration, training, processing, or security fees for an opportunity.",
    };
  }
  return {};
}

// 2. Telegram recruitment rule
export function checkTelegramRecruitment(input: OpportunityInput): EvaluatedRuleResult {
  const method = (input.contactMethod || "").trim().toLowerCase();
  if (method === "telegram") {
    return {
      signal: {
        id: "telegram-recruitment",
        title: "Unusual recruitment channel",
        description:
          "The opportunity relies on Telegram for recruitment communication. This is not proof of fraud, but it deserves additional verification.",
        severity: "medium",
        points: 10,
      },
      recommendation: "Verify interview communication through the company's verified email domain.",
    };
  }
  return {};
}

// 3. WhatsApp recruitment rule
export function checkWhatsAppRecruitment(input: OpportunityInput): EvaluatedRuleResult {
  const method = (input.contactMethod || "").trim().toLowerCase();
  if (method === "whatsapp") {
    return {
      signal: {
        id: "whatsapp-recruitment",
        title: "Informal recruitment channel",
        description:
          "The opportunity relies on WhatsApp for recruitment communication. Independently verify the employer and recruiter.",
        severity: "medium",
        points: 7,
      },
      recommendation: "Request official correspondence from a corporate email address.",
    };
  }
  return {};
}

// 4. Public recruiter email rule
export function checkPublicRecruiterEmail(input: OpportunityInput): EvaluatedRuleResult {
  const email = (input.recruiterEmail || "").trim().toLowerCase();
  if (!email || !email.includes("@")) return {};

  const publicDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "proton.me",
    "protonmail.com",
    "icloud.com",
    "aol.com",
    "mail.com",
    "yandex.com",
  ];

  const domain = email.split("@")[1];
  if (publicDomains.includes(domain)) {
    return {
      signal: {
        id: "public-recruiter-email",
        title: "Non-corporate recruiter email",
        description:
          "The recruiter appears to be using a public email provider rather than a company domain.",
        severity: "medium",
        points: 10,
      },
      recommendation: "Confirm recruiter identity on professional platforms like LinkedIn.",
    };
  }
  return {};
}

// 5. Missing company name rule
export function checkMissingCompany(input: OpportunityInput): EvaluatedRuleResult {
  // If manual input or URL without company provided
  if (input.inputType === "manual" && (!input.companyName || input.companyName.trim().length === 0)) {
    return {
      signal: {
        id: "missing-company",
        title: "Company identity unavailable",
        description:
          "The submitted information does not provide enough company identity information for confident verification.",
        severity: "medium",
        points: 10,
      },
      recommendation: "Identify the exact corporate entity offering the position.",
    };
  }
  return {};
}

// 6. Missing or short job description rule (< 80 chars)
export function checkMissingJobDescription(input: OpportunityInput): EvaluatedRuleResult {
  if (input.inputType === "manual") {
    const desc = (input.jobDescription || "").trim();
    if (desc.length < 80) {
      return {
        signal: {
          id: "limited-job-details",
          title: "Limited job details",
          description:
            "The opportunity contains limited information about the role or responsibilities.",
          severity: "medium",
          points: 10,
        },
        recommendation: "Ask for a formal written job description before submitting application materials.",
      };
    }
  }
  return {};
}

// 7. Suspicious URL pattern rule
export function checkSuspiciousUrl(input: OpportunityInput): EvaluatedRuleResult {
  const rawUrl = (input.url || "").trim().toLowerCase();
  if (!rawUrl) return {};

  const shorteners = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "buff.ly", "ow.ly", "cutt.ly"];
  const suspiciousKeywords = ["urgent", "claim", "reward", "payment", "bonus", "verify", "free"];

  let hasShortener = false;
  let hasSuspiciousWord = false;
  let hasExcessiveSubdomains = false;

  try {
    const parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    const hostname = parsed.hostname;

    if (shorteners.some((s) => hostname === s || hostname.endsWith(`.${s}`))) {
      hasShortener = true;
    }

    const hostParts = hostname.split(".");
    if (hostParts.length > 4) {
      hasExcessiveSubdomains = true;
    }

    if (suspiciousKeywords.some((w) => parsed.pathname.toLowerCase().includes(w) || hostname.includes(w))) {
      hasSuspiciousWord = true;
    }
  } catch {
    // Basic fallback string matching
    if (shorteners.some((s) => rawUrl.includes(s))) hasShortener = true;
    if (suspiciousKeywords.some((w) => rawUrl.includes(w))) hasSuspiciousWord = true;
  }

  if (hasShortener || hasSuspiciousWord || hasExcessiveSubdomains) {
    return {
      signal: {
        id: "suspicious-url-pattern",
        title: "Suspicious URL pattern",
        description:
          "The submitted URL contains characteristics that deserve additional verification.",
        severity: "medium",
        points: 12,
      },
      recommendation: "Navigate to the company's official careers page directly rather than using third-party redirect links.",
    };
  }

  return {};
}

// 8. Suspicious job language rule
export function checkSuspiciousJobLanguage(input: OpportunityInput): EvaluatedRuleResult {
  const textToScan = [
    input.jobDescription || "",
    input.salaryText || "",
    input.jobTitle || "",
  ]
    .join(" ")
    .toLowerCase();

  if (!textToScan.trim()) return {};

  const scamPhrases = [
    "pay to apply",
    "registration fee",
    "processing fee",
    "security deposit",
    "guaranteed income",
    "earn money instantly",
    "no experience high salary",
    "limited seats",
    "act immediately",
    "urgent hiring apply now",
    "telegram interview",
    "wire fee",
  ];

  if (scamPhrases.some((phrase) => textToScan.includes(phrase))) {
    return {
      signal: {
        id: "suspicious-job-language",
        title: "Suspicious recruitment language",
        description:
          "The opportunity contains language commonly associated with high-pressure or potentially misleading recruitment offers.",
        severity: "high",
        points: 15,
      },
      recommendation: "Be cautious of offers that create artificial urgency or promise guaranteed high income.",
    };
  }

  return {};
}

// 9. Unrealistic compensation rule
export function checkUnrealisticCompensation(input: OpportunityInput): EvaluatedRuleResult {
  const textToScan = [
    input.salaryText || "",
    input.jobDescription || "",
  ]
    .join(" ")
    .toLowerCase();

  if (!textToScan.trim()) return {};

  const unrealisticTerms = [
    "₹1 lakh per day",
    "1 lakh per day",
    "₹5 lakh per month internship",
    "5 lakh per month",
    "guaranteed ₹10 lakh",
    "guaranteed 10 lakh",
    "earn ₹1 crore",
    "earn 1 crore",
    "₹50,000 per day",
    "50000 per day",
  ];

  if (unrealisticTerms.some((term) => textToScan.includes(term))) {
    return {
      signal: {
        id: "unrealistic-compensation",
        title: "Unusually high compensation claim",
        description:
          "The opportunity makes an unusually large compensation claim that should be independently verified.",
        severity: "medium",
        points: 15,
      },
      recommendation: "Compare the offered compensation with standard industry benchmarks for similar roles.",
    };
  }

  return {};
}

// 10. Missing recruiter rule
export function checkMissingRecruiter(input: OpportunityInput): EvaluatedRuleResult {
  if (input.inputType === "manual" && (!input.recruiterEmail || input.recruiterEmail.trim().length === 0)) {
    return {
      signal: {
        id: "missing-recruiter",
        title: "Recruiter information unavailable",
        description:
          "No recruiter identity was provided, so recruiter verification could not be performed.",
        severity: "low",
        points: 5,
      },
      recommendation: "Ask for the recruiter's name and official company contact before sharing personal records.",
    };
  }
  return {};
}
