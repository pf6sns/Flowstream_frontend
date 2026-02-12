"use client";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Timer, TrendingDown, ShieldCheck, Zap, Bell, FileText } from "lucide-react";

const benefits = [
  { label: "Reduced manual coordination between ITSM and DevOps", icon: TrendingDown },
  { label: "Faster execution across service and delivery teams", icon: Zap },
  { label: "Improved SLA compliance and transparency", icon: ShieldCheck },
  { label: "Strategic alignment between operations and product teams", icon: FileText },
  { label: "Data-driven decision making for CIOs and leadership", icon: TrendingDown }, // Using TrendingDown as a placeholder or reuse another relevant icon
];

const Benefits = () => {
  return (
    <section id="benefits" className="bg-white py-20 sm:py-24">
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
                BUSINESS IMPACT
              </span>
            </div>
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold text-[#111111] md:text-5xl">
            Operational Excellence at Scale
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-[#e6f0ff] hover:shadow-xl hover:shadow-brand/5"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#e6f0ff] text-[#0065ff]">
                <item.icon className="h-7 w-7" />
              </div>
              <div className="font-display text-lg font-bold text-[#111111]">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
