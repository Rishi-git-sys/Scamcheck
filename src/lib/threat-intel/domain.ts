// ==============================================================================
// Phase 13: Passive Domain Intelligence & RDAP Lookup
// Non-intrusive domain registration age and structure inspection
// ==============================================================================

/**
 * Extracts hostname and normalized root domain from a URL or raw domain.
 */
export function extractDomainParts(inputUrl: string): { hostname: string; rootDomain: string; isHttps: boolean } {
  let hostname = (inputUrl || "").trim().toLowerCase();
  let isHttps = false;

  try {
    if (hostname.startsWith("https://")) {
      isHttps = true;
    }
    if (!hostname.startsWith("http://") && !hostname.startsWith("https://")) {
      hostname = `https://${hostname}`;
      isHttps = true;
    }
    const parsed = new URL(hostname);
    hostname = parsed.hostname;
  } catch {
    hostname = inputUrl.trim().toLowerCase().split("/")[0].split(":")[0];
  }

  hostname = hostname.replace(/^www\./, "");
  const parts = hostname.split(".");
  const rootDomain = parts.length > 2 ? parts.slice(-2).join(".") : hostname;

  return { hostname, rootDomain, isHttps };
}

/**
 * Retrieve public domain registration creation date via public RDAP protocol.
 * Passive, non-intrusive, and strictly timed out (2.5s).
 */
export async function lookupDomainRegistrationDate(rootDomain: string): Promise<{
  creationDate?: string;
  domainAgeYears?: number;
  isRecentlyRegistered?: boolean;
}> {
  if (!rootDomain || rootDomain.includes("localhost") || rootDomain.split(".").length < 2) {
    return {};
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const rdapUrl = `https://rdap.org/domain/${encodeURIComponent(rootDomain)}`;
    const res = await fetch(rdapUrl, {
      method: "GET",
      headers: { Accept: "application/rdap+json, application/json" },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return {};

    const data = await res.json();
    const events: { eventAction?: string; eventDate?: string }[] = data.events || [];
    const registrationEvent = events.find(
      (e) => e.eventAction === "registration" || e.eventAction === "created"
    );

    if (!registrationEvent?.eventDate) return {};

    const createdTime = new Date(registrationEvent.eventDate).getTime();
    if (isNaN(createdTime)) return {};

    const now = Date.now();
    const diffMs = now - createdTime;
    const daysOld = diffMs / (1000 * 60 * 60 * 24);
    const domainAgeYears = Math.max(0, Math.round((daysOld / 365.25) * 10) / 10);
    const isRecentlyRegistered = daysOld < 30;

    return {
      creationDate: registrationEvent.eventDate.split("T")[0],
      domainAgeYears,
      isRecentlyRegistered,
    };
  } catch {
    // Non-fatal, return empty on timeout or network block
    return {};
  }
}
