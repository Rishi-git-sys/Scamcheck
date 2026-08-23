// ==============================================================================
// Phase 13: Threat Intelligence Provider Abstraction
// Connects to Safe Browsing / Threat Intel API with in-memory caching and fallback
// ==============================================================================

import { ThreatIntelProvider, ThreatReputationStatus } from "./types";
import { RiskSignal } from "@/lib/risk-engine/types";

// In-memory cache for public domain threat lookups (10 minute TTL)
const threatCache = new Map<string, { result: any; expiresAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export class SafeBrowsingThreatProvider implements ThreatIntelProvider {
  name = "SafeBrowsingThreatProvider";

  isConfigured(): boolean {
    return !!process.env.THREAT_INTEL_API_KEY && process.env.THREAT_INTEL_API_KEY.trim().length > 0;
  }

  async checkDomain(domain: string): Promise<{
    status: ThreatReputationStatus;
    source: string;
    signals: RiskSignal[];
    reasons: string[];
  }> {
    const apiKey = process.env.THREAT_INTEL_API_KEY;

    if (!apiKey) {
      return {
        status: "unavailable",
        source: "Threat intelligence not configured",
        signals: [],
        reasons: ["No external threat intelligence API configured."],
      };
    }

    // Check in-memory cache
    const cached = threatCache.get(domain);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: { clientId: "scamcheck", clientVersion: "1.0.0" },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url: `https://${domain}` }, { url: `http://${domain}` }],
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          status: "unavailable",
          source: "SafeBrowsing API",
          signals: [],
          reasons: [`SafeBrowsing API returned HTTP ${res.status}.`],
        };
      }

      const data = await res.json();
      const matches: any[] = data.matches || [];

      let status: ThreatReputationStatus = "clean";
      const signals: RiskSignal[] = [];
      const reasons: string[] = [];

      if (matches.length > 0) {
        status = "malicious";
        signals.push({
          id: "known-malicious-domain",
          title: "Known malicious domain",
          description: `The domain (${domain}) is flagged as a threat in external security intelligence databases.`,
          severity: "high",
          points: 40,
        });
        reasons.push(`Flagged as security threat by SafeBrowsing API (${matches[0].threatType}).`);
      } else {
        status = "clean";
        reasons.push("No known threats detected by SafeBrowsing threat intelligence.");
      }

      const result = {
        status,
        source: "SafeBrowsing API",
        signals,
        reasons,
      };

      // Store in cache
      threatCache.set(domain, { result, expiresAt: Date.now() + CACHE_TTL_MS });
      return result;
    } catch (err: any) {
      console.warn(`[threat-intel] Lookup failed for ${domain}: ${err?.message}`);
      return {
        status: "unavailable",
        source: "SafeBrowsing API",
        signals: [],
        reasons: ["Threat intelligence lookup timed out or was unreachable."],
      };
    }
  }
}
