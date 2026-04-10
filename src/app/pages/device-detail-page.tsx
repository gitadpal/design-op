import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check, MapPin, Globe, X, Image } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Progress } from "../components/ui/progress";
import { SectionHeader } from "../components/section-header";
import { devices, deviceInteractions, campaigns, type Device, type CampaignMonitor } from "../utils/mock-data";

const statusConfig: Record<Device["status"], { label: string; classes: string }> = {
  "in-stock": { label: "In Stock", classes: "bg-[#e9eff2] text-[#546875]" },
  "available": { label: "Available to Cast", classes: "bg-[#ddf3ef] text-[#177e73]" },
  "casting": { label: "Casting", classes: "bg-[#fff0e8] text-[#b8672f]" },
  "ready-to-claim": { label: "Ready to Claim", classes: "bg-[#f0e6fd] text-[#7c3aed]" },
};

const interactionTypeConfig: Record<string, { label: string; classes: string }> = {
  "activated": { label: "Activated", classes: "bg-[#ddf3ef] text-[#177e73]" },
  "cast-started": { label: "Cast Started", classes: "bg-[#fff0e8] text-[#b8672f]" },
  "cast-completed": { label: "Cast Completed", classes: "bg-[#e3edf0] text-[#2d5968]" },
  "claimed": { label: "Claimed", classes: "bg-[#f0e6fd] text-[#7c3aed]" },
  "deactivated": { label: "Deactivated", classes: "bg-[#fde9e6] text-[#c44c3f]" },
};

const campaignStatusConfig: Record<string, { label: string; classes: string }> = {
  "active": { label: "Active", classes: "bg-[#E5F7F3] text-[#00B88F]" },
  "completed": { label: "Completed", classes: "bg-[#f1f5f9] text-[#64748b]" },
  "aborted": { label: "Aborted", classes: "bg-[#fee2e2] text-[#ef4444]" },
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="ml-1.5 inline-flex text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    + " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function InfoField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-[#f6fbfa] border border-[#e2efec] p-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</div>
    </div>
  );
}

function CampaignPreview({ campaign, onClose }: { campaign: CampaignMonitor; onClose: () => void }) {
  const statusConf = campaignStatusConfig[campaign.status] ?? { label: campaign.status, classes: "bg-[#e9eff2] text-[#546875]" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-[24px] border border-[#d8e8e4] bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">{campaign.name}</h3>
              <span className={["rounded-full px-2.5 py-1 text-xs font-medium", statusConf.classes].join(" ")}>
                {statusConf.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground font-mono">{campaign.id} &middot; {campaign.segment}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Cast image placeholder */}
        <div className="rounded-2xl border border-[#d8e8e4] bg-[#f6fbfa] flex items-center justify-center h-48 mb-5">
          <div className="text-center text-muted-foreground">
            <Image size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs">Cast image (528 &times; 768)</p>
            <p className="text-xs font-mono mt-1 opacity-60">{campaign.castImageUrl}</p>
          </div>
        </div>

        {/* Campaign stats */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="rounded-xl border border-[#d8e8e4] bg-[#f6fbfa] p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Total Token Pool</p>
            <p className="mt-1 font-['Space_Grotesk'] text-lg font-semibold">{campaign.totalTokenPool.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-[#d8e8e4] bg-[#f6fbfa] p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Tokens per Cast</p>
            <p className="mt-1 font-['Space_Grotesk'] text-lg font-semibold">{campaign.tokensPerCast}</p>
          </div>
          <div className="rounded-xl border border-[#d8e8e4] bg-[#f6fbfa] p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Cast Duration</p>
            <p className="mt-1 font-['Space_Grotesk'] text-lg font-semibold">{campaign.castDurationDays} days</p>
          </div>
          <div className="rounded-xl border border-[#d8e8e4] bg-[#f6fbfa] p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Active Devices</p>
            <p className="mt-1 font-['Space_Grotesk'] text-lg font-semibold">{campaign.activeDevices.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress bars */}
        <div className="space-y-3">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pool consumed</span>
              <span className="font-medium">{campaign.tokenPoolConsumedPct}%</span>
            </div>
            <Progress value={campaign.tokenPoolConsumedPct} className="h-2 bg-[#e2efec]" />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fill rate</span>
              <span className="font-medium">{campaign.fillRate}%</span>
            </div>
            <Progress value={campaign.fillRate} className="h-2 bg-[#e2efec]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DeviceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [previewCampaign, setPreviewCampaign] = useState<CampaignMonitor | null>(null);

  const device = devices.find((d) => d.id === id);
  if (!device) {
    return (
      <div className="p-6 lg:p-8">
        <button onClick={() => navigate("/devices")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft size={16} /> Back to devices
        </button>
        <p className="text-center text-muted-foreground py-16">Device not found.</p>
      </div>
    );
  }

  const interactions = deviceInteractions
    .filter((i) => i.deviceId === device.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const { label: statusLabel, classes: statusClasses } = statusConfig[device.status];
  const isActivated = device.status !== "in-stock";

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <button onClick={() => navigate("/devices")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Back to devices
      </button>

      <SectionHeader
        eyebrow={device.id}
        title="Device details"
        description="Identity, activation info, and interaction history."
      />

      {/* Device info */}
      <Card className="glass-effect border-0">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle>{device.id}</CardTitle>
            <span className={["rounded-full px-2.5 py-1 text-xs font-medium", statusClasses].join(" ")}>
              {statusLabel}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Left column */}
            <div className="space-y-4">
              <SectionCard title="Basics">
                <InfoField label="Device ID">
                  <p className="font-mono flex items-center">
                    {device.id}
                    <CopyButton value={device.id} />
                  </p>
                </InfoField>
                <InfoField label="Manufacturer">
                  <p>{device.manufacturer}</p>
                </InfoField>
                <InfoField label="Device Model">
                  <p>{device.deviceModel}</p>
                </InfoField>
                <InfoField label="Client Version">
                  <p>v{device.clientVersion}</p>
                </InfoField>
                <InfoField label="Registered">
                  <p>{formatTimestamp(device.registeredAt)}</p>
                </InfoField>
              </SectionCard>

              <SectionCard title="Keys">
                <InfoField label="Device Public Key">
                  <p className="font-mono flex items-center break-all">
                    {device.devicePubkey}
                    <CopyButton value={device.devicePubkey} />
                  </p>
                </InfoField>
                <InfoField label="Bound App Public Key">
                  <p className="font-mono flex items-center break-all">
                    {device.boundAppPubkey}
                    <CopyButton value={device.boundAppPubkey} />
                  </p>
                </InfoField>
              </SectionCard>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {isActivated && (
                <SectionCard title="Activation">
                  {device.activatedAt && (
                    <InfoField label="Activated">
                      <p>{formatTimestamp(device.activatedAt)}</p>
                    </InfoField>
                  )}
                  {device.activationIp && (
                    <InfoField label="Activation IP">
                      <p className="flex items-center gap-1.5 font-mono">
                        <Globe size={13} className="text-muted-foreground" />
                        {device.activationIp}
                      </p>
                    </InfoField>
                  )}
                  {device.activatedLocation && (
                    <InfoField label="Location">
                      <p className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#177e73]" />
                        {device.activatedLocation.district}, {device.activatedLocation.country}
                      </p>
                    </InfoField>
                  )}
                </SectionCard>
              )}

              <SectionCard title="Activity">
                <InfoField label="Last Seen">
                  <p>{formatTimestamp(new Date(Date.now() - device.lastSeenMinutes * 60_000).toISOString())}</p>
                </InfoField>
                {device.campaignId && (() => {
                  const linkedCampaign = campaigns.find((c) => c.id === device.campaignId);
                  return (
                    <InfoField label="Current Campaign">
                      {linkedCampaign ? (
                        <button
                          onClick={() => setPreviewCampaign(linkedCampaign)}
                          className="font-mono text-sm text-[#177e73] hover:underline underline-offset-2 transition-colors"
                        >
                          {device.campaignId}
                        </button>
                      ) : (
                        <p className="font-mono">{device.campaignId}</p>
                      )}
                    </InfoField>
                  );
                })()}
              </SectionCard>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interaction history */}
      <Card className="glass-effect border-0">
        <CardHeader>
          <CardTitle>Interaction history ({interactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No interactions recorded.
                  </TableCell>
                </TableRow>
              ) : (
                interactions.map((interaction) => {
                  const typeConf = interactionTypeConfig[interaction.type] ?? { label: interaction.type, classes: "bg-[#e9eff2] text-[#546875]" };
                  const linkedCampaign = interaction.campaignId
                    ? campaigns.find((c) => c.id === interaction.campaignId)
                    : undefined;

                  return (
                    <TableRow key={interaction.id}>
                      <TableCell className="text-muted-foreground">{formatTimestamp(interaction.timestamp)}</TableCell>
                      <TableCell>
                        <span className={["rounded-full px-2.5 py-1 text-xs font-medium", typeConf.classes].join(" ")}>
                          {typeConf.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        {interaction.campaignName ? (
                          linkedCampaign ? (
                            <button
                              onClick={() => setPreviewCampaign(linkedCampaign)}
                              className="text-left font-mono text-sm text-[#177e73] hover:underline underline-offset-2 transition-colors"
                            >
                              {interaction.campaignId} &mdash; {interaction.campaignName}
                            </button>
                          ) : (
                            <span className="font-mono text-muted-foreground">
                              {interaction.campaignId} &mdash; {interaction.campaignName}
                            </span>
                          )
                        ) : (
                          <span className="text-muted-foreground">&mdash;</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {interaction.type === "activated" && interaction.location
                          ? `${interaction.location.district}, ${interaction.location.country}`
                          : interaction.tokensEarned
                            ? `${interaction.tokensEarned} tokens`
                            : interaction.txHash
                              ? <span className="font-mono">{interaction.txHash}</span>
                              : "\u2014"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Campaign preview modal */}
      {previewCampaign && (
        <CampaignPreview campaign={previewCampaign} onClose={() => setPreviewCampaign(null)} />
      )}
    </div>
  );
}
