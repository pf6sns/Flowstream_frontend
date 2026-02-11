import Link from "next/link";

/**
 * Marketing footer for the landing page, adapted from the orchestrai-flow Footer.
 */
export function Footer() {
  return (
    <div className="px-4 pb-6 sm:px-6 lg:px-8">
      <footer className="mx-auto max-w-6xl rounded-2xl bg-gradient-to-b from-white to-brand-50 py-10 shadow-sm">
        <div className="flex flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand">
              <span className="text-xs font-bold text-white">O</span>
            </div>
            <span className="text-sm font-semibold text-text">OrchestrAI</span>
            <span className="text-xs text-slate-500">by SNS Square</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 sm:gap-6">
            <Link href="#" className="transition-colors hover:text-text">
              Privacy
            </Link>
            <Link href="#" className="transition-colors hover:text-text">
              Terms
            </Link>
            <Link href="#" className="transition-colors hover:text-text">
              Security
            </Link>
            <Link href="#" className="transition-colors hover:text-text">
              Contact
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SNS Square. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

