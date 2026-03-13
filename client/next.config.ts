import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI, // only print logs in CI
  widenClientFileUpload: true,
  sourcemaps: { disable: process.env.NODE_ENV !== "production" },
  disableLogger: true,
  automaticVercelMonitors: true,
});
