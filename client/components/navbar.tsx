"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLogout, useUser } from "@/lib/hooks/useAuth";
import {
  FileText,
  FolderOpen,
  LayoutDashboard,
  Loader2,
  LogOut,
  Timer,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Müşteriler",
    href: "/clients",
    icon: Users,
  },
  {
    label: "Projeler",
    href: "/projects",
    icon: FolderOpen,
  },
  {
    label: "Faturalar",
    href: "/invoices",
    icon: FileText,
  },
  {
    label: "Zaman",
    href: "/time-entries",
    icon: Timer,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: user } = useUser();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-14 items-center px-6">
        {/* Logo */}
        <Link href="/dashboard" className="mr-8 flex items-center gap-2">
          <Image
            className="dark:invert"
            src="/timelyne-logo.png"
            alt="Timelyne"
            width={120}
            height={34}
            priority
          />
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={
                    isActive
                      ? "font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {user && (
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {user.first_name} {user.last_name}
            </span>
          )}
          <Separator orientation="vertical" className="h-5 hidden sm:block" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={logout.isPending}
            className="text-muted-foreground hover:text-foreground"
          >
            {logout.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            <span className="hidden sm:inline">Çıkış</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
