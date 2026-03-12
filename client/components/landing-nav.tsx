"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/logo-wo-text.png"
            alt="Flowbill"
            width={30}
            height={30}
            className="rounded"
          />
          <span className="font-semibold text-lg tracking-tight">Flowbill</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            How it works
          </a>
          <a
            href="#pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20"
          >
            <Link href="/register">Get started free</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b px-4 py-5 flex flex-col gap-4">
          <a
            href="#features"
            onClick={() => setMobileOpen(false)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileOpen(false)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            How it works
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileOpen(false)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Pricing
          </a>
          <div className="flex flex-col gap-2 pt-3 border-t">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Link href="/register">Get started free</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
