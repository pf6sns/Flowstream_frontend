 "use client";

import { motion } from "framer-motion";
import { Clock, Mail, Unlink, EyeOff, Timer, MessageSquareOff } from "lucide-react";

const pains = [
  {
    icon: Clock,
    title: "Manual ticket creation",
    desc: "Hours wasted manually logging, categorizing, and routing incidents across disconnected systems.",
  },
  {
    icon: Mail,
    title: "Email overload",
    desc: "Critical issues buried in inboxes — missed SLAs and frustrated customers.",
  },
  {
    icon: Unlink,
    title: "Siloed tools",
    desc: "Email, ServiceNow, and Jira operating as islands — no unified view.",
  },
  {
    icon: EyeOff,
    title: "Zero visibility",
    desc: "No real-time insight into incident status, ownership, or resolution progress.",
  },
  {
    icon: Timer,
    title: "Slow resolution",
    desc: "Manual handoffs and escalation delays push MTTR beyond acceptable thresholds.",
  },
  {
    icon: MessageSquareOff,
    title: "Poor communication",
    desc: "Customers left in the dark with no automated updates throughout the lifecycle.",
  },
];

export function PainPoints() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            The problem
          </p>
          <h2 className="mt-3 font-semibold text-2xl text-text sm:text-3xl md:text-4xl">
            Your incident workflow is broken
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            Enterprise teams lose thousands of hours annually to fragmented, manual incident
            management processes.
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
              className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand">
                <pain.icon className="h-5 w-5" />
              </div>
              <h3 className="font-medium text-text">{pain.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{pain.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

