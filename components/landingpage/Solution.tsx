"use client";

import { motion } from "framer-motion";
import { Brain, GitPullRequest, Link2, Activity, Bell, CheckCircle2 } from "lucide-react";

const solutions = [
  {
    icon: Brain,
    title: "Context Awareness",
    desc: "Understands service impact, dependencies, and urgency.",
  },
  {
    icon: GitPullRequest,
    title: "Autonomous Routing",
    desc: "Assigns tasks based on skill, availability, and priority.",
  },
  {
    icon: Link2,
    title: "Adaptive Prioritization",
    desc: "Dynamically re-ranks work as business impact shifts.",
  },
  {
    icon: Activity,
    title: "Predictive SLA Monitoring",
    desc: "Forecasts risk before breaches occur.",
  },
  {
    icon: Bell,
    title: "Continuous Learning Loop",
    desc: "Improves routing and resolution based on historical outcomes.",
  },
  {
    icon: CheckCircle2,
    title: "Cross-Platform Visibility",
    desc: "Unified dashboards for leadership oversight.",
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
            An AI-driven orchestration framework connecting Jira project workflows with ServiceNow ITSM and ITOM operations.
            <br className="mt-2 block" />
            Flowstream creates a unified execution engine that:
          </p>
          <ul className="mx-auto mt-4 max-w-lg text-left text-sm leading-relaxed text-slate-600 md:text-base list-disc pl-5 space-y-1">
            <li>Detects and categorizes incidents automatically</li>
            <li>Routes work using AI-based prioritization</li>
            <li>Synchronizes tasks across platforms in real time</li>
            <li>Learns and optimizes continuously</li>
          </ul>
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

