 "use client";

import { motion } from "framer-motion";
import Link from "next/link";

/**
 * Top navigation bar for the marketing landing page.
 * Uses brand tokens from Tailwind: bg white, brand button, text brand.
 */
export function LandingNavbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <span className="text-sm font-bold text-white">O</span>
          </div>
          <span className="font-semibold text-text text-base sm:text-lg">
            OrchestrAI
          </span>
          <span className="ml-1 hidden text-xs text-slate-500 sm:inline">
            by SNS Square
          </span>
        </div>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
          <a
            href="#solution"
            className="transition-colors hover:text-text"
          >
            Solution
          </a>
          <a
            href="#benefits"
            className="transition-colors hover:text-text"
          >
            Benefits
          </a>
          <a
            href="#workflow"
            className="transition-colors hover:text-text"
          >
            How it works
          </a>
          <a
            href="#enterprise"
            className="transition-colors hover:text-text"
          >
            Enterprise
          </a>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 md:inline-block"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-400"
          >
            Request demo
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

