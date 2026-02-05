"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/components/auth-provider";
import { Building2 } from "lucide-react";

export default function SupervisorDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.firstName || "Supervisor"}`}
        description={`Department Head Dashboard • ${user?.department?.name || "Department"}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Department</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">{user?.department?.name || "N/A"}</div>
            <p className="text-xs text-muted-foreground">{user?.department?.type || "General"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border bg-muted/10 border-dashed p-8 text-center">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Department Head Controls
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
          Use the navigation menu to manage operations within the <strong>{user?.department?.name}</strong> department.
        </p>
      </div>
    </div>
  );
}