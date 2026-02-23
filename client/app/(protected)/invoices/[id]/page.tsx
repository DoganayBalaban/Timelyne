"use client";

import { InvoicePaymentDialog } from "@/components/invoice-payment-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDownloadPdf,
  useGeneratePdf,
  useInvoice,
  useSendInvoiceEmail,
  useUpdateInvoice,
} from "@/lib/hooks/useInvoices";
import {
  ArrowLeft,
  CreditCard,
  Download,
  FileText,
  Loader2,
  Mail,
  RefreshCw,
  Send,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// ── Helpers ────────────────────────────────────────────────────────────────

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    draft: "Taslak",
    sent: "Gönderildi",
    paid: "Ödendi",
    overdue: "Vadesi Geçti",
    cancelled: "İptal",
  };
  return map[status] || status;
}

function getStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  const map: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    draft: "outline",
    sent: "default",
    paid: "secondary",
    overdue: "destructive",
    cancelled: "destructive",
  };
  return map[status] || "secondary";
}

function getPdfStatusBadge(status: string) {
  const map: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    not_generated: { label: "Oluşturulmadı", variant: "outline" },
    processing: { label: "İşleniyor...", variant: "default" },
    generated: { label: "Hazır", variant: "secondary" },
    failed: { label: "Başarısız", variant: "destructive" },
  };
  return map[status] || { label: status, variant: "outline" as const };
}

function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
  }).format(Number(amount));
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

// ── Component ──────────────────────────────────────────────────────────────

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const { data: invoice, isLoading, error } = useInvoice(invoiceId);
  const generatePdf = useGeneratePdf();
  const downloadPdf = useDownloadPdf();
  const sendEmail = useSendInvoiceEmail();
  const updateInvoice = useUpdateInvoice();

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center py-20">
        <p className="text-destructive text-lg">Fatura bulunamadı.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>
      </div>
    );
  }

  // Calculate remaining balance from payments
  const totalPaid =
    invoice.payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
  const remainingBalance = Number(invoice.total) - totalPaid;

  const pdfBadge = getPdfStatusBadge(invoice.pdf_status);

  const handleGeneratePdf = () => {
    generatePdf.mutate(
      { id: invoiceId },
      {
        onSuccess: () =>
          toast.info("PDF oluşturuluyor...", {
            description: "Hazır olduğunda bildirim alacaksınız.",
          }),
        onError: () => toast.error("PDF oluşturulamadı"),
      },
    );
  };

  const handleDownloadPdf = () => {
    downloadPdf.mutate(invoiceId, {
      onError: () => toast.error("PDF henüz hazır değil"),
    });
  };

  const handleSendEmail = () => {
    sendEmail.mutate(invoiceId, {
      onSuccess: () => toast.success("E-posta gönderiliyor..."),
      onError: () => toast.error("E-posta gönderilemedi"),
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {invoice.invoice_number}
            </h1>
            <p className="text-sm text-muted-foreground">
              {invoice.client?.name} • {invoice.client?.email}
            </p>
          </div>
          <Badge variant={getStatusVariant(invoice.status)} className="ml-2">
            {getStatusLabel(invoice.status)}
          </Badge>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Draft → Sent transition */}
          {invoice.status === "draft" && (
            <Button
              size="sm"
              onClick={() =>
                updateInvoice.mutate(
                  { id: invoiceId, data: { status: "sent" } },
                  {
                    onSuccess: () =>
                      toast.success("Fatura gönderildi olarak işaretlendi"),
                    onError: () => toast.error("Durum güncellenemedi"),
                  },
                )
              }
              disabled={updateInvoice.isPending}
            >
              {updateInvoice.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Gönderildi Olarak İşaretle
            </Button>
          )}
          {invoice.pdf_status !== "generated" && invoice.status !== "draft" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGeneratePdf}
              disabled={
                generatePdf.isPending || invoice.pdf_status === "processing"
              }
            >
              {generatePdf.isPending || invoice.pdf_status === "processing" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              PDF Oluştur
            </Button>
          )}
          {invoice.pdf_status === "generated" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={downloadPdf.isPending}
              >
                <Download className="mr-2 h-4 w-4" />
                PDF İndir
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  generatePdf.mutate(
                    { id: invoiceId, force: true },
                    {
                      onSuccess: () =>
                        toast.info("PDF yeniden oluşturuluyor..."),
                    },
                  )
                }
                disabled={generatePdf.isPending}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Yeniden Oluştur
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendEmail}
                disabled={sendEmail.isPending}
              >
                {sendEmail.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                E-posta Gönder
              </Button>
            </>
          )}
          {invoice.status !== "paid" &&
            invoice.status !== "cancelled" &&
            invoice.status !== "draft" && (
              <Button size="sm" onClick={() => setPaymentDialogOpen(true)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Ödeme Kaydet
              </Button>
            )}
        </div>
      </div>

      {/* Invoice Info + Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Fatura Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Düzenleme Tarihi</p>
                <p className="font-medium">{formatDate(invoice.issue_date)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Vade Tarihi</p>
                <p className="font-medium">{formatDate(invoice.due_date)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Para Birimi</p>
                <p className="font-medium">{invoice.currency}</p>
              </div>
              <div>
                <p className="text-muted-foreground">PDF Durumu</p>
                <Badge variant={pdfBadge.variant} className="mt-0.5">
                  {pdfBadge.label}
                </Badge>
              </div>
            </div>

            {(invoice.notes || invoice.terms) && (
              <>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {invoice.notes && (
                    <div>
                      <p className="text-muted-foreground mb-1">Notlar</p>
                      <p className="whitespace-pre-wrap">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice.terms && (
                    <div>
                      <p className="text-muted-foreground mb-1">Koşullar</p>
                      <p className="whitespace-pre-wrap">{invoice.terms}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Özet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ara Toplam</span>
              <span>
                {formatCurrency(Number(invoice.subtotal), invoice.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vergi</span>
              <span>
                {formatCurrency(Number(invoice.tax), invoice.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">İndirim</span>
              <span>
                -{formatCurrency(Number(invoice.discount), invoice.currency)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Genel Toplam</span>
              <span>
                {formatCurrency(Number(invoice.total), invoice.currency)}
              </span>
            </div>
            {totalPaid > 0 && (
              <>
                <div className="flex justify-between text-green-600">
                  <span>Ödenen</span>
                  <span>{formatCurrency(totalPaid, invoice.currency)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Kalan</span>
                  <span>
                    {formatCurrency(remainingBalance, invoice.currency)}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoice Items */}
      {invoice.invoice_items && invoice.invoice_items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fatura Kalemleri</CardTitle>
            <CardDescription>
              {invoice.invoice_items.length} kalem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Açıklama</TableHead>
                    <TableHead className="text-right">Miktar</TableHead>
                    <TableHead className="text-right">Birim Fiyat</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.invoice_items.map((item, index) => (
                    <TableRow key={item.id ?? index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
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
          </CardContent>
        </Card>
      )}

      {/* Payments History */}
      {invoice.payments && invoice.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ödeme Geçmişi</CardTitle>
            <CardDescription>
              {invoice.payments.length} ödeme kaydı
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Yöntem</TableHead>
                    <TableHead>Referans No</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.payments.map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatDate(payment.paid_at)}</TableCell>
                      <TableCell>{payment.payment_method || "—"}</TableCell>
                      <TableCell>{payment.reference_number || "—"}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(payment.amount, invoice.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Dialog */}
      <InvoicePaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        invoiceId={invoiceId}
        remainingBalance={remainingBalance}
        currency={invoice.currency}
      />
    </div>
  );
}
