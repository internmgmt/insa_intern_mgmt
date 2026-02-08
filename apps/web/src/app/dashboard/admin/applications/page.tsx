"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Search,
    Filter,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Building2,
    Calendar,
    Briefcase,
    Activity,
    ClipboardList,
    RotateCcw,
    FileDown
} from "lucide-react";
import Link from "next/link";
import {
    listApplications,
    reviewApplication,
    submitApplication
} from "@/lib/services/applications";
import { listUniversities } from "@/lib/services/universities";
import { listDocuments } from "@/lib/services/documents";
import { downloadFile } from "@/lib/download";
import { toast } from "sonner";

export default function AdminApplicationsPage() {
    const { token } = useAuth();

    // Data State
    const [applications, setApplications] = useState<any[]>([]);
    const [universities, setUniversities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [universityFilter, setUniversityFilter] = useState<string>("ALL");
    const [academicYearFilter, setAcademicYearFilter] = useState<string>("ALL");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // Helpers
    const academicYears = useMemo(() => {
        // Collect unique academic years from current applications or common ones
        const years = new Set(applications.map(a => a.academicYear));
        // Add some defaults if empty
        if (years.size === 0) {
            years.add("2024/2025");
            years.add("2025/2026");
        }
        return Array.from(years).sort();
    }, [applications]);

    // Init
    useEffect(() => {
        if (!token) return;
        fetchUniversities();
    }, [token]);

    useEffect(() => {
        if (!token) return;
        fetchApplications();
    }, [token, page, universityFilter, academicYearFilter, statusFilter]);

    async function fetchUniversities() {
        try {
            const res = await listUniversities({ page: 1, limit: 100 }, token || undefined);
            const items = (res as any)?.data?.items || (res as any)?.data || [];
            setUniversities(items);
        } catch (err) {
            console.error("Failed to fetch universities", err);
        }
    }

    async function fetchApplications() {
        try {
            setLoading(true);
            const params: any = { page, limit: 12 };
            if (universityFilter !== "ALL") params.universityId = universityFilter;
            if (academicYearFilter !== "ALL") params.academicYear = academicYearFilter;
            if (statusFilter !== "ALL") params.status = statusFilter;

            const res = await listApplications(params, token || undefined);
            const items = (res as any).data.items || [];
            const pagination = (res as any).data.pagination || { totalPages: 1 };

            setApplications(items);
            setTotalPages(pagination.totalPages);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    }

    async function downloadOfficialLetter(app: any) {
        if (!token) return;
        try {
            // 1. Try to find the document ID for this application's official letter
            const res = await listDocuments({
                entityId: app.id,
                entityType: 'APPLICATION'
            }, token);

            const docs = (res as any)?.data?.items || [];
            // Many docs might be linked to the application (including student ones if logic allowed it)
            // but we look for OFFICIAL_LETTER specifically
            const doc = docs.find((d: any) => {
                try {
                    const meta = JSON.parse(d.metadata || '{}');
                    return meta.documentType === 'OFFICIAL_LETTER';
                } catch (e) { return false; }
            }) || docs[0];

            if (!doc) {
                toast.error("Official letter document not found");
                return;
            }

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
            await downloadFile(`${baseUrl}/documents/${doc.id}/download`, token, `Official_Letter_${app.academicYear.replace('/', '-')}.pdf`);
        } catch (error: any) {
            toast.error("Failed to download official letter");
        }
    }

    async function handleReview(id: string, decision: 'APPROVED' | 'REJECTED') {
        const app = applications.find(a => a.id === id);
        const appName = app?.name || id;
        let rejectionReason: string | undefined = undefined;

        if (decision === 'REJECTED') {
            const input = window.prompt(`Rejection reason for "${appName}" (required):`, '');
            if (!input || !input.trim()) return;
            rejectionReason = input.trim();
        }

        try {
            const apiDecision = decision === 'APPROVED' ? 'APPROVE' : 'REJECT';
            try {
                await reviewApplication(id, { decision: apiDecision, rejectionReason }, token || undefined);
            } catch (err: any) {
                const code = String(err?.code || "");
                const msg = String(err?.message || "").toLowerCase();
                
                if (code === 'APPLICATION_NOT_REVIEWABLE' || msg.includes('under_review') || msg.includes('not under review')) {
                    // Try to auto-submit and review again
                    await submitApplication(id, token || undefined);
                    await reviewApplication(id, { decision: apiDecision, rejectionReason }, token || undefined);
                } else {
                    throw err;
                }
            }
            toast.success(`Application "${appName}" ${decision.toLowerCase()}`);
            fetchApplications();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to review application');
        }
    }

    const filteredApplications = useMemo(() => {
        if (!searchQuery) return applications;
        return applications.filter(app =>
            app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (app.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (app.university?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [applications, searchQuery]);

    const stats = useMemo(() => [
        { label: "Total Batches", value: applications.length.toString(), icon: ClipboardList, color: "text-primary" },
        { label: "Pending Review", value: applications.filter(a => a.status === 'PENDING' || a.status === 'UNDER_REVIEW').length.toString(), icon: Clock, color: "text-warning" },
        { label: "Approved", value: applications.filter(a => a.status === 'APPROVED').length.toString(), icon: CheckCircle, color: "text-success" },
        { label: "Rejected", value: applications.filter(a => a.status === 'REJECTED').length.toString(), icon: XCircle, color: "text-destructive" },
    ], [applications]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING": return <Badge variant="outline">Pending (Draft)</Badge>;
            case "UNDER_REVIEW": return <Badge variant="warning">Under Review</Badge>;
            case "APPROVED": return <Badge variant="success">Approved</Badge>;
            case "REJECTED": return <Badge variant="destructive">Rejected</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const resetFilters = () => {
        setUniversityFilter("ALL");
        setAcademicYearFilter("ALL");
        setStatusFilter("ALL");
        setSearchQuery("");
        setPage(1);
    };

    return (
        <div className="space-y-10 px-4 py-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-2">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">University Applications</h1>
                    <p className="text-muted-foreground">Review and validate incoming internship requests from partnered institutions.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset Filters
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="overflow-hidden border-none shadow-md bg-muted/20">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={`p-2 rounded-lg bg-white shadow-sm ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card className="border-none shadow-sm overflow-visible">
                <CardHeader className="pb-4">
                    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
                        <div className="space-y-2 col-span-1 lg:col-span-1">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">University</Label>
                            <Select value={universityFilter} onValueChange={(v) => { setUniversityFilter(v); setPage(1); }}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="All Universities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Universities</SelectItem>
                                    {universities.map((uni) => (
                                        <SelectItem key={uni.id} value={uni.id}>{uni.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 col-span-1 lg:col-span-1">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Application Batch</Label>
                            <Select value={academicYearFilter} onValueChange={(v) => { setAcademicYearFilter(v); setPage(1); }}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="All Applications" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Applications</SelectItem>
                                    {academicYears.map((year) => (
                                        <SelectItem key={year} value={year}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 col-span-1 lg:col-span-1">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Status</Label>
                            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 col-span-1 lg:col-span-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, ID or university..."
                                    className="pl-8 h-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredApplications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                            <ClipboardList className="h-12 w-12 mb-4 opacity-20" />
                            <p className="font-medium">No applications found.</p>
                            <p className="text-xs">Try adjusting your filters or search query.</p>
                        </div>
                    ) : (
                        <div className="rounded-xl border overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                        <TableHead className="font-bold text-[10px] uppercase">Application</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase">University</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase">Batch</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase text-center">Students</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase">Submitted</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase">Status</TableHead>
                                        <TableHead className="text-right font-bold text-[10px] uppercase">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredApplications.map((app) => (
                                        <TableRow key={app.id} className="group hover:bg-muted/10 transition-colors">
                                            <TableCell>
                                                <div className="font-semibold">{app.name || 'Untitled Application'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded bg-primary/5 flex items-center justify-center text-primary">
                                                        <Building2 className="h-3.5 w-3.5" />
                                                    </div>
                                                    <span className="font-semibold text-sm">{app.university?.name || 'Unknown'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    {app.academicYear}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className="font-bold text-[10px]">
                                                    {app.studentCount}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {app.submittedAt ? String(app.submittedAt).split('T')[0] : (app.createdAt ? String(app.createdAt).split('T')[0] : "—")}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    {(app.status === 'PENDING' || app.status === 'UNDER_REVIEW') && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-success hover:bg-success/10"
                                                                onClick={() => handleReview(app.id, 'APPROVED')}
                                                                title="Approve"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleReview(app.id, 'REJECTED')}
                                                                title="Reject"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-primary hover:bg-primary/10"
                                                        onClick={() => downloadOfficialLetter(app)}
                                                        title="Download Official Letter"
                                                    >
                                                        <FileDown className="h-4 w-4" />
                                                    </Button>
                                                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                                        <Link href={`/dashboard/admin/applications/${app.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 px-2">
                            <p className="text-xs text-muted-foreground font-medium">
                                Showing <span className="text-foreground">{filteredApplications.length}</span> applications on page <span className="text-foreground">{page}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-wider" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
                                <div className="text-[10px] font-bold px-3">Page {page} of {totalPages}</div>
                                <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-wider" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
