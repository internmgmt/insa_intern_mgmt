"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Building2, Mail, Phone, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { listUniversities, getUniversityById } from "@/lib/services/universities";
import { useAuth } from "@/components/auth-provider";

export default function UniversitiesPage() {
    const { token, user } = useAuth();
    const [universities, setUniversities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [newUni, setNewUni] = useState({
        name: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
    });

    useEffect(() => {
        // Always fetch public list immediately so UI has data.
        fetchPublicUniversities();
        // If token is available (or becomes available), fetch enriched details for admins.
        if (token) fetchUniversities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, user?.role]);

    async function fetchPublicUniversities() {
        try {
            setLoading(true);
            const res = await listUniversities({ page: 1, limit: 50 });
            const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
            setUniversities(items.map((u: any) => ({
                id: u.id,
                name: u.name,
                status: (u as any).isActive !== false ? 'active' : 'inactive',
                email: (u as any).contactEmail || '',
                phone: (u as any).contactPhone || '',
                address: (u as any).address || '',
            })));
        } catch (error) {
            console.error('Failed to fetch public universities:', error);
            setUniversities([]);
        } finally {
            setLoading(false);
        }
    }

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return universities;
        return universities.filter((u: any) => {
            return (
                (u.name || "").toLowerCase().includes(q) ||
                (u.location || "").toLowerCase().includes(q) ||
                (u.email || "").toLowerCase().includes(q)
            );
        });
    }, [universities, search]);

    async function fetchUniversities() {
        try {
            const res = await listUniversities({ page: 1, limit: 50 }, token || undefined);
            const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
            if (user?.role === "ADMIN") {
                const detailed = await Promise.all(
                    items.map(async (u: any) => {
                        try {
                            const detail = await getUniversityById(u.id, token || undefined);
                            return detail.data;
                        } catch {
                            return u;
                        }
                    })
                );
                setUniversities(detailed.map((u: any) => ({
                    id: u.id,
                    name: u.name,
                    status: (u as any).isActive !== false ? 'active' : 'inactive',
                    email: (u as any).contactEmail || '',
                    phone: (u as any).contactPhone || '',
                    address: (u as any).address || '',
                })));
            } else {
                setUniversities(items.map((u: any) => ({
                    id: u.id,
                    name: u.name,
                    status: (u as any).isActive !== false ? 'active' : 'inactive',
                    email: (u as any).contactEmail || '',
                    phone: (u as any).contactPhone || '',
                    address: (u as any).address || '',
                })));
            }
        } catch (error) {
            console.error('Failed to fetch universities:', error);
            setUniversities([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleAddUniversity() {
        if (!newUni.name.trim()) return;

        try {
            const res = await fetch('/api/universities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify({
                    name: newUni.name,
                    address: newUni.address || undefined,
                    contactEmail: newUni.contactEmail || undefined,
                    contactPhone: newUni.contactPhone || undefined,
                    isActive: true,
                }),
            });

            if (res.ok) {
                fetchUniversities();
                setNewUni({ name: "", contactEmail: "", contactPhone: "", address: "" });
                setShowForm(false);
            }
        } catch (error) {
            console.error('Failed to add university:', error);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Universities</h1>
                    <p className="text-muted-foreground text-sm mt-1">Create and view partner universities</p>
                </div>
                <Button onClick={() => setShowForm((prev) => !prev)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {showForm ? "Cancel" : "Add University"}
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">New university</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Name</label>
                            <Input
                                placeholder="e.g. Dire Dawa University"
                                value={newUni.name}
                                onChange={(e) => setNewUni({ ...newUni, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Contact Email</label>
                            <Input
                                placeholder="contact@university.edu.et"
                                value={newUni.contactEmail}
                                onChange={(e) => setNewUni({ ...newUni, contactEmail: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Contact Phone</label>
                            <Input
                                placeholder="+251 .."
                                value={newUni.contactPhone}
                                onChange={(e) => setNewUni({ ...newUni, contactPhone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Address</label>
                            <Input
                                placeholder="City, Ethiopia"
                                value={newUni.address}
                                onChange={(e) => setNewUni({ ...newUni, address: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end pt-1">
                            <Button size="sm" onClick={handleAddUniversity}>
                                Save
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search & Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search universities..."
                                className="pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="outline">Filter</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Universities Grid */}
            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading universities...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No universities found.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((uni) => (
                        <Card key={uni.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{uni.name}</CardTitle>
                                            <CardDescription>{uni.address}</CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant={uni.status === 'active' ? 'success' : 'secondary'}>
                                        {uni.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">{uni.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">{uni.phone}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <span className="text-sm text-muted-foreground">University record</span>
                                        <div className="text-xs text-muted-foreground">Edit/Delete not supported</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
