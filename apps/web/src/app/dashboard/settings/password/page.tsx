"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";
import { changePasswordApi } from "@/lib/auth-api";
import { toast } from "sonner";
import { Key, Eye, EyeOff, Check, X, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";

export default function ChangePasswordPage() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const passwordRequirements = useMemo(() => [
    { label: "At least 8 characters", regex: /.{8,}/ },
    { label: "At least one uppercase letter", regex: /[A-Z]/ },
    { label: "At least one lowercase letter", regex: /[a-z]/ },
    { label: "At least one number", regex: /[0-9]/ },
    { label: "At least one special character", regex: /[^A-Za-z0-9]/ },
  ], []);

  const strength = useMemo(() => {
    if (!formData.newPassword) return 0;
    return passwordRequirements.filter(req => req.regex.test(formData.newPassword)).length;
  }, [formData.newPassword, passwordRequirements]);

  const strengthColor = useMemo(() => {
    if (strength === 0) return "bg-muted";
    if (strength <= 2) return "bg-destructive";
    if (strength <= 4) return "bg-warning";
    return "bg-success";
  }, [strength]);

  const strengthText = useMemo(() => {
    if (!formData.newPassword) return "";
    if (strength <= 2) return "Weak";
    if (strength <= 4) return "Medium";
    return "Strong";
  }, [strength, formData.newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (strength < 5) {
      toast.error("Please meet all password requirements");
      return;
    }

    try {
      setLoading(true);
      const res = await changePasswordApi({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      }, token);

      if (res.success) {
        toast.success("Password changed successfully. Please login again.");
        setTimeout(() => {
          logout();
          router.push("/login");
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Key className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Settings</h1>
          <p className="text-muted-foreground text-sm">Update your password to keep your account secure.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Choose a strong password with at least 8 characters, including letters, numbers, and symbols.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="newPassword">New Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    {showPasswords ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {showPasswords ? "Hide" : "Show"}
                  </button>
                </div>
                <Input
                  id="newPassword"
                  type={showPasswords ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  required
                />
              </div>

              {/* Strength Meter */}
              {formData.newPassword && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-medium uppercase tracking-wider">
                    <span className="text-muted-foreground">Strength:</span>
                    <span className={
                      strength <= 2 ? "text-destructive" : 
                      strength <= 4 ? "text-warning" : "text-success"
                    }>
                      {strengthText}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <div 
                        key={idx}
                        className={`h-full flex-1 transition-all duration-500 ${
                          idx <= strength ? strengthColor : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Requirements grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 p-3 rounded-lg bg-muted/30 border border-muted">
                    {passwordRequirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        {req.regex.test(formData.newPassword) ? (
                          <Check className="h-3.5 w-3.5 text-success shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                        )}
                        <span className={req.regex.test(formData.newPassword) ? "text-foreground" : "text-muted-foreground"}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type={showPasswords ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                required
              />
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3" /> Passwords do not match
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || strength < 5 || formData.newPassword !== formData.confirmPassword}
                className="min-w-[140px]"
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-warning/20 bg-warning/5">
        <CardContent className="p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <div className="text-xs text-warning-foreground leading-relaxed">
            <p className="font-semibold mb-1">Important Security Note</p>
            For security reasons, changing your password will terminate all your active sessions. You will be required to sign in again after the update.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
