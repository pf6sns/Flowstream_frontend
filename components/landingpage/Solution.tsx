"use client";

import { motion } from "framer-motion";
import { Brain, GitPullRequest, Link2, Activity, Bell, CheckCircle2 } from "lucide-react";

const solutions = [
  {
    icon: Brain,
    title: "Intelligent Classification",
    desc: "AI analyzes intent and categorizes incoming requests.",
  },
  {
    icon: GitPullRequest,
    title: "Automated Ticket Creation",
    desc: "Instantly generates ServiceNow incidents and Jira tickets.",
  },
  {
    icon: Link2,
    title: "Smart Routing",
    desc: "Directs tasks to the correct team based on expertise and availability.",
  },
  {
    icon: Activity,
    title: "Lifecycle Synchronization",
    desc: "Updates status across all platforms in real-time.",
  },
  {
    icon: Bell,
    title: "Proactive Notifications",
    desc: "Keeps users and stakeholders informed at every stage.",
  },
  {
    icon: CheckCircle2,
    title: "Automated Closure",
    desc: "Validates resolution and closes tickets without manual intervention.",
  },
];

export function Solution() {
  return (
    <section
      id="solution"
      className="bg-gradient-to-b from-white to-[#e6f0ff] py-16 sm:py-20"
    >
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
                THE SOLUTION
              </span>
            </div>
          </div>
          <h2 className="mt-3 font-semibold text-2xl text-black sm:text-3xl md:text-4xl">
            One Ecosystem. Intelligent Workflows. Real Impact.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            FlowStream serves as the intelligent bridge between your support channels and technical execution.
            <br className="mt-2 block" />
            Our platform orchestrates the complete incident lifecycle:
          </p>
       
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {solutions.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.45 }}
              className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-brand/40 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e6f0ff] text-[#0065ff]">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-black">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

