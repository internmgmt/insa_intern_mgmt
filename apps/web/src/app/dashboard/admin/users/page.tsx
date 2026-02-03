"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Shield, Trash2, Power } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { listUsers, createUser, updateUser, deactivateUser } from "@/lib/services/users";
import { listUniversities } from "@/lib/services/universities";
import { useAuth } from "@/components/auth-provider";
import type { User, UserRole } from "@/lib/types";
import { toast } from "sonner";

type NewUser = {
  firstName: string;
  lastName: string;
  email: string;
  role: Exclude<UserRole, "INTERN">;
  universityId?: string;
};

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [universities, setUniversities] = useState<{ id: string; name: string }[]>([]);
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
  });

  const canCreate = useMemo(() => newUser.firstName.trim() && newUser.lastName.trim() && newUser.email.trim(), [newUser]);

  useEffect(() => {
    void fetchUsers();
    void fetchUniversities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function fetchUniversities() {
    try {
      const res = await listUniversities({ page: 1, limit: 100 }, token || undefined);
      const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
      setUniversities(items.map((u: any) => ({ id: u.id, name: u.name })));
    } catch (error) {
      // Non-blocking
    }
  }

  async function handleAddUser() {
    if (!canCreate) return;
    try {
      await createUser({
        email: newUser.email.trim(),
        firstName: newUser.firstName.trim(),
        lastName: newUser.lastName.trim(),
        role: newUser.role,
        universityId: newUser.role === "UNIVERSITY" ? (newUser.universityId || undefined) : undefined,
      }, token || undefined);
      toast.success("User created");
      setShowNewUserForm(false);
      setNewUser({ firstName: "", lastName: "", email: "", role: "UNIVERSITY", universityId: "" });
      void fetchUsers();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create user");
    }
  }

  async function handleDeleteUser(id: string) {
    if (!confirm('Deactivate this user?')) return;
    try {
      await deactivateUser(id, token || undefined);
      toast.success("User deactivated");
      void fetchUsers();
    } catch (error: any) {
      toast.error(error?.message || "Failed to deactivate user");
    }
  }

  async function handleToggleStatus(u: User) {
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
      <PageHeader title="User Management" />

      <div className="flex items-center justify-between gap-2">
        <Button
          className="shrink-0"
          onClick={() => setShowNewUserForm((prev) => !prev)}
        >
          <Plus className="mr-2 h-4 w-4" />
          {showNewUserForm ? "Cancel" : "Add user"}
        </Button>
      </div>

      {showNewUserForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">New user</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-5">
            <div className="space-y-1">
              <label className="text-xs font-medium">First name</label>
              <Input
                placeholder="e.g. Biruk"
                value={newUser.firstName}
                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Last name</label>
              <Input
                placeholder="e.g. Teshome"
                value={newUser.lastName}
                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Email</label>
              <Input
                placeholder="user@example.com"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Role</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={newUser.role}
                onChange={(e) => {
                  const role = e.target.value as NewUser["role"];
                  setNewUser({
                    ...newUser,
                    role,
                    universityId: role === "UNIVERSITY" ? newUser.universityId : "",
                  });
                }}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="UNIVERSITY">UNIVERSITY</option>
                <option value="SUPERVISOR">SUPERVISOR</option>
              </select>
            </div>
            {newUser.role === "UNIVERSITY" && (
              <div className="space-y-1">
                <label className="text-xs font-medium">University</label>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newUser.universityId}
                  onChange={(e) =>
                    setNewUser({ ...newUser, universityId: e.target.value })
                  }
                >
                  <option value="">Select University</option>
                  {universities.map((uni) => (
                    <option key={uni.id} value={uni.id}>
                      {uni.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="md:col-span-5 flex justify-end pt-1">
              <Button size="sm" onClick={handleAddUser} disabled={!canCreate}>
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button variant="outline" onClick={() => { setPage(1); void fetchUsers(); }}>Search</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[110px]">Role</TableHead>
                <TableHead className="w-[110px]">Status</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "success" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => handleToggleStatus(user)}
                          title={user.isActive ? "Deactivate" : "Activate"}
                        >
                          <Power className={`h-4 w-4 ${user.isActive ? "text-destructive" : "text-success"}`} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => handleDeleteUser(user.id)}
                          title="Deactivate user"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-end gap-2 mt-3">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
            <div className="text-xs text-muted-foreground">Page {page} of {totalPages}</div>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
          </div>
        </CardContent>
      </Card>

      {/* Removed explainer cards per request */}
    </div>
  );
}
