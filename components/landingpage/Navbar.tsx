"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

/**
 * Top navigation bar for the marketing landing page.
 * Uses brand tokens from Tailwind: bg white, brand button, text brand.
 */
export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Solution", href: "#solution" },
    { name: "Benefits", href: "#benefits" },
    { name: "How it works", href: "#workflow" },
    { name: "Enterprise", href: "#enterprise" },
  ];

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
              <span className="text-sm font-bold uppercase tracking-tight text-white">
                fs
              </span>
            </div>
            <span className="font-semibold text-text text-base sm:text-lg">
              Flowstream
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="transition-colors hover:text-brand"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* CTAs & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* <Link
              href="/login"
              className="rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link> */}
            <Link
              href="/signup"
              className="hidden sm:inline-flex rounded-full bg-brand px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-brand-600 transition-all active:scale-95"
            >
              Let's Start
            </Link>

            <button
              className="md:hidden p-1 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-x-0 top-16 z-40 md:hidden border-b border-slate-200 bg-white shadow-xl overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-2 border-t border-slate-100">
                <Link
                  href="/signup"
                  className="flex w-full items-center justify-center rounded-lg bg-brand py-3 text-sm font-bold text-white shadow-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Let's Start
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

