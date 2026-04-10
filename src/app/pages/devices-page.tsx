import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { SectionHeader } from "../components/section-header";
import { devices, type Device } from "../utils/mock-data";

const statusConfig: Record<Device["status"], { label: string; classes: string }> = {
  "in-stock": { label: "In Stock", classes: "bg-[#e9eff2] text-[#546875]" },
  "available": { label: "Available", classes: "bg-[#ddf3ef] text-[#177e73]" },
  "casting": { label: "Casting", classes: "bg-[#fff0e8] text-[#b8672f]" },
  "ready-to-claim": { label: "Ready to Claim", classes: "bg-[#f0e6fd] text-[#7c3aed]" },
};

export function DevicesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Device["status"]>("all");

  const filtered = devices.filter((d) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      d.id.toLowerCase().includes(q) ||
      d.status.includes(q) ||
      (d.activatedLocation?.country.toLowerCase().includes(q) ?? false) ||
      (d.activatedLocation?.district.toLowerCase().includes(q) ?? false) ||
      (d.campaignId?.toLowerCase().includes(q) ?? false);
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <SectionHeader
        eyebrow="Device fleet"
        title="Registered E-ink devices"
        description="Device inventory, activation status, and campaign casting across the AdPal network."
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => navigate("/devices/register")}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#143733] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1a4a45] transition-colors"
        >
          <Plus size={16} />
          Register Device
        </button>

        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, location, campaign..."
            className="w-full rounded-xl border border-[#d8e8e4] bg-white/75 py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-[#177e73] transition-colors"
          />
        </div>

        <div className="flex gap-1 rounded-xl border border-[#d8e8e4] bg-white/75 p-1">
          {(["all", "in-stock", "available", "casting", "ready-to-claim"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={[
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === f ? "bg-[#143733] text-white" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {f === "all" ? "All" : statusConfig[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="glass-effect border-0">
        <CardHeader>
          <CardTitle>Device roster ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>ClientVer</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No devices match your search.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((device) => {
                  const { label, classes } = statusConfig[device.status];
                  return (
                    <TableRow
                      key={device.id}
                      onClick={() => navigate(`/devices/${device.id}`)}
                      className="cursor-pointer"
                    >
                      <TableCell className="py-4 font-mono font-medium">{device.id}</TableCell>
                      <TableCell className="py-4">
                        <span className={["rounded-full px-2.5 py-1 text-xs font-medium", classes].join(" ")}>
                          {label}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-muted-foreground">
                        {device.activatedLocation
                          ? `${device.activatedLocation.district}, ${device.activatedLocation.country}`
                          : "\u2014"}
                      </TableCell>
                      <TableCell className="py-4 font-mono text-muted-foreground">
                        {device.campaignId ?? "\u2014"}
                      </TableCell>
                      <TableCell className="py-4 text-muted-foreground">
                        {device.manufacturer}
                      </TableCell>
                      <TableCell className="py-4 text-muted-foreground">{device.clientVersion}</TableCell>
                      <TableCell className="py-4 text-muted-foreground">{new Date(device.registeredAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</TableCell>
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
