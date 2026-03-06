"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Briefcase, 
  Users, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Send,
  Loader2,
  FileText,
  Search,
  UserPlus
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { listInterns } from "@/lib/services/interns";
import { createSubmission, listSubmissions, deleteSubmission } from "@/lib/services/submissions";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePreview } from "@/components/file-preview";

function isSafeHttpUrl(url: string | undefined | null): boolean {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
        return false;
    }
}

function sanitizeUrl(url: string | undefined | null): string {
    if (!url) return "#";
    if (isSafeHttpUrl(url)) return url;
    if (url.startsWith("/")) return url;
    return "#";
}

export default function MentorTasksPage() {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]); // These are task blueprints/templates (DRAFT)
  const [assignments, setAssignments] = useState<any[]>([]); // These are active assignments (ASSIGNED/etc)
  const [interns, setInterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);

  // CRUD State
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', maxScore: 100 });

  // Assignment State
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedTaskTemplate, setSelectedTaskTemplate] = useState<any>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [internSearch, setInternSearch] = useState("");

  const filteredInterns = useMemo(() => {
    if (!internSearch) return interns;
    const lowerSearch = internSearch.toLowerCase();
    return interns.filter((i: any) => 
      `${i.firstName} ${i.lastName}`.toLowerCase().includes(lowerSearch) ||
      i.email?.toLowerCase().includes(lowerSearch)
    );
  }, [interns, internSearch]);

  const fetchData = async () => {
    if (!token) return;
    try {
      const [subsRes, internsRes] = await Promise.all([
        listSubmissions({ type: 'TASK', limit: 300 }, token),
        listInterns({ limit: 100 }, token)
      ]);

      const allSubmissions = (subsRes as any)?.data?.items ?? [];
      // Only show tasks created by this mentor
      const myCreated = allSubmissions.filter((s: any) => s.assignedBy === user?.id);
      
      setTasks(myCreated.filter((s: any) => s.status === 'DRAFT'));
      setAssignments(myCreated.filter((s: any) => s.status !== 'DRAFT'));
      setInterns((internsRes as any)?.data?.items ?? []);
    } catch (error) {
      console.error("Failed to fetch tasks/talent:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, user]);

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !token) {
        toast.error("Task title required");
        return;
    }

    setCreating(true);
    try {
      await createSubmission({
        internId: undefined as any,
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        type: 'TASK',
        status: 'DRAFT',
        maxScore: newTask.maxScore
      } as any, token);
      
      toast.success("Task template created");
      setShowCreateDialog(false);
      setNewTask({ title: '', description: '', maxScore: 100 });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this task? All active assignments of this task will remain but the template will be removed.")) return;

    try {
      await deleteSubmission(id, token);
      toast.success("Task template deleted");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Delete failed");
    }
  };

  const isInternAssigned = (internId: string, template: any) => {
    if (!template) return false;
    return assignments.some((a: any) => 
      a.intern?.id === internId && 
      a.title === template.title && 
      a.status === 'ASSIGNED'
    );
  };

  const toggleAssignment = async (intern: any, template: any) => {
    if (!token || !template || !intern) return;

    const existingId = assignments.find((a: any) => 
      a.intern?.id === intern.id && 
      a.title === template.title && 
      a.status === 'ASSIGNED'
    )?.id;

    setIsAssigning(true);
    try {
      if (existingId) {
        // Unassign
        await deleteSubmission(existingId, token);
        toast.success(`Task unassigned from ${intern.firstName}`);
      } else {
        // Assign
        await createSubmission({
          internId: intern.id,
          title: template.title,
          description: template.description,
          type: 'TASK',
          status: 'ASSIGNED',
          maxScore: template.maxScore
        } as any, token);
        toast.success(`Task assigned to ${intern.firstName}`);
      }
      await fetchData(); // Refresh state to update checkboxes
    } catch (error: any) {
      toast.error(error.message || "Assignment update failed");
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-1">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1">
        <div className="flex flex-col gap-0.5 sm:gap-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground uppercase italic">Task Management</h1>
          <p className="text-muted-foreground text-[11px] sm:text-sm">Create task templates and manage intern workload.</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2 w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm font-bold uppercase tracking-widest shadow-md">
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Create Template
        </Button>
      </div>

      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-4 sm:mb-6 border bg-muted/[0.03] p-1 h-9 sm:h-11 rounded-lg">
          <TabsTrigger value="library" className="uppercase text-[9px] sm:text-[10px] font-bold tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all">Task Library</TabsTrigger>
          <TabsTrigger value="active" className="uppercase text-[9px] sm:text-[10px] font-bold tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all">Active Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-3 sm:space-y-4 outline-none">
          {tasks.length === 0 ? (
            <Card className="border-dashed h-40 sm:h-48 flex items-center justify-center bg-muted/[0.02] border-border/60">
              <div className="flex flex-col items-center gap-2 text-muted-foreground text-center p-6">
                <FileText className="h-8 w-8 sm:h-10 sm:w-10 opacity-20 mb-1 sm:mb-2" />
                <p className="text-[11px] sm:text-sm font-medium opacity-60">Your task library is empty.</p>
                <Button variant="outline" size="sm" onClick={() => setShowCreateDialog(true)} className="mt-2 font-bold uppercase text-[9px] sm:text-[10px] h-7 sm:h-8 px-4 rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors">
                   Create Template
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {tasks.map((task: any) => (
                <Card key={task.id} className="border-border/60 hover:border-primary/20 hover:shadow-md transition-all duration-200 flex flex-col group overflow-hidden">
                  <CardHeader className="p-3 sm:p-5 pb-2 sm:pb-3">
                    <div className="flex justify-between items-start mb-1 sm:mb-2 min-w-0">
                      <Badge variant="outline" className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 h-4 px-1.5 border-muted-foreground/20 rounded-sm">Template</Badge>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 sm:h-8 sm:w-8 -mt-1 sm:-mt-2 -mr-1 sm:-mr-2 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 sm:opacity-0 group-hover:opacity-100 transition-all rounded-full"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                         <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-base sm:text-lg font-bold leading-tight truncate">{task.title}</CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs line-clamp-2 min-h-[28px] sm:min-h-[32px] mt-1 sm:mt-1.5 opacity-80">{task.description || "No description provided."}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto p-3 sm:p-5 pt-3 sm:pt-4 border-t border-border/40 bg-muted/[0.01]">
                    <Button 
                      className="w-full h-8 sm:h-9 uppercase text-[9px] sm:text-[10px] font-bold tracking-widest gap-1.5 sm:gap-2 rounded-lg shadow-sm"
                      onClick={() => {
                        setSelectedTaskTemplate(task);
                        setShowAssignDialog(true);
                      }}
                    >
                      <UserPlus className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                      Manage Assignments
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-3">
          {assignments.length === 0 ? (
            <Card className="border-dashed h-48 flex items-center justify-center bg-muted/5">
              <div className="flex flex-col items-center gap-2 text-muted-foreground text-center">
                <Briefcase className="h-10 w-10 opacity-20 mb-2" />
                <p className="text-sm font-medium">No active tasks currently assigned.</p>
              </div>
            </Card>
          ) : (
            assignments.map((assignment: any) => (
              <Card key={assignment.id} className="overflow-hidden border-primary/5 hover:border-primary/10 transition-all bg-background shadow-sm">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-stretch">
                    <div className="p-4 flex-1 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border/50">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                           <Badge variant="outline" className="text-[8px] font-black uppercase text-primary">Assignment</Badge>
                           <Badge variant={assignment.status === 'APPROVED' ? 'success' : assignment.status === 'SUBMITTED' ? 'warning' : 'secondary'} className="text-[8px] font-bold uppercase">
                              {assignment.status}
                           </Badge>
                        </div>
                        <h3 className="text-sm font-bold text-foreground mb-1">{assignment.title}</h3>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 italic">{assignment.description}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-4 text-[9px] font-bold text-muted-foreground uppercase">
                        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Assigned: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                        {assignment.reviewedAt && (
                           <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="h-3 w-3" /> Approved: {new Date(assignment.reviewedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 w-full md:w-64 bg-muted/5 flex items-center gap-4">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20 text-xs shadow-sm capitalize">
                        {assignment.intern?.firstName?.[0] || '?'}{assignment.intern?.lastName?.[0] || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-foreground truncate">{assignment.intern?.firstName || 'Unknown'} {assignment.intern?.lastName || 'Intern'}</p>
                        <p className="text-[9px] text-muted-foreground truncate opacity-70">{assignment.intern?.email || 'No email'}</p>
                      </div>
                      {(assignment.files || assignment.fileUrl) && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full border-primary/20 hover:bg-primary/5"
                          onClick={() => setSelectedFileUrl(assignment.files || assignment.fileUrl)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {selectedFileUrl && (
        <FilePreview
          url={sanitizeUrl(selectedFileUrl)}
          title="Task Submission"
          onClose={() => setSelectedFileUrl(null)}
        />
      )}

      {/* Create Task Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Task Template</DialogTitle>
            <DialogDescription>Define a task once and then assign it to multiple interns.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                placeholder="e.g. Weekly Status Report, Module Audit"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxScore">Maximum Score</Label>
              <Input
                id="maxScore"
                type="number"
                min="1"
                max="1000"
                value={newTask.maxScore}
                onChange={(e) => setNewTask(prev => ({ ...prev, maxScore: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Requirements / Description</Label>
              <Textarea
                id="desc"
                placeholder="Details about what needs to be done..."
                className="min-h-[120px]"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateTask} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Assignments Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Task: {selectedTaskTemplate?.title}</DialogTitle>
            <DialogDescription>Select which interns should be assigned this task.</DialogDescription>
          </DialogHeader>
          
          <div className="relative my-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search interns by name or email..."
              className="pl-9"
              value={internSearch}
              onChange={(e) => setInternSearch(e.target.value)}
            />
          </div>

          <div className="h-[300px] border rounded-md p-4 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              {filteredInterns.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">No interns found.</p>
              ) : (
                filteredInterns.map((intern: any) => {
                  const assigned = isInternAssigned(intern.id, selectedTaskTemplate);
                  return (
                    <div key={intern.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                          {intern.firstName?.[0] || '?'}{intern.lastName?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{intern.firstName || 'Unknown'} {intern.lastName || ''}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{intern.email || 'No email'}</p>
                        </div>
                      </div>
                      <Checkbox 
                        checked={assigned}
                        disabled={isAssigning}
                        onCheckedChange={() => toggleAssignment(intern, selectedTaskTemplate)}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button className="w-full" onClick={() => setShowAssignDialog(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
