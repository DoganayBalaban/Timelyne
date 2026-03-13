import * as Sentry from "@sentry/node";
import { env } from "./env";

export function initSentry() {
  if (!env.SENTRY_DSN) return;

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,

    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1.0,

    ignoreTransactions: ["/api/health"],

    beforeSend(event) {
      // Drop operational AppErrors (4xx) — expected user-facing errors
      const extra = event.extra as Record<string, unknown> | undefined;
      if (extra?.isOperational === true) return null;

      // Drop Zod validation errors — always 400s
      for (const ex of event.exception?.values ?? []) {
        if (ex.type === "ZodError") return null;
      }

      return event;
    },
  });
}

export { Sentry };
