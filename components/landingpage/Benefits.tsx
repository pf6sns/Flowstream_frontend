"use client";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Timer, TrendingDown, ShieldCheck, Zap, Bell, FileText } from "lucide-react";

const benefits = [
  { metric: "70%", label: "Faster MTTR", desc: "Dramatically reduce Mean Time To Resolution with AI-driven automation.", icon: Timer },
  { metric: "60%", label: "Less Overhead", desc: "Eliminate manual triage, routing, and follow-up tasks.", icon: TrendingDown },
  { metric: "99.5%", label: "SLA Compliance", desc: "Meet and exceed service level agreements consistently.", icon: ShieldCheck },
  { metric: "100%", label: "Automated Workflows", desc: "End-to-end orchestration with zero manual intervention.", icon: Zap },
  { metric: "0", label: "Manual Follow-ups", desc: "Every stakeholder receives automated, real-time updates.", icon: Bell },
  { metric: "Full", label: "Traceability", desc: "Complete audit trail from issue to resolution.", icon: FileText },
];

const Counter = ({ value }: { value: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const motionValue = useMotionValue(0);

  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  const isNumeric = !isNaN(numericValue);
  const suffix = value.replace(/[0-9.]/g, '');

  useEffect(() => {
    if (isInView && isNumeric) {
      const controls = animate(motionValue, numericValue, {
        duration: 1.5,
        ease: "easeOut"
      });
      return () => controls.stop();
    }
  }, [isInView, isNumeric, numericValue, motionValue]);

  const displayValue = useTransform(motionValue, (latest) => {
    if (!isNumeric) return value;
    const isFloat = value.includes('.');
    return `${latest.toFixed(isFloat ? 1 : 0)}${suffix}`;
  });

  if (!isNumeric) {
    return <span ref={ref}>{value}</span>;
  }

  return <motion.span ref={ref}>{displayValue}</motion.span>;
};

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
            Measurable Results. Real ROI.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500">
            Flowstream delivers quantifiable improvements across resolution speed, operational cost, and service quality.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-[#e6f0ff] hover:shadow-xl hover:shadow-brand/5"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e6f0ff] text-[#0065ff]">
                <item.icon className="h-7 w-7" />
              </div>
              <div className="mt-3 font-display text-4xl font-bold text-[#0065ff]">
                <Counter value={item.metric} />
              </div>
              <div className="mt-1 font-display text-base font-bold text-[#111111]">{item.label}</div>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
