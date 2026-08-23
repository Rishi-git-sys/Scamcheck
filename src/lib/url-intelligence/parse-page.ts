import { PageMetadata } from "./types";

export function extractTextFromHtml(html: string): string {
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
    .replace(/&nbsp;/g, " ")
    .replace(/&#x2F;/g, "/");

  clean = clean.replace(/\s+/g, " ").trim();

  return clean.slice(0, 20000);
}

export function parsePageMetadata(
  html: string,
  rootDomain: string,
  pathname: string = ""
): PageMetadata {
  if (!html) {
    return {
      emails: [],
      jobRelated: false,
      hasSensitiveFormFields: false,
      sensitiveFieldNames: [],
      externalLinksCount: 0,
      hasApplyButton: false,
      hasRoleDetails: false,
      hasRequirements: false,
      hasSalaryInfo: false,
      isCompanyOrShowcasePage: false,
    };
  }

  // 1. Extract Page Title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  let title: string | undefined = undefined;
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].replace(/\s+/g, " ").trim();
  }

  // 2. Extract Meta Description
  const metaDescMatch =
    html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i) ||
    html.match(/<meta\s+content=["'](.*?)["']\s+name=["']description["']/i) ||
    html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);
  let description: string | undefined = undefined;
  if (metaDescMatch && metaDescMatch[1]) {
    description = metaDescMatch[1].replace(/\s+/g, " ").trim();
  }

  // 3. Extract Emails
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
          !lower.endsWith(".gif") &&
          !lower.endsWith(".js") &&
          !lower.endsWith(".css")
        );
      })
    )
  );

  const pageText = extractTextFromHtml(html).toLowerCase();
  const lowerHtml = html.toLowerCase();
  const lowerPath = pathname.toLowerCase();

  // 4. Specific Listing Indicators
  const applyPatterns = [
    /\bapply\s+now\b/i,
    /\beasy\s+apply\b/i,
    /\bsubmit\s+application\b/i,
    /\bapply\s+for\s+this\s+job\b/i,
    /\bapply\s+on\s+company\s+website\b/i,
    /<button[^>]*>[^<]*apply[^<]*<\/button>/i,
    /<a[^>]*>[^<]*apply\s+now[^<]*<\/a>/i,
  ];
  const hasApplyButton = applyPatterns.some((pattern) => pattern.test(lowerHtml));

  const rolePatterns = [
    "responsibilities",
    "what you'll do",
    "what you will do",
    "role overview",
    "job duties",
    "key responsibilities",
    "about the job",
    "about the role",
    "position overview",
  ];
  const hasRoleDetails = rolePatterns.some((p) => pageText.includes(p));

  const reqPatterns = [
    "requirements",
    "qualifications",
    "what you need",
    "who you are",
    "skills required",
    "minimum qualifications",
    "preferred qualifications",
    "eligibility criteria",
  ];
  const hasRequirements = reqPatterns.some((p) => pageText.includes(p));

  const salaryPatterns = [
    "salary",
    "stipend",
    "compensation",
    "per month",
    "per annum",
    "lpa",
    "hourly rate",
    "ctc",
  ];
  const hasSalaryInfo = salaryPatterns.some((p) => pageText.includes(p));

  // 5. Detect if page is a Company / Showcase / Profile / Homepage
  const isCompanyPath =
    lowerPath.includes("/company/") ||
    lowerPath.includes("/showcase/") ||
    lowerPath.includes("/school/") ||
    lowerPath === "/" ||
    lowerPath === "";

  const isCompanyText =
    pageText.includes("company overview") ||
    pageText.includes("about our company") ||
    pageText.includes("showcase page") ||
    pageText.includes("followers") && pageText.includes("employees");

  const isCompanyOrShowcasePage = isCompanyPath || (isCompanyText && !hasApplyButton && !hasRoleDetails);

  // 6. General Job Terms
  const jobTerms = [
    "internship",
    "intern",
    "developer",
    "engineer",
    "software",
    "careers",
    "job",
    "vacancy",
    "hiring",
    "recruitment",
    "position",
  ];
  const jobRelated =
    jobTerms.some((term) => pageText.includes(term)) ||
    hasApplyButton ||
    hasRoleDetails ||
    hasRequirements;

  // 7. Sensitive Form Fields
  const sensitiveFieldPatterns = [
    { name: "card number", regex: /\b(?:card\s*number|credit\s*card|debit\s*card)\b/i },
    { name: "cvv", regex: /\b(?:cvv|cvc|security\s*code)\b/i },
    { name: "bank account", regex: /\b(?:bank\s*account|account\s*number|routing\s*number)\b/i },
    { name: "otp / pin", regex: /\b(?:otp|one\s*time\s*password|upi\s*pin|atm\s*pin)\b/i },
    { name: "national id / pan", regex: /\b(?:aadhaar|pan\s*card|ssn|social\s*security)\b/i },
  ];

  const sensitiveFieldNames: string[] = [];
  for (const pattern of sensitiveFieldPatterns) {
    if (pattern.regex.test(html)) {
      sensitiveFieldNames.push(pattern.name);
    }
  }

  const hasSensitiveFormFields = sensitiveFieldNames.length > 0;

  // 8. Count External Links
  const linkRegex = /href=["'](https?:\/\/[^"'>]+)["']/gi;
  let match;
  let externalLinksCount = 0;
  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const linkHost = new URL(match[1]).hostname.toLowerCase();
      if (rootDomain && !linkHost.includes(rootDomain)) {
        externalLinksCount++;
      }
    } catch {
      // ignore
    }
  }

  return {
    title: title ? title.slice(0, 200) : undefined,
    description: description ? description.slice(0, 300) : undefined,
    emails: validEmails.slice(0, 10),
    jobRelated,
    hasSensitiveFormFields,
    sensitiveFieldNames,
    externalLinksCount,
    hasApplyButton,
    hasRoleDetails,
    hasRequirements,
    hasSalaryInfo,
    isCompanyOrShowcasePage,
  };
}
