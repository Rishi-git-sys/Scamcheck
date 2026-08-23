export interface UrlValidationResult {
  isValid: boolean;
  normalizedUrl?: string;
  parsedUrl?: URL;
  error?: string;
}

export function isPrivateOrLocalIp(ip: string): boolean {
  // IPv4 checks
  const ipv4Match = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const octets = ipv4Match.slice(1, 5).map(Number);
    if (octets.some((o) => o > 255)) return true;

    // 127.0.0.0/8 (Loopback)
    if (octets[0] === 127) return true;
    // 10.0.0.0/8 (Private)
    if (octets[0] === 10) return true;
    // 172.16.0.0/12 (Private 172.16 - 172.31)
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (octets[0] === 192 && octets[1] === 168) return true;
    // 169.254.0.0/16 (Link-local & AWS/GCP metadata 169.254.169.254)
    if (octets[0] === 169 && octets[1] === 254) return true;
    // 0.0.0.0/8 (Current network)
    if (octets[0] === 0) return true;
    // 224.0.0.0/4 (Multicast) or 240.0.0.0/4 (Reserved)
    if (octets[0] >= 224) return true;
  }

  // IPv6 checks
  const cleanIpv6 = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    cleanIpv6 === "::1" ||
    cleanIpv6 === "::" ||
    cleanIpv6.startsWith("fe80:") ||
    cleanIpv6.startsWith("fc00:") ||
    cleanIpv6.startsWith("fd") ||
    cleanIpv6.startsWith("::ffff:127.") ||
    cleanIpv6.startsWith("::ffff:10.") ||
    cleanIpv6.startsWith("::ffff:192.168.")
  ) {
    return true;
  }

  return false;
}

export function validateAndNormalizeUrl(rawUrl: string): UrlValidationResult {
  const trimmed = (rawUrl || "").trim();
  if (!trimmed) {
    return { isValid: false, error: "Please enter a valid public URL." };
  }

  const lower = trimmed.toLowerCase();

  // Reject explicit dangerous protocols
  const disallowedProtocols = [
    "javascript:",
    "data:",
    "file:",
    "vbscript:",
    "blob:",
    "ftp:",
    "sftp:",
    "gopher:",
    "ldap:",
    "mailto:",
    "tel:",
  ];

  if (disallowedProtocols.some((p) => lower.startsWith(p))) {
    return { isValid: false, error: "Only HTTP and HTTPS URLs are supported." };
  }

  let formatted = trimmed;
  if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
    formatted = `https://${trimmed}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(formatted);
  } catch {
    return { isValid: false, error: "Please enter a valid, well-formed URL." };
  }

  // Enforce http/https protocol only
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { isValid: false, error: "Only HTTP and HTTPS URLs are supported." };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Reject local and internal hostnames
  const localHostnames = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
    "metadata.google.internal",
    "instance-data",
  ];

  if (
    localHostnames.includes(hostname) ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".lan") ||
    hostname.endsWith(".home") ||
    hostname.endsWith(".corp") ||
    hostname.endsWith(".test") ||
    hostname.endsWith(".invalid") ||
    hostname.endsWith(".example")
  ) {
    return { isValid: false, error: "Local or private network addresses cannot be analyzed." };
  }

  // Reject suspicious numeric-only or octal/hex IP notations
  if (/^0x[0-9a-f]+$/i.test(hostname) || /^\d+$/.test(hostname)) {
    return { isValid: false, error: "Non-standard IP address formats are not permitted." };
  }

  // Check for private / internal IPv4 / IPv6 literals
  if (isPrivateOrLocalIp(hostname)) {
    return { isValid: false, error: "Private or internal network IP addresses cannot be analyzed." };
  }

  // Ensure normal domain has at least a valid structure (has a dot or is a valid public hostname)
  if (!hostname.includes(".") && !hostname.startsWith("[")) {
    return { isValid: false, error: "Please enter a valid public domain name." };
  }

  return {
    isValid: true,
    normalizedUrl: parsed.toString(),
    parsedUrl: parsed,
  };
}
