import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://flowbill.xyz";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register", "/forgot-password", "/privacy", "/terms"],
        disallow: [
          "/dashboard",
          "/clients",
          "/projects",
          "/invoices",
          "/time-entries",
          "/expenses",
          "/settings",
          "/onboarding",
          "/portal",
          "/reset-password",
          "/verify-email",
          "/api",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
