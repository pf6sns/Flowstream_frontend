"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type SettingsTab = "company" | "integrations" | "workflow" | "team" | "billing";

const tabs: { id: SettingsTab; label: string }[] = [
  { id: "company", label: "Company" },
  { id: "integrations", label: "Integrations" },
  { id: "workflow", label: "Workflow" },
  { id: "team", label: "Team" },
  { id: "billing", label: "Billing" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("company");
  const [companyName, setCompanyName] = useState("");
  const [companyDomain, setCompanyDomain] = useState("");
  const [companyTimezone, setCompanyTimezone] = useState("UTC");
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyError, setCompanyError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setCompanyLoading(true);
        setCompanyError(null);
        const res = await fetch("/api/companies", { cache: "no-store" });
        if (!res.ok) {
          // For now, just fall back to defaults if company not found/unauthorized
          setCompanyLoading(false);
          return;
        }
        const data = await res.json();
        const company = data.company ?? data.companies?.[0];
        if (company) {
          setCompanyName(company.name ?? "");
          setCompanyDomain(company.domain ?? "");
          setCompanyTimezone(company.timezone ?? "UTC");
        }
      } catch (error) {
        console.error("Error loading company settings:", error);
        setCompanyError("Unable to load company details right now.");
      } finally {
        setCompanyLoading(false);
      }
    };

    fetchCompany();
  }, []);

  return (
    <div className="flex h-full flex-col gap-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text lg:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your Flowstream workspace configuration.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-1 text-sm font-medium">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-t-md px-3 py-2 transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-brand text-brand"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1.1fr)]">
        <div className="space-y-6">
          {activeTab === "company" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-text">Company settings</h2>
              <p className="mt-1 text-xs text-slate-500">
                Update your company profile, branding, and timezone.
              </p>

              {companyError && (
                <p className="mt-3 text-xs text-red-500">{companyError}</p>
              )}

              <form className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600">
                    Company name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="Flowstream Inc."
                    disabled={companyLoading}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Domain
                    </label>
                    <input
                      type="text"
                      value={companyDomain}
                      onChange={(e) => setCompanyDomain(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-black placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
                      placeholder="company.com"
                      disabled={companyLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Timezone
                    </label>
                    <select
                      value={companyTimezone}
                      onChange={(e) => setCompanyTimezone(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-black focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
                      disabled={companyLoading}
                    >
                      <option value="UTC">UTC</option>
                      <option value="Asia/Kolkata">Asia/Kolkata</option>
                      <option value="America/New_York">America/New_York</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <Button size="sm" disabled={companyLoading}>
                    Save changes
                  </Button>
                </div>
              </form>
            </section>
          )}

          {activeTab === "integrations" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-text">Integrations</h2>
              <p className="mt-1 text-xs text-slate-500">
                Configure credentials for ServiceNow, Jira, Gmail, and Groq AI.
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>Use the Integrations page to connect and test each service.</p>
              </div>
            </section>
          )}

          {activeTab === "workflow" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-text">Workflow settings</h2>
              <p className="mt-1 text-xs text-slate-500">
                Control how often emails are checked and how tickets are assigned.
              </p>

              <form className="mt-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Email check frequency (minutes)
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-black focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
                      defaultValue={1}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Default assignment rule
                    </label>
                    <select className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-black focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand">
                      <option>Round robin</option>
                      <option>Least busy engineer</option>
                      <option>Single queue</option>
                    </select>
                  </div>
                </div>
                <div className="pt-2">
                  <Button size="sm">Save workflow settings</Button>
                </div>
              </form>
            </section>
          )}

          {activeTab === "team" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-text">Team management</h2>
              <p className="mt-1 text-xs text-slate-500">
                Manage who can access Flowstream and their roles.
              </p>
              <p className="mt-4 text-sm text-slate-600">
                Team management UI will be implemented later.
              </p>
            </section>
          )}

          {activeTab === "billing" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-text">Billing</h2>
              <p className="mt-1 text-xs text-slate-500">
                Subscription details, invoices, and usage metrics.
              </p>
              <p className="mt-4 text-sm text-slate-600">
                Billing configuration will be added in a future iteration.
              </p>
            </section>
          )}
        </div>

        {/* Right sidebar summary */}
        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Workspace summary
            </h3>
            <ul className="mt-4 space-y-2 text-xs text-slate-600">
              <li>
                Company:{" "}
                <span className="font-medium">
                  {companyName || "Not set"}
                </span>
              </li>
              <li>Integrations: ServiceNow, Jira, Gmail, Groq</li>
              <li>Timezone: {companyTimezone || "UTC"}</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Quick actions
            </h3>
            <div className="mt-3 space-y-2 text-xs">
              <Button variant="outline" size="sm" className="w-full">
                Test ServiceNow connection
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Test Jira connection
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

