"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/lib/hooks/useAuth";
import { RegisterInput, registerSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, X, Zap, BarChart3, Clock, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";

const perks = [
  { icon: Clock, text: "Unlimited time tracking" },
  { icon: FileText, text: "Professional PDF invoicing" },
  { icon: BarChart3, text: "Real-time financial dashboard" },
  { icon: Zap, text: "Up and running in under 5 minutes" },
];

export default function RegisterPage() {
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const strengthCount = Object.values(passwordChecks).filter(Boolean).length;
  const strengthLabel =
    strengthCount <= 1
      ? { text: "Weak", color: "bg-red-500" }
      : strengthCount <= 3
      ? { text: "Fair", color: "bg-amber-500" }
      : strengthCount === 4
      ? { text: "Good", color: "bg-blue-500" }
      : { text: "Strong", color: "bg-emerald-500" };

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-violet-950 via-violet-900 to-indigo-900 overflow-hidden">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-violet-500/20 blur-[100px]" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-[80px]" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3 w-fit">
          <Image
            src="/timelyne-logo.png"
            alt="Timelyne"
            width={32}
            height={32}
            className="rounded brightness-200"
          />
          <span className="text-white font-semibold text-lg tracking-tight">
            Timelyne
          </span>
        </Link>

        {/* Center content */}
        <div className="relative space-y-8">
          <div className="space-y-3">
            <p className="text-violet-300 text-sm font-medium uppercase tracking-widest">
              Free to get started
            </p>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Join freelancers who work smarter, not harder
            </h1>
            <p className="text-violet-200/70 text-base leading-relaxed">
              Manage your clients, projects, and invoices without the chaos.
              Everything in one place, ready in minutes.
            </p>
          </div>

          <ul className="space-y-3">
            {perks.map((p) => (
              <li key={p.text} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <p.icon className="h-4 w-4 text-violet-300" />
                </span>
                <span className="text-violet-100/90 text-sm">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom stat cards */}
        <div className="relative grid grid-cols-2 gap-3">
          {[
            { value: "< 10 min", label: "daily admin time" },
            { value: "1-click", label: "invoice generation" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl bg-white/5 border border-white/10 p-4"
            >
              <p className="text-white font-bold text-2xl">{s.value}</p>
              <p className="text-violet-300/70 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-background relative overflow-y-auto">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-violet-500/5 blur-[100px]" />
        </div>

        {/* Mobile logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2 mb-10">
          <Image
            src="/timelyne-logo.png"
            alt="Timelyne"
            width={28}
            height={28}
            className="rounded dark:brightness-200"
          />
          <span className="font-semibold text-lg tracking-tight">Timelyne</span>
        </Link>

        <div className="w-full max-w-sm space-y-8">
          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Create your account
            </h2>
            <p className="text-sm text-muted-foreground">
              Free to use. No credit card required.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {registerMutation.error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {(registerMutation.error as any).response?.data?.message ||
                  "Registration failed. Please try again."}
              </div>
            )}

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First name
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  className="h-11"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  className="h-11"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-11"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-11"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}

              {/* Strength meter */}
              {password && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= strengthCount
                              ? strengthLabel.color
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {strengthLabel.text}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {[
                      { ok: passwordChecks.length, label: "8+ characters" },
                      { ok: passwordChecks.uppercase, label: "Uppercase letter" },
                      { ok: passwordChecks.lowercase, label: "Lowercase letter" },
                      { ok: passwordChecks.number, label: "Number" },
                      { ok: passwordChecks.special, label: "Special character" },
                    ].map((c) => (
                      <div
                        key={c.label}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          c.ok ? "text-emerald-600" : "text-muted-foreground"
                        }`}
                      >
                        {c.ok ? (
                          <Check className="h-3 w-3 shrink-0" />
                        ) : (
                          <X className="h-3 w-3 shrink-0" />
                        )}
                        {c.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20 transition-all"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create account"
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              By creating an account you agree to our{" "}
              <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
                Privacy Policy
              </span>
              .
            </p>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-violet-600 hover:text-violet-700 hover:underline transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
