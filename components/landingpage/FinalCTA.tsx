 "use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="bg-gradient-to-b from-white to-brand-50 pt-20 pb-0 sm:pt-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mx-auto max-w-3xl font-semibold text-2xl text-text sm:text-3xl md:text-4xl">
            Transform your incident management with{" "}
            <span className="bg-gradient-to-r from-brand to-brand-200 bg-clip-text text-transparent">
              Agentic AI
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
            Join forward-thinking enterprises that have eliminated manual triage and achieved faster
            resolution times with OrchestrAI.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:mt-10 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-w-[200px] items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-brand-400"
            >
              Request demo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex min-w-[200px] items-center justify-center rounded-full border border-brand bg-white px-6 py-3 text-sm font-semibold text-brand shadow-sm transition-colors hover:bg-brand-50"
            >
              Talk to sales
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer inside CTA section */}
      <div className="mt-16 px-4 pb-6 sm:px-6 lg:px-8">
        <footer className="mx-auto max-w-6xl rounded-2xl bg-white py-8 shadow-sm">
          <div className="flex flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand">
                <span className="text-xs font-bold text-white">O</span>
              </div>
              <span className="text-sm font-semibold text-text">OrchestrAI</span>
              <span className="text-xs text-slate-500">by SNS Square</span>
            </div>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} SNS Square. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
}

