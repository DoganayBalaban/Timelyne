"use client";

import { ProjectFormDialog } from "@/components/project-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
    useProject,
    useProjectStats,
    useProjectTasks,
    useProjectTimeEntries,
} from "@/lib/hooks/useProjects";
import {
    ArrowLeft,
    Banknote,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    FolderOpen,
    ListTodo,
    Pencil,
    Receipt,
    Timer,
    TrendingUp,
    User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

// Status helpers
function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    active: "Aktif",
    completed: "Tamamlandı",
    on_hold: "Beklemede",
    cancelled: "İptal Edildi",
  };
  return map[status] || status;
}

function getStatusVariant(status: string) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    completed: "secondary",
    on_hold: "outline",
    cancelled: "destructive",
  };
  return map[status] || "secondary";
}

function getTaskStatusLabel(status: string) {
  const map: Record<string, string> = {
    todo: "Yapılacak",
    in_progress: "Devam Ediyor",
    done: "Tamamlandı",
  };
  return map[status] || status;
}

function getTaskStatusVariant(status: string) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    todo: "outline",
    in_progress: "default",
    done: "secondary",
  };
  return map[status] || "secondary";
}

function getPriorityLabel(priority: string) {
  const map: Record<string, string> = {
    low: "Düşük",
    medium: "Orta",
    high: "Yüksek",
  };
  return map[priority] || priority;
}

function getPriorityVariant(priority: string) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    low: "outline",
    medium: "secondary",
    high: "destructive",
  };
  return map[priority] || "secondary";
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

function formatDuration(minutes: number | null | undefined) {
  if (minutes == null || minutes === 0) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}dk`;
  if (mins === 0) return `${hours}sa`;
  return `${hours}sa ${mins}dk`;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, isLoading, error } = useProject(projectId);
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

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">Proje bulunamadı</p>
          <Button variant="outline" onClick={() => router.push("/projects")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Projelere Dön
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
              onClick={() => router.push("/projects")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              {project.color && (
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
              )}
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {project.name}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={getStatusVariant(project.status)}>
                    {getStatusLabel(project.status)}
                  </Badge>
                  {project.client && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {project.client.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Düzenle
          </Button>
        </div>

        {/* Project Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderOpen className="h-5 w-5" />
              Proje Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem
                icon={<DollarSign className="h-4 w-4" />}
                label="Bütçe"
                value={formatCurrency(project.budget)}
              />
              <InfoItem
                icon={<Clock className="h-4 w-4" />}
                label="Saatlik Ücret"
                value={
                  project.hourly_rate
                    ? formatCurrency(project.hourly_rate)
                    : null
                }
              />
              <InfoItem
                icon={<Calendar className="h-4 w-4" />}
                label="Başlangıç Tarihi"
                value={formatDate(project.start_date)}
              />
              <InfoItem
                icon={<Calendar className="h-4 w-4" />}
                label="Son Tarih"
                value={formatDate(project.deadline)}
              />
              <InfoItem
                icon={<TrendingUp className="h-4 w-4" />}
                label="Toplam Faturalanan"
                value={formatCurrency(project.total_billed)}
              />
              <InfoItem
                icon={<Timer className="h-4 w-4" />}
                label="Toplam Takip Edilen Saat"
                value={
                  project.total_tracked_hours
                    ? `${Number(project.total_tracked_hours).toFixed(1)} saat`
                    : null
                }
              />
              {project.description && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <FolderOpen className="h-4 w-4" />
                    Açıklama
                  </div>
                  <p className="text-sm">{project.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="tasks">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              Görevler
            </TabsTrigger>
            <TabsTrigger value="time-entries" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Zaman Kayıtları
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              İstatistikler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-4">
            <TasksTab projectId={projectId} />
          </TabsContent>
          <TabsContent value="time-entries" className="mt-4">
            <TimeEntriesTab projectId={projectId} />
          </TabsContent>
          <TabsContent value="stats" className="mt-4">
            <StatsTab projectId={projectId} />
          </TabsContent>
        </Tabs>
      </div>

      <ProjectFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        project={project}
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

// Tasks Tab
function TasksTab({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading } = useProjectTasks(projectId);

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

  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 space-y-2">
            <ListTodo className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Bu projeye ait görev bulunmuyor.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Görevler</CardTitle>
        <CardDescription>{tasks.length} görev bulundu</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Görev</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Öncelik</TableHead>
                <TableHead className="hidden md:table-cell">Son Tarih</TableHead>
                <TableHead className="hidden lg:table-cell">Tahmini Süre</TableHead>
                <TableHead className="hidden lg:table-cell">Gerçek Süre</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTaskStatusVariant(task.status)}>
                      {getTaskStatusLabel(task.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityVariant(task.priority)}>
                      {getPriorityLabel(task.priority)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDate(task.due_date)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {task.estimated_hours
                      ? `${task.estimated_hours} saat`
                      : "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {task.actual_hours ? `${task.actual_hours} saat` : "—"}
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

// Time Entries Tab
function TimeEntriesTab({ projectId }: { projectId: string }) {
  const { data: entries, isLoading } = useProjectTimeEntries(projectId);

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

  if (!entries || entries.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 space-y-2">
            <Timer className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Bu projeye ait zaman kaydı bulunmuyor.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Zaman Kayıtları</CardTitle>
        <CardDescription>{entries.length} kayıt bulundu</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead className="hidden md:table-cell">Görev</TableHead>
                <TableHead>Süre</TableHead>
                <TableHead className="hidden md:table-cell">Faturalanabilir</TableHead>
                <TableHead className="hidden lg:table-cell">Saatlik Ücret</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    {formatDate(entry.date)}
                  </TableCell>
                  <TableCell>
                    <span className="line-clamp-1">
                      {entry.description || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {entry.task ? (
                      <Badge variant="secondary">{entry.task.title}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDuration(entry.duration_minutes)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {entry.billable ? (
                      <Badge variant="default">Evet</Badge>
                    ) : (
                      <Badge variant="outline">Hayır</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatCurrency(entry.hourly_rate)}
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

// Stats Tab
function StatsTab({ projectId }: { projectId: string }) {
  const { data: stats, isLoading } = useProjectStats(projectId);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 space-y-2">
            <TrendingUp className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              İstatistik verisi yüklenemedi.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tasksDone = stats.tasks.done ?? 0;
  const tasksTotal = stats.tasks.total;
  const taskProgress = tasksTotal > 0 ? (tasksDone / tasksTotal) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Task Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Görev Dağılımı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">İlerleme</span>
              <span className="font-medium">
                {tasksDone}/{tasksTotal} tamamlandı
              </span>
            </div>
            <Progress value={taskProgress} className="h-2" />
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.tasks.todo ?? 0}</p>
                <p className="text-xs text-muted-foreground">Yapılacak</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.tasks.in_progress ?? 0}</p>
                <p className="text-xs text-muted-foreground">Devam Eden</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{tasksDone}</p>
                <p className="text-xs text-muted-foreground">Tamamlanan</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Toplam Zaman Kaydı"
          value={stats.time.total_entries.toString()}
          description="Kayıtlı zaman girişi"
          icon={<Timer className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title="Toplam Saat"
          value={`${stats.time.total_hours.toFixed(1)} sa`}
          description="Takip edilen toplam süre"
          icon={<Clock className="h-5 w-5 text-emerald-500" />}
        />
        <StatCard
          title="Faturalanabilir Saat"
          value={`${stats.time.billable_hours.toFixed(1)} sa`}
          description="Faturalanabilir süre"
          icon={<CheckCircle2 className="h-5 w-5 text-purple-500" />}
        />
        <StatCard
          title="Toplam Gider"
          value={formatCurrency(stats.expenses.total_amount)}
          description={`${stats.expenses.total_count} gider kaydı`}
          icon={<Receipt className="h-5 w-5 text-amber-500" />}
        />
        <StatCard
          title="Toplam Faturalanan"
          value={formatCurrency(stats.budget.total_billed)}
          description="Faturalanan tutar"
          icon={<Banknote className="h-5 w-5 text-emerald-500" />}
        />
        {stats.budget.budget != null && (
          <StatCard
            title="Bütçe Kullanımı"
            value={
              stats.budget.budget_used_percent != null
                ? `%${stats.budget.budget_used_percent.toFixed(0)}`
                : "—"
            }
            description={`Bütçe: ${formatCurrency(stats.budget.budget)}`}
            icon={<DollarSign className="h-5 w-5 text-red-500" />}
            highlight={
              stats.budget.budget_used_percent != null &&
              stats.budget.budget_used_percent > 80
            }
          />
        )}
      </div>
    </div>
  );
}

// Stat card component
function StatCard({
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
