export interface Device {
  chipId: string;
  devicePk: string;
  boundAppPk: string;
  status: "in-stock" | "available" | "casting" | "ready-to-claim";
  registeredAt: string;
  activatedAt?: string;
  activationIp?: string;
  activatedLocation?: { country: string; district: string };
  lastSeenMinutes: number;
  deviceModel: string;
  manufacturer: string;
  clientVersion: string;
  campaignId?: string;
}

export interface ModelStats {
  model: string;
  devices: number;
  castSuccessRate: number;
  claimSuccessRate: number;
  avgDailyOpens: number;
}

export interface AppClient {
  id: string;
  version: string;
  releaseState: "stable" | "rollout" | "beta";
  totalDevices: number;
  castSuccessRate: number;
  claimSuccessRate: number;
  avgDailyOpens: number;
  weeklyActive: number;
  monthlyActive: number;
  modelBreakdown: ModelStats[];
}

export interface Advertiser {
  id: string;
  name: string;
  company: string;
  email: string;
}

export const advertisers: Advertiser[] = [
  { id: "ADV-001", name: "Lena Moreau", company: "RetailVibe Inc.", email: "lena@retailvibe.io" },
  { id: "ADV-002", name: "James Chen", company: "TechPulse Labs", email: "james@techpulse.dev" },
  { id: "ADV-003", name: "Aisha Patel", company: "Wanderlux Travel", email: "aisha@wanderlux.com" },
  { id: "ADV-004", name: "Marcus Rivera", company: "UrbanThread Co.", email: "marcus@urbanthread.co" },
  { id: "ADV-005", name: "Suki Tanaka", company: "NeonByte Finance", email: "suki@neonbyte.io" },
];

export interface CampaignMonitor {
  id: string;
  name: string;
  segment: string;
  status: "review" | "approved" | "active" | "completed" | "aborted";
  dbStatus: "pending-review" | "scheduled" | "serving" | "completed" | "paused";
  chainStatus: "unfunded" | "funded" | "active" | "settling" | "unreachable";
  fillRate: number;
  pacing: number;
  tokenPoolConsumedPct: number;
  activeDevices: number;
  castImageUrl: string;
  totalTokenPool: number;
  castDurationDays: number;
  tokensPerCast: number;
  createdAt: string;
  createdBy: string;
  advertiserId: string;
  startDate?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComment?: string;
  targetDeviceCount?: number;
  campaignBrief?: string;
}

export interface CastEvent {
  id: string;
  deviceAlias: string;
  campaignName: string;
  startedAt: string;
  endedAt?: string;
  durationSec: number;
  status: "started" | "ended" | "claimed" | "aborted";
  source: "operation-db" | "chain-readonly";
  txHash?: string;
}

export interface DeviceInteraction {
  id: string;
  chipId: string;
  type: "activated" | "cast-started" | "cast-completed" | "claimed" | "deactivated";
  timestamp: string;
  campaignId?: string;
  campaignName?: string;
  location?: { country: string; district: string };
  txHash?: string;
  tokensEarned?: number;
}

export const deviceInteractions: DeviceInteraction[] = [
  { id: "INT-001", chipId: "DV-1042", type: "activated", timestamp: "2026-02-14T10:30:00Z", location: { country: "United Kingdom", district: "Greater London" } },
  { id: "INT-002", chipId: "DV-1042", type: "cast-started", timestamp: "2026-03-01T09:00:00Z", campaignId: "CMP-208", campaignName: "Weekend Beverage Push" },
  { id: "INT-003", chipId: "DV-1042", type: "cast-completed", timestamp: "2026-03-15T18:00:00Z", campaignId: "CMP-208", campaignName: "Weekend Beverage Push", tokensEarned: 120 },
  { id: "INT-004", chipId: "DV-1042", type: "claimed", timestamp: "2026-03-16T08:12:00Z", campaignId: "CMP-208", campaignName: "Weekend Beverage Push", txHash: "0x2f11...ab91", tokensEarned: 120 },
  { id: "INT-005", chipId: "DV-1042", type: "cast-started", timestamp: "2026-04-01T07:00:00Z", campaignId: "CMP-208", campaignName: "Weekend Beverage Push" },
  { id: "INT-006", chipId: "DV-2339", type: "activated", timestamp: "2026-01-20T14:15:00Z", location: { country: "United States", district: "New York" } },
  { id: "INT-007", chipId: "DV-2339", type: "cast-started", timestamp: "2026-02-10T11:00:00Z", campaignId: "CMP-203", campaignName: "Launch Week Consumer Tech" },
  { id: "INT-008", chipId: "DV-8761", type: "activated", timestamp: "2026-03-01T06:00:00Z", location: { country: "Japan", district: "Tokyo" } },
  { id: "INT-009", chipId: "DV-8761", type: "cast-started", timestamp: "2026-03-10T08:00:00Z", campaignId: "CMP-211", campaignName: "Citywide Fintech Awareness" },
  { id: "INT-010", chipId: "DV-8761", type: "cast-completed", timestamp: "2026-04-05T20:00:00Z", campaignId: "CMP-211", campaignName: "Citywide Fintech Awareness", tokensEarned: 95 },
  { id: "INT-011", chipId: "DV-0184", type: "activated", timestamp: "2025-12-08T09:45:00Z", location: { country: "China", district: "Shanghai" } },
  { id: "INT-012", chipId: "DV-0184", type: "cast-started", timestamp: "2026-01-05T10:00:00Z", campaignId: "CMP-201", campaignName: "Metro Spring Retail" },
  { id: "INT-013", chipId: "DV-0184", type: "cast-completed", timestamp: "2026-02-28T22:00:00Z", campaignId: "CMP-201", campaignName: "Metro Spring Retail", tokensEarned: 200 },
  { id: "INT-014", chipId: "DV-0184", type: "claimed", timestamp: "2026-03-01T10:30:00Z", campaignId: "CMP-201", campaignName: "Metro Spring Retail", txHash: "0x88cf...d412", tokensEarned: 200 },
  { id: "INT-015", chipId: "DV-6228", type: "activated", timestamp: "2026-01-05T16:20:00Z", location: { country: "United States", district: "California" } },
  { id: "INT-016", chipId: "DV-6228", type: "cast-started", timestamp: "2026-02-01T08:00:00Z", campaignId: "CMP-209", campaignName: "Hyperlocal Fashion Pulse" },
];

export const overviewStats = {
  activeDevices: 12482,
  onlineClients: 371,
  liveCasts: 869,
  servingCampaigns: 46,
};

export const throughputSeries = [
  { hour: "00:00", casts: 340, confirmations: 314, retries: 21 },
  { hour: "04:00", casts: 412, confirmations: 388, retries: 18 },
  { hour: "08:00", casts: 590, confirmations: 562, retries: 24 },
  { hour: "12:00", casts: 724, confirmations: 691, retries: 28 },
  { hour: "16:00", casts: 808, confirmations: 772, retries: 31 },
  { hour: "20:00", casts: 688, confirmations: 651, retries: 26 },
];

export const regionHealth = [
  { region: "North America", devices: 4180, healthy: 96 },
  { region: "Europe", devices: 3238, healthy: 94 },
  { region: "Asia Pacific", devices: 2860, healthy: 91 },
  { region: "LATAM", devices: 1424, healthy: 89 },
  { region: "MEA", devices: 780, healthy: 86 },
];

export function registerDevice(entry: { chipId: string; devicePk: string; deviceModel: string; manufacturer: string; registeredAt: string }) {
  devices.push({
    ...entry,
    boundAppPk: "",
    status: "in-stock",
    lastSeenMinutes: 999,
    clientVersion: "—",
  });
}

export const devices: Device[] = [
  { chipId: "DV-1042", devicePk: "0x7a3f...e9f2", boundAppPk: "0x91bc...4d17", status: "casting", registeredAt: "2026-01-30T09:00:00Z", activatedAt: "2026-02-14T10:30:00Z", activationIp: "82.132.41.17", activatedLocation: { country: "United Kingdom", district: "Greater London" }, lastSeenMinutes: 1, deviceModel: "iPhone 15 Pro Max", manufacturer: "Waveshare", clientVersion: "2.8.1", campaignId: "CMP-208" },
  { chipId: "DV-2339", devicePk: "0x4e21...b8a3", boundAppPk: "0xd3f0...7e52", status: "casting", registeredAt: "2026-01-10T14:00:00Z", activatedAt: "2026-01-20T14:15:00Z", activationIp: "72.89.104.53", activatedLocation: { country: "United States", district: "New York" }, lastSeenMinutes: 3, deviceModel: "iPhone 14", manufacturer: "Waveshare", clientVersion: "2.8.1", campaignId: "CMP-203" },
  { chipId: "DV-8761", devicePk: "0xc5d8...1fa6", boundAppPk: "0x28e4...9c03", status: "ready-to-claim", registeredAt: "2026-02-18T11:00:00Z", activatedAt: "2026-03-01T06:00:00Z", activationIp: "133.242.18.91", activatedLocation: { country: "Japan", district: "Tokyo" }, lastSeenMinutes: 1, deviceModel: "iPhone 15 Pro", manufacturer: "Good Display", clientVersion: "2.9.0", campaignId: "CMP-211" },
  { chipId: "DV-0184", devicePk: "0x6b92...d4e8", boundAppPk: "0xf1a7...3b90", status: "available", registeredAt: "2025-11-20T08:30:00Z", activatedAt: "2025-12-08T09:45:00Z", activationIp: "116.236.72.44", activatedLocation: { country: "China", district: "Shanghai" }, lastSeenMinutes: 15, deviceModel: "iPhone 13", manufacturer: "Good Display", clientVersion: "2.7.6" },
  { chipId: "DV-5510", devicePk: "0x3af6...82c1", boundAppPk: "0x0e5d...a647", status: "in-stock", registeredAt: "2026-03-15T12:00:00Z", lastSeenMinutes: 74, deviceModel: "iPhone 15", manufacturer: "Waveshare", clientVersion: "2.7.6" },
  { chipId: "DV-6228", devicePk: "0x8d14...5fb9", boundAppPk: "0xb270...e138", status: "casting", registeredAt: "2025-12-20T16:00:00Z", activatedAt: "2026-01-05T16:20:00Z", activationIp: "209.131.57.82", activatedLocation: { country: "United States", district: "California" }, lastSeenMinutes: 2, deviceModel: "iPhone 14 Pro", manufacturer: "Waveshare", clientVersion: "2.8.1", campaignId: "CMP-209" },
];

export const clients: AppClient[] = [
  {
    id: "ios-stable",
    version: "2.9.0",
    releaseState: "stable",
    totalDevices: 8204,
    castSuccessRate: 96.8,
    claimSuccessRate: 94.2,
    avgDailyOpens: 3.4,
    weeklyActive: 7418,
    monthlyActive: 8012,
    modelBreakdown: [
      { model: "iPhone 15 Pro Max", devices: 1840, castSuccessRate: 98.1, claimSuccessRate: 96.3, avgDailyOpens: 3.8 },
      { model: "iPhone 15 Pro", devices: 2105, castSuccessRate: 97.6, claimSuccessRate: 95.5, avgDailyOpens: 3.6 },
      { model: "iPhone 15", devices: 1422, castSuccessRate: 97.0, claimSuccessRate: 94.8, avgDailyOpens: 3.4 },
      { model: "iPhone 14 Pro", devices: 1290, castSuccessRate: 96.2, claimSuccessRate: 93.7, avgDailyOpens: 3.2 },
      { model: "iPhone 14", devices: 982, castSuccessRate: 95.4, claimSuccessRate: 92.1, avgDailyOpens: 3.0 },
      { model: "iPhone 13", devices: 565, castSuccessRate: 93.8, claimSuccessRate: 90.4, avgDailyOpens: 2.6 },
    ],
  },
  {
    id: "ios-prev",
    version: "2.8.1",
    releaseState: "stable",
    totalDevices: 3916,
    castSuccessRate: 94.1,
    claimSuccessRate: 91.6,
    avgDailyOpens: 2.8,
    weeklyActive: 3102,
    monthlyActive: 3640,
    modelBreakdown: [
      { model: "iPhone 15 Pro Max", devices: 310, castSuccessRate: 96.0, claimSuccessRate: 93.8, avgDailyOpens: 3.2 },
      { model: "iPhone 15 Pro", devices: 420, castSuccessRate: 95.2, claimSuccessRate: 93.0, avgDailyOpens: 3.0 },
      { model: "iPhone 15", devices: 586, castSuccessRate: 94.5, claimSuccessRate: 92.1, avgDailyOpens: 2.9 },
      { model: "iPhone 14 Pro", devices: 724, castSuccessRate: 93.8, claimSuccessRate: 91.2, avgDailyOpens: 2.7 },
      { model: "iPhone 14", devices: 891, castSuccessRate: 93.0, claimSuccessRate: 90.4, avgDailyOpens: 2.5 },
      { model: "iPhone 13", devices: 985, castSuccessRate: 91.6, claimSuccessRate: 88.9, avgDailyOpens: 2.2 },
    ],
  },
  {
    id: "ios-rollout",
    version: "2.10.0-rc1",
    releaseState: "rollout",
    totalDevices: 362,
    castSuccessRate: 92.4,
    claimSuccessRate: 89.7,
    avgDailyOpens: 4.1,
    weeklyActive: 348,
    monthlyActive: 362,
    modelBreakdown: [
      { model: "iPhone 15 Pro Max", devices: 128, castSuccessRate: 93.8, claimSuccessRate: 91.2, avgDailyOpens: 4.4 },
      { model: "iPhone 15 Pro", devices: 112, castSuccessRate: 92.6, claimSuccessRate: 90.0, avgDailyOpens: 4.2 },
      { model: "iPhone 15", devices: 74, castSuccessRate: 91.4, claimSuccessRate: 88.5, avgDailyOpens: 3.8 },
      { model: "iPhone 14 Pro", devices: 48, castSuccessRate: 90.2, claimSuccessRate: 87.1, avgDailyOpens: 3.6 },
    ],
  },
];

export const campaigns: CampaignMonitor[] = [
  { id: "CMP-201", name: "Metro Spring Retail", segment: "Retail", status: "active", dbStatus: "serving", chainStatus: "active", fillRate: 93, pacing: 102, tokenPoolConsumedPct: 67, activeDevices: 1844, castImageUrl: "/mock/cmp-201-cast.png", totalTokenPool: 500000, castDurationDays: 14, tokensPerCast: 8, createdAt: "2026-02-18T10:30:00Z", createdBy: "Lena Moreau", advertiserId: "ADV-001", startDate: "2026-03-01T00:00:00Z", submittedAt: "2026-02-15T09:00:00Z", reviewedAt: "2026-02-17T14:30:00Z", reviewedBy: "ops-admin" },
  { id: "CMP-203", name: "Launch Week Consumer Tech", segment: "Technology", status: "active", dbStatus: "serving", chainStatus: "funded", fillRate: 72, pacing: 81, tokenPoolConsumedPct: 45, activeDevices: 1092, castImageUrl: "/mock/cmp-203-cast.png", totalTokenPool: 300000, castDurationDays: 7, tokensPerCast: 12, createdAt: "2026-03-02T14:00:00Z", createdBy: "James Chen", advertiserId: "ADV-002", startDate: "2026-03-10T00:00:00Z", submittedAt: "2026-02-28T11:00:00Z", reviewedAt: "2026-03-01T10:00:00Z", reviewedBy: "ops-admin" },
  { id: "CMP-205", name: "Luxury Travel Moments", segment: "Travel", status: "aborted", dbStatus: "paused", chainStatus: "settling", fillRate: 0, pacing: 0, tokenPoolConsumedPct: 88, activeDevices: 0, castImageUrl: "/mock/cmp-205-cast.png", totalTokenPool: 750000, castDurationDays: 30, tokensPerCast: 10, createdAt: "2026-01-10T08:00:00Z", createdBy: "Aisha Patel", advertiserId: "ADV-003", startDate: "2026-01-20T00:00:00Z", submittedAt: "2026-01-08T15:00:00Z", reviewedAt: "2026-01-09T09:00:00Z", reviewedBy: "ops-admin" },
  { id: "CMP-208", name: "Weekend Beverage Push", segment: "FMCG", status: "active", dbStatus: "serving", chainStatus: "active", fillRate: 97, pacing: 108, tokenPoolConsumedPct: 59, activeDevices: 2101, castImageUrl: "/mock/cmp-208-cast.png", totalTokenPool: 400000, castDurationDays: 3, tokensPerCast: 15, createdAt: "2026-04-05T16:45:00Z", createdBy: "Lena Moreau", advertiserId: "ADV-001", startDate: "2026-04-07T00:00:00Z", submittedAt: "2026-04-03T08:00:00Z", reviewedAt: "2026-04-04T16:00:00Z", reviewedBy: "ops-admin" },
  { id: "CMP-209", name: "Hyperlocal Fashion Pulse", segment: "Fashion", status: "active", dbStatus: "scheduled", chainStatus: "funded", fillRate: 18, pacing: 34, tokenPoolConsumedPct: 12, activeDevices: 286, castImageUrl: "/mock/cmp-209-cast.png", totalTokenPool: 200000, castDurationDays: 10, tokensPerCast: 6, createdAt: "2026-04-01T09:15:00Z", createdBy: "Marcus Rivera", advertiserId: "ADV-004", startDate: "2026-04-12T00:00:00Z", submittedAt: "2026-03-28T14:00:00Z", reviewedAt: "2026-03-31T11:00:00Z", reviewedBy: "ops-admin" },
  { id: "CMP-211", name: "Citywide Fintech Awareness", segment: "Finance", status: "completed", dbStatus: "completed", chainStatus: "settling", fillRate: 95, pacing: 99, tokenPoolConsumedPct: 73, activeDevices: 2412, castImageUrl: "/mock/cmp-211-cast.png", totalTokenPool: 600000, castDurationDays: 21, tokensPerCast: 10, createdAt: "2026-02-28T11:20:00Z", createdBy: "James Chen", advertiserId: "ADV-002", startDate: "2026-03-05T00:00:00Z", submittedAt: "2026-02-25T10:00:00Z", reviewedAt: "2026-02-27T09:00:00Z", reviewedBy: "ops-admin" },
  // Approved — awaiting start date
  { id: "CMP-212", name: "Summer Wellness Wave", segment: "Health", status: "approved", dbStatus: "scheduled", chainStatus: "funded", fillRate: 0, pacing: 0, tokenPoolConsumedPct: 0, activeDevices: 0, castImageUrl: "/mock/cmp-212-cast.png", totalTokenPool: 350000, castDurationDays: 14, tokensPerCast: 9, createdAt: "2026-04-10T08:00:00Z", createdBy: "Aisha Patel", advertiserId: "ADV-003", startDate: "2026-04-20T00:00:00Z", submittedAt: "2026-04-08T11:00:00Z", reviewedAt: "2026-04-10T08:00:00Z", reviewedBy: "ops-admin", targetDeviceCount: 1800, campaignBrief: "Promote wellness supplements across urban commuter demographics during morning and evening slots." },
  { id: "CMP-213", name: "Electric Auto Launch", segment: "Automotive", status: "approved", dbStatus: "scheduled", chainStatus: "funded", fillRate: 0, pacing: 0, tokenPoolConsumedPct: 0, activeDevices: 0, castImageUrl: "/mock/cmp-213-cast.png", totalTokenPool: 800000, castDurationDays: 28, tokensPerCast: 14, createdAt: "2026-04-11T15:30:00Z", createdBy: "James Chen", advertiserId: "ADV-002", startDate: "2026-04-25T00:00:00Z", submittedAt: "2026-04-09T16:00:00Z", reviewedAt: "2026-04-11T15:30:00Z", reviewedBy: "ops-admin", targetDeviceCount: 3000, campaignBrief: "Nationwide launch awareness for the NX-7 electric vehicle. High-impact creative targeting tech-savvy urban commuters." },
  // Pending review
  { id: "CMP-214", name: "Gourmet Coffee Mornings", segment: "FMCG", status: "review", dbStatus: "pending-review", chainStatus: "unfunded", fillRate: 0, pacing: 0, tokenPoolConsumedPct: 0, activeDevices: 0, castImageUrl: "/mock/cmp-214-cast.png", totalTokenPool: 180000, castDurationDays: 7, tokensPerCast: 7, createdAt: "2026-04-12T09:00:00Z", createdBy: "Lena Moreau", advertiserId: "ADV-001", startDate: "2026-04-22T00:00:00Z", submittedAt: "2026-04-12T09:00:00Z", targetDeviceCount: 1200, campaignBrief: "Drive brand awareness for a premium single-origin coffee line. Target morning commuters in major metro areas with eye-catching E-ink visuals." },
  { id: "CMP-215", name: "Streaming Music Festival", segment: "Entertainment", status: "review", dbStatus: "pending-review", chainStatus: "unfunded", fillRate: 0, pacing: 0, tokenPoolConsumedPct: 0, activeDevices: 0, castImageUrl: "/mock/cmp-215-cast.png", totalTokenPool: 500000, castDurationDays: 5, tokensPerCast: 20, createdAt: "2026-04-13T14:20:00Z", createdBy: "Suki Tanaka", advertiserId: "ADV-005", startDate: "2026-04-28T00:00:00Z", submittedAt: "2026-04-13T14:20:00Z", targetDeviceCount: 2500, campaignBrief: "Promote a 3-day virtual music festival. High token incentive to maximize screen time during the lead-up week. Creative features bold typography on dark background optimized for E-ink." },
  { id: "CMP-216", name: "Crypto Wallet Onboarding", segment: "Finance", status: "review", dbStatus: "pending-review", chainStatus: "unfunded", fillRate: 0, pacing: 0, tokenPoolConsumedPct: 0, activeDevices: 0, castImageUrl: "/mock/cmp-216-cast.png", totalTokenPool: 420000, castDurationDays: 21, tokensPerCast: 11, createdAt: "2026-04-14T07:45:00Z", createdBy: "Marcus Rivera", advertiserId: "ADV-004", startDate: "2026-05-01T00:00:00Z", submittedAt: "2026-04-14T07:45:00Z", targetDeviceCount: 2000, campaignBrief: "User acquisition campaign for a new non-custodial crypto wallet. Emphasize security and ease-of-use messaging across tech-forward urban markets." },
];

export const castEvents: CastEvent[] = [
  { id: "CAST-9001", deviceAlias: "DV-1042", campaignName: "Weekend Beverage Push", startedAt: "2026-04-09T08:41:00Z", endedAt: "2026-04-09T08:41:12Z", durationSec: 12, status: "claimed", source: "chain-readonly", txHash: "0x2f11...ab91" },
  { id: "CAST-9002", deviceAlias: "DV-2339", campaignName: "Launch Week Consumer Tech", startedAt: "2026-04-09T08:39:00Z", durationSec: 0, status: "started", source: "operation-db" },
  { id: "CAST-9003", deviceAlias: "DV-5510", campaignName: "Luxury Travel Moments", startedAt: "2026-04-09T08:32:00Z", durationSec: 0, status: "aborted", source: "operation-db" },
  { id: "CAST-9004", deviceAlias: "DV-8761", campaignName: "Citywide Fintech Awareness", startedAt: "2026-04-09T08:27:00Z", endedAt: "2026-04-09T08:27:15Z", durationSec: 15, status: "claimed", source: "chain-readonly", txHash: "0x913a...1ce4" },
  { id: "CAST-9005", deviceAlias: "DV-6228", campaignName: "Hyperlocal Fashion Pulse", startedAt: "2026-04-09T08:24:00Z", endedAt: "2026-04-09T08:24:09Z", durationSec: 9, status: "ended", source: "operation-db" },
  { id: "CAST-9006", deviceAlias: "DV-0184", campaignName: "Metro Spring Retail", startedAt: "2026-04-09T08:18:00Z", endedAt: "2026-04-09T08:18:11Z", durationSec: 11, status: "claimed", source: "chain-readonly", txHash: "0x44b2...e7f3" },
  { id: "CAST-9007", deviceAlias: "DV-1042", campaignName: "Weekend Beverage Push", startedAt: "2026-04-09T08:12:00Z", endedAt: "2026-04-09T08:12:14Z", durationSec: 14, status: "claimed", source: "chain-readonly", txHash: "0x71d9...3a08" },
  { id: "CAST-9008", deviceAlias: "DV-2339", campaignName: "Launch Week Consumer Tech", startedAt: "2026-04-09T08:05:00Z", durationSec: 0, status: "aborted", source: "operation-db" },
  { id: "CAST-9009", deviceAlias: "DV-6228", campaignName: "Hyperlocal Fashion Pulse", startedAt: "2026-04-09T07:58:00Z", endedAt: "2026-04-09T07:58:10Z", durationSec: 10, status: "ended", source: "operation-db" },
  { id: "CAST-9010", deviceAlias: "DV-8761", campaignName: "Citywide Fintech Awareness", startedAt: "2026-04-09T07:51:00Z", endedAt: "2026-04-09T07:51:13Z", durationSec: 13, status: "claimed", source: "chain-readonly", txHash: "0xbe47...c901" },
  { id: "CAST-9011", deviceAlias: "DV-0184", campaignName: "Metro Spring Retail", startedAt: "2026-04-09T07:44:00Z", durationSec: 0, status: "started", source: "operation-db" },
  { id: "CAST-9012", deviceAlias: "DV-1042", campaignName: "Weekend Beverage Push", startedAt: "2026-04-09T07:38:00Z", endedAt: "2026-04-09T07:38:11Z", durationSec: 11, status: "claimed", source: "chain-readonly", txHash: "0x5f83...d214" },
  { id: "CAST-9013", deviceAlias: "DV-5510", campaignName: "Metro Spring Retail", startedAt: "2026-04-09T07:30:00Z", durationSec: 0, status: "aborted", source: "operation-db" },
  { id: "CAST-9014", deviceAlias: "DV-2339", campaignName: "Launch Week Consumer Tech", startedAt: "2026-04-09T07:22:00Z", endedAt: "2026-04-09T07:22:12Z", durationSec: 12, status: "ended", source: "chain-readonly", txHash: "0xa3e1...8b72" },
  { id: "CAST-9015", deviceAlias: "DV-6228", campaignName: "Hyperlocal Fashion Pulse", startedAt: "2026-04-09T07:15:00Z", endedAt: "2026-04-09T07:15:09Z", durationSec: 9, status: "ended", source: "operation-db" },
];

export function getAdvertiser(id: string): Advertiser | undefined {
  return advertisers.find((a) => a.id === id);
}

export const castSummaryStats = {
  totalCastsToday: 3842,
  successRate: 94.6,
  avgDurationSec: 12.3,
  activeCampaignsCasting: 4,
  totalStarted: 148,
  totalAborted: 62,
  tokensDistributedToday: 38420,
};

export const campaignCastSummary = [
  { campaignId: "CMP-201", campaignName: "Metro Spring Retail", castsToday: 1102, successRate: 96.2, avgDuration: 11.4, tokensDistributed: 8816, activeDevices: 1844 },
  { campaignId: "CMP-203", campaignName: "Launch Week Consumer Tech", castsToday: 624, successRate: 91.8, avgDuration: 14.2, tokensDistributed: 7488, activeDevices: 1092 },
  { campaignId: "CMP-208", campaignName: "Weekend Beverage Push", castsToday: 1480, successRate: 97.1, avgDuration: 11.8, tokensDistributed: 22200, activeDevices: 2101 },
  { campaignId: "CMP-209", campaignName: "Hyperlocal Fashion Pulse", castsToday: 186, successRate: 88.4, avgDuration: 13.6, tokensDistributed: 1116, activeDevices: 286 },
];

/* ── Campaign growth over time (daily, last 14 days) ── */

export const campaignGrowthSeries = [
  { date: "Mar 27", activeCampaigns: 2, totalCasts: 1840 },
  { date: "Mar 28", activeCampaigns: 2, totalCasts: 2110 },
  { date: "Mar 29", activeCampaigns: 3, totalCasts: 2680 },
  { date: "Mar 30", activeCampaigns: 3, totalCasts: 2420 },
  { date: "Mar 31", activeCampaigns: 3, totalCasts: 2890 },
  { date: "Apr 1", activeCampaigns: 4, totalCasts: 3120 },
  { date: "Apr 2", activeCampaigns: 4, totalCasts: 3340 },
  { date: "Apr 3", activeCampaigns: 4, totalCasts: 3580 },
  { date: "Apr 4", activeCampaigns: 4, totalCasts: 3210 },
  { date: "Apr 5", activeCampaigns: 4, totalCasts: 3760 },
  { date: "Apr 6", activeCampaigns: 4, totalCasts: 3490 },
  { date: "Apr 7", activeCampaigns: 4, totalCasts: 3680 },
  { date: "Apr 8", activeCampaigns: 4, totalCasts: 3920 },
  { date: "Apr 9", activeCampaigns: 4, totalCasts: 3842 },
];

/* ── Token distribution over time (daily, USDC-denominated) ── */

export const tokenDistributionSeries = [
  { date: "Mar 27", distributed: 14720, poolDeposited: 22000, cumulativeDistributed: 14720 },
  { date: "Mar 28", distributed: 16880, poolDeposited: 22000, cumulativeDistributed: 31600 },
  { date: "Mar 29", distributed: 21440, poolDeposited: 34000, cumulativeDistributed: 53040 },
  { date: "Mar 30", distributed: 19360, poolDeposited: 34000, cumulativeDistributed: 72400 },
  { date: "Mar 31", distributed: 23120, poolDeposited: 34000, cumulativeDistributed: 95520 },
  { date: "Apr 1", distributed: 28080, poolDeposited: 48000, cumulativeDistributed: 123600 },
  { date: "Apr 2", distributed: 30060, poolDeposited: 48000, cumulativeDistributed: 153660 },
  { date: "Apr 3", distributed: 32220, poolDeposited: 48000, cumulativeDistributed: 185880 },
  { date: "Apr 4", distributed: 28890, poolDeposited: 48000, cumulativeDistributed: 214770 },
  { date: "Apr 5", distributed: 33840, poolDeposited: 48000, cumulativeDistributed: 248610 },
  { date: "Apr 6", distributed: 31410, poolDeposited: 48000, cumulativeDistributed: 280020 },
  { date: "Apr 7", distributed: 33120, poolDeposited: 48000, cumulativeDistributed: 313140 },
  { date: "Apr 8", distributed: 35280, poolDeposited: 48000, cumulativeDistributed: 348420 },
  { date: "Apr 9", distributed: 38420, poolDeposited: 48000, cumulativeDistributed: 386840 },
];

export const statusCounts = [
  { name: "Live", value: 869, fill: "var(--color-chart-1)" },
  { name: "Buffering", value: 124, fill: "var(--color-chart-2)" },
  { name: "Idle", value: 306, fill: "var(--color-chart-3)" },
  { name: "Offline", value: 58, fill: "var(--color-destructive)" },
];
