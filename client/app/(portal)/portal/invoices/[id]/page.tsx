"use client";

import { portalApiClient, PortalInvoiceDetail } from "@/lib/api/portal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/lib/i18n/context";
import { ArrowLeft, Download, Loader2, XCircle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

function formatCurrency(amount: number | string, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(Number(amount));
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  if (status === "paid") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">
        {t("portal.status_paid")}
      </Badge>
    );
  }
  if (status === "overdue") {
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400">
        {t("portal.status_overdue")}
      </Badge>
    );
  }
  return (
    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
      {t("portal.status_sent")}
    </Badge>
  );
}

export default function PortalInvoiceDetailPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<PortalInvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    portalApiClient
      .getInvoice(invoiceId)
      .then((res) => setInvoice(res.invoice))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((err: any) => {
        setError(err?.response?.data?.message ?? t("portal.invoice_not_found_desc"));
      })
      .finally(() => setLoading(false));
  }, [invoiceId, t]);

  const handleDownload = async () => {
    if (!invoice?.pdf_url) return;
    setDownloading(true);
    try {
      const { url } = await portalApiClient.getPdfUrl(invoiceId);
      window.open(url, "_blank");
    } catch {
      // Silently fail
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-10 max-w-md w-full text-center space-y-4">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="text-xl font-semibold">{t("portal.invoice_not_found")}</h1>
          <p className="text-muted-foreground text-sm">
            {error ?? t("portal.invoice_not_found_desc")}
          </p>
          <Button variant="outline" onClick={() => router.push("/portal/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("portal.btn_back")}
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = Number(invoice.subtotal);
  const tax = Number(invoice.tax);
  const discount = Number(invoice.discount);
  const total = Number(invoice.total);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/portal/dashboard")}
        className="mb-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("portal.btn_back")}
      </Button>

      {/* Invoice Header */}
      <Card>
        <CardHeader className="bg-slate-900 dark:bg-slate-950 text-white rounded-t-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                {t("portal.invoice_label")}
              </p>
              <CardTitle className="text-2xl text-white">
                {invoice.invoice_number}
              </CardTitle>
            </div>
            <StatusBadge status={invoice.status} />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                {t("portal.col_issue_date")}
              </p>
              <p className="font-medium">{formatDate(invoice.issue_date)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                {t("portal.col_due_date")}
              </p>
              <p className="font-medium">{formatDate(invoice.due_date)}</p>
            </div>
            {invoice.paid_at && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {t("portal.paid_on")}
                </p>
                <p className="font-medium text-emerald-600 dark:text-emerald-400">
                  {formatDate(invoice.paid_at)}
                </p>
              </div>
            )}
          </div>

          {invoice.pdf_url && (
            <div className="mt-6">
              <Button onClick={handleDownload} disabled={downloading}>
                {downloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {t("portal.btn_download_pdf")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("portal.line_items")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("portal.col_description")}</TableHead>
                  <TableHead className="text-right">{t("portal.col_qty")}</TableHead>
                  <TableHead className="text-right">{t("portal.col_rate")}</TableHead>
                  <TableHead className="text-right">{t("portal.col_amount")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.invoice_items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{Number(item.quantity)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.rate, invoice.currency)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.amount, invoice.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("portal.subtotal")}</span>
                <span>{formatCurrency(subtotal, invoice.currency)}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("portal.tax")}</span>
                  <span>{formatCurrency(tax, invoice.currency)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("portal.discount")}</span>
                  <span className="text-red-600">
                    -{formatCurrency(discount, invoice.currency)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>{t("portal.total")}</span>
                <span>{formatCurrency(total, invoice.currency)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments */}
      {invoice.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("portal.payments_title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("portal.col_date")}</TableHead>
                    <TableHead>{t("portal.col_amount")}</TableHead>
                    <TableHead className="hidden md:table-cell">{t("portal.col_method")}</TableHead>
                    <TableHead className="hidden md:table-cell">{t("portal.col_reference")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.paid_at)}</TableCell>
                      <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(payment.amount, invoice.currency)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm capitalize">
                        {payment.payment_method?.replace("_", " ") ?? "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm font-mono">
                        {payment.reference_number ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground pb-6">
        {t("portal.powered_by")} <strong>Flowbill</strong>
      </p>
    </div>
  );
}
