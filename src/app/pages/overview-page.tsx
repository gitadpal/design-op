import { useNavigate } from "react-router-dom";
import { Activity, CheckCircle2, Coins, MonitorSmartphone, RadioTower, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { MetricCard } from "../components/metric-card";
import { SectionHeader } from "../components/section-header";
import { campaigns, castSummaryStats, campaignGrowthSeries, tokenDistributionSeries } from "../utils/mock-data";

/* ── Status badge config ── */

const statusStyle: Record<string, string> = {
  active: "bg-[#E5F7F3] text-[#00B88F] border border-[#00B88F]/20",
  completed: "bg-[#f1f5f9] text-[#64748b] border border-[#64748b]/20",
  aborted: "bg-[#fee2e2] text-[#ef4444] border border-[#ef4444]/20",
};

/* ── Derived stats ── */

const activeCampaigns = campaigns.filter((c) => c.status === "active");
const totalActiveDevices = activeCampaigns.reduce((sum, c) => sum + c.activeDevices, 0);
const avgFillRate = Math.round(activeCampaigns.reduce((sum, c) => sum + c.fillRate, 0) / activeCampaigns.length);

export function OverviewPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <SectionHeader
        eyebrow="Operations overview"
        title="Cast delivery & campaign health"
        description="Real-time cast throughput, campaign delivery performance, and token distribution across the network."
      />

      {/* ── KPI summary ── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Casts today"
            value={castSummaryStats.totalCastsToday.toLocaleString()}
            delta={`${castSummaryStats.successRate}% success`}
            detail="across all campaigns"
            icon={<RadioTower size={22} />}
          />
          <MetricCard
            label="Active campaigns"
            value={activeCampaigns.length.toString()}
            delta={`${avgFillRate}% avg fill`}
            detail="currently serving"
            icon={<Activity size={22} />}
          />
          <MetricCard
            label="Devices casting"
            value={totalActiveDevices.toLocaleString()}
            delta="+3.2%"
            detail="vs last hour"
            icon={<MonitorSmartphone size={22} />}
          />
          <MetricCard
            label="Tokens distributed"
            value={castSummaryStats.tokensDistributedToday.toLocaleString()}
            delta={`${castSummaryStats.activeCampaignsCasting} campaigns`}
            detail="distributed today"
            icon={<Coins size={22} />}
          />
      </div>

      {/* ── Campaign growth + Token distribution graphs ── */}
      <section className="grid gap-6 xl:grid-cols-2">
        {/* Campaign growth */}
        <Card className="glass-effect border-0">
          <CardHeader>
            <CardTitle>Campaign growth</CardTitle>
          </CardHeader>
          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={campaignGrowthSeries}>
                <defs>
                  <linearGradient id="castsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#177e73" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#177e73" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d8e7e3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis yAxisId="casts" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis yAxisId="campaigns" orientation="right" tickLine={false} axisLine={false} fontSize={12} domain={[0, "dataMax + 2"]} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #d8e8e4", fontSize: 12 }}
                  formatter={(value: number, name: string) => [
                    name === "totalCasts" ? value.toLocaleString() : value,
                    name === "totalCasts" ? "Daily casts" : "Active campaigns",
                  ]}
                />
                <Legend
                  formatter={(value) => (value === "totalCasts" ? "Daily casts" : "Active campaigns")}
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Area yAxisId="casts" type="monotone" dataKey="totalCasts" stroke="#177e73" fill="url(#castsGrad)" strokeWidth={2.5} />
                <Area yAxisId="campaigns" type="stepAfter" dataKey="activeCampaigns" stroke="#7c3aed" fill="none" strokeWidth={2} strokeDasharray="6 3" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Token distribution (USDC) */}
        <Card className="glass-effect border-0">
          <CardHeader>
            <CardTitle>Token distribution (USDC)</CardTitle>
          </CardHeader>
          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tokenDistributionSeries}>
                <defs>
                  <linearGradient id="distribGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#177e73" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#177e73" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="poolGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d8e7e3" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#d8e7e3" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="cumulGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d8e7e3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis yAxisId="daily" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="cumul" orientation="right" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #d8e8e4", fontSize: 12 }}
                  formatter={(value: number, name: string) => {
                    const label = name === "distributed" ? "Daily distributed" : name === "poolDeposited" ? "Pool deposited" : "Cumulative distributed";
                    return [`$${value.toLocaleString()}`, label];
                  }}
                />
                <Legend
                  formatter={(value) => (value === "distributed" ? "Daily distributed" : value === "poolDeposited" ? "Pool deposited" : "Cumulative")}
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Bar yAxisId="daily" dataKey="poolDeposited" fill="url(#poolGrad)" radius={[4, 4, 0, 0]} stackId="stack" />
                <Bar yAxisId="daily" dataKey="distributed" fill="url(#distribGrad)" radius={[4, 4, 0, 0]} stackId="stack" />
                <Area yAxisId="cumul" type="monotone" dataKey="cumulativeDistributed" stroke="#7c3aed" fill="url(#cumulGrad)" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* ── All campaigns quick view ── */}
      <Card className="glass-effect border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Campaign health overview</CardTitle>
          <button
            onClick={() => navigate("/campaigns")}
            className="flex items-center gap-1.5 rounded-xl bg-[#143733] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#1a4a45]"
          >
            <TrendingUp size={13} />
            View all
          </button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/campaigns/${c.id}`)}
                className="cursor-pointer rounded-2xl border border-[#d8e8e4] bg-white/75 p-4 transition-colors hover:border-[#177e73]/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{c.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{c.segment} &middot; {c.id}</p>
                  </div>
                  <span className={["rounded-lg px-2 py-0.5 text-[10px] font-semibold capitalize shrink-0", statusStyle[c.status]].join(" ")}>
                    {c.status}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Fill</p>
                    <p className={["mt-0.5 text-sm font-semibold tabular-nums", c.fillRate >= 85 ? "text-[#177e73]" : c.fillRate >= 60 ? "text-[#b8672f]" : "text-[#c44c3f]"].join(" ")}>
                      {c.fillRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pacing</p>
                    <p className={["mt-0.5 text-sm font-semibold tabular-nums", c.pacing >= 80 && c.pacing <= 110 ? "text-[#177e73]" : c.pacing === 0 ? "text-muted-foreground" : "text-[#b8672f]"].join(" ")}>
                      {c.pacing > 0 ? `${c.pacing}%` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pool</p>
                    <p className={["mt-0.5 text-sm font-semibold tabular-nums", c.tokenPoolConsumedPct >= 90 ? "text-[#c44c3f]" : c.tokenPoolConsumedPct >= 75 ? "text-[#b8672f]" : "text-[#177e73]"].join(" ")}>
                      {c.tokenPoolConsumedPct}%
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 size={12} />
                  <span>{c.activeDevices.toLocaleString()} devices &middot; {c.tokensPerCast} tokens/cast</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
