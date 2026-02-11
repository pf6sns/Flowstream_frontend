 "use client";

import { motion } from "framer-motion";
import { Shield, Plug, Users, Scale, Zap, FileCheck } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure integrations",
    desc: "Enterprise-grade encryption and secure API connections across all platforms.",
  },
  {
    icon: Plug,
    title: "API-first architecture",
    desc: "RESTful APIs enable seamless connectivity with your existing tech stack.",
  },
  {
    icon: Users,
    title: "Role-based workflows",
    desc: "Granular access controls aligned with your organizational structure.",
  },
  {
    icon: Scale,
    title: "Scalable deployment",
    desc: "Handles 10 or 10,000 daily incidents without performance degradation.",
  },
  {
    icon: Zap,
    title: "Production-ready",
    desc: "Battle-tested automation that runs reliably in mission-critical environments.",
  },
  {
    icon: FileCheck,
    title: "Audit-ready logging",
    desc: "Complete event logs for compliance, governance, and forensic analysis.",
  },
];

export function Enterprise() {
  return (
    <section id="enterprise" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Enterprise ready
          </p>
          <h2 className="mt-3 font-semibold text-2xl text-text sm:text-3xl md:text-4xl">
            Built for scale. Ready for production.
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
              className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

