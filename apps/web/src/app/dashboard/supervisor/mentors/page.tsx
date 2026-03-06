"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, UserCog, UserCheck, UserMinus, UserPlus, CheckCircle2, X, GraduationCap, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { listUsers, createUser, updateUser } from "@/lib/services/users";
import { listInterns, updateIntern } from "@/lib/services/interns";
import { useAuth } from "@/components/auth-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import type { UserRole } from "@/lib/types";
import { toast } from "sonner";
import { sanitizeFormData } from "@/lib/sanitize";

type NewMentor = {
  firstName: string;
  lastName: string;
  email: string;
};

export default function SupervisorMentorsPage() {
  const { token, user } = useAuth();
  const [mentors, setMentors] = useState<any[]>([]);
  const [interns, setInterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingInterns, setLoadingInterns] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [showNewMentorForm, setShowNewMentorForm] = useState(false);
  const [newMentor, setNewMentor] = useState<NewMentor>({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Assign Interns Logic
  const [selectedMentor, setSelectedMentor] = useState<any | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedInternIds, setSelectedInternIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [internSearch, setInternSearch] = useState("");

  const canCreate = useMemo(() =>
    newMentor.firstName.trim() &&
    newMentor.lastName.trim() &&
    newMentor.email.trim(),
    [newMentor]);

  const filteredInterns = useMemo(() => {
    if (!internSearch) return interns;
    const searchLower = internSearch.toLowerCase();
    return interns.filter((i: any) =>
      i.firstName?.toLowerCase().includes(searchLower) ||
      i.lastName?.toLowerCase().includes(searchLower) ||
      i.email?.toLowerCase().includes(searchLower)
    );
  }, [interns, internSearch]);

  useEffect(() => {
    void fetchMentors();
  }, [page, token]);

  async function fetchMentors() {
    try {
      setLoading(true);
      const res = await listUsers({
        page,
        limit: 10,
        role: "MENTOR" as any,
        search: search || undefined
      }, token || undefined);

      const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
      const totalPages = (res as any)?.data?.pagination?.totalPages ?? (res as any)?.pagination?.totalPages ?? 1;

      setMentors(items);
      setTotalPages(totalPages);
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch mentors");
    } finally {
      setLoading(false);
    }
  }

  async function fetchInterns() {
    try {
      setLoadingInterns(true);
      const res = await listInterns({ limit: 100 }, token || undefined);
      setInterns(res.data?.items || []);
    } catch (error: any) {
      toast.error("Failed to fetch interns");
    } finally {
      setLoadingInterns(false);
    }
  }

  const handleOpenAssign = (mentor: any) => {
    setSelectedMentor(mentor);
    setSelectedInternIds(mentor.mentoredInterns?.map((i: any) => i.id) || []);
    setInternSearch("");
    setShowAssignDialog(true);
    void fetchInterns();
  };

  const toggleInternSelection = (id: string) => {
    setSelectedInternIds((prev: string[]) =>
      prev.includes(id) ? prev.filter((i: string) => i !== id) : [...prev, id]
    );
  };

  async function handleBatchAssign() {
    if (!selectedMentor || !token) return;
    setIsAssigning(true);
    try {
      // For simplicity, we assign the current mentor to all selected interns
      // and remove them from orphans if they were unassigned.
      // In a real app we might want a batch endpoint, but we can iterate.
      const currentAssigned = selectedMentor.mentoredInterns?.map((i: any) => i.id) || [];
      const toAssign = selectedInternIds.filter((id: string) => !currentAssigned.includes(id));
      const toUnassign = currentAssigned.filter((id: string) => !selectedInternIds.includes(id));

      const promises = [
        ...toAssign.map((id: string) => updateIntern(id, { assignedMentorId: selectedMentor.id }, token || undefined)),
        ...toUnassign.map((id: string) => updateIntern(id, { assignedMentorId: null }, token || undefined))
      ];

      await Promise.all(promises);
      toast.success("Intern assignments updated");
      setShowAssignDialog(false);
      void fetchMentors();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update assignments");
    } finally {
      setIsAssigning(false);
    }
  }

  async function handleAddMentor() {
    if (!canCreate) return;
    const cleanData = sanitizeFormData({
      email: newMentor.email.trim().toLowerCase(),
      firstName: newMentor.firstName.trim(),
      lastName: newMentor.lastName.trim(),
    });
    try {
      await createUser({
        email: cleanData.email,
        firstName: cleanData.firstName,
        lastName: cleanData.lastName,
        role: "MENTOR" as any,
      }, token || undefined);
      toast.success("Mentor created and credentials emailed");
      setShowNewMentorForm(false);
      setNewMentor({ firstName: "", lastName: "", email: "" });
      void fetchMentors();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create mentor");
    }
  }

  async function handleToggleStatus(m: any) {
    try {
      await updateUser(m.id, { isActive: !m.isActive }, token || undefined);
      toast.success(!m.isActive ? "Mentor activated" : "Mentor deactivated");
      void fetchMentors();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update status");
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Departmental Mentors</h1>
          <p className="text-muted-foreground text-[11px] sm:text-sm max-w-xl">
            Onboard and manage mentors who will oversee daily intern tasks in {user?.department?.name || 'your department'}.
          </p>
        </div>
        <Button
          onClick={() => setShowNewMentorForm((prev) => !prev)}
          size="sm"
          className="shadow-sm w-full sm:w-auto mt-1 sm:mt-0 font-bold"
        >
          {showNewMentorForm ? "Dismiss Form" : <><Plus className="mr-1.5 h-4 w-4" /> Add Mentor</>}
        </Button>
      </div>

      {showNewMentorForm && (
        <Card className="border-primary/20 bg-primary/[0.01] animate-in fade-in slide-in-from-top-2">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base font-bold text-primary/80 uppercase tracking-tight">Register New Staff</CardTitle>
            <CardDescription className="text-[11px] sm:text-xs">Mentors will be automatically assigned to your department ({user?.department?.name}).</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-4 lg:grid-cols-5">
            <div className="space-y-1 lg:col-span-2">
              <label className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground/70 tracking-wider">Legal Name</label>
              <div className="flex gap-2">
                <Input
                  className="bg-background shadow-xs h-9 text-sm"
                  placeholder="First"
                  value={newMentor.firstName}
                  onChange={(e) => setNewMentor({ ...newMentor, firstName: e.target.value })}
                />
                <Input
                  className="bg-background shadow-xs h-9 text-sm"
                  placeholder="Last"
                  value={newMentor.lastName}
                  onChange={(e) => setNewMentor({ ...newMentor, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1 lg:col-span-2">
              <label className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground/70 tracking-wider">Email Address</label>
              <Input
                className="bg-background shadow-xs h-9 text-sm"
                placeholder="mentor@insa.et"
                type="email"
                value={newMentor.email}
                onChange={(e) => setNewMentor({ ...newMentor, email: e.target.value })}
              />
            </div>

            <div className="space-y-1 flex items-end">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold shadow-sm h-9" onClick={handleAddMentor} disabled={!canCreate}>
                <UserCheck className="mr-1.5 h-4 w-4" /> Register
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border shadow-sm overflow-hidden bg-card">
        <CardHeader className="p-3 sm:p-4 border-b bg-muted/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-primary/80">
              <UserCog className="h-4 w-4 sm:h-5 sm:w-5" />
              <CardTitle className="text-base sm:text-lg font-bold uppercase tracking-tight">Staff Registry</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input
                  placeholder="Search staff..."
                  className="pl-9 w-full sm:w-[220px] h-9 bg-background shadow-xs text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchMentors()}
                />
              </div>
              <Button variant="outline" size="sm" className="h-9 hover:bg-foreground hover:text-background transition-colors font-bold shrink-0" onClick={() => fetchMentors()}>
                <Filter className="mr-1.5 h-4 w-4" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="md:block hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b hover:bg-transparent">
                  <TableHead className="font-bold py-3 pl-6 text-xs uppercase tracking-wider text-muted-foreground">Full Name</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Contact Email</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Assigned Interns</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground text-center">Status</TableHead>
                  <TableHead className="text-right font-bold pr-6 text-xs uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="py-12 text-center text-muted-foreground italic">Fetching departmental records...</TableCell></TableRow>
                ) : mentors.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="py-12 text-center text-muted-foreground">No mentors registered in your department.</TableCell></TableRow>
                ) : (
                  mentors.map((m: any) => (
                    <TableRow key={m.id} className="hover:bg-primary/[0.01] transition-colors border-b last:border-0">
                      <TableCell className="pl-6 py-4">
                        <span className="font-bold text-sm block">{m.firstName} {m.lastName}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground font-mono">{m.email}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold text-[10px] bg-muted/20 px-2 py-0 border-primary/10">
                          {m.mentoredInterns?.length || 0} Interns
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={m.isActive ? "success" : "destructive"} className="text-[10px] font-bold py-0 h-5">
                          {m.isActive ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 text-xs font-bold" onClick={() => handleOpenAssign(m)}>
                            <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Manage
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn("h-8 text-xs font-bold", m.isActive ? "text-destructive" : "text-success")}
                            onClick={() => handleToggleStatus(m)}
                          >
                            {m.isActive ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Mobile Card List */}
          <div className="md:hidden block p-3 space-y-3">
            {loading ? (
              <div className="py-8 text-center text-muted-foreground italic text-xs">Fetching records...</div>
            ) : mentors.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-xs">No mentors registered.</div>
            ) : (
              mentors.map((m: any) => (
                <div key={m.id} className="p-3 border rounded-lg bg-card shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm">{m.firstName} {m.lastName}</h3>
                      <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[180px]">{m.email}</p>
                    </div>
                    <Badge variant={m.isActive ? "success" : "destructive"} className="text-[9px] font-bold h-5 uppercase">
                      {m.isActive ? "Act" : "Off"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <Badge variant="outline" className="text-[10px] font-bold bg-muted/20 h-5 min-w-[70px] justify-center">
                      {m.mentoredInterns?.length || 0} Interns
                    </Badge>
                    <div className="flex gap-2">
                       <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold px-2" onClick={() => handleOpenAssign(m)}>
                        Assign
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={cn("h-7 text-[10px] font-bold px-2", m.isActive ? "text-destructive" : "text-success")}
                        onClick={() => handleToggleStatus(m)}
                      >
                        {m.isActive ? "Off" : "On"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Supervision Assignment
            </DialogTitle>
            <DialogDescription>
              Select interns to be assigned to <span className="font-bold text-foreground">{selectedMentor?.firstName} {selectedMentor?.lastName}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter department interns..."
                className="pl-9 bg-muted/20 border-none"
                value={internSearch}
                onChange={(e) => setInternSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              {loadingInterns ? (
                <div className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary/40" /></div>
              ) : filteredInterns.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                  {internSearch ? "No interns match your search." : "No active interns in your department."}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {filteredInterns.map((intern: any) => {
                    const isSelected = selectedInternIds.includes(intern.id);
                    const hasOtherMentor = intern.mentor && intern.mentor.id !== selectedMentor?.id;

                    return (
                      <div
                        key={intern.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                          isSelected ? "bg-primary/[0.03] border-primary/30 shadow-sm" : "hover:bg-muted/30"
                        )}
                        onClick={() => toggleInternSelection(intern.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleInternSelection(intern.id)}
                            className="h-5 w-5"
                          />
                          <div>
                            <p className="text-sm font-bold">{intern.firstName} {intern.lastName}</p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span>{intern.email}</span>
                              {hasOtherMentor && (
                                <Badge variant="outline" className="h-4 py-0 text-[8px] border-amber-500/30 text-amber-600 bg-amber-50">
                                  Assigned to: {intern.mentor.firstName}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 bg-muted/20 border-t flex items-center justify-between">
            <div className="text-xs font-medium text-muted-foreground">
              {selectedInternIds.length} intern{selectedInternIds.length === 1 ? '' : 's'} selected
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
              <Button
                onClick={handleBatchAssign}
                className="font-bold min-w-[120px]"
                disabled={isAssigning}
              >
                {isAssigning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserCheck className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
