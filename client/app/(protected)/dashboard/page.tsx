"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useLogout, useResendVerification, useUser } from "@/lib/hooks/useAuth";
import { useAppSelector } from "@/lib/hooks/useRedux";
import { AlertTriangle, Loader2, LogOut, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: user, isLoading, error } = useUser();
  const logout = useLogout();
  const resendVerification = useResendVerification();
  const authState = useAppSelector((state) => state.auth);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && error) {
      router.push("/login");
    }
  }, [isLoading, error, router]);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!isLoading && user && !user.is_onboarding_completed) {
      router.push("/onboarding");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout.mutate();
  };

  const handleResendVerification = () => {
    if (user.email) {
      resendVerification.mutate(user.email);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button variant="outline" onClick={handleLogout} disabled={logout.isPending}>
            {logout.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Çıkış Yap
          </Button>
        </div>

        {/* Email verification warning */}
        {!user.email_verified && (
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    E-posta Doğrulanmadı
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Tüm özelliklere erişmek için lütfen e-posta adresinizi doğrulayın.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={handleResendVerification}
                    disabled={resendVerification.isPending}
                  >
                    {resendVerification.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="mr-2 h-4 w-4" />
                    )}
                    Doğrulama E-postası Gönder
                  </Button>
                  {resendVerification.isSuccess && (
                    <p className="text-sm text-green-600 mt-2">
                      Doğrulama e-postası gönderildi!
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User info card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profil Bilgileri
            </CardTitle>
            <CardDescription>
              Hesap bilgileriniz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">İsim</p>
                <p className="font-medium">
                  {user.first_name} {user.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">E-posta</p>
                <p className="font-medium flex items-center gap-2">
                  {user.email}
                  {user.email_verified ? (
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full">
                      Doğrulandı
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                      Doğrulanmadı
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rol</p>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-medium capitalize">{user.plan}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Zaman Dilimi</p>
                <p className="font-medium">{user.timezone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Para Birimi</p>
                <p className="font-medium">{user.currency}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Welcome message */}
        <Card>
          <CardHeader>
            <CardTitle>Hoş Geldiniz, {user.first_name}! 🎉</CardTitle>
            <CardDescription>
              Timelyne'a başarıyla giriş yaptınız. Freelance işlerinizi yönetmeye başlayabilirsiniz.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
