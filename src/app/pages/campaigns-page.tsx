import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, AlertTriangle, CheckCircle2, MonitorSmartphone, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { SectionHeader } from "../components/section-header";
import { campaigns, getAdvertiser, type CampaignMonitor } from "../utils/mock-data";

/* ── Status config (platform-aligned) ── */

type CampaignStatus = CampaignMonitor["status"];

const statusConfig: Record<CampaignStatus, { label: string; classes: string }> = {
  review: { label: "In Review", classes: "bg-[#fff0e8] text-[#b8672f] border border-[#b8672f]/20" },
  approved: { label: "Approved", classes: "bg-[#f0e6fd] text-[#7c3aed] border border-[#7c3aed]/20" },
  active: { label: "Active", classes: "bg-[#E5F7F3] text-[#00B88F] border border-[#00B88F]/20" },
  completed: { label: "Completed", classes: "bg-[#f1f5f9] text-[#64748b] border border-[#64748b]/20" },
  aborted: { label: "Aborted", classes: "bg-[#fee2e2] text-[#ef4444] border border-[#ef4444]/20" },
};

const statusPriority: Record<CampaignStatus, number> = {
  review: 0,
  approved: 1,
  active: 2,
  aborted: 3,
  completed: 4,
};

/* ── Metric tone helpers ── */

function pacingTone(pacing: number) {
  if (pacing === 0) return { color: "text-muted-foreground", bg: "" };
  if (pacing > 110) return { color: "text-[#c44c3f]", bg: "bg-[#fde9e6]" };
  if (pacing > 100) return { color: "text-[#b8672f]", bg: "bg-[#fff0e8]" };
  if (pacing >= 80) return { color: "text-[#177e73]", bg: "bg-[#ddf3ef]" };
  if (pacing >= 50) return { color: "text-[#b8672f]", bg: "bg-[#fff0e8]" };
  return { color: "text-[#c44c3f]", bg: "bg-[#fde9e6]" };
}

function fillTone(rate: number) {
  if (rate >= 85) return "text-[#177e73]";
  if (rate >= 60) return "text-[#b8672f]";
  return "text-[#c44c3f]";
}

function poolTone(pct: number) {
  if (pct >= 90) return "text-[#c44c3f]";
  if (pct >= 75) return "text-[#b8672f]";
  return "text-[#177e73]";
}

/* ── Tooltip descriptions ── */

const metricTips = {
  fillRate: "Fill Rate = (Active Devices on Campaign / Eligible Devices in Network) × 100. Measures what share of the network's eligible device supply is currently serving this campaign. Below 85% may indicate insufficient device allocation.",
  pacing: "Pacing = (Actual Tokens Distributed / Expected Tokens Distributed) × 100, where Expected = (Total Pool × Elapsed Days / Duration Days). 100% = on track, >100% = ahead of schedule, <80% = behind.",
  poolConsumed: "Pool Consumed = (Tokens Distributed / Total Token Pool) × 100. Tokens distributed so far versus the total pool deposited by the advertiser.",
};

/* ── Formatters ── */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/* ── Filter ── */

const filterOptions = ["all", "review", "approved", "active", "completed", "aborted"] as const;
type FilterOption = (typeof filterOptions)[number];

/* ── MetricTip — inline label with hover tooltip ── */

function MetricTip({ label, tip }: { label: string; tip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help">
          {label}
          <Info size={12} className="text-muted-foreground/60" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
        {tip}
      </TooltipContent>
    </Tooltip>
  );
}

/* ── Page ── */

export function CampaignsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterOption>("all");

  const sorted = useMemo(() => {
    const filtered = filter === "all" ? campaigns : campaigns.filter((c) => c.status === filter);
    return [...filtered].sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);
  }, [filter]);

  const counts = useMemo(() => {
    const m: Record<CampaignStatus, number> = { review: 0, approved: 0, active: 0, completed: 0, aborted: 0 };
    let totalFill = 0;
    let totalDevices = 0;
    for (const c of campaigns) {
      m[c.status]++;
      totalFill += c.fillRate;
      totalDevices += c.activeDevices;
    }
    return { ...m, avgFill: Math.round(totalFill / campaigns.length), totalDevices };
  }, []);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <SectionHeader
        eyebrow="Campaign status"
        title="Operational campaign monitoring"
        description="Delivery health and token pool consumption across all campaigns."
      />

      {/* ── Summary KPIs ── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Active" value={counts.active} icon={<Activity size={18} />} tone="green" />
        <SummaryCard label="Completed" value={counts.completed} icon={<CheckCircle2 size={18} />} tone="neutral" />
        <SummaryCard label="Aborted" value={counts.aborted} icon={<AlertTriangle size={18} />} tone="red" />
        <SummaryCard label="Avg fill rate" value={`${counts.avgFill}%`} icon={<ArrowUpRight size={18} />} tone="neutral" />
        <SummaryCard label="Total devices" value={counts.totalDevices.toLocaleString()} icon={<MonitorSmartphone size={18} />} tone="neutral" />
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-1 rounded-xl border border-[#d8e8e4] bg-white/75 p-1 w-fit">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={[
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize",
              filter === f ? "bg-[#143733] text-white" : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {f === "all" ? `All (${campaigns.length})` : `${f === "review" ? "In Review" : f} (${counts[f]})`}
          </button>
        ))}
      </div>

      {/* ── Campaign table ── */}
      <Card className="glass-effect border-0">
        <CardHeader>
          <CardTitle>Campaigns ({sorted.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[240px]">Campaign</TableHead>
                <TableHead className="w-[150px]">Advertiser</TableHead>
                <TableHead className="w-[90px]">Status</TableHead>
                <TableHead className="w-[150px]"><MetricTip label="Fill rate" tip={metricTips.fillRate} /></TableHead>
                <TableHead className="w-[170px]"><MetricTip label="Pacing" tip={metricTips.pacing} /></TableHead>
                <TableHead className="w-[180px]"><MetricTip label="Pool consumed" tip={metricTips.poolConsumed} /></TableHead>
                <TableHead className="w-[90px]">Devices</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    No campaigns match this filter.
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((c) => {
                  const advertiser = getAdvertiser(c.advertiserId);
                  return (
                  <TableRow
                    key={c.id}
                    onClick={() => navigate(`/campaigns/${c.id}`)}
                    className="cursor-pointer group"
                  >
                    {/* Campaign identity */}
                    <TableCell className="py-5">
                      <p className="font-medium group-hover:text-[#177e73] transition-colors">{c.name}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="font-mono">{c.id}</span>
                        <span className="text-[#d8e8e4]">/</span>
                        <span>{c.segment}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground/70">
                        {formatDate(c.createdAt)}
                      </div>
                    </TableCell>

                    {/* Advertiser */}
                    <TableCell className="py-5">
                      <p className="text-sm font-medium">{advertiser?.name ?? c.createdBy}</p>
                      <p className="text-xs text-muted-foreground">{advertiser?.company}</p>
                    </TableCell>

                    {/* Status badge */}
                    <TableCell className="py-5">
                      <span className={["rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize", statusConfig[c.status].classes].join(" ")}>
                        {statusConfig[c.status].label}
                      </span>
                    </TableCell>

                    {/* Fill rate mini-graph */}
                    <TableCell className="py-5">
                      <div className="space-y-1.5">
                        <span className={["text-sm font-medium tabular-nums", fillTone(c.fillRate)].join(" ")}>{c.fillRate}%</span>
                        <Progress value={c.fillRate} className="h-1.5 bg-[#e2efec]" />
                      </div>
                    </TableCell>

                    {/* Pacing mini-graph */}
                    <TableCell className="py-5">
                      <PacingCell pacing={c.pacing} />
                    </TableCell>

                    {/* Pool consumed mini-graph */}
                    <TableCell className="py-5">
                      <PoolCell campaign={c} />
                    </TableCell>

                    {/* Devices count */}
                    <TableCell className="py-5">
                      <span className="text-sm tabular-nums font-medium">{c.activeDevices.toLocaleString()}</span>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Summary card (compact KPI) ── */

function SummaryCard({ label, value, icon, tone }: { label: string; value: string | number; icon: React.ReactNode; tone: "green" | "red" | "neutral" }) {
  const bg = tone === "green" ? "bg-[#ddf3ef]" : tone === "red" ? "bg-[#fde9e6]" : "bg-[#e3edf0]";
  const fg = tone === "green" ? "text-[#177e73]" : tone === "red" ? "text-[#c44c3f]" : "text-[#2d5968]";
  return (
    <div className={["rounded-2xl p-4", bg].join(" ")}>
      <div className="flex items-center justify-between">
        <p className={["text-xs uppercase tracking-[0.16em] font-medium", fg].join(" ")}>{label}</p>
        <span className={fg}>{icon}</span>
      </div>
      <p className={["mt-2 font-['Space_Grotesk'] text-2xl font-semibold", fg].join(" ")}>{value}</p>
    </div>
  );
}

/* ── Inline pacing cell ── */

function PacingCell({ pacing }: { pacing: number }) {
  const tone = pacingTone(pacing);

  if (pacing === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className={["text-sm font-medium tabular-nums", tone.color].join(" ")}>{pacing}%</span>
        {pacing > 100 && <ArrowUpRight size={13} className="text-[#c44c3f]" />}
        {pacing > 0 && pacing < 80 && <ArrowDownRight size={13} className="text-[#b8672f]" />}
      </div>
      <Progress value={Math.min(pacing, 100)} className="h-1.5 bg-[#e2efec]" />
    </div>
  );
}

/* ── Inline pool cell ── */

function PoolCell({ campaign }: { campaign: CampaignMonitor }) {
  const consumed = Math.round((campaign.tokenPoolConsumedPct / 100) * campaign.totalTokenPool);
  return (
    <div className="space-y-1.5">
      <span className={["text-sm font-medium tabular-nums", poolTone(campaign.tokenPoolConsumedPct)].join(" ")}>
        {campaign.tokenPoolConsumedPct}%
      </span>
      <Progress value={campaign.tokenPoolConsumedPct} className="h-1.5 bg-[#e2efec]" />
      <p className="text-[10px] text-muted-foreground tabular-nums">
        {consumed.toLocaleString()} / {campaign.totalTokenPool.toLocaleString()} {campaign.tokenSymbol}
      </p>
      <p className="text-[10px] text-muted-foreground/60">{campaign.tokenNetwork}</p>
    </div>
  );
}

