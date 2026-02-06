"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/ui/page-header";
import { CheckCircle, Key, Moon, Sun } from "lucide-react";
import { sanitizeFormData } from "@/lib/sanitize";

export default function UniversitySettingsPage() {
  const [preferences, setPreferences] = useState({ timezone: "America/New_York", dateFormat: "MM/DD/YYYY", resultsPerPage: "25" });
  const [security, setSecurity] = useState({ twoFactorEnabled: false, sessionTimeout: "30" });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  const handleSaveSettings = () => {
    setSaveStatus("saving");
    const cleanPreferences = sanitizeFormData(preferences);
    const cleanSecurity = { ...security, sessionTimeout: sanitizeFormData({ sessionTimeout: security.sessionTimeout }).sessionTimeout };
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account preferences and security settings" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Appearance</CardTitle>
              <CardDescription>Customize how the dashboard looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant={theme === "light" ? "default" : "outline"} size="sm" onClick={() => setTheme("light")} className="gap-2">
                    <Sun className="h-4 w-4" /> Light
                  </Button>
                  <Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")} className="gap-2">
                    <Moon className="h-4 w-4" /> Dark
                  </Button>
                  <Button variant={theme === "system" ? "default" : "outline"} size="sm" onClick={() => setTheme("system")} className="gap-2">
                    Auto
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select value={preferences.dateFormat} onValueChange={(value) => setPreferences({ ...preferences, dateFormat: value })}>
                    <SelectTrigger id="date-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="results-per-page">Results Per Page</Label>
                  <Select value={preferences.resultsPerPage} onValueChange={(value) => setPreferences({ ...preferences, resultsPerPage: value })}>
                    <SelectTrigger id="results-per-page">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveSettings} size="sm" disabled={saveStatus === "saving"}>
                  {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : "Save Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="two-factor" className="text-base font-medium">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Switch id="two-factor" checked={security.twoFactorEnabled} onCheckedChange={(checked) => setSecurity({ ...security, twoFactorEnabled: checked })} />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Change Password</Label>
                  <div className="flex gap-2">
                    <Input id="current-password" type="password" placeholder="Current password" />
                    <Input id="new-password" type="password" placeholder="New password" />
                  </div>
                </div>
                <Button variant="outline" className="gap-2" size="sm"><Key className="h-4 w-4" /> Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Help & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Have questions or need assistance? Our support team is here to help.</p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full gap-2" size="sm">Contact Support</Button>
                <Button variant="outline" className="w-full gap-2" size="sm">Documentation</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}