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
    <section id="enterprise" className="bg-gradient-to-b from-[#e6f0ff] to-white py-24 sm:py-32">
      <div className="container mx-auto px-6">
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
              <span className="relative text-xs font-bold uppercase tracking-[0.2em] text-[#0065ff]">
                ENTERPRISE READY
              </span>
            </div>
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold text-[#111111] md:text-5xl">
            Built for Scale. Ready for Production.
          </h2>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e6f0ff] text-[#0065ff]">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#111111]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

