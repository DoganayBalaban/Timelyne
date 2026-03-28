"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { analytics } from "@/lib/analytics";
import { useUpdateMe, useUser } from "@/lib/hooks/useAuth";
import { useTranslation } from "@/lib/i18n/context";
import {
  ArrowLeft,
  Building2,
  Check,
  Loader2,
  User,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const timezones = [
  { value: "Europe/Istanbul", label: "Istanbul (UTC+3)" },
  { value: "Europe/London", label: "London (UTC+0/+1)" },
  { value: "Europe/Paris", label: "Paris (UTC+1/+2)" },
  { value: "Europe/Berlin", label: "Berlin (UTC+1/+2)" },
  { value: "Europe/Rome", label: "Rome (UTC+1/+2)" },
  { value: "Europe/Madrid", label: "Madrid (UTC+1/+2)" },
  { value: "Europe/Amsterdam", label: "Amsterdam (UTC+1/+2)" },
  { value: "Europe/Warsaw", label: "Warsaw (UTC+1/+2)" },
  { value: "Europe/Moscow", label: "Moscow (UTC+3)" },
  { value: "America/New_York", label: "New York (UTC-5/-4)" },
  { value: "America/Chicago", label: "Chicago (UTC-6/-5)" },
  { value: "America/Denver", label: "Denver (UTC-7/-6)" },
  { value: "America/Los_Angeles", label: "Los Angeles (UTC-8/-7)" },
  { value: "America/Toronto", label: "Toronto (UTC-5/-4)" },
  { value: "America/Vancouver", label: "Vancouver (UTC-8/-7)" },
  { value: "America/Sao_Paulo", label: "São Paulo (UTC-3)" },
  { value: "America/Mexico_City", label: "Mexico City (UTC-6/-5)" },
  { value: "America/Buenos_Aires", label: "Buenos Aires (UTC-3)" },
  { value: "Asia/Dubai", label: "Dubai (UTC+4)" },
  { value: "Asia/Kolkata", label: "Mumbai/Delhi (UTC+5:30)" },
  { value: "Asia/Dhaka", label: "Dhaka (UTC+6)" },
  { value: "Asia/Bangkok", label: "Bangkok (UTC+7)" },
  { value: "Asia/Singapore", label: "Singapore (UTC+8)" },
  { value: "Asia/Shanghai", label: "Beijing/Shanghai (UTC+8)" },
  { value: "Asia/Tokyo", label: "Tokyo (UTC+9)" },
  { value: "Asia/Seoul", label: "Seoul (UTC+9)" },
  { value: "Australia/Sydney", label: "Sydney (UTC+10/+11)" },
  { value: "Australia/Melbourne", label: "Melbourne (UTC+10/+11)" },
  { value: "Pacific/Auckland", label: "Auckland (UTC+12/+13)" },
  { value: "Africa/Cairo", label: "Cairo (UTC+2)" },
  { value: "Africa/Johannesburg", label: "Johannesburg (UTC+2)" },
  { value: "Africa/Lagos", label: "Lagos (UTC+1)" },
  { value: "UTC", label: "UTC" },
];

const currencies = [
  { value: "USD", label: "$ US Dollar (USD)" },
  { value: "EUR", label: "€ Euro (EUR)" },
  { value: "GBP", label: "£ British Pound (GBP)" },
  { value: "TRY", label: "₺ Turkish Lira (TRY)" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useUser();
  const updateMe = useUpdateMe();
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const totalSteps = 2;

  const [role, setRole] = useState<"freelancer" | "agency">("freelancer");
  const [timezone, setTimezone] = useState("Europe/Istanbul");
  const [currency, setCurrency] = useState("USD");
  const [hourlyRate, setHourlyRate] = useState("");

  useEffect(() => {
    if (!userLoading && user?.is_onboarding_completed) {
      router.push("/dashboard");
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  const handleRoleSelect = (selected: "freelancer" | "agency") => {
    setRole(selected);
    // Auto-advance after short delay for visual feedback
    setTimeout(() => setStep(2), 300);
  };

  const handleComplete = () => {
    updateMe.mutate(
      {
        role,
        timezone,
        currency,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        is_onboarding_completed: true,
      },
      {
        onSuccess: () => {
          analytics.onboardingCompleted(role);
          router.push("/dashboard");
        },
      }
    );
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currencySymbol: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", TRY: "₺",
  };

  const progressValue = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/50">
      {/* Logo */}
      <div className="w-full flex justify-center pt-8 pb-4">
        <Image
          className="dark:invert"
          src="/flowbill-logo.png"
          alt="Flowbill Logo"
          width={180}
          height={86}
          priority
        />
      </div>

      {/* Progress */}
      <div className="w-full max-w-2xl mx-auto px-4 pb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{t("onboarding.step_of", { step, total: totalSteps })}</span>
            <span>{t("onboarding.step_complete", { pct: Math.round(progressValue) })}</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">

          {/* Step 1: Role */}
          {step === 1 && (
            <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center space-y-4 pb-8">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-bold">
                    {t("onboarding.step1_title", { name: user?.first_name ?? "" })}
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    {t("onboarding.step1_desc")}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Label className="text-base font-medium block">
                  {t("onboarding.step1_label")}
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(["freelancer", "agency"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleSelect(r)}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                        role === r
                          ? "border-primary bg-primary/5 shadow-lg"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          role === r ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}>
                          {r === "freelancer" ? <User className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {t(`onboarding.role_${r}`)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t(`onboarding.role_${r}_desc`)}
                          </p>
                        </div>
                        {role === r && <Check className="h-5 w-5 text-primary ml-auto" />}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Settings */}
          {step === 2 && (
            <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center space-y-4 pb-8">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-bold">
                    {t("onboarding.step2_title")}
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    {t("onboarding.step2_desc")}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">{t("onboarding.timezone")}</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder={t("onboarding.timezone_placeholder")} />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {timezones.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">{t("onboarding.currency")}</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder={t("onboarding.currency_placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">{t("onboarding.hourly_rate")}</Label>
                  <div className="relative">
                    <Input
                      id="hourlyRate"
                      type="number"
                      placeholder="0.00"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="pl-8"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {currencySymbol[currency] ?? "$"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("onboarding.hourly_rate_hint")}
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t("onboarding.btn_back")}
                  </Button>
                  <Button
                    onClick={handleComplete}
                    size="lg"
                    className="gap-2"
                    disabled={updateMe.isPending}
                  >
                    {updateMe.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("onboarding.btn_completing")}
                      </>
                    ) : (
                      <>
                        {t("onboarding.btn_complete")}
                        <Check className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="py-4 text-center text-sm text-muted-foreground">
        <p>© 2026 Flowbill. All rights reserved.</p>
      </div>
    </div>
  );
}
