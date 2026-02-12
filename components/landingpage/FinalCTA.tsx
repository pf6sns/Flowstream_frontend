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
              className="inline-flex min-w-[200px] items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-black"
            >
              Request Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex min-w-[200px] items-center justify-center rounded-lg border border-black bg-white px-6 py-3 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-neutral-100"
            >
              Talk to Sales
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </section>
  );
}

