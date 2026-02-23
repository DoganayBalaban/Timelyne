"use client";

import { InvoiceFormDialog } from "@/components/invoice-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceListItem, InvoicesQueryParams } from "@/lib/api/invoices";
import {
  useDeleteInvoice,
  useDownloadPdf,
  useGeneratePdf,
  useInvoices,
  useInvoiceStats,
  useSendInvoiceEmail,
  useUpdateInvoice,
} from "@/lib/hooks/useInvoices";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

function getPdfStatusLabel(status: string) {
  const map: Record<string, string> = {
    not_generated: "—",
    processing: "İşleniyor...",
    generated: "Hazır",
    failed: "Başarısız",
  };
  return map[status] || status;
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
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

// ── Component ──────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const router = useRouter();
  const [params, setParams] = useState<InvoicesQueryParams>({
    page: 1,
    limit: 10,
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, error } = useInvoices(params);
  const { data: stats } = useInvoiceStats();
  const deleteInvoice = useDeleteInvoice();
  const generatePdf = useGeneratePdf();
  const downloadPdf = useDownloadPdf();
  const sendEmail = useSendInvoiceEmail();
  const updateInvoice = useUpdateInvoice();

  const handleMarkAsSent = (id: string) => {
    updateInvoice.mutate(
      { id, data: { status: "sent" } },
      {
        onSuccess: () => toast.success("Fatura gönderildi olarak işaretlendi"),
        onError: () => toast.error("Durum güncellenemedi"),
      },
    );
  };

  const handleStatusFilter = (value: string) => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      status:
        value === "all" ? undefined : (value as InvoicesQueryParams["status"]),
    }));
  };

  const handleSort = (field: InvoicesQueryParams["sortBy"]) => {
    setParams((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu faturayı silmek istediğinize emin misiniz?")) {
      deleteInvoice.mutate(id, {
        onSuccess: () => toast.success("Fatura silindi"),
        onError: () => toast.error("Fatura silinemedi"),
      });
    }
  };

  const handleGeneratePdf = (id: string) => {
    generatePdf.mutate(
      { id },
      {
        onSuccess: () =>
          toast.info("PDF oluşturuluyor...", {
            description: "Hazır olduğunda bildirim alacaksınız.",
          }),
        onError: () => toast.error("PDF oluşturulamadı"),
      },
    );
  };

  const handleDownloadPdf = (id: string) => {
    downloadPdf.mutate(id, {
      onError: () => toast.error("PDF henüz hazır değil"),
    });
  };

  const handleSendEmail = (id: string) => {
    sendEmail.mutate(id, {
      onSuccess: () => toast.success("E-posta gönderiliyor..."),
      onError: () => toast.error("E-posta gönderilemedi"),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Faturalar</h1>
              <p className="text-sm text-muted-foreground">
                Faturalarınızı yönetin
              </p>
            </div>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Fatura
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              {
                label: "Toplam",
                value: stats.total_invoiced,
                color: "text-foreground",
              },
              {
                label: "Ödenen",
                value: stats.total_paid,
                color: "text-green-600",
              },
              {
                label: "Bekleyen",
                value: stats.total_pending,
                color: "text-blue-600",
              },
              {
                label: "Vadesi Geçen",
                value: stats.total_overdue,
                color: "text-red-600",
              },
              {
                label: "Taslak",
                value: stats.total_draft,
                color: "text-muted-foreground",
              },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className={`text-xl font-bold mt-1 ${stat.color}`}>
                    {formatCurrency(stat.value)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                value={params.status || "all"}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="draft">Taslak</SelectItem>
                  <SelectItem value="sent">Gönderildi</SelectItem>
                  <SelectItem value="paid">Ödendi</SelectItem>
                  <SelectItem value="overdue">Vadesi Geçti</SelectItem>
                  <SelectItem value="cancelled">İptal</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={params.sortBy}
                onValueChange={(val) =>
                  setParams((prev) => ({
                    ...prev,
                    sortBy: val as InvoicesQueryParams["sortBy"],
                  }))
                }
              >
                <SelectTrigger className="w-[200px]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sıralama" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Oluşturma Tarihi</SelectItem>
                  <SelectItem value="issue_date">Düzenleme Tarihi</SelectItem>
                  <SelectItem value="due_date">Vade Tarihi</SelectItem>
                  <SelectItem value="total">Tutar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Fatura Listesi</CardTitle>
            <CardDescription>
              {data
                ? `Toplam ${data.meta.total} fatura bulundu`
                : "Yükleniyor..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-10 text-destructive">
                Faturalar yüklenirken bir hata oluştu.
              </div>
            ) : data?.data.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <div>
                  <p className="font-medium text-muted-foreground">
                    Henüz fatura yok
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    İlk faturanızı ekleyerek başlayın.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(true)}
                  className="mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Fatura Ekle
                </Button>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fatura No</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Müşteri
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort("issue_date")}
                        >
                          <span className="flex items-center gap-1">
                            Tarih
                            <ArrowUpDown className="h-3 w-3" />
                          </span>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort("due_date")}
                        >
                          <span className="flex items-center gap-1">
                            Vade
                            <ArrowUpDown className="h-3 w-3" />
                          </span>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => handleSort("total")}
                        >
                          <span className="flex items-center gap-1">
                            Tutar
                            <ArrowUpDown className="h-3 w-3" />
                          </span>
                        </TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead className="hidden lg:table-cell">
                          PDF
                        </TableHead>
                        <TableHead className="w-[50px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.data.map((invoice: InvoiceListItem) => (
                        <TableRow
                          key={invoice.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => router.push(`/invoices/${invoice.id}`)}
                        >
                          <TableCell className="font-medium">
                            {invoice.invoice_number}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {invoice.client?.name || "—"}
                          </TableCell>
                          <TableCell>
                            {formatDate(invoice.issue_date)}
                          </TableCell>
                          <TableCell>{formatDate(invoice.due_date)}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(invoice.total, invoice.currency)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(invoice.status)}>
                              {getStatusLabel(invoice.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span
                              className={`text-xs ${
                                invoice.pdf_status === "generated"
                                  ? "text-green-600"
                                  : invoice.pdf_status === "processing"
                                    ? "text-yellow-600"
                                    : invoice.pdf_status === "failed"
                                      ? "text-red-600"
                                      : "text-muted-foreground"
                              }`}
                            >
                              {getPdfStatusLabel(invoice.pdf_status)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/invoices/${invoice.id}`);
                                  }}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Detaylar
                                </DropdownMenuItem>
                                {invoice.status === "draft" && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsSent(invoice.id);
                                    }}
                                  >
                                    <Send className="mr-2 h-4 w-4" />
                                    Gönderildi Olarak İşaretle
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {invoice.status !== "draft" && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleGeneratePdf(invoice.id);
                                    }}
                                  >
                                    <FileText className="mr-2 h-4 w-4" />
                                    PDF Oluştur
                                  </DropdownMenuItem>
                                )}
                                {invoice.pdf_status === "generated" && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadPdf(invoice.id);
                                    }}
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    PDF İndir
                                  </DropdownMenuItem>
                                )}
                                {invoice.pdf_status === "generated" && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSendEmail(invoice.id);
                                    }}
                                  >
                                    <Mail className="mr-2 h-4 w-4" />
                                    E-posta Gönder
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {invoice.status === "draft" && (
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(invoice.id);
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Sil
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {data && data.meta.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      Sayfa {data.meta.page} / {data.meta.totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={data.meta.page <= 1}
                        onClick={() => handlePageChange(data.meta.page - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Önceki
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={data.meta.page >= data.meta.totalPages}
                        onClick={() => handlePageChange(data.meta.page + 1)}
                      >
                        Sonraki
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <InvoiceFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {/* Delete loading indicator */}
      {deleteInvoice.isPending && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
          <div className="flex items-center gap-3 bg-card p-4 rounded-lg shadow-lg border">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Siliniyor...</span>
          </div>
        </div>
      )}
    </div>
  );
}
