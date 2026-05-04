import { Link, NavLink, Outlet } from "react-router-dom";
import { BarChart3, FileArchive, History, LogOut, Settings, Shield, Upload, Users } from "lucide-react";
import { getUser } from "../api/client.js";

const navItems = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/upload", label: "Upload Project", icon: Upload },
  { to: "/projects", label: "Projects", icon: FileArchive },
  { to: "/history", label: "Scan History", icon: History },
  { to: "/reports", label: "Reports", icon: Shield },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ onLogout }) {
  const user = getUser();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-slate-950/95 px-5 py-6 lg:block">
        <Link to="/" className="mb-10 flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 shadow-glow">
            <Shield size={26} />
          </div>
          <div>
            <p className="text-xl font-black tracking-tight">BugShield</p>
            <p className="text-xs text-slate-400">AI Security Scanner</p>
          </div>
        </Link>
        <nav className="space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-white/10"}`}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-950/85 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-sm text-slate-400">Secure Code Starts Here</p>
            <h1 className="text-2xl font-black">BugShield Console</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden rounded-2xl border border-white/10 px-4 py-2 text-sm md:block">
              <span className="text-slate-400">Role:</span> {user?.role || "developer"}
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15">
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </header>
        <div className="p-5 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
