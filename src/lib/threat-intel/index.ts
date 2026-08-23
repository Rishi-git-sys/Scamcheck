// ==============================================================================
// Phase 13: Threat Intelligence Controller
// Orchestrates passive domain checks, RDAP age, and threat provider lookups
// ==============================================================================

import { DomainIntelResult, ThreatIntelProvider } from "./types";
import { SafeBrowsingThreatProvider } from "./provider";
import { extractDomainParts, lookupDomainRegistrationDate } from "./domain";
import { RiskSignal } from "@/lib/risk-engine/types";

let defaultThreatProvider: ThreatIntelProvider = new SafeBrowsingThreatProvider();

/**
 * Set custom threat intel provider (for dependency injection or testing).
 */
export function setThreatIntelProvider(provider: ThreatIntelProvider) {
  defaultThreatProvider = provider;
}

/**
 * Check domain threat intelligence and RDAP registration age.
 */
export async function checkDomainThreatIntelligence(
  inputUrlOrDomain: string
): Promise<DomainIntelResult> {
  const { hostname, rootDomain, isHttps } = extractDomainParts(inputUrlOrDomain);
  const checkedAt = new Date().toISOString();

  if (!hostname || hostname.includes("localhost") || !rootDomain) {
    return {
      hostname: hostname || "unknown",
      rootDomain: rootDomain || "unknown",
      status: "unavailable",
      source: null,
      checkedAt,
      https: isHttps,
      signals: [],
      reasons: ["No valid external public domain provided."],
    };
  }

  const signals: RiskSignal[] = [];
  const reasons: string[] = [];

  // 1. Passive RDAP Domain Registration Age Check
  const rdapInfo = await lookupDomainRegistrationDate(rootDomain);
  if (rdapInfo.domainAgeYears !== undefined) {
    reasons.push(`Domain registered approx. ${rdapInfo.domainAgeYears} years ago (${rdapInfo.creationDate}).`);
  }

  if (rdapInfo.isRecentlyRegistered) {
    signals.push({
      id: "recently-registered-domain",
      title: "Recently registered domain",
      description: `The website domain (${rootDomain}) was registered recently (${rdapInfo.creationDate}), which warrants extra verification.`,
      severity: "medium",
      points: 10,
    });
    reasons.push("Domain was registered very recently (less than 30 days ago).");
  }

  // 2. Active Threat Intelligence Provider Check
  const providerResult = await defaultThreatProvider.checkDomain(rootDomain);
  signals.push(...providerResult.signals);
  reasons.push(...providerResult.reasons);

  return {
    hostname,
    rootDomain,
    status: providerResult.status,
    source: providerResult.source || null,
    checkedAt,
    domainAgeYears: rdapInfo.domainAgeYears,
    creationDate: rdapInfo.creationDate,
    isRecentlyRegistered: rdapInfo.isRecentlyRegistered,
    https: isHttps,
    signals,
    reasons,
  };
}
