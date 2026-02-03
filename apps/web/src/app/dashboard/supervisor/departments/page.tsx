"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from "lucide-react";

export default function SupervisorDepartmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Department"
        description="View your department details and intern roster."
      />

      <Card>
        <CardHeader>
          <CardTitle>Cybersecurity Department</CardTitle>
          <CardDescription className="flex items-center gap-2 text-xs">
            <Badge variant="outline">CYBERSECURITY</Badge>
            <span>Focus on defensive operations, monitoring, and incident response.</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <div className="font-medium text-foreground mb-1">Supervisors</div>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="secondary">Melaku Abebe</Badge>
              <Badge variant="secondary">Saron Tesfaye</Badge>
              <Badge variant="secondary">Haile Fikru</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-muted-foreground">Created</div>
              <div className="text-foreground">2024-01-10</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total interns this cycle</div>
              <div className="text-foreground">12</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Interns in your department</CardTitle>
            <CardDescription>Interns currently assigned to this department.</CardDescription>
          </div>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Intern</TableHead>
                <TableHead>Intern ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="w-[140px]">Last submission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Yared Getachew</TableCell>
                <TableCell className="text-xs text-muted-foreground">INSA-2025-001</TableCell>
                <TableCell>
                  <Badge variant="success">ACTIVE</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">2025-07-01 → 2025-10-31</TableCell>
                <TableCell className="text-xs text-muted-foreground">Weekly report • 2 days ago</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Mimi Worku</TableCell>
                <TableCell className="text-xs text-muted-foreground">INSA-2025-002</TableCell>
                <TableCell>
                  <Badge variant="success">ACTIVE</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">2025-07-01 → 2025-10-31</TableCell>
                <TableCell className="text-xs text-muted-foreground">Project file • 5 days ago</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Samuel Bekele</TableCell>
                <TableCell className="text-xs text-muted-foreground">INSA-2025-003</TableCell>
                <TableCell>
                  <Badge variant="secondary">COMPLETED</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">2025-03-01 → 2025-06-30</TableCell>
                <TableCell className="text-xs text-muted-foreground">Final report • last month</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
