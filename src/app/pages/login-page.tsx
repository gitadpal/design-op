import { useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "motion/react";
import { ShieldCheck, Wallet, PlayCircle, RadioTower, Database, MonitorSmartphone } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { Button } from "../components/ui/button";
import adpalLogo from "../../assets/36644de98caf356890fbfd747093ee89df1b9cef.png";

export function LoginPage() {
  const { isAuthenticated, isLoading, loginDemo, privyLogin } = useAuth();
  const [pending, setPending] = useState<"wallet" | "demo" | null>(null);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-[#177E73]/20 border-t-[#177E73] animate-spin" />
          <p className="text-sm text-muted-foreground">Initializing secure access...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const signals = [
    { icon: MonitorSmartphone, title: "Device fleet", detail: "Connectivity, location, version, and active campaign per device." },
    { icon: RadioTower, title: "Cast delivery", detail: "Real-time delivery status, retries, and on-chain confirmations." },
    { icon: Database, title: "Campaign health", detail: "Token pool usage, pacing, and fill rates vs on-chain state." },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eef6f4]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(23,126,115,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,139,82,0.18),transparent_34%)]" />
      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
        <section className="matte-obsidian flex flex-col justify-between overflow-hidden px-8 py-8 text-white md:px-12 lg:px-16">
          <div className="relative z-10 flex items-center gap-3">
            <img src={adpalLogo} alt="AdPal" className="w-11" />
            <div>
              <p className="font-['Space_Grotesk'] text-2xl font-semibold tracking-[-0.03em]">AdPal</p>
              <p className="text-sm text-white/50">Operational platform</p>
            </div>
          </div>

          <div className="relative z-10 max-w-2xl space-y-8 py-12">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[#8fd8cb]">Monitor. Trace. Verify.</p>
              <h1 className="text-4xl leading-tight tracking-[-0.05em] text-white md:text-6xl">
                Real-time visibility into the <span className="text-prism-gradient">E-ink advertising network</span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-white/62">
                Operations console for E-ink device fleet, cast delivery, campaign review, and device registration across all regions.
              </p>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-3">
              {signals.map((signal, index) => (
                <motion.div
                  key={signal.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.2 + index * 0.1 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-[#49b5a5]/14 p-3 text-[#8fd8cb]">
                    <signal.icon size={20} />
                  </div>
                  <p className="text-sm font-medium text-white">{signal.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">{signal.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-sm text-white/45">
            <ShieldCheck size={16} />
            Internal operations console. Authorized personnel only.
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-8 lg:px-12">
          <div className="glass-effect-light w-full max-w-md rounded-[28px] p-7 shadow-[0_24px_70px_rgba(16,41,35,0.12)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[#177e73]">Access</p>
            <h2 className="mt-3 text-3xl tracking-[-0.04em]">Sign in to the operation console</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Wallet for operator access, or demo mode with mock telemetry.
            </p>

            <div className="mt-8 space-y-3">
              <Button
                className="h-12 w-full justify-between rounded-2xl bg-[#143733] px-4 text-sm hover:bg-[#18423d]"
                onClick={() => {
                  setPending("wallet");
                  privyLogin();
                  setTimeout(() => setPending(null), 500);
                }}
              >
                <span className="flex items-center gap-2">
                  <Wallet size={16} />
                  Wallet Sign-In
                </span>
                <span className="text-white/60">{pending === "wallet" ? "Opening..." : "Secure"}</span>
              </Button>

              <Button
                variant="outline"
                className="h-12 w-full justify-between rounded-2xl border-[#cfe0dc] bg-white px-4 text-sm hover:bg-[#f5fbfa]"
                onClick={() => {
                  setPending("demo");
                  loginDemo();
                }}
              >
                <span className="flex items-center gap-2">
                  <PlayCircle size={16} />
                  Demo Sign-In
                </span>
                <span className="text-muted-foreground">{pending === "demo" ? "Entering..." : "Readonly"}</span>
              </Button>
            </div>

            <div className="mt-8 rounded-2xl border border-[#d6e8e4] bg-[#f6fbfa] p-4">
              <p className="text-sm font-medium text-foreground">Access policy</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Wallet login is the primary operator path.</li>
                <li>Demo login provides a readonly walkthrough.</li>
                <li>No mutation controls exposed.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
