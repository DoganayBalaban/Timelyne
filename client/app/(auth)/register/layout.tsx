import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your free Flowbill account and start managing your freelance business in minutes.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
