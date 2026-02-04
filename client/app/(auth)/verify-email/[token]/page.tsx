"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { useVerifyEmail } from "@/lib/hooks/useAuth";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const params = useParams();
  const token = params.token as string;
  const verifyEmail = useVerifyEmail();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (token) {
      verifyEmail.mutate(token, {
        onSuccess: () => {
          setStatus("success");
        },
        onError: () => {
          setStatus("error");
        },
      });
    }
  }, [token]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="mx-auto mb-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              E-posta Doğrulanıyor
            </CardTitle>
            <CardDescription className="text-center">
              Lütfen bekleyin...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              E-posta Doğrulandı
            </CardTitle>
            <CardDescription className="text-center">
              E-posta adresiniz başarıyla doğrulandı. Artık tüm özelliklere erişebilirsiniz.
            </CardDescription>
          </CardHeader>

          <CardFooter>
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">Dashboard'a Git</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Doğrulama Başarısız
          </CardTitle>
          <CardDescription className="text-center">
            E-posta doğrulama bağlantısı geçersiz veya süresi dolmuş olabilir.
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-col gap-2">
          <Link href="/login" className="w-full">
            <Button className="w-full">Giriş Yap</Button>
          </Link>
          <p className="text-sm text-muted-foreground text-center">
            Giriş yaptıktan sonra yeni bir doğrulama e-postası isteyebilirsiniz.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
