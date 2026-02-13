"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/**
 * Hero section for the landing page.
 * Matches the  Flowstream hero but adapted to the Next.js app + brand tokens.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#e6f0ff] pt-32 pb-24">
      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(36,36,36,0.35) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            ENTERPRISE AI ORCHESTRATION
          </div>

          <h1 className="mx-auto max-w-4xl font-semibold tracking-tight text-black text-4xl leading-tight sm:text-5xl md:text-6xl md:leading-[1.05]">
            Unified Incident Management. <br className="hidden md:block" />
            <span className="text-brand">Intelligent Execution.</span>
          </h1>

          {/* Subheading copy – use darker gray for better contrast on the blue background */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-700 md:text-lg">
            Connect email, ServiceNow, and Jira into one automated workflow. FlowStream classifies, routes, and resolves incidents with Agentic AI, eliminating manual triage and accelerating resolution.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          {/* Primary CTA – Let's Start */}
          <Link
            href="/signup"
            className="inline-flex min-w-[50px] max-h-[50px] items-center justify-center rounded-lg bg-brand px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-brand-600 active:scale-95"
          >
            Let's Start
          </Link>

          {/* Secondary CTA - Log In */}
          <Link
            href="/login"
            className="inline-flex min-w-[50px] max-h-[50px] items-center justify-center rounded-lg border border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
          >
            Sign In
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-xs font-medium text-slate-500 max-w-lg mx-auto italic"
        >
          &quot;A dedicated AI layer that orchestrates the entire incident lifecycle—from email ingestion to final resolution.&quot;
        </motion.p>
      </div>
    </section>
  );
}

