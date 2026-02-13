"use client";

import { motion } from "framer-motion";
import { Clock, RefreshCcw, Layers, AlertTriangle, AlertCircle } from "lucide-react";

const pains = [
  {
    icon: RefreshCcw,
    title: "Manual Incident Routing",
    desc: "Support teams spend hours manually categorizing and assigning tickets.",
  },
  {
    icon: Clock,
    title: "Disconnected Tools",
    desc: "ServiceNow and Jira operate in silos, creating visibility gaps.",
  },
  {
    icon: Layers,
    title: "Delayed Response Times",
    desc: "Handover friction between systems slows down critical issue resolution.",
  },
  {
    icon: AlertTriangle,
    title: "Lack of Lifecycle Visibility",
    desc: "Stakeholders cannot track the complete journey of an incident.",
  },
  {
    icon: AlertCircle,
    title: "Inconsistent Communication",
    desc: "Updates are lost between technical teams and end-users.",
  },
];

export function PainPoints() {
  return (
    <section className="bg-white py-6 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex justify-center">
            <div className="relative inline-flex items-center justify-center px-8 py-2">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full border border-[#bcd6ff] bg-[#e6f0ff]"
              />
              <span className="relative text-xs font-semibold uppercase tracking-[0.2em] text-[#0065ff]">
                THE PROBLEM
              </span>
            </div>
          </div>
          <h2 className="mt-3 font-semibold text-2xl text-black sm:text-3xl md:text-4xl">
            Operational Fragmentation. Reduced Efficiency.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            Enterprise IT and project teams operate in parallel systems, creating friction and visibility gaps that impact service delivery.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {pains.map((pain, i) => (
            <motion.div
              key={pain.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.45 }}
              className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-brand/40 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e6f0ff] text-[#0065ff]">
                <pain.icon className="h-5 w-5" />
              </div>
              <h3 className="font-medium text-black">{pain.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{pain.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

