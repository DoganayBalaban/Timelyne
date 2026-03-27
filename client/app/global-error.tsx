"use client";

import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center font-sans">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="text-sm text-gray-500 max-w-sm">
              A critical error occurred. Our team has been notified.
            </p>
          </div>
          <button
            onClick={reset}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
