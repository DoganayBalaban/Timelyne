"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export function SentryInit() {
  useEffect(() => {
    if (Sentry.isInitialized()) return;

    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      debug: process.env.NODE_ENV === "development",
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.05,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      beforeSend(event) {
        for (const ex of event.exception?.values ?? []) {
          if (ex.value?.includes("AbortError")) return null;
        }
        return event;
      },
    });
  }, []);

  return null;
}
