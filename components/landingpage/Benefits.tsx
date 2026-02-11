 "use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Timer, TrendingDown, ShieldCheck, Zap, Bell, FileText } from "lucide-react";

const benefits = [
  {
    metric: "70%",
    label: "Faster MTTR",
    desc: "Dramatically reduce Mean Time To Resolution with AI-driven automation.",
    icon: Timer,
  },
  {
    metric: "60%",
    label: "Less overhead",
    desc: "Eliminate manual triage, routing, and follow-up tasks.",
    icon: TrendingDown,
  },
  {
    metric: "99.5%",
    label: "SLA compliance",
    desc: "Meet and exceed service level agreements consistently.",
    icon: ShieldCheck,
  },
  {
    metric: "100%",
    label: "Automated workflows",
    desc: "End-to-end orchestration with zero manual intervention.",
    icon: Zap,
  },
  {
    metric: "0",
    label: "Manual follow-ups",
    desc: "Every stakeholder receives automated, real-time updates.",
    icon: Bell,
  },
  {
    metric: "Full",
    label: "Traceability",
    desc: "Complete audit trail from issue to resolution.",
    icon: FileText,
  },
];

function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const motionValue = useMotionValue(0);

  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
  const isNumeric = !isNaN(numericValue);
  const suffix = value.replace(/[0-9.]/g, "");

  useEffect(() => {
    if (isInView && isNumeric) {
      const controls = animate(motionValue, numericValue, {
        duration: 1.4,
        ease: "easeOut",
      });
      return () => controls.stop();
    }
  }, [isInView, isNumeric, numericValue, motionValue]);

  const displayValue = useTransform(motionValue, (latest) => {
    if (!isNumeric) return value;
    const isFloat = value.includes(".");
    return `${latest.toFixed(isFloat ? 1 : 0)}${suffix}`;
  });

  if (!isNumeric) {
    return <span ref={ref}>{value}</span>;
  }

  return (
    <motion.span ref={ref} className="tabular-nums">
      {displayValue}
    </motion.span>
  );
}

export function Benefits() {
  return (
    <section id="benefits" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Business impact
          </p>
          <h2 className="mt-3 font-semibold text-2xl text-text sm:text-3xl md:text-4xl">
            Measurable results. Real ROI.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            OrchestrAI delivers quantifiable improvements across resolution speed, operational cost,
            and service quality.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
              className="rounded-xl border border-slate-200 bg-white p-7 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand">
                <item.icon className="h-6 w-6" />
              </div>
              <div className="mt-2 font-semibold text-3xl text-text sm:text-4xl">
                <Counter value={item.metric} />
              </div>
              <div className="mt-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {item.label}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

