"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Footer } from "@/components/landingpage/Footer";

export function FinalCTA() {
  return (
    <section className="bg-gradient-to-b from-white to-[#e6f0ff] pt-2 sm:pt-6">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mx-auto max-w-3xl font-semibold text-2xl text-black sm:text-3xl md:text-4xl">
            Modernize. Automate. Optimize.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
            From customer query to intelligent action — without operational chaos.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm font-medium text-slate-800 md:text-base">
            Intelligence should reduce friction. Automation should enhance execution.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:mt-8 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-w-[200px] items-center justify-center gap-2 rounded-lg bg-brand px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-brand-600 active:scale-95"
            >
              Let's Start
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex min-w-[200px] items-center justify-center rounded-lg border border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </section>
  );
}

