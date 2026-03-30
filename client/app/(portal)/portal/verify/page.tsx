"use client";

import { portalApiClient } from "@/lib/api/portal";
import { useTranslation } from "@/lib/i18n/context";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error",
  );
  const [errorMsg, setErrorMsg] = useState(
    token ? "" : t("portal.verify_no_token"),
  );

  useEffect(() => {
    if (!token) return;

    portalApiClient
      .verify(token)
      .then(() => {
        setStatus("success");
        setTimeout(() => router.push("/portal/dashboard"), 1500);
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((err: any) => {
        setStatus("error");
        setErrorMsg(
          err?.response?.data?.message ?? t("portal.verify_error_hint"),
        );
      });
  }, [token, router, t]);

  return (
    <>
      {status === "loading" && (
        <>
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
          <h1 className="text-xl font-semibold">{t("portal.verify_loading")}</h1>
          <p className="text-muted-foreground text-sm">{t("portal.verify_loading_desc")}</p>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h1 className="text-xl font-semibold">{t("portal.verify_success")}</h1>
          <p className="text-muted-foreground text-sm">{t("portal.verify_success_desc")}</p>
        </>
      )}
      {status === "error" && (
        <>
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="text-xl font-semibold">{t("portal.verify_error_title")}</h1>
          <p className="text-muted-foreground text-sm">{errorMsg}</p>
          <p className="text-xs text-muted-foreground">{t("portal.verify_error_hint")}</p>
        </>
      )}
    </>
  );
}

export default function PortalVerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-10 max-w-md w-full text-center space-y-4">
        <Suspense fallback={<Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
