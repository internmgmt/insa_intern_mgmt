"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Briefcase, Users, Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { listDepartments, createDepartment, updateDepartment } from "@/lib/services/departments";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";

export default function DepartmentsPage() {
    const { token } = useAuth();
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newDept, setNewDept] = useState<{ name: string; type: "NETWORKING" | "CYBERSECURITY" | "SOFTWARE_DEVELOPMENT"; description: string }>({ name: "", type: "SOFTWARE_DEVELOPMENT", description: "" });
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editingDept, setEditingDept] = useState<{ id: string; name: string; description: string } | null>(null);

    useEffect(() => {
        void fetchDepartments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function fetchDepartments() {
        try {
            setLoading(true);
            const res = await listDepartments({ page: 1, limit: 100 }, token || undefined);
            const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
            setDepartments(items.map((d: any) => ({ id: d.id, name: d.name, head: (d as any).head || '', interns: (d as any).internCount || 0, status: (d as any).isActive !== false ? 'active' : 'inactive' })));
        } catch (err) {
            setDepartments([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleAddDepartment() {
        if (!newDept.name.trim()) return;
        try {
            await createDepartment({ name: newDept.name.trim(), type: newDept.type, description: newDept.description.trim() || undefined }, token || undefined);
            setShowForm(false);
            setNewDept({ name: "", type: "SOFTWARE_DEVELOPMENT", description: "" });
            void fetchDepartments();
        } catch (err) {
            // non-blocking toast optional
        }
    }

    function openEdit(dept: any) {
        setEditingDept({ id: dept.id, name: dept.name || "", description: (dept as any).description || "" });
        setShowEditDialog(true);
    }

    async function saveEditDialog() {
        if (!editingDept) return;
        try {
            await updateDepartment(editingDept.id, {
                name: editingDept.name.trim() || undefined,
                description: editingDept.description.trim() || undefined,
            }, token || undefined);
            toast.success("Department updated");
            setShowEditDialog(false);
            setEditingDept(null);
            void fetchDepartments();
        } catch (err: any) {
            toast.error(err?.message || "Failed to update department");
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Departments</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage departments and their configurations
                    </p>
                </div>
                <Button onClick={() => setShowForm((prev) => !prev)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {showForm ? "Cancel" : "Add Department"}
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">New department</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Name</label>
                            <Input value={newDept.name} onChange={(e) => setNewDept({ ...newDept, name: e.target.value })} placeholder="e.g. Networking" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Type</label>
                            <select
                                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={newDept.type}
                                onChange={(e) => setNewDept({ ...newDept, type: e.target.value as typeof newDept.type })}
                            >
                                <option value="NETWORKING">NETWORKING</option>
                                <option value="CYBERSECURITY">CYBERSECURITY</option>
                                <option value="SOFTWARE_DEVELOPMENT">SOFTWARE_DEVELOPMENT</option>
                            </select>
                        </div>
                        <div className="space-y-1 md:col-span-3">
                            <label className="text-xs font-medium">Description (optional)</label>
                            <Input value={newDept.description} onChange={(e) => setNewDept({ ...newDept, description: e.target.value })} placeholder="Short description" />
                        </div>
                        <div className="md:col-span-3 flex justify-end pt-1">
                            <Button size="sm" onClick={handleAddDepartment}>Save</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search departments..." className="pl-10" />
                    </div>
                </CardContent>
            </Card>

            {/* Departments Grid */}
            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading departments...</div>
            ) : departments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No departments found.</div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((dept: any) => (
                    <Card key={dept.id}>
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Briefcase className="h-5 w-5" />
                                </div>
                                <Badge variant={dept.status === 'active' ? 'success' : 'secondary'}>
                                    {dept.status}
                                </Badge>
                            </div>
                            <CardTitle className="mt-3 text-lg">{dept.name}</CardTitle>
                            <CardDescription>Head: {dept.head}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between pt-3 border-t">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>{dept.interns} Interns</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(dept)} title="Edit department">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <div className="text-[11px] text-muted-foreground">Delete not supported</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            )}

            {/* Edit Department Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle>Edit Department</DialogTitle>
                        <DialogDescription>Update department name or description. Type cannot be changed.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Name</label>
                            <Input
                                value={editingDept?.name || ""}
                                onChange={(e) => setEditingDept((prev) => prev ? { ...prev, name: e.target.value } : prev)}
                                placeholder="e.g. Networking"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Description (optional)</label>
                            <Input
                                value={editingDept?.description || ""}
                                onChange={(e) => setEditingDept((prev) => prev ? { ...prev, description: e.target.value } : prev)}
                                placeholder="Short description"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" size="sm" type="button" onClick={() => { setShowEditDialog(false); setEditingDept(null); }}>Cancel</Button>
                        <Button size="sm" type="button" onClick={saveEditDialog} disabled={!editingDept || !editingDept.name.trim()}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
