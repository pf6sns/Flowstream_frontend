 "use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Workflow, Ticket, PlugZap, Settings, LogOut } from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const mainNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Workflows", href: "/dashboard/workflows", icon: Workflow },
  { name: "Tickets", href: "/dashboard/tickets", icon: Ticket },
  { name: "Integrations", href: "/dashboard/integrations", icon: PlugZap },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data?.authenticated && data.user?.email) {
          setUserEmail(data.user.email);
        }
      } catch {
        // ignore
      }
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 border-r border-slate-200 bg-white">
      <div className="relative flex h-full flex-col bg-white p-6">
        {/* Brand */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
            <span className="text-base font-bold uppercase tracking-tight">
              fs
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-text">Flowstream</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
              Incident Automation
            </span>
          </div>
        </div>

        {/* Menu: Dashboard, Workflows, Tickets, Integrations */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3">
            Menu
          </p>
          <nav className="space-y-1 text-sm font-medium">
            {mainNav.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                    isActive
                      ? "bg-brand text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User info + account menu trigger */}
        <div className="mt-auto pt-6 text-xs text-slate-400">
          {userEmail ? (
            <button
              type="button"
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-50"
            >
              <p className="font-medium text-slate-500">Signed in as</p>
              <p className="truncate text-slate-700">{userEmail}</p>
            </button>
          ) : (
            <p className="text-slate-400">Loading account…</p>
          )}
        </div>

        {/* Floating account menu (Settings + Logout) */}
        {showUserMenu && (
          <div className="absolute bottom-20 left-6 w-56 rounded-xl border border-slate-200 bg-white/95 py-2 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setShowUserMenu(false);
                router.push("/dashboard/settings");
              }}
              className={`flex w-full items-center gap-3 px-3 py-2 text-left text-xs transition-colors ${
                pathname.startsWith("/dashboard/settings")
                  ? "bg-brand-50 text-brand"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                setShowUserMenu(false);
                await handleLogout();
              }}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:bg-slate-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
