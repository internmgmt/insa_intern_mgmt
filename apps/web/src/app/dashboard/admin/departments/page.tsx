"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Briefcase, Users, Edit, Trash2, Building2, LayoutGrid, Info } from "lucide-react";
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
            setDepartments(items.filter((d: any) => d && d.id).map((d: any) => {
                const typeMap: any = {
                    'SOFTWARE_DEVELOPMENT': 'Software Engineering',
                    'CYBERSECURITY': 'Cyber Operations',
                    'NETWORKING': 'Networking & Infra'
                };
                return { 
                    id: d.id, 
                    name: d.name || "Unnamed Unit", 
                    type: typeMap[d.type] || d.type || "General",
                    description: d.description || "",
                    head: d.head || 'Not Assigned', 
                    internCount: Number(d.internCount || 0), 
                    isActive: d.isActive !== false 
                };
            }));
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
            toast.success("Department created successfully");
            void fetchDepartments();
        } catch (err: any) {
            toast.error(err?.message || "Failed to create department");
        }
    }

    function openEdit(dept: any) {
        setEditingDept({ id: dept.id, name: dept.name || "", description: dept.description || "" });
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Departments</h1>
                    <p className="text-muted-foreground text-sm">Manage institutional departments and scientific domains</p>
                </div>
                <Button onClick={() => setShowForm((prev) => !prev)} variant={showForm ? "outline" : "default"}>
                    {showForm ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> Add Department</>}
                </Button>
            </div>

            {showForm && (
                <Card className="border-primary/20 bg-primary/[0.01]">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">Registration: New Department</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Department Name</label>
                                <Input value={newDept.name} onChange={(e) => setNewDept({ ...newDept, name: e.target.value })} placeholder="e.g. Network Infrastructure" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Scientific Domain</label>
                                <select
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    value={newDept.type}
                                    onChange={(e) => setNewDept({ ...newDept, type: e.target.value as any })}
                                >
                                    <option value="NETWORKING">Networking & Infrastructure</option>
                                    <option value="CYBERSECURITY">Cyber Operations</option>
                                    <option value="SOFTWARE_DEVELOPMENT">Software Engineering</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Mission & Objective</label>
                            <Input value={newDept.description} onChange={(e) => setNewDept({ ...newDept, description: e.target.value })} placeholder="Describe the department's primary focus..." />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button onClick={handleAddDepartment}>Register Department</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-20 text-muted-foreground flex flex-col items-center gap-2">
                        <div className="h-6 w-6 animate-spin border-2 border-primary border-t-transparent rounded-full" />
                        Loading organizational data...
                    </div>
                ) : departments.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                        No departments found.
                    </div>
                ) : (
                    departments.map((dept) => (
                        <Card key={dept.id} className="group hover:shadow-md transition-all duration-300 border-none bg-muted/40">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="p-2.5 rounded-xl bg-background border group-hover:border-primary/30 transition-colors">
                                        <Briefcase className="h-5 w-5 text-primary" />
                                    </div>
                                    <Badge variant={dept.isActive ? "success" : "secondary"} className="uppercase text-[10px] font-bold">
                                        {dept.isActive ? 'Active' : 'Offline'}
                                    </Badge>
                                </div>
                                <CardTitle className="mt-4 text-lg font-bold">{dept.name}</CardTitle>
                                <CardDescription className="line-clamp-2 text-xs min-h-[32px]">
                                    {dept.description || "No mission statement provided."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2 rounded-lg bg-background/60 border border-transparent group-hover:border-primary/10 transition-colors">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">Domain</p>
                                        <p className="text-xs font-semibold truncate uppercase">{dept.type}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-background/60 border border-transparent group-hover:border-primary/10 transition-colors">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">Intern Capacity</p>
                                        <div className="flex items-center gap-1.5 font-bold text-xs uppercase">
                                            <Users className="h-3 w-3 text-primary" /> {dept.internCount} Interns
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                                        <Info className="h-3 w-3" /> Dept. Head: {dept.head}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors" 
                                            onClick={() => openEdit(dept)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Edit Dialog - Kept simple but functional */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Department</DialogTitle>
                        <DialogDescription>Modify metadata for {editingDept?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Label</label>
                            <Input
                                value={editingDept?.name || ""}
                                onChange={(e) => setEditingDept((prev) => prev ? { ...prev, name: e.target.value } : prev)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Mission Description</label>
                            <Input
                                value={editingDept?.description || ""}
                                onChange={(e) => setEditingDept((prev) => prev ? { ...prev, description: e.target.value } : prev)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditingDept(null); }}>Cancel</Button>
                        <Button onClick={saveEditDialog}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
