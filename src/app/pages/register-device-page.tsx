import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Upload, FileSpreadsheet, X, AlertCircle, Download } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { SectionHeader } from "../components/section-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { toast } from "sonner";
import { registerDevice } from "../utils/mock-data";

type RegistrationMode = "single" | "batch";

interface CsvRow {
  chipId: string;
  devicePk: string;
  producedAt: string;
  deviceModel: string;
  manufacturer: string;
}

interface ParsedCsv {
  rows: CsvRow[];
  errors: string[];
}

const CSV_COLUMNS = ["chip_id", "device_pk", "produced_at", "device_model", "manufacturer"] as const;

function parseCsvContent(content: string): ParsedCsv {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    return { rows: [], errors: ["CSV must contain a header row and at least one data row."] };
  }

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));

  const missing = CSV_COLUMNS.filter((col) => !header.includes(col));
  if (missing.length > 0) {
    return { rows: [], errors: [`Missing required columns: ${missing.join(", ")}`] };
  }

  const colIndex = Object.fromEntries(CSV_COLUMNS.map((col) => [col, header.indexOf(col)]));

  const rows: CsvRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    if (cells.length < header.length) {
      errors.push(`Row ${i + 1}: expected ${header.length} columns, got ${cells.length}`);
      continue;
    }

    const row: CsvRow = {
      chipId: cells[colIndex["chip_id"]].trim(),
      devicePk: cells[colIndex["device_pk"]].trim(),
      producedAt: cells[colIndex["produced_at"]].trim(),
      deviceModel: cells[colIndex["device_model"]].trim(),
      manufacturer: cells[colIndex["manufacturer"]].trim(),
    };

    const emptyFields = CSV_COLUMNS.filter((col) => !cells[colIndex[col]].trim());
    if (emptyFields.length > 0) {
      errors.push(`Row ${i + 1}: empty fields — ${emptyFields.join(", ")}`);
      continue;
    }

    rows.push(row);
  }

  return { rows, errors };
}

/** Parse a single CSV line, handling quoted fields with commas inside */
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        cells.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  cells.push(current);
  return cells;
}

function downloadTemplate() {
  const header = CSV_COLUMNS.join(",");
  const example = "DV-8001,0x3af6...82c1,2026-01-15T10:30,iPhone 15 Pro Max,Waveshare";
  // columns: chip_id, device_pk, produced_at, device_model, manufacturer
  const blob = new Blob([header + "\n" + example + "\n"], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "device_registration_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function RegisterDevicePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mode
  const [mode, setMode] = useState<RegistrationMode>("single");

  // Single-registration state
  const [chipId, setChipId] = useState("");
  const [devicePk, setDevicePk] = useState("");
  const [producedAt, setProducedAt] = useState(new Date().toISOString().split("T")[0]);
  const [manufacturer, setManufacturer] = useState("");
  const [deviceModel, setDeviceModel] = useState("");

  // Batch state
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [parsedCsv, setParsedCsv] = useState<ParsedCsv | null>(null);

  const isValid = chipId.trim() && devicePk.trim() && producedAt && manufacturer.trim() && deviceModel.trim();
  const batchValid = parsedCsv && parsedCsv.rows.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    registerDevice({
      chipId: chipId.trim(),
      devicePk: devicePk.trim(),
      deviceModel: deviceModel.trim(),
      manufacturer: manufacturer.trim(),
      registeredAt: new Date(producedAt).toISOString(),
    });
    toast.success(`Device ${chipId} registered and added to stock.`);
    navigate("/devices");
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please select a CSV file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = parseCsvContent(text);
      setCsvFileName(file.name);
      setParsedCsv(result);

      if (result.errors.length > 0 && result.rows.length > 0) {
        toast.warning(`Parsed ${result.rows.length} devices with ${result.errors.length} skipped rows.`);
      } else if (result.rows.length > 0) {
        toast.success(`Parsed ${result.rows.length} devices from CSV.`);
      } else {
        toast.error("No valid rows found in CSV.");
      }
    };
    reader.readAsText(file);

    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  function clearCsv() {
    setCsvFileName(null);
    setParsedCsv(null);
  }

  function handleBatchSubmit() {
    if (!batchValid) return;

    for (const row of parsedCsv!.rows) {
      registerDevice({
        chipId: row.chipId,
        devicePk: row.devicePk,
        deviceModel: row.deviceModel,
        manufacturer: row.manufacturer,
        registeredAt: new Date(row.producedAt).toISOString(),
      });
    }
    toast.success(`${parsedCsv!.rows.length} devices registered and added to stock.`);
    navigate("/devices");
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <button
        onClick={() => navigate("/devices")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Back to devices
      </button>

      <SectionHeader
        eyebrow="Device fleet"
        title="Register new device"
        description="Add a new E-ink device to the whitelist. The device will be registered with an in-stock status."
      />

      {/* Mode toggle */}
      <div className="flex gap-1 rounded-lg bg-muted/50 p-1 w-fit">
        <button
          onClick={() => setMode("single")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "single"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Single
        </button>
        <button
          onClick={() => setMode("batch")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "batch"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Batch Import
        </button>
      </div>

      {mode === "single" ? (
        <Card className="glass-effect border-0 max-w-2xl">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="chipId">Chip ID</Label>
                <Input
                  id="chipId"
                  placeholder="e.g. DV-7001"
                  value={chipId}
                  onChange={(e) => setChipId(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="devicePk">Device PK</Label>
                <Input
                  id="devicePk"
                  placeholder="e.g. 0x3af6...82c1"
                  value={devicePk}
                  onChange={(e) => setDevicePk(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="producedAt">Produced At</Label>
                <Input
                  id="producedAt"
                  type="date"
                  value={producedAt}
                  onChange={(e) => setProducedAt(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deviceModel">Device Model</Label>
                <Input
                  id="deviceModel"
                  placeholder="e.g. iPhone 15 Pro Max, iPhone 13"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  placeholder="e.g. Waveshare, Good Display"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={!isValid} className="rounded-xl bg-[#143733] hover:bg-[#1a4a45]">
                  <Plus size={16} />
                  Register Device
                </Button>
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => navigate("/devices")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 max-w-5xl">
          {/* Upload area */}
          <Card className="glass-effect border-0">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Upload CSV file</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Required columns: <code className="text-[11px] bg-muted/70 px-1 py-0.5 rounded">chip_id</code>,{" "}
                      <code className="text-[11px] bg-muted/70 px-1 py-0.5 rounded">device_pk</code>,{" "}
                      <code className="text-[11px] bg-muted/70 px-1 py-0.5 rounded">produced_at</code>,{" "}
                      <code className="text-[11px] bg-muted/70 px-1 py-0.5 rounded">device_model</code>,{" "}
                      <code className="text-[11px] bg-muted/70 px-1 py-0.5 rounded">manufacturer</code>
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={downloadTemplate}
                  >
                    <Download size={14} />
                    Download template
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!csvFileName ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/40 transition-colors py-10 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Upload size={24} />
                    <span className="text-sm font-medium">Click to select a CSV file</span>
                    <span className="text-xs text-muted-foreground">or drag and drop</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl bg-muted/30 px-4 py-3">
                    <FileSpreadsheet size={20} className="text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{csvFileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {parsedCsv?.rows.length ?? 0} valid device{(parsedCsv?.rows.length ?? 0) !== 1 ? "s" : ""}
                        {parsedCsv?.errors.length ? ` · ${parsedCsv.errors.length} skipped` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs"
                      >
                        Replace
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={clearCsv} className="h-8 w-8">
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Errors */}
          {parsedCsv && parsedCsv.errors.length > 0 && (
            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-[#b8672f] mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-[#b8672f]">
                      {parsedCsv.errors.length} row{parsedCsv.errors.length !== 1 ? "s" : ""} skipped
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {parsedCsv.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                      {parsedCsv.errors.length > 5 && (
                        <li>...and {parsedCsv.errors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview table */}
          {parsedCsv && parsedCsv.rows.length > 0 && (
            <Card className="glass-effect border-0">
              <CardContent className="pt-4 pb-2">
                <p className="text-sm font-medium mb-3">
                  Preview ({parsedCsv.rows.length} device{parsedCsv.rows.length !== 1 ? "s" : ""})
                </p>
                <div className="rounded-lg border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs">#</TableHead>
                        <TableHead className="text-xs">Chip ID</TableHead>
                        <TableHead className="text-xs">Device PK</TableHead>
                        <TableHead className="text-xs">Produced At</TableHead>
                        <TableHead className="text-xs">Device Model</TableHead>
                        <TableHead className="text-xs">Manufacturer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedCsv.rows.slice(0, 50).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="text-xs font-medium">{row.chipId}</TableCell>
                          <TableCell className="text-xs font-mono">{row.devicePk}</TableCell>
                          <TableCell className="text-xs">{row.producedAt}</TableCell>
                          <TableCell className="text-xs">{row.deviceModel}</TableCell>
                          <TableCell className="text-xs">{row.manufacturer}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {parsedCsv.rows.length > 50 && (
                    <p className="text-xs text-muted-foreground text-center py-2 border-t border-border/50">
                      Showing first 50 of {parsedCsv.rows.length} rows
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              disabled={!batchValid}
              className="rounded-xl bg-[#143733] hover:bg-[#1a4a45]"
              onClick={handleBatchSubmit}
            >
              <Plus size={16} />
              Register {parsedCsv?.rows.length ?? 0} Device{(parsedCsv?.rows.length ?? 0) !== 1 ? "s" : ""}
            </Button>
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => navigate("/devices")}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
