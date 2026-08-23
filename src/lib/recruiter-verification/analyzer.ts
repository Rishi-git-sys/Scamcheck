// ==============================================================================
// Phase 10: Recruiter Verification Analyzer
// Deterministic domain matching and recruiter contact consistency check
// ==============================================================================

import { RecruiterVerificationInput, RecruiterVerificationResult, RecruiterVerificationStatus } from "./types";
import { RiskSignal } from "@/lib/risk-engine/types";

// Public free email providers
const PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "yahoo.co.uk",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "proton.me",
  "protonmail.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "mail.com",
  "yandex.com",
  "zoho.com",
  "gmx.com",
  "rediffmail.com",
]);

// Known recruitment / job platforms
const KNOWN_JOB_PLATFORMS = new Set([
  "linkedin.com",
  "indeed.com",
  "glassdoor.com",
  "naukri.com",
  "internshala.com",
  "foundit.in",
  "monster.com",
  "wellfound.com",
  "angel.co",
  "hirist.com",
  "unstop.com",
  "instahyre.com",
]);

/**
 * Extracts normalized root domain from a hostname or URL string.
 */
function extractRootDomain(inputUrlOrHost: string): string | null {
  if (!inputUrlOrHost || typeof inputUrlOrHost !== "string") return null;
  let hostname = inputUrlOrHost.trim().toLowerCase();

  try {
    if (!hostname.startsWith("http://") && !hostname.startsWith("https://")) {
      hostname = `https://${hostname}`;
    }
    const parsed = new URL(hostname);
    hostname = parsed.hostname;
  } catch {
    hostname = inputUrlOrHost.trim().toLowerCase().split("/")[0].split(":")[0];
  }

  hostname = hostname.replace(/^www\./, "");
  return hostname || null;
}

/**
 * Extracts domain from an email address.
 */
function extractEmailDomain(email: string): string | null {
  if (!email || !email.includes("@")) return null;
  const parts = email.trim().toLowerCase().split("@");
  return parts[parts.length - 1] || null;
}

/**
 * Checks if email domain is a subdomain or exact match of company domain.
 * e.g. "careers.microsoft.com" is consistent with "microsoft.com".
 */
function isDomainConsistent(emailDomain: string, companyDomain: string): boolean {
  if (!emailDomain || !companyDomain) return false;
  const eDom = emailDomain.toLowerCase().replace(/^www\./, "");
  const cDom = companyDomain.toLowerCase().replace(/^www\./, "");

  if (eDom === cDom) return true;
  if (eDom.endsWith(`.${cDom}`)) return true;
  if (cDom.endsWith(`.${eDom}`)) return true;

  return false;
}

/**
 * Checks if a hostname belongs to a known public job platform.
 */
function isJobPlatformDomain(domain: string): boolean {
  if (!domain) return false;
  const d = domain.toLowerCase();
  for (const platform of Array.from(KNOWN_JOB_PLATFORMS)) {
    if (d === platform || d.endsWith(`.${platform}`)) {
      return true;
    }
  }
  return false;
}

/**
 * Verify recruiter contact details and consistency with company.
 */
export function verifyRecruiter(input: RecruiterVerificationInput): RecruiterVerificationResult {
  const signals: RiskSignal[] = [];
  const reasons: string[] = [];
  const recommendations: string[] = [];

  const rawEmail = input.recruiterEmail?.trim().toLowerCase();
  const emailDomain = rawEmail ? extractEmailDomain(rawEmail) : null;
  const rawName = input.recruiterName?.trim();
  const contactMethod = input.contactMethod?.trim();

  // Resolve company domain from companyWebsite or opportunityUrl
  const companyHost = input.companyWebsite ? extractRootDomain(input.companyWebsite) : null;
  const oppHost = input.opportunityUrl ? extractRootDomain(input.opportunityUrl) : null;

  // Determine effective company domain (ignoring job platforms like linkedin.com for company domain)
  let effectiveCompanyDomain: string | null = companyHost;
  if (!effectiveCompanyDomain && oppHost && !isJobPlatformDomain(oppHost)) {
    effectiveCompanyDomain = oppHost;
  }

  // 1. Check if no recruiter info provided at all
  if (!rawEmail && !rawName && !contactMethod) {
    return {
      status: "not_available",
      reasons: ["No recruiter contact information was detected."],
      signals,
      recommendations,
    };
  }

  let status: RecruiterVerificationStatus = "limited";
  let domainMatch: boolean | undefined = undefined;
  let publicProvider: boolean | undefined = undefined;

  // 2. Email domain analysis
  if (emailDomain) {
    publicProvider = PUBLIC_EMAIL_DOMAINS.has(emailDomain);

    if (effectiveCompanyDomain) {
      domainMatch = isDomainConsistent(emailDomain, effectiveCompanyDomain);

      if (domainMatch) {
        status = "consistent";
        reasons.push("Email domain matches company domain.");
      } else if (publicProvider) {
        status = "needs_review";
        reasons.push("Recruiter communication uses a public email provider rather than a company domain.");
        reasons.push("Additional recruiter verification recommended.");

        signals.push({
          id: "public-recruiter-email",
          title: "Public recruiter email",
          description: `The recruiter uses a public email address (${rawEmail}) rather than an official company domain.`,
          severity: "medium",
          points: 10,
        });

        recommendations.push("Confirm recruiter identity on professional platforms or through the company's verified email domain.");
      } else {
        // Different private domain
        status = "needs_review";
        reasons.push(`Recruiter email domain (@${emailDomain}) does not match company domain (${effectiveCompanyDomain}).`);
        reasons.push("Additional recruiter verification recommended.");

        signals.push({
          id: "recruiter-domain-mismatch",
          title: "Recruiter domain mismatch",
          description: `Recruiter email domain (@${emailDomain}) does not match the company's website (${effectiveCompanyDomain}).`,
          severity: "medium",
          points: 15,
        });

        recommendations.push("Verify the recruiter through the company's official careers website.");
      }
    } else {
      // No company domain available to compare against
      if (publicProvider) {
        status = "needs_review";
        reasons.push("Recruiter uses a public email provider.");

        signals.push({
          id: "public-recruiter-email",
          title: "Public recruiter email",
          description: `The recruiter uses a public email address (${rawEmail}).`,
          severity: "medium",
          points: 10,
        });

        recommendations.push("Request official correspondence from a corporate email address.");
      } else {
        status = "limited";
        reasons.push(`Recruiter uses corporate domain @${emailDomain}, but company website was not provided for cross-verification.`);
      }
    }
  }

  // 3. Contact Method Analysis (Telegram / WhatsApp informal channel)
  const methodLower = contactMethod?.toLowerCase();
  if (methodLower === "telegram") {
    if (status !== "consistent") {
      status = "needs_review";
    }
    reasons.push("Recruiter communication relies on Telegram.");
  } else if (methodLower === "whatsapp") {
    if (status !== "consistent") {
      status = "needs_review";
    }
    reasons.push("Recruiter communication relies on WhatsApp.");
  }

  // 4. Recruiter Name without verified email
  if (rawName && !emailDomain) {
    status = "limited";
    reasons.push(`Recruiter identified as "${rawName}" (identity not independently verified).`);
  }

  return {
    status,
    recruiterName: rawName,
    recruiterEmail: rawEmail,
    emailDomain: emailDomain || undefined,
    domainMatch,
    publicProvider,
    contactMethod: contactMethod || undefined,
    reasons,
    signals,
    recommendations,
  };
}
