import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { SectionHeader } from "../components/section-header";
import { clients, type AppClient } from "../utils/mock-data";
import { ChevronDown, ChevronRight, Smartphone, Radio, Coins, CalendarDays, Eye } from "lucide-react";

function releaseTone(state: AppClient["releaseState"]) {
  if (state === "stable") return "bg-[#ddf3ef] text-[#177e73]";
  if (state === "rollout") return "bg-[#fff0e8] text-[#b8672f]";
  return "bg-[#e8e0f5] text-[#6b3fa0]";
}

function releaseLabel(state: AppClient["releaseState"]) {
  if (state === "stable") return "Stable";
  if (state === "rollout") return "Rollout";
  return "Beta";
}

const totalDevices = clients.reduce((s, c) => s + c.totalDevices, 0);

export function ClientsPage() {
  const [expanded, setExpanded] = useState<string | null>(clients[0]?.id ?? null);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <SectionHeader
        eyebrow="App clients"
        title="iOS app versions across iPhone models"
        description="Casting success, claim rates, app engagement, and activity — iOS only."
      />

      {/* Summary strip */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="glass-effect border-0">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total devices</p>
            <p className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold">{totalDevices.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="glass-effect border-0">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Weekly active</p>
            <p className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold">
              {clients.reduce((s, c) => s + c.weeklyActive, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-effect border-0">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Monthly active</p>
            <p className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold">
              {clients.reduce((s, c) => s + c.monthlyActive, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-effect border-0">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">iPhone models</p>
            <p className="mt-1 font-['Space_Grotesk'] text-2xl font-semibold">
              {new Set(clients.flatMap((c) => c.modelBreakdown.map((m) => m.model))).size}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Version cards */}
      <div className="space-y-4">
        {clients.map((client) => {
          const isOpen = expanded === client.id;
          return (
            <Card key={client.id} className="glass-effect border-0">
              <CardHeader
                className="cursor-pointer select-none"
                onClick={() => setExpanded(isOpen ? null : client.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {isOpen ? <ChevronDown size={18} className="text-muted-foreground" /> : <ChevronRight size={18} className="text-muted-foreground" />}
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span>iOS {client.version}</span>
                        <span className={["rounded-full px-2.5 py-0.5 text-xs font-medium", releaseTone(client.releaseState)].join(" ")}>
                          {releaseLabel(client.releaseState)}
                        </span>
                      </CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {client.totalDevices.toLocaleString()} devices · {client.modelBreakdown.length} models
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              {isOpen && (
                <CardContent className="space-y-5 pt-0">
                  {/* Aggregate metrics */}
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div className="rounded-2xl border border-[#d8e8e4] bg-white/70 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Radio size={14} />
                        <p className="text-xs uppercase tracking-[0.12em]">Cast success</p>
                      </div>
                      <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold">{client.castSuccessRate}%</p>
                    </div>
                    <div className="rounded-2xl border border-[#d8e8e4] bg-white/70 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Coins size={14} />
                        <p className="text-xs uppercase tracking-[0.12em]">Claim success</p>
                      </div>
                      <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold">{client.claimSuccessRate}%</p>
                    </div>
                    <div className="rounded-2xl border border-[#d8e8e4] bg-white/70 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Eye size={14} />
                        <p className="text-xs uppercase tracking-[0.12em]">Avg daily opens</p>
                      </div>
                      <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold">{client.avgDailyOpens}</p>
                    </div>
                    <div className="rounded-2xl border border-[#d8e8e4] bg-white/70 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays size={14} />
                        <p className="text-xs uppercase tracking-[0.12em]">WAU / MAU</p>
                      </div>
                      <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold">
                        {client.weeklyActive.toLocaleString()}{" "}
                        <span className="text-base font-normal text-muted-foreground">/ {client.monthlyActive.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>

                  {/* Model breakdown table */}
                  <div>
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Breakdown by iPhone model
                    </p>
                    <div className="overflow-hidden rounded-xl border border-[#d8e8e4]">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#d8e8e4] bg-white/70 text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                            <th className="px-4 py-3 font-medium">Model</th>
                            <th className="px-4 py-3 font-medium text-right">Devices</th>
                            <th className="px-4 py-3 font-medium text-right">Cast %</th>
                            <th className="px-4 py-3 font-medium text-right">Claim %</th>
                            <th className="px-4 py-3 font-medium text-right">Opens/day</th>
                          </tr>
                        </thead>
                        <tbody>
                          {client.modelBreakdown.map((m) => (
                            <tr key={m.model} className="border-b border-[#d8e8e4] last:border-0">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Smartphone size={14} className="shrink-0 text-muted-foreground" />
                                  <span className="font-medium">{m.model}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums">{m.devices.toLocaleString()}</td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Progress value={m.castSuccessRate} className="h-1.5 w-16 bg-[#e2efec]" />
                                  <span className="w-12 tabular-nums">{m.castSuccessRate}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Progress value={m.claimSuccessRate} className="h-1.5 w-16 bg-[#e2efec]" />
                                  <span className="w-12 tabular-nums">{m.claimSuccessRate}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums">{m.avgDailyOpens}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
