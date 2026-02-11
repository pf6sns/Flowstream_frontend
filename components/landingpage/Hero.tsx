 "use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

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
            Agentic AI for Enterprise Operations
          </div>

          <h1 className="mx-auto max-w-4xl font-semibold tracking-tight text-black text-4xl leading-tight sm:text-5xl md:text-6xl md:leading-[1.05]">
            Resolve Incidents{" "}
            <span className="text-brand">Before They Escalate</span>
          </h1>

          {/* Subheading copy – use darker gray for better contrast on the blue background */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-700 md:text-lg">
             Flowstream connects your email, service desk, and engineering tools into one
            intelligent automation layer — turning hours of manual triage into minutes of
            AI-driven resolution.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          {/* Watch Demo - simple button linking to YouTube for now */}
          <a
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-neutral-900"
          >
            <Play className="h-4 w-4 fill-current" />
            Watch Demo
          </a>

          {/* Request demo CTA scroll to contact / signup */}
          <a
            href="#benefits"
            className="inline-flex min-w-[180px] items-center justify-center rounded-lg border border-black bg-white px-6 py-3 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-neutral-100"
          >
            Request Demo
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-xs font-medium text-slate-500"
        >
          Trusted by enterprise teams managing 10,000+ incidents monthly
        </motion.p>
      </div>
    </section>
  );
}

