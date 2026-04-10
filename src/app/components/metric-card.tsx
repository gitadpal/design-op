import { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export function MetricCard({
  label,
  value,
  delta,
  tone = "up",
  detail,
  icon,
}: {
  label: string;
  value: string;
  delta: string;
  tone?: "up" | "down" | "neutral";
  detail: string;
  icon: ReactNode;
}) {
  const deltaClass =
    tone === "up"
      ? "text-[#177e73]"
      : tone === "down"
        ? "text-[#c44c3f]"
        : "text-[#546875]";

  return (
    <Card className="glass-effect border-0 shadow-[0_18px_60px_rgba(23,45,40,0.08)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
            <p className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold tracking-[-0.04em]">{value}</p>
          </div>
          <div className="rounded-2xl bg-[#177e73]/10 p-3 text-[#177e73]">{icon}</div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className={["inline-flex items-center gap-1 font-medium", deltaClass].join(" ")}>
            {tone === "down" ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
            {delta}
          </span>
          <span className="text-muted-foreground">{detail}</span>
        </div>
      </CardContent>
    </Card>
  );
}
