import { DomainAnalysis } from "./types";

const KNOWN_SHORTENERS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "cutt.ly",
  "rb.gy",
  "rebrand.ly",
  "shorturl.at",
  "bl.ink",
]);

const KNOWN_PLATFORMS: Record<string, string> = {
  "linkedin.com": "LinkedIn",
  "greenhouse.io": "Greenhouse",
  "lever.co": "Lever",
  "ashbyhq.com": "Ashby",
  "workday.com": "Workday",
  "myworkdayjobs.com": "Workday",
  "smartrecruiters.com": "SmartRecruiters",
  "indeed.com": "Indeed",
  "glassdoor.com": "Glassdoor",
  "wellfound.com": "Wellfound / AngelList",
  "internshala.com": "Internshala",
  "naukri.com": "Naukri",
  "joinhandshake.com": "Handshake",
  "ripplematch.com": "RippleMatch",
  "github.com": "GitHub",
  "google.com": "Google Careers",
  "microsoft.com": "Microsoft Careers",
  "apple.com": "Apple Careers",
  "amazon.jobs": "Amazon Jobs",
};

export function parseDomain(url: URL): DomainAnalysis {
  const hostname = url.hostname.toLowerCase();
  const protocol = url.protocol as "http:" | "https:";

  // Check if IP address
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.startsWith("[");

  // Determine TLD and root domain
  const parts = hostname.split(".");
  let tld = "";
  let rootDomain = hostname;
  let subdomain: string | undefined = undefined;

  if (!isIpAddress && parts.length >= 2) {
    const secondToLast = parts[parts.length - 2];
    const isTwoPartTld =
      parts.length > 2 &&
      ["co", "com", "edu", "gov", "org", "net", "ac"].includes(secondToLast) &&
      parts[parts.length - 1].length === 2;

    if (isTwoPartTld && parts.length >= 3) {
      tld = `${secondToLast}.${parts[parts.length - 1]}`;
      rootDomain = `${parts[parts.length - 3]}.${tld}`;
      if (parts.length > 3) {
        subdomain = parts.slice(0, parts.length - 3).join(".");
      }
    } else {
      tld = parts[parts.length - 1];
      rootDomain = `${parts[parts.length - 2]}.${tld}`;
      if (parts.length > 2) {
        subdomain = parts.slice(0, parts.length - 2).join(".");
      }
    }
  }

  const isShortener = KNOWN_SHORTENERS.has(hostname) || KNOWN_SHORTENERS.has(rootDomain);

  let isKnownPlatform = false;
  let platformName: string | undefined = undefined;

  for (const [platformDomain, name] of Object.entries(KNOWN_PLATFORMS)) {
    if (rootDomain === platformDomain || hostname.endsWith(`.${platformDomain}`)) {
      isKnownPlatform = true;
      platformName = name;
      break;
    }
  }

  // Check for suspicious structural characteristics
  let hasSuspiciousStructure = false;

  if (!isIpAddress && !isKnownPlatform) {
    const hyphenCount = (hostname.match(/-/g) || []).length;
    const digitCount = (hostname.match(/\d/g) || []).length;
    const subdomainsCount = subdomain ? subdomain.split(".").length : 0;

    if (hyphenCount >= 3 || subdomainsCount >= 3 || (digitCount >= 6 && !isShortener)) {
      hasSuspiciousStructure = true;
    }

    const suspiciousDomainKeywords = [
      "free-intern",
      "quick-cash",
      "urgent-job",
      "wire-pay",
      "claim-reward",
      "bonus-earn",
    ];

    if (suspiciousDomainKeywords.some((k) => hostname.includes(k))) {
      hasSuspiciousStructure = true;
    }
  }

  return {
    hostname,
    rootDomain,
    subdomain,
    tld,
    protocol,
    isIpAddress,
    isShortener,
    hasSuspiciousStructure,
    isKnownPlatform,
    platformName,
  };
}
