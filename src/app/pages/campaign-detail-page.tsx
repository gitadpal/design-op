import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Image, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { SectionHeader } from "../components/section-header";
import { campaigns, deviceInteractions, campaignCastSummary, getAdvertiser } from "../utils/mock-data";

/* ── Status config (platform-aligned) ── */

const statusConfig: Record<string, { label: string; classes: string }> = {
  review: { label: "In Review", classes: "bg-[#fff0e8] text-[#b8672f] border border-[#b8672f]/20" },
  approved: { label: "Approved", classes: "bg-[#f0e6fd] text-[#7c3aed] border border-[#7c3aed]/20" },
  active: { label: "Active", classes: "bg-[#E5F7F3] text-[#00B88F] border border-[#00B88F]/20" },
  completed: { label: "Completed", classes: "bg-[#f1f5f9] text-[#64748b] border border-[#64748b]/20" },
  aborted: { label: "Aborted", classes: "bg-[#fee2e2] text-[#ef4444] border border-[#ef4444]/20" },
};


const interactionTypeConfig: Record<string, { label: string; classes: string }> = {
  "cast-started": { label: "Cast Started", classes: "bg-[#fff0e8] text-[#b8672f]" },
  "cast-completed": { label: "Cast Completed", classes: "bg-[#ddf3ef] text-[#177e73]" },
  "claimed": { label: "Claimed", classes: "bg-[#f0e6fd] text-[#7c3aed]" },
};

/* ── Metric helpers ── */

function fillTone(rate: number) {
  if (rate >= 85) return "text-[#177e73]";
  if (rate >= 60) return "text-[#b8672f]";
  return "text-[#c44c3f]";
}

function pacingTone(pacing: number) {
  if (pacing === 0) return "text-muted-foreground";
  if (pacing > 110) return "text-[#c44c3f]";
  if (pacing > 100) return "text-[#b8672f]";
  if (pacing >= 80) return "text-[#177e73]";
  if (pacing >= 50) return "text-[#b8672f]";
  return "text-[#c44c3f]";
}

function poolTone(pct: number) {
  if (pct >= 90) return "text-[#c44c3f]";
  if (pct >= 75) return "text-[#b8672f]";
  return "text-[#177e73]";
}

/* ── Formatters ── */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    + " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

/* ── Info field ── */

function InfoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-1">{label}</p>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}

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

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const campaign = campaigns.find((c) => c.id === id);

  const interactions = useMemo(() => {
    if (!campaign) return [];
    return deviceInteractions
      .filter((i) => i.campaignId === campaign.id && ["cast-started", "cast-completed", "claimed"].includes(i.type))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [campaign]);

  if (!campaign) {
    return (
      <div className="p-6 lg:p-8">
        <button onClick={() => navigate("/campaigns")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft size={16} /> Back to campaigns
        </button>
        <p className="text-center text-muted-foreground py-16">Campaign not found.</p>
      </div>
    );
  }

  const tokensConsumed = Math.round((campaign.tokenPoolConsumedPct / 100) * campaign.totalTokenPool);
  const tokensRemaining = campaign.totalTokenPool - tokensConsumed;
  const castSummary = campaignCastSummary.find((s) => s.campaignId === campaign.id);
  const accumulatedShowTimeHrs = castSummary
    ? Math.round((castSummary.castsToday * castSummary.avgDuration) / 3600 * 100) / 100
    : 0;
  const totalCastsDelivered = castSummary?.castsToday ?? 0;

  /* Generate daily casting trend across campaign date range */
  const castingTrend = useMemo(() => {
    const start = new Date(campaign.createdAt);
    const days = campaign.castDurationDays;
    const baseDaily = castSummary ? Math.round(castSummary.castsToday * 0.6) : Math.round(campaign.activeDevices * 0.4);
    const seed = campaign.id.charCodeAt(4) || 5;
    const points: { date: string; casts: number }[] = [];
    for (let d = 0; d < days; d++) {
      const day = new Date(start);
      day.setDate(day.getDate() + d);
      // deterministic pseudo-random variation
      const noise = Math.sin(seed * (d + 1) * 2.7) * 0.3 + 1;
      const ramp = Math.min(1, (d + 1) / Math.max(3, days * 0.2));
      const casts = Math.round(baseDaily * noise * ramp);
      points.push({
        date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        casts,
      });
    }
    return points;
  }, [campaign]);

  const sc = statusConfig[campaign.status] ?? { label: campaign.status, classes: "bg-[#e9eff2] text-[#546875]" };
  const advertiser = getAdvertiser(campaign.advertiserId);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <button onClick={() => navigate("/campaigns")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Back to campaigns
      </button>

      <SectionHeader
        eyebrow={campaign.id}
        title={campaign.name}
        description={`${campaign.segment} · ${campaign.castDurationDays}-day campaign`}
      />

      {/* ── Header row: status + advertiser + created info ── */}
      <div className="flex flex-wrap items-center gap-3">
        <span className={["rounded-lg px-3 py-1.5 text-xs font-semibold capitalize", sc.classes].join(" ")}>
          {sc.label}
        </span>
        <span className="text-sm text-muted-foreground">
          Advertiser: <span className="font-medium text-foreground">{advertiser?.name ?? campaign.createdBy}</span>
          {advertiser?.company && <span className="text-muted-foreground"> ({advertiser.company})</span>}
        </span>
        <span className="text-[#d8e8e4]">|</span>
        <span className="rounded-md bg-[#e3edf0] px-2 py-0.5 text-xs font-medium text-[#2d5968]">
          {campaign.tokenSymbol} on {campaign.tokenNetwork}
        </span>
        <span className="text-[#d8e8e4]">|</span>
        <span className="text-sm text-muted-foreground">
          Created {formatDate(campaign.createdAt)}
        </span>
      </div>

      {/* ── Top section: Live preview + Campaign stats ── */}
      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        {/* Cast image preview */}
        <Card className="glass-effect border-0">
          <CardHeader>
            <CardTitle className="text-base">Cast image preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-[#d8e8e4] bg-[#f6fbfa] flex items-center justify-center aspect-[528/768]">
              <div className="text-center text-muted-foreground">
                <Image size={36} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs">E-ink display (528 &times; 768)</p>
                <p className="text-[10px] font-mono mt-1 opacity-60">{campaign.castImageUrl}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign metrics — single unified card */}
        <Card className="glass-effect border-0">
          <CardContent className="p-5 space-y-5">
            {/* Delivery health */}
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-3">Delivery health</p>
              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <MetricTip label="Fill rate" tip="Fill Rate = (Active Devices on Campaign / Eligible Devices in Network) × 100. Measures what share of the network's eligible device supply is currently serving this campaign." />
                    <span className={["font-medium tabular-nums", fillTone(campaign.fillRate)].join(" ")}>{campaign.fillRate}%</span>
                  </div>
                  <Progress value={campaign.fillRate} className="h-2 bg-[#e2efec]" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <MetricTip label="Pacing" tip="Pacing = (Actual Tokens Distributed / Expected Tokens Distributed) × 100, where Expected = Total Pool × (Elapsed Days / Duration Days). 100% = on track." />
                    <div className="flex items-center gap-1">
                      {campaign.pacing > 100 && <ArrowUpRight size={13} className="text-[#c44c3f]" />}
                      {campaign.pacing > 0 && campaign.pacing < 80 && <ArrowDownRight size={13} className="text-[#b8672f]" />}
                      <span className={["font-medium tabular-nums", pacingTone(campaign.pacing)].join(" ")}>{campaign.pacing}%</span>
                    </div>
                  </div>
                  <Progress value={Math.min(campaign.pacing, 100)} className="h-2 bg-[#e2efec]" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <MetricTip label="Pool consumed" tip="Pool Consumed = (Tokens Distributed / Total Token Pool) × 100." />
                    <span className={["font-medium tabular-nums", poolTone(campaign.tokenPoolConsumedPct)].join(" ")}>{campaign.tokenPoolConsumedPct}%</span>
                  </div>
                  <Progress value={campaign.tokenPoolConsumedPct} className="h-2 bg-[#e2efec]" />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    <span className="font-['Space_Grotesk'] font-medium text-foreground">{tokensConsumed.toLocaleString()}</span>
                    {" / "}{campaign.totalTokenPool.toLocaleString()} {campaign.tokenSymbol}
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Token pool + Cast & duration side by side */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <div className="grid gap-3 grid-cols-2">
                  <InfoField label="Total pool">
                    <p className="font-['Space_Grotesk'] text-lg">{campaign.totalTokenPool.toLocaleString()} <span className="text-sm text-muted-foreground">{campaign.tokenSymbol}</span></p>
                  </InfoField>
                  <InfoField label="Tokens per cast">
                    <p className="font-['Space_Grotesk'] text-lg">{campaign.tokensPerCast} <span className="text-sm text-muted-foreground">{campaign.tokenSymbol}</span></p>
                  </InfoField>
                  <InfoField label="Distributed">
                    <p className="font-['Space_Grotesk'] text-lg text-[#7c3aed]">{tokensConsumed.toLocaleString()} <span className="text-sm text-muted-foreground">{campaign.tokenSymbol}</span></p>
                  </InfoField>
                  <InfoField label="Remaining">
                    <p className={["font-['Space_Grotesk'] text-lg", campaign.tokenPoolConsumedPct >= 90 ? "text-[#c44c3f]" : "text-[#177e73]"].join(" ")}>{tokensRemaining.toLocaleString()} <span className="text-sm text-muted-foreground">{campaign.tokenSymbol}</span></p>
                  </InfoField>
                </div>
              </div>
              <div>
                <div className="grid gap-3 grid-cols-2">
                  <InfoField label="Campaign length">
                    <p className="font-['Space_Grotesk'] text-lg">{campaign.castDurationDays} days</p>
                  </InfoField>
                  <InfoField label="Active devices">
                    <p className="font-['Space_Grotesk'] text-lg">{campaign.activeDevices.toLocaleString()}</p>
                  </InfoField>
                  <InfoField label="Casts today">
                    <p className="font-['Space_Grotesk'] text-lg">{totalCastsDelivered.toLocaleString()}</p>
                  </InfoField>
                  <InfoField label="Show time today">
                    <p className="font-['Space_Grotesk'] text-lg">{accumulatedShowTimeHrs} hrs</p>
                  </InfoField>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Casting trend */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Casting trend</p>
                <p className="text-[11px] text-muted-foreground">Daily casts across campaign date range</p>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={castingTrend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="castGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#177e73" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#177e73" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
                  />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(value: number) => [value.toLocaleString(), "Casts"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="casts"
                    stroke="#177e73"
                    strokeWidth={1.5}
                    fill="url(#castGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Cast & claim history ── */}
      <Card className="glass-effect border-0">
        <CardHeader>
          <CardTitle>Cast &amp; claim history ({interactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Tokens earned</TableHead>
                <TableHead>Tx hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No cast or claim interactions recorded for this campaign.
                  </TableCell>
                </TableRow>
              ) : (
                interactions.map((interaction) => {
                  const tc = interactionTypeConfig[interaction.type] ?? { label: interaction.type, classes: "bg-[#e9eff2] text-[#546875]" };
                  return (
                    <TableRow key={interaction.id}>
                      <TableCell className="text-muted-foreground">{formatTimestamp(interaction.timestamp)}</TableCell>
                      <TableCell>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/devices/${interaction.chipId}`); }}
                          className="font-mono text-[#177e73] hover:underline underline-offset-2"
                        >
                          {interaction.chipId}
                        </button>
                      </TableCell>
                      <TableCell>
                        <span className={["rounded-full px-2.5 py-1 text-xs font-medium", tc.classes].join(" ")}>
                          {tc.label}
                        </span>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {interaction.tokensEarned ? `${interaction.tokensEarned} tokens` : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {interaction.txHash ?? "—"}
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
