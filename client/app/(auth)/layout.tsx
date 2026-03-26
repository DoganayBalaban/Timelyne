import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: true, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
