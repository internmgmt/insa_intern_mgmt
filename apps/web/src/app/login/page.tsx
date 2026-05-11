"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, loginWithCredentials, roleHome } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => Boolean(email.trim() && password), [email, password]);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(roleHome(user.role));
    }
  }, [isLoading, user, router, roleHome]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await loginWithCredentials({ email: email.trim(), password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(var(--primary),0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.10),transparent_24%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        <div className="hidden lg:flex items-center justify-center border-r border-border/60 bg-muted/20 p-10 xl:p-16">
          <div className="max-w-xl space-y-10 text-left">
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm">
                <img src="/logo.png" alt="INSA Logo" className="h-full w-full object-contain p-1" />
              </div>
              <div className="space-y-2">
                <h1 className="max-w-md text-2xl font-semibold leading-tight tracking-tight text-foreground xl:text-3xl">
                  Information Network Security Administration Intern Management System
                </h1>
              </div>
            </div>

           
          </div>
        </div>

        <div className="flex items-center justify-center p-4 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-background shadow-sm">
                <img src="/logo.png" alt="INSA Logo" className="h-full w-full object-contain p-1" />
              </div>
              <div>
                <h1 className="max-w-xs text-base font-semibold leading-tight tracking-tight text-foreground sm:text-lg">
                  Information Network Security Administration Intern Management System
                </h1>
              </div>
            </div>

            <Card className="border-border/70 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/90">
              <CardHeader className="space-y-2 pb-6 pt-8 text-center sm:text-left sm:px-8">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                  Welcome back
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 px-6 pb-8 sm:px-8">
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="username@insa.gov.et"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        className="h-11 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                        Password
                      </Label>
                    </div>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        className="h-11 pl-10 pr-11"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((value: boolean) => !value)}
                        className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="h-11 w-full"
                    disabled={!canSubmit || isLoading || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>

                <p className="text-center text-xs text-muted-foreground">
                  Only authorized accounts can access the portal.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}