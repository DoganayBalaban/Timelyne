"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/lib/hooks/useAuth";
import { ForgotPasswordInput, forgotPasswordSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const forgotPassword = useForgotPassword();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotPassword.mutate(data.email, {
      onSuccess: () => setEmailSent(true),
    });
  };

  /* ── Shared left panel ─────────────────────────────────── */
  const LeftPanel = () => (
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
            Account recovery
          </p>
          <h1 className="text-4xl font-bold text-white leading-tight">
            We&apos;ll get you back in seconds
          </h1>
          <p className="text-violet-200/70 text-base leading-relaxed">
            Enter the email linked to your account and we&apos;ll send a
            secure reset link straight to your inbox.
          </p>
        </div>

        <ul className="space-y-3">
          {[
            { icon: Mail, text: "Reset link sent to your inbox" },
            { icon: ShieldCheck, text: "Link expires after 1 hour for security" },
            { icon: KeyRound, text: "Choose a new password immediately" },
          ].map((item) => (
            <li key={item.text} className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <item.icon className="h-4 w-4 text-violet-300" />
              </span>
              <span className="text-violet-100/90 text-sm">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom tip */}
      <div className="relative rounded-2xl bg-white/5 border border-white/10 p-5">
        <p className="text-violet-100/70 text-sm leading-relaxed">
          <span className="font-semibold text-white">Tip:</span> Check your
          spam folder if the email doesn&apos;t arrive within a couple of
          minutes.
        </p>
      </div>
    </div>
  );

  /* ── Success state ─────────────────────────────────────── */
  if (emailSent) {
    return (
      <div className="min-h-screen flex">
        <LeftPanel />

        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-background relative">
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

          <div className="w-full max-w-sm space-y-8 text-center">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                  <Mail className="h-9 w-9 text-violet-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Check your inbox</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We sent a password reset link to{" "}
                <span className="font-medium text-foreground">
                  {getValues("email")}
                </span>
                . The link expires in 1 hour.
              </p>
            </div>

            <div className="rounded-xl border bg-muted/40 p-4 text-left space-y-2">
              <p className="text-xs font-medium text-foreground">Didn&apos;t receive it?</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Check your spam or junk folder</li>
                <li>Make sure you used the right email address</li>
                <li>Wait a couple of minutes and check again</li>
              </ul>
            </div>

            <Button asChild variant="outline" className="w-full h-11">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Form state ────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex">
      <LeftPanel />

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-background relative">
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
          {/* Icon + heading */}
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <KeyRound className="h-6 w-6 text-violet-600" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Forgot password?</h2>
              <p className="text-sm text-muted-foreground">
                No worries. Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {forgotPassword.error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {(forgotPassword.error as any).response?.data?.message ||
                  "Something went wrong. Please try again."}
              </div>
            )}

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
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20 transition-all"
              disabled={forgotPassword.isPending}
            >
              {forgotPassword.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>

          <Button asChild variant="ghost" className="w-full h-10 text-muted-foreground">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
