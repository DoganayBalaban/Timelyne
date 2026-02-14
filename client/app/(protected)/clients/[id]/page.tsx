"use client";

import { ClientFormDialog } from "@/components/client-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    useClient,
    useClientInvoices,
    useClientProjects,
    useClientRevenue,
} from "@/lib/hooks/useClients";
import {
    ArrowLeft,
    Banknote,
    Building2,
    Clock,
    FileText,
    FolderOpen,
    Mail,
    MapPin,
    Pencil,
    Phone,
    StickyNote,
    TrendingUp,
    User
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

// Status badge helpers
function getProjectStatusLabel(status: string) {
  const map: Record<string, string> = {
    not_started: "Başlamadı",
    in_progress: "Devam Ediyor",
    on_hold: "Beklemede",
    completed: "Tamamlandı",
    cancelled: "İptal Edildi",
  };
  return map[status] || status;
}

function getProjectStatusVariant(status: string) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    not_started: "outline",
    in_progress: "default",
    on_hold: "secondary",
    completed: "default",
    cancelled: "destructive",
  };
  return map[status] || "secondary";
}

function getInvoiceStatusLabel(status: string) {
  const map: Record<string, string> = {
    draft: "Taslak",
    sent: "Gönderildi",
    paid: "Ödendi",
    overdue: "Gecikmiş",
    cancelled: "İptal Edildi",
    partially_paid: "Kısmi Ödeme",
  };
  return map[status] || status;
}

function getInvoiceStatusVariant(status: string) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "outline",
    sent: "secondary",
    paid: "default",
    overdue: "destructive",
    cancelled: "destructive",
    partially_paid: "secondary",
  };
  return map[status] || "secondary";
}

function formatCurrency(amount: number | null | undefined) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
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

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const { data: client, isLoading, error } = useClient(clientId);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">Müşteri bulunamadı</p>
          <Button variant="outline" onClick={() => router.push("/clients")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Müşterilere Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/clients")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {client.name}
              </h1>
              {client.company && (
                <p className="text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {client.company}
                </p>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Düzenle
          </Button>
        </div>

        {/* Client Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Müşteri Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem
                icon={<Mail className="h-4 w-4" />}
                label="E-posta"
                value={client.email}
              />
              <InfoItem
                icon={<Phone className="h-4 w-4" />}
                label="Telefon"
                value={client.phone}
              />
              <InfoItem
                icon={<Clock className="h-4 w-4" />}
                label="Saatlik Ücret"
                value={
                  client.hourly_rate
                    ? formatCurrency(client.hourly_rate)
                    : null
                }
              />
              <InfoItem
                icon={<MapPin className="h-4 w-4" />}
                label="Adres"
                value={client.address}
              />
              {client.notes && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <StickyNote className="h-4 w-4" />
                    Notlar
                  </div>
                  <p className="text-sm">{client.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="projects">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Projeler
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Faturalar
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Gelir Analizi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-4">
            <ProjectsTab clientId={clientId} />
          </TabsContent>
          <TabsContent value="invoices" className="mt-4">
            <InvoicesTab clientId={clientId} />
          </TabsContent>
          <TabsContent value="revenue" className="mt-4">
            <RevenueTab clientId={clientId} />
          </TabsContent>
        </Tabs>
      </div>

      <ClientFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        client={client}
      />
    </div>
  );
}

// Info item component
function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}

// Projects Tab
function ProjectsTab({ clientId }: { clientId: string }) {
  const { data: projects, isLoading } = useClientProjects(clientId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 space-y-2">
            <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Bu müşteriye ait proje bulunmuyor.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Projeler</CardTitle>
        <CardDescription>{projects.length} proje bulundu</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proje Adı</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="hidden md:table-cell">Bütçe</TableHead>
                <TableHead className="hidden md:table-cell">
                  Başlangıç
                </TableHead>
                <TableHead className="hidden lg:table-cell">Bitiş</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <Badge variant={getProjectStatusVariant(project.status)}>
                      {getProjectStatusLabel(project.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatCurrency(project.budget)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDate(project.start_date)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatDate(project.end_date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// Invoices Tab
function InvoicesTab({ clientId }: { clientId: string }) {
  const { data: invoices, isLoading } = useClientInvoices(clientId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 space-y-2">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Bu müşteriye ait fatura bulunmuyor.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Faturalar</CardTitle>
        <CardDescription>{invoices.length} fatura bulundu</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fatura No</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead className="hidden md:table-cell">
                  Düzenleme Tarihi
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Vade Tarihi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium font-mono text-sm">
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getInvoiceStatusVariant(invoice.status)}>
                      {getInvoiceStatusLabel(invoice.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(invoice.total)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDate(invoice.issue_date)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDate(invoice.due_date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// Revenue Tab
function RevenueTab({ clientId }: { clientId: string }) {
  const { data: revenue, isLoading } = useClientRevenue(clientId);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!revenue) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 space-y-2">
            <TrendingUp className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Gelir verisi yüklenemedi.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RevenueCard
        title="Toplam Gelir"
        value={formatCurrency(revenue.total_revenue)}
        description="Tüm faturalardan elde edilen gelir"
        icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
      />
      <RevenueCard
        title="Toplam Ödenen"
        value={formatCurrency(revenue.total_paid)}
        description="Alınan toplam ödeme"
        icon={<Banknote className="h-5 w-5 text-blue-500" />}
      />
      <RevenueCard
        title="Bekleyen"
        value={formatCurrency(revenue.outstanding)}
        description="Henüz ödenmemiş tutar"
        icon={<Clock className="h-5 w-5 text-amber-500" />}
        highlight={revenue.outstanding > 0}
      />
      <RevenueCard
        title="Toplam Fatura"
        value={revenue.invoice_count.toString()}
        description="Kesilen fatura sayısı"
        icon={<FileText className="h-5 w-5 text-muted-foreground" />}
      />
      <RevenueCard
        title="Ödenen Fatura"
        value={revenue.paid_invoice_count.toString()}
        description="Ödemesi tamamlanan faturalar"
        icon={<FileText className="h-5 w-5 text-emerald-500" />}
      />
    </div>
  );
}

// Revenue card component
function RevenueCard({
  title,
  value,
  description,
  icon,
  highlight = false,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-amber-500/50" : ""}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
