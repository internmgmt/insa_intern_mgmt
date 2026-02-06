"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Shield, Trash2, Power, Search, Building2, School as SchoolIcon, Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { listUsers, createUser, updateUser, deactivateUser } from "@/lib/services/users";
import { listUniversities } from "@/lib/services/universities";
import { listDepartments } from "@/lib/services/departments";
import { useAuth } from "@/components/auth-provider";
import type { User, UserRole } from "@/lib/types";
import { toast } from "sonner";
import { sanitizeFormData } from "@/lib/sanitize";

type NewUser = {
  firstName: string;
  lastName: string;
  email: string;
  role: Exclude<UserRole, "INTERN">;
  universityId?: string;
  departmentId?: string;
};

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [universities, setUniversities] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    firstName: "",
    lastName: "",
    email: "",
    role: "ADMIN",
    universityId: "",
    departmentId: "",
  });

  const canCreate = useMemo(() => 
    newUser.firstName.trim() && 
    newUser.lastName.trim() && 
    newUser.email.trim() &&
    (newUser.role !== "UNIVERSITY" || newUser.universityId) &&
    (newUser.role !== "SUPERVISOR" || newUser.departmentId),
  [newUser]);

  useEffect(() => {
    void fetchUsers();
    void fetchResources();
  }, [page]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await listUsers({ page, limit: 10, search: search || undefined }, token || undefined);
      const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
      const totalPages = (res as any)?.data?.pagination?.totalPages ?? (res as any)?.pagination?.totalPages ?? 1;
      setUsers(items);
      setTotalPages(totalPages);
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  async function fetchResources() {
    try {
      const [uniRes, deptRes] = await Promise.all([
        listUniversities({ page: 1, limit: 100 }, token || undefined),
        listDepartments({ page: 1, limit: 100 }, token || undefined)
      ]);
      setUniversities(((uniRes as any)?.data?.items ?? (uniRes as any)?.data ?? []).map((u: any) => ({ id: u.id, name: u.name })));
      setDepartments(((deptRes as any)?.data?.items ?? (deptRes as any)?.data ?? []).map((d: any) => ({ id: d.id, name: d.name })));
    } catch (error) {
    }
  }

  async function handleAddUser() {
    if (!canCreate) return;
    const cleanData = sanitizeFormData({
      email: newUser.email.trim().toLowerCase(),
      firstName: newUser.firstName.trim(),
      lastName: newUser.lastName.trim(),
    });
    try {
      await createUser({
        email: cleanData.email,
        firstName: cleanData.firstName,
        lastName: cleanData.lastName,
        role: newUser.role,
        universityId: newUser.role === "UNIVERSITY" ? (newUser.universityId || undefined) : undefined,
        departmentId: newUser.role === "SUPERVISOR" ? (newUser.departmentId || undefined) : undefined,
      }, token || undefined);
      toast.success("User created and credentials emailed");
      setShowNewUserForm(false);
      setNewUser({ firstName: "", lastName: "", email: "", role: "ADMIN", universityId: "", departmentId: "" });
      void fetchUsers();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create user");
    }
  }

  async function handleToggleStatus(u: any) {
    try {
      await updateUser(u.id, { isActive: !u.isActive }, token || undefined);
      toast.success(!u.isActive ? "User activated" : "User deactivated");
      void fetchUsers();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update status");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm">Manage system users, roles, and departmental permissions</p>
        </div>
        <Button
          onClick={() => setShowNewUserForm((prev) => !prev)}
          className="shadow-sm"
        >
          {showNewUserForm ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> Add system user</>}
        </Button>
      </div>

      {showNewUserForm && (
        <Card className="border-primary/20 bg-primary/[0.02]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Register New User</CardTitle>
            <CardDescription>Accounts are created with an auto-generated temporary password sent to the user's email.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-bold uppercase text-muted-foreground/70">Legal Name</label>
              <div className="flex gap-2">
                <Input
                  className="bg-background"
                  placeholder="First"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                />
                <Input
                  className="bg-background"
                  placeholder="Last"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-bold uppercase text-muted-foreground/70">Email Address</label>
              <Input
                className="bg-background"
                placeholder="user@insa.et"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>

            <div className="space-y-1 lg:col-span-1">
              <label className="text-xs font-bold uppercase text-muted-foreground/70">User Role</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={newUser.role}
                onChange={(e) => {
                  const role = e.target.value as NewUser["role"];
                  setNewUser({ ...newUser, role, universityId: "", departmentId: "" });
                }}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="UNIVERSITY">UNIVERSITY</option>
                <option value="SUPERVISOR">SUPERVISOR</option>
              </select>
            </div>

            <div className="space-y-1 lg:col-span-1 flex items-end">
              <Button className="w-full" onClick={handleAddUser} disabled={!canCreate}>
                Register
              </Button>
            </div>

            {(newUser.role === "UNIVERSITY" || newUser.role === "SUPERVISOR") && (
              <div className="md:col-span-4 lg:col-span-6 animate-in slide-in-from-top-2 duration-300">
                <div className="p-4 rounded-lg bg-background border shadow-sm flex items-center gap-4">
                  {newUser.role === "UNIVERSITY" ? (
                    <>
                      <SchoolIcon className="h-5 w-5 text-primary shrink-0" />
                      <div className="flex-1 space-y-1">
                        <label className="text-xs font-medium">Associated Institution</label>
                        <select
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none"
                          value={newUser.universityId}
                          onChange={(e) => setNewUser({ ...newUser, universityId: e.target.value })}
                        >
                          <option value="">Select University...</option>
                          {universities.map((uni) => <option key={uni.id} value={uni.id}>{uni.name}</option>)}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <Building2 className="h-5 w-5 text-primary shrink-0" />
                      <div className="flex-1 space-y-1">
                        <label className="text-xs font-medium">Departmental Assignment</label>
                        <select
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none"
                          value={newUser.departmentId}
                          onChange={(e) => setNewUser({ ...newUser, departmentId: e.target.value })}
                        >
                          <option value="">Select Department...</option>
                          {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg">System Registries</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name or email..." 
                  className="pl-9 w-[280px] h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                />
              </div>
              <Button variant="outline" size="sm" className="h-9" onClick={() => fetchUsers()}>
                <Filter className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold py-4">User Identity</TableHead>
                <TableHead className="font-bold">Access Role</TableHead>
                <TableHead className="font-bold">Affiliation</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold pr-6">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="py-12 text-center text-muted-foreground">Loading registries...</TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="py-12 text-center text-muted-foreground">No matching users found.</TableCell></TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{u.firstName} {u.lastName}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-tight">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {u.role === 'UNIVERSITY' ? (u.university?.name || '--') : (u.department?.name || '--')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${u.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                        <span className="text-xs font-medium">{u.isActive ? 'Active' : 'Suspended'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-8 px-2 ${u.isActive ? 'hover:text-amber-600 hover:bg-amber-50/50' : 'hover:text-emerald-600 hover:bg-emerald-50/50'}`}
                        onClick={() => handleToggleStatus(u)}
                      >
                        {u.isActive ? <><Power className="h-4 w-4 mr-2" /> Suspend</> : <><Power className="h-4 w-4 mr-2" /> Restore</>}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          <div className="p-4 border-t flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing page <span className="font-bold text-foreground">{page}</span> of <span className="font-bold text-foreground">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 pr-4" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="h-8 pl-4" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}