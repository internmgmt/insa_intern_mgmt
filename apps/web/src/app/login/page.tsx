"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { LogoBlock } from "@/components/logo-block";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, loginWithCredentials, roleHome } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => email.trim() && password, [email, password]);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(roleHome(user.role));
    }
  }, [isLoading, user, router, roleHome]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await loginWithCredentials({ email: email.trim(), password });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid credentials. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background p-4 overflow-hidden">
      {/* Premium Animated Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-primary/10 blur-[120px] animate-pulse transition-all duration-[10s]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-primary/10 blur-[120px] animate-pulse [animation-delay:2s] duration-[8s]" />

        {/* Animated Mesh Gradients */}
        <div className="absolute top-1/2 left-1/4 w-[20%] h-[20%] bg-accent/10 blur-[100px] animate-fade-in [animation-duration:5s] repeat-infinite alternate" />
        <div className="absolute bottom-1/4 right-1/4 w-[15%] h-[15%] bg-primary/5 blur-[80px] animate-fade-in [animation-delay:3s] [animation-duration:7s] repeat-infinite alternate" />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="w-full max-w-2xl relative z-10 transition-all duration-700">
        {/* Main Branding Header - Specialized for Login Page */}
        <div className="flex flex-col items-center mb-10 animate-slide-up-fade [animation-duration:600ms]">
          <div className="flex items-center gap-6 text-left">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center bg-transparent">
              <img
                src="/logo.png"
                alt="INSA Logo"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex flex-col items-start gap-0.5">
              <h1 className="font-bold text-xl leading-tight tracking-tight text-foreground max-w-[360px]">
                Information Network Security Administration
              </h1>
              <h2 className="text-lg font-medium text-foreground/85 font-amharic">
                የኢንፎርሜሽን መረብ ደህንነት አስተዳደር
              </h2>
            </div>
          </div>
        </div>

        <div className="animate-slide-up-fade [animation-delay:300ms] [animation-fill-mode:both] flex justify-center">
          <Card className="w-full max-w-lg border-border/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-card/95 backdrop-blur-xl overflow-hidden rounded-[2.5rem] transition-all duration-500 hover:shadow-primary/10 hover:border-primary/20">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/30 via-primary to-primary/30 animate-pulse" />

            <CardHeader className="space-y-1.5 pt-12 pb-8 text-center px-10">
              <CardTitle className="text-4xl font-black tracking-tight text-foreground">
                Login
              </CardTitle>
              <CardDescription className="text-base font-semibold text-muted-foreground">
                Authenticate your credentials to continue
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 sm:px-14 pb-14">
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-2.5 animate-slide-up-fade [animation-delay:600ms] [animation-fill-mode:both]">
                  <Label
                    htmlFor="email"
                    className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground/70 ml-2"
                  >
                    Email
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors duration-300">
                      <Mail className="size-5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="username@insa.gov.et"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="pl-12 h-14 bg-muted/20 border-border/60 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all duration-300 rounded-2xl placeholder:text-muted-foreground/60 font-semibold text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2.5 animate-slide-up-fade [animation-delay:700ms] [animation-fill-mode:both]">
                  <div className="flex items-center justify-between ml-2">
                    <Label
                      htmlFor="password"
                      className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground/70"
                    >
                      Password
                    </Label>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors duration-300">
                      <Lock className="size-5" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      className="pl-12 pr-12 h-14 bg-muted/20 border-border/60 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all duration-300 rounded-2xl placeholder:text-muted-foreground/60 font-semibold text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-transparent transition-transform active:scale-90"
                    >
                      {showPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl bg-destructive/5 border border-destructive/20 p-5 text-sm font-bold text-destructive flex items-center gap-4 animate-in fade-in slide-in-from-top-3 duration-500 shadow-sm">
                    <div className="size-2 rounded-full bg-destructive animate-pulse shrink-0" />
                    {error}
                  </div>
                )}

                <div className="pt-4 animate-slide-up-fade [animation-delay:800ms] [animation-fill-mode:both]">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-sm font-black uppercase tracking-[0.2em] bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_10px_30px_rgba(var(--primary),0.3)] transition-all active:scale-[0.97] rounded-2xl flex items-center justify-center gap-3 group relative overflow-hidden"
                    disabled={!canSubmit || isLoading || isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="size-6 border-4 border-primary-foreground/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="relative z-10 flex items-center gap-3">
                          Login
                          <ChevronRight className="size-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 animate-fade-in [animation-delay:1200ms] [animation-fill-mode:both]">
          <p className="text-[9px] text-muted-foreground/80 font-semibold">
            &copy; {new Date().getFullYear()} Information Network Security
            Administration
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
