import { NavLink, useNavigate } from "react-router-dom";
import {
  Activity,
  LogOut,
  MonitorSmartphone,
  Radio,
  Rows4,
  SquareStack,
} from "lucide-react";
import { useAuth } from "../context/auth-context";
import adpalLogo from "../../assets/36644de98caf356890fbfd747093ee89df1b9cef.png";

const navItems = [
  { to: "/", icon: Rows4, label: "Overview" },
  { to: "/devices", icon: MonitorSmartphone, label: "Devices" },
  { to: "/casts", icon: Radio, label: "Cast Status" },
  { to: "/campaigns", icon: Activity, label: "Campaign Status" },
  { to: "/clients", icon: SquareStack, label: "App Clients" },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="matte-obsidian relative flex h-full w-[280px] shrink-0 flex-col text-sidebar-foreground">
      <div className="relative z-10 flex h-[72px] items-center gap-3 border-b border-sidebar-border px-5 py-4">
        <img src={adpalLogo} alt="AdPal" className="w-10 shrink-0" />
        <div>
          <p className="font-['Space_Grotesk'] text-[17px] font-semibold tracking-[-0.03em]">AdPal</p>
          <p className="text-xs text-white/50">Operation Console</p>
        </div>
      </div>

      <nav className="relative z-10 flex-1 space-y-1 px-4 py-5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              [
                "data-spark flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all",
                isActive
                  ? "border-[#49b5a5]/30 bg-[#49b5a5]/12 text-white shadow-[0_12px_30px_rgba(17,33,31,0.22)]"
                  : "border-transparent text-white/65 hover:border-white/10 hover:bg-white/5 hover:text-white",
              ].join(" ")
            }
          >
            <item.icon size={18} className="shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="relative z-10 border-t border-sidebar-border p-4">
        <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-medium text-white">{user?.name}</p>
          <p className="mt-1 text-xs text-white/50">{user?.role}</p>
          <p className="mt-2 truncate text-xs text-white/40">{user?.email}</p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
