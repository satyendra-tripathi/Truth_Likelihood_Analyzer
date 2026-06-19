import { BarChart3, History, LogOut, Moon, SearchCheck, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const nav = [
  { to: "/", label: "Analyze", icon: SearchCheck },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/history", label: "History", icon: History }
];

export default function Shell() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen px-4 py-4 text-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <header className="mx-auto mb-6 flex max-w-7xl flex-col gap-4 rounded-lg border border-white/50 bg-white/65 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/65 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">AI NLP Analyzer</p>
          <h1 className="text-xl font-bold">Truth Likelihood Analyzer</h1>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `btn-secondary py-2 ${isActive ? "border-teal-500 text-teal-700 dark:text-teal-300" : ""}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
          <button className="btn-secondary py-2" onClick={() => setDark((value) => !value)} title="Toggle theme">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="btn-secondary py-2" onClick={logout}>
            <LogOut size={18} /> {user?.name}
          </button>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}
