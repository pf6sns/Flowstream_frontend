"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (typeof window !== "undefined") {
    console.error("Global error boundary caught:", error);
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="max-w-md rounded-2xl bg-white p-6 shadow-lg border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              An unexpected error occurred while loading this page. Please try
              again, or contact support if the problem persists.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex items-center rounded-md bg-brand px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = "/";
                  }
                }}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                Go to dashboard
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

