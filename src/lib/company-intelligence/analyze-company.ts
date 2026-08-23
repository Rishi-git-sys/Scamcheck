import { CompanyPageAnalysis, CompanyNameMatch } from "./types";

const CORPORATE_SUFFIXES = [
  "inc",
  "ltd",
  "limited",
  "llc",
  "corporation",
  "corp",
  "pvt",
  "private",
  "technologies",
  "technology",
  "tech",
  "solutions",
  "services",
  "group",
  "holdings",
  "international",
  "global",
];

const PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "proton.me",
  "protonmail.com",
  "icloud.com",
  "aol.com",
  "mail.com",
]);

const KNOWN_JOB_PLATFORMS = new Set([
  "linkedin.com",
  "indeed.com",
  "glassdoor.com",
  "naukri.com",
  "foundit.in",
  "internshala.com",
  "wellfound.com",
  "joinhandshake.com",
  "greenhouse.io",
  "lever.co",
  "ashbyhq.com",
  "workday.com",
  "myworkdayjobs.com",
  "smartrecruiters.com",
  "ripplematch.com",
  "monster.com",
  "ziprecruiter.com",
  "angellist.com",
  "angel.co",
]);

export function normalizeCompanyName(name: string): string {
  let normalized = name.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
  const words = normalized.split(/\s+/).filter(Boolean);
  const filtered = words.filter((w) => !CORPORATE_SUFFIXES.includes(w));
  return (filtered.length > 0 ? filtered : words).join(" ");
}

export function checkCompanyNameMatch(companyName: string, pageText: string): CompanyNameMatch {
  if (!companyName.trim() || !pageText.trim()) return "unknown";

  const normalizedInput = normalizeCompanyName(companyName);
  const normalizedPage = pageText.toLowerCase().replace(/[^a-z0-9\s]/g, " ");

  if (!normalizedInput) return "unknown";

  // Direct match check
  if (normalizedPage.includes(normalizedInput)) return "true";

  // Try matching individual words of the normalized company name
  const inputWords = normalizedInput.split(/\s+/).filter((w) => w.length >= 3);
  if (inputWords.length === 0) return "unknown";

  const wordMatchCount = inputWords.filter((w) => normalizedPage.includes(w)).length;
  const matchRatio = wordMatchCount / inputWords.length;

  if (matchRatio >= 0.75) return "true";
  if (matchRatio >= 0.4) return "unknown";

  return "false";
}

export function checkDomainMatchesBrand(companyName: string, rootDomain: string): boolean {
  const normalizedBrand = normalizeCompanyName(companyName).replace(/\s+/g, "");
  const normalizedDomain = rootDomain.toLowerCase().split(".")[0].replace(/-/g, "");

  if (!normalizedBrand || !normalizedDomain) return false;

  // Direct containment
  if (normalizedDomain.includes(normalizedBrand) || normalizedBrand.includes(normalizedDomain)) {
    return true;
  }

  // Match any individual word of the brand against domain
  const brandWords = normalizeCompanyName(companyName)
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  return brandWords.some(
    (w) => normalizedDomain.includes(w) || w.includes(normalizedDomain)
  );
}

export function checkSuppliedEmailDomainMatch(
  companyEmail: string,
  rootDomain: string
): boolean {
  if (!companyEmail || !rootDomain) return false;
  const emailDomain = companyEmail.split("@")[1]?.toLowerCase();
  if (!emailDomain) return false;
  return emailDomain === rootDomain || emailDomain.endsWith(`.${rootDomain}`);
}

export function isPublicEmailDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? PUBLIC_EMAIL_DOMAINS.has(domain) : false;
}

export function parseCompanyPageContent(
  html: string,
  companyName: string,
  rootDomain: string
): CompanyPageAnalysis {
  const lowerHtml = html.toLowerCase();
  const pageText = extractTextForCompany(html);

  // 1. Title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch?.[1]?.replace(/\s+/g, " ").trim();

  // 2. Meta description
  const metaMatch =
    html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i) ||
    html.match(/<meta\s+content=["'](.*?)["']\s+name=["']description["']/i);
  const description = metaMatch?.[1]?.replace(/\s+/g, " ").trim();

  // 3. Emails from page
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const rawEmails = html.match(emailRegex) || [];
  const validEmails = Array.from(
    new Set(
      rawEmails.filter((e) => {
        const lower = e.toLowerCase();
        return (
          !lower.endsWith(".png") &&
          !lower.endsWith(".jpg") &&
          !lower.endsWith(".svg") &&
          !lower.endsWith(".webp") &&
          !lower.endsWith(".js") &&
          !lower.endsWith(".css")
        );
      })
    )
  ).slice(0, 10);

  // 4. Page section presence
  const aboutPatterns = ["about us", "about our company", "who we are", "our story", "about microsoft", "about google", "company overview"];
  const aboutPresent = aboutPatterns.some((p) => pageText.includes(p));

  const careersPatterns = ["careers", "jobs", "vacancies", "internship", "open positions", "join us", "join our team", "work with us"];
  const careersPresent = careersPatterns.some((p) => pageText.includes(p));

  const contactPatterns = ["contact us", "get in touch", "reach us", "contact:", "email us"];
  const contactPresent = contactPatterns.some((p) => pageText.includes(p));

  const privacyPatterns = ["privacy policy", "privacy notice", "terms of service", "terms and conditions", "cookie policy"];
  const privacyPresent = privacyPatterns.some((p) => pageText.includes(p));

  const termsPresent = pageText.includes("terms of service") || pageText.includes("terms and conditions");

  // 5. Social links
  const socialDomains = ["linkedin.com", "twitter.com", "x.com", "facebook.com", "instagram.com", "github.com", "youtube.com"];
  const socialLinksFound = socialDomains.some((d) => lowerHtml.includes(d));

  // 6. Company name match
  const companyNameMatch = checkCompanyNameMatch(companyName, pageText);

  // 7. Email domain matches site
  const corpEmail = validEmails.find((e) => {
    const domain = e.split("@")[1]?.toLowerCase();
    return domain && !PUBLIC_EMAIL_DOMAINS.has(domain);
  });
  const emailDomainMatches =
    corpEmail !== undefined &&
    corpEmail.split("@")[1]?.toLowerCase().includes(rootDomain.split(".")[0]);

  return {
    title: title?.slice(0, 200),
    description: description?.slice(0, 300),
    emails: validEmails,
    aboutPresent,
    careersPresent,
    contactPresent,
    privacyPresent,
    termsPresent,
    socialLinksFound,
    companyNameMatch,
    emailDomainMatches,
  };
}

export function extractTextForCompany(html: string): string {
  if (!html) return "";

  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
    .replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, " ");

  clean = clean.replace(/<[^>]+>/g, " ");

  clean = clean
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  clean = clean.replace(/\s+/g, " ").trim();

  return clean.slice(0, 15000).toLowerCase();
}

export function isKnownJobPlatform(rootDomain: string): { known: boolean; name?: string } {
  if (KNOWN_JOB_PLATFORMS.has(rootDomain)) {
    const nameMappings: Record<string, string> = {
      "linkedin.com": "LinkedIn",
      "indeed.com": "Indeed",
      "glassdoor.com": "Glassdoor",
      "naukri.com": "Naukri",
      "foundit.in": "Foundit",
      "internshala.com": "Internshala",
      "wellfound.com": "Wellfound",
      "joinhandshake.com": "Handshake",
      "greenhouse.io": "Greenhouse",
      "lever.co": "Lever",
      "ashbyhq.com": "Ashby",
      "workday.com": "Workday",
      "myworkdayjobs.com": "Workday",
      "smartrecruiters.com": "SmartRecruiters",
    };
    return { known: true, name: nameMappings[rootDomain] || rootDomain };
  }
  return { known: false };
}
