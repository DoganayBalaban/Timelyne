"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/lib/hooks/useAuth";
import { RegisterInput, registerSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

export default function RegisterPage() {
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  // Password strength indicators
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Hesap Oluştur
          </CardTitle>
          <CardDescription className="text-center">
            Timelyne'a hoş geldiniz
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {registerMutation.error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {(registerMutation.error as any).response?.data?.message || "Kayıt başarısız"}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">İsim</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Soyisim</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              
              {/* Password strength indicator */}
              {password && (
                <div className="space-y-1 mt-2">
                  <div className="text-xs text-muted-foreground">Şifre gereksinimleri:</div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className={`flex items-center gap-1 ${passwordChecks.length ? "text-green-600" : "text-muted-foreground"}`}>
                      {passwordChecks.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      En az 8 karakter
                    </div>
                    <div className={`flex items-center gap-1 ${passwordChecks.uppercase ? "text-green-600" : "text-muted-foreground"}`}>
                      {passwordChecks.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      Büyük harf
                    </div>
                    <div className={`flex items-center gap-1 ${passwordChecks.lowercase ? "text-green-600" : "text-muted-foreground"}`}>
                      {passwordChecks.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      Küçük harf
                    </div>
                    <div className={`flex items-center gap-1 ${passwordChecks.number ? "text-green-600" : "text-muted-foreground"}`}>
                      {passwordChecks.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      Rakam
                    </div>
                    <div className={`flex items-center gap-1 ${passwordChecks.special ? "text-green-600" : "text-muted-foreground"}`}>
                      {passwordChecks.special ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      Özel karakter
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kayıt Ol
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Zaten hesabınız var mı?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Giriş yapın
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
