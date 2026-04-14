import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, CheckCircle2, AlertTriangle, Clock, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { SectionHeader } from "../components/section-header";
import { castEvents, castSummaryStats, campaignCastSummary, type CastEvent } from "../utils/mock-data";

/* ── Status config ── */

const castStatusConfig: Record<string, { label: string; classes: string }> = {
  started: { label: "Started", classes: "bg-[#fff0e8] text-[#b8672f] border border-[#b8672f]/20" },
  ended: { label: "Ended", classes: "bg-[#E5F7F3] text-[#00B88F] border border-[#00B88F]/20" },
  claimed: { label: "Claimed", classes: "bg-[#f0e6fd] text-[#7c3aed] border border-[#7c3aed]/20" },
  aborted: { label: "Aborted", classes: "bg-[#fee2e2] text-[#ef4444] border border-[#ef4444]/20" },
};

const filterOptions = ["all", "started", "ended", "claimed", "aborted"] as const;
type FilterOption = (typeof filterOptions)[number];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/* ── Campaign names from cast events ── */

function uniqueCampaigns(events: CastEvent[]) {
  const names = new Set(events.map((e) => e.campaignName));
  return Array.from(names).sort();
}

/* ── Page ── */

export function CastStatusPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<FilterOption>("all");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const campaignNames = useMemo(() => uniqueCampaigns(castEvents), []);

  const filtered = useMemo(() => {
    let result = castEvents;
    if (statusFilter !== "all") result = result.filter((e) => e.status === statusFilter);
    if (campaignFilter !== "all") result = result.filter((e) => e.campaignName === campaignFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.campaignName.toLowerCase().includes(q) ||
          e.deviceAlias.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [statusFilter, campaignFilter, search]);

  const statusCounts = useMemo(() => {
    const m = { started: 0, ended: 0, claimed: 0, aborted: 0 };
    for (const e of castEvents) m[e.status]++;
    return m;
  }, []);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <SectionHeader
        eyebrow="Cast monitoring"
        title="Cast delivery log"
        description="Campaign-level cast activity, delivery outcomes, and on-chain confirmations."
      />

      {/* ── Summary KPIs ── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Casts today"
          value={castSummaryStats.totalCastsToday.toLocaleString()}
          icon={<Activity size={18} />}
          tone="green"
        />
        <SummaryCard
          label="Claim rate"
          value={`${castSummaryStats.successRate}%`}
          icon={<CheckCircle2 size={18} />}
          tone="green"
        />
        <SummaryCard
          label="In progress"
          value={castSummaryStats.totalStarted.toLocaleString()}
          icon={<Clock size={18} />}
          tone="neutral"
        />
        <SummaryCard
          label="Aborted"
          value={castSummaryStats.totalAborted.toLocaleString()}
          icon={<AlertTriangle size={18} />}
          tone={castSummaryStats.totalAborted > 50 ? "red" : "neutral"}
        />
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Campaign summary</TabsTrigger>
          <TabsTrigger value="log">Cast log</TabsTrigger>
        </TabsList>

        {/* ── Campaign cast summary ── */}
        <TabsContent value="summary">
          <Card className="glass-effect border-0">
            <CardHeader>
              <CardTitle>Campaign cast summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[260px]">Campaign</TableHead>
                    <TableHead className="w-[100px]">Casts today</TableHead>
                    <TableHead className="w-[110px]">Success rate</TableHead>
                    <TableHead className="w-[110px]">Avg duration</TableHead>
                    <TableHead className="w-[130px]">Tokens distributed</TableHead>
                    <TableHead className="w-[100px]">Devices</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignCastSummary.map((c) => (
                    <TableRow
                      key={c.campaignId}
                      className="cursor-pointer group"
                      onClick={() => navigate(`/campaigns/${c.campaignId}`)}
                    >
                      <TableCell className="py-4">
                        <p className="font-medium group-hover:text-[#177e73] transition-colors">{c.campaignName}</p>
                        <p className="mt-1 text-xs text-muted-foreground font-mono">{c.campaignId}</p>
                      </TableCell>
                      <TableCell className="py-4 tabular-nums font-medium">{c.castsToday.toLocaleString()}</TableCell>
                      <TableCell className="py-4">
                        <span className={["tabular-nums font-medium", c.successRate >= 95 ? "text-[#177e73]" : c.successRate >= 90 ? "text-[#b8672f]" : "text-[#c44c3f]"].join(" ")}>
                          {c.successRate}%
                        </span>
                      </TableCell>
                      <TableCell className="py-4 tabular-nums text-muted-foreground">{c.avgDuration}s</TableCell>
                      <TableCell className="py-4 tabular-nums font-medium">{c.tokensDistributed.toLocaleString()}</TableCell>
                      <TableCell className="py-4 tabular-nums">{c.activeDevices.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Cast log ── */}
        <TabsContent value="log" className="space-y-4">
          {/* Filters + search */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1 rounded-xl border border-[#d8e8e4] bg-white/75 p-1">
              {filterOptions.map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={[
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize",
                    statusFilter === f ? "bg-[#143733] text-white" : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {f === "all" ? `All (${castEvents.length})` : `${f} (${statusCounts[f]})`}
                </button>
              ))}
            </div>

            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="rounded-xl border border-[#d8e8e4] bg-white/75 px-3 py-1.5 text-xs font-medium text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#177e73]"
            >
              <option value="all">All campaigns</option>
              {campaignNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search casts..."
                className="rounded-xl border border-[#d8e8e4] bg-white/75 py-1.5 pl-8 pr-3 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[#177e73]"
              />
            </div>
          </div>

          <Card className="glass-effect border-0">
            <CardHeader>
              <CardTitle>Cast log ({filtered.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Cast ID</TableHead>
                    <TableHead className="w-[230px]">Campaign</TableHead>
                    <TableHead className="w-[90px]">Device</TableHead>
                    <TableHead className="w-[80px]">Status</TableHead>
                    <TableHead className="w-[100px]">Time</TableHead>
                    <TableHead className="w-[80px]">Duration</TableHead>
                    <TableHead>Tx hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                        No cast events match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="py-4 font-mono text-xs text-muted-foreground">{event.id}</TableCell>
                        <TableCell className="py-4">
                          <p className="font-medium text-sm">{event.campaignName}</p>
                        </TableCell>
                        <TableCell className="py-4 font-mono text-xs">{event.deviceAlias}</TableCell>
                        <TableCell className="py-4">
                          <span className={["rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize", castStatusConfig[event.status]?.classes ?? "bg-[#e9eff2] text-[#546875]"].join(" ")}>
                            {castStatusConfig[event.status]?.label ?? event.status}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 tabular-nums text-xs text-muted-foreground">{formatTime(event.startedAt)}</TableCell>
                        <TableCell className="py-4 tabular-nums text-xs">
                          {event.durationSec > 0 ? `${event.durationSec}s` : "—"}
                        </TableCell>
                        <TableCell className="py-4 font-mono text-xs text-muted-foreground truncate max-w-[140px]">
                          {event.txHash || "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ── Summary card (compact KPI) ── */

function SummaryCard({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: "green" | "red" | "neutral" }) {
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
