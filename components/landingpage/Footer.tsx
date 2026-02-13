import Link from "next/link";

/**
 * Marketing footer for the landing page, adapted from the  Flowstream-flow Footer.
 */
export function Footer() {
  return (
    <div className="px-4 pb-6 sm:px-6 lg:px-8">
      <footer className="mt-8 w-[75%] mx-auto rounded-2xl bg-white py-10 shadow-sm">
        <div className="flex flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand">
              <span className="text-xs font-bold uppercase tracking-tight text-white">
                fs
              </span>
            </div>
            <span className="text-sm font-semibold text-text">Flowstream</span>
            {/* <span className="text-xs text-slate-500">by SNS Square</span> */}
          </div>



          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SNS Square. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

