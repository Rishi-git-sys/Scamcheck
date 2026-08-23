// ==============================================================================
// Phase 13: Threat Intelligence Types
// Types for passive domain reputation, RDAP age, and threat intelligence providers
// ==============================================================================

import { RiskSignal } from "@/lib/risk-engine/types";

export type ThreatReputationStatus =
  | "clean"
  | "suspicious"
  | "malicious"
  | "unknown"
  | "unavailable";

export interface DomainIntelResult {
  hostname: string;
  rootDomain: string;
  status: ThreatReputationStatus;
  source: string | null;
  checkedAt: string;
  domainAgeYears?: number;
  creationDate?: string;
  isRecentlyRegistered?: boolean;
  https: boolean;
  signals: RiskSignal[];
  reasons: string[];
}

export interface ThreatIntelProvider {
  name: string;
  isConfigured(): boolean;
  checkDomain(domain: string): Promise<{
    status: ThreatReputationStatus;
    source: string;
    signals: RiskSignal[];
    reasons: string[];
  }>;
}
