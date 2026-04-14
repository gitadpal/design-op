import { useState, useMemo } from "react";
import { ClipboardCheck, Clock, Image, CheckCircle2, XCircle, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { SectionHeader } from "../components/section-header";
import { campaigns, getAdvertiser, type CampaignMonitor } from "../utils/mock-data";

/* ── Helpers ── */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    + " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

/* ── Page ── */

export function CampaignReviewPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignMonitor | null>(null);
  const [rejectCampaign, setRejectCampaign] = useState<CampaignMonitor | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [actionLog, setActionLog] = useState<{ id: string; action: "approved" | "rejected"; comment?: string }[]>([]);

  const pendingReview = useMemo(
    () => campaigns.filter((c) => c.status === "review" && !actionLog.some((a) => a.id === c.id)),
    [actionLog]
  );

  const recentlyActioned = useMemo(
    () => actionLog.map((a) => ({ ...a, campaign: campaigns.find((c) => c.id === a.id)! })).filter((a) => a.campaign),
    [actionLog]
  );

  function handleApprove(campaign: CampaignMonitor) {
    setActionLog((prev) => [...prev, { id: campaign.id, action: "approved" }]);
    setSelectedCampaign(null);
  }

  function handleReject() {
    if (!rejectCampaign) return;
    setActionLog((prev) => [...prev, { id: rejectCampaign.id, action: "rejected", comment: rejectComment }]);
    setRejectCampaign(null);
    setRejectComment("");
    setSelectedCampaign(null);
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <SectionHeader
        eyebrow="Campaign review"
        title="Pending campaign submissions"
        description="Review advertiser-submitted campaigns before they go live. Approve or reject with feedback."
      />

      {/* ── Summary KPIs ── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Pending review"
          value={pendingReview.length}
          icon={<ClipboardCheck size={18} />}
          tone="orange"
        />
        <SummaryCard
          label="Approved today"
          value={recentlyActioned.filter((a) => a.action === "approved").length}
          icon={<CheckCircle2 size={18} />}
          tone="green"
        />
        <SummaryCard
          label="Rejected today"
          value={recentlyActioned.filter((a) => a.action === "rejected").length}
          icon={<XCircle size={18} />}
          tone="red"
        />
      </div>

      {/* ── Pending review table ── */}
      <Card className="glass-effect border-0">
        <CardHeader>
          <CardTitle>Pending review ({pendingReview.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[260px]">Campaign</TableHead>
                <TableHead className="w-[180px]">Advertiser</TableHead>
                <TableHead className="w-[110px]">Token pool</TableHead>
                <TableHead className="w-[90px]">Duration</TableHead>
                <TableHead className="w-[100px]">Target devices</TableHead>
                <TableHead className="w-[130px]">Submitted</TableHead>
                <TableHead className="w-[130px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingReview.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    No campaigns pending review.
                  </TableCell>
                </TableRow>
              ) : (
                pendingReview.map((c) => {
                  const advertiser = getAdvertiser(c.advertiserId);
                  return (
                    <TableRow key={c.id} className="group">
                      <TableCell className="py-5">
                        <p className="font-medium">{c.name}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                          <span className="font-mono">{c.id}</span>
                          <span className="text-[#d8e8e4]">/</span>
                          <span>{c.segment}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <p className="text-sm font-medium">{advertiser?.name ?? c.createdBy}</p>
                        <p className="text-xs text-muted-foreground">{advertiser?.company}</p>
                      </TableCell>
                      <TableCell className="py-5 tabular-nums font-medium font-['Space_Grotesk']">
                        {c.totalTokenPool.toLocaleString()}
                        <p className="text-[10px] font-normal text-muted-foreground">{c.tokenSymbol} on {c.tokenNetwork}</p>
                      </TableCell>
                      <TableCell className="py-5 tabular-nums text-sm">{c.castDurationDays} days</TableCell>
                      <TableCell className="py-5 tabular-nums text-sm">{c.targetDeviceCount?.toLocaleString() ?? "—"}</TableCell>
                      <TableCell className="py-5 text-xs text-muted-foreground">
                        {c.submittedAt ? formatTimestamp(c.submittedAt) : "—"}
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedCampaign(c)}
                            className="rounded-lg border border-[#d8e8e4] bg-white px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-[#177e73] hover:text-[#177e73]"
                          >
                            <Eye size={13} className="inline mr-1" />
                            Review
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Recently actioned ── */}
      {recentlyActioned.length > 0 && (
        <Card className="glass-effect border-0">
          <CardHeader>
            <CardTitle>Recently actioned ({recentlyActioned.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[260px]">Campaign</TableHead>
                  <TableHead className="w-[180px]">Advertiser</TableHead>
                  <TableHead className="w-[100px]">Decision</TableHead>
                  <TableHead>Comment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentlyActioned.map((a) => {
                  const advertiser = getAdvertiser(a.campaign.advertiserId);
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="py-4">
                        <p className="font-medium">{a.campaign.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground font-mono">{a.id}</p>
                      </TableCell>
                      <TableCell className="py-4">
                        <p className="text-sm">{advertiser?.name ?? a.campaign.createdBy}</p>
                        <p className="text-xs text-muted-foreground">{advertiser?.company}</p>
                      </TableCell>
                      <TableCell className="py-4">
                        {a.action === "approved" ? (
                          <span className="rounded-lg px-2.5 py-1 text-[11px] font-semibold bg-[#E5F7F3] text-[#00B88F] border border-[#00B88F]/20">
                            Approved
                          </span>
                        ) : (
                          <span className="rounded-lg px-2.5 py-1 text-[11px] font-semibold bg-[#fee2e2] text-[#ef4444] border border-[#ef4444]/20">
                            Rejected
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-muted-foreground">
                        {a.comment || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ── Review detail dialog ── */}
      <Dialog open={!!selectedCampaign} onOpenChange={(open) => { if (!open) setSelectedCampaign(null); }}>
        {selectedCampaign && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg">{selectedCampaign.name}</DialogTitle>
              <DialogDescription>
                {selectedCampaign.id} &middot; {selectedCampaign.segment}
              </DialogDescription>
            </DialogHeader>

            <ReviewDetail campaign={selectedCampaign} />

            <DialogFooter className="gap-2 sm:gap-0">
              <button
                onClick={() => {
                  setRejectCampaign(selectedCampaign);
                }}
                className="rounded-xl border border-[#ef4444]/30 bg-[#fee2e2] px-5 py-2.5 text-sm font-medium text-[#ef4444] transition hover:bg-[#fdd]"
              >
                Reject
              </button>
              <button
                onClick={() => handleApprove(selectedCampaign)}
                className="rounded-xl bg-[#143733] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1a4a44]"
              >
                Approve
              </button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* ── Reject comment dialog ── */}
      <Dialog open={!!rejectCampaign} onOpenChange={(open) => { if (!open) { setRejectCampaign(null); setRejectComment(""); } }}>
        {rejectCampaign && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reject campaign</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting "{rejectCampaign.name}". The advertiser will see this comment.
              </DialogDescription>
            </DialogHeader>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Reason for rejection..."
              rows={4}
              className="w-full rounded-xl border border-[#d8e8e4] bg-white px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-[#177e73]"
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <button
                onClick={() => { setRejectCampaign(null); setRejectComment(""); }}
                className="rounded-xl border border-[#d8e8e4] px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectComment.trim()}
                className="rounded-xl bg-[#ef4444] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#dc2626] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm rejection
              </button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

/* ── Review detail view inside dialog ── */

function ReviewDetail({ campaign }: { campaign: CampaignMonitor }) {
  const advertiser = getAdvertiser(campaign.advertiserId);

  return (
    <div className="space-y-5 py-2">
      {/* Advertiser info */}
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-2">Advertiser</p>
        <div className="rounded-xl border border-[#d8e8e4] bg-[#f6fbfa] p-4 space-y-1">
          <p className="text-sm font-medium">{advertiser?.name ?? campaign.createdBy}</p>
          {advertiser && (
            <>
              <p className="text-xs text-muted-foreground">{advertiser.company}</p>
              <p className="text-xs text-muted-foreground">{advertiser.email}</p>
            </>
          )}
        </div>
      </div>

      {/* Campaign brief */}
      {campaign.campaignBrief && (
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-2">Campaign brief</p>
          <p className="text-sm leading-relaxed text-foreground/80">{campaign.campaignBrief}</p>
        </div>
      )}

      {/* Campaign details grid */}
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-2">Campaign details</p>
        <div className="grid grid-cols-2 gap-4">
          <DetailField label="Segment" value={campaign.segment} />
          <DetailField label="Duration" value={`${campaign.castDurationDays} days`} />
          <DetailField label="Start date" value={campaign.startDate ? formatDate(campaign.startDate) : "—"} />
          <DetailField label="Target devices" value={campaign.targetDeviceCount?.toLocaleString() ?? "—"} />
        </div>
      </div>

      {/* Token economics */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Token economics</p>
          <span className="rounded-md bg-[#e3edf0] px-2 py-0.5 text-[10px] font-medium text-[#2d5968]">
            {campaign.tokenSymbol} on {campaign.tokenNetwork}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <DetailField label="Total pool" value={`${campaign.totalTokenPool.toLocaleString()} ${campaign.tokenSymbol}`} highlight />
          <DetailField label="Per cast" value={`${campaign.tokensPerCast} ${campaign.tokenSymbol}`} />
          <DetailField label="Est. total casts" value={Math.floor(campaign.totalTokenPool / campaign.tokensPerCast).toLocaleString()} />
        </div>
      </div>

      {/* Cast image preview */}
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-2">Cast image</p>
        <div className="rounded-2xl border border-[#d8e8e4] bg-[#f6fbfa] flex items-center justify-center" style={{ aspectRatio: "528/768", maxHeight: 240 }}>
          <div className="text-center text-muted-foreground">
            <Image size={28} className="mx-auto mb-1.5 opacity-40" />
            <p className="text-xs">E-ink (528 x 768)</p>
            <p className="text-[10px] font-mono mt-0.5 opacity-60">{campaign.castImageUrl}</p>
          </div>
        </div>
      </div>

      {/* Submission info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock size={13} />
        <span>Submitted {campaign.submittedAt ? formatTimestamp(campaign.submittedAt) : "—"}</span>
      </div>
    </div>
  );
}

/* ── Detail field ── */

function DetailField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
      <p className={["text-sm font-medium tabular-nums", highlight ? "font-['Space_Grotesk'] text-base" : ""].join(" ")}>{value}</p>
    </div>
  );
}

/* ── Summary card ── */

function SummaryCard({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: "green" | "red" | "orange" }) {
  const bg = tone === "green" ? "bg-[#ddf3ef]" : tone === "red" ? "bg-[#fde9e6]" : "bg-[#fff0e8]";
  const fg = tone === "green" ? "text-[#177e73]" : tone === "red" ? "text-[#c44c3f]" : "text-[#b8672f]";
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
