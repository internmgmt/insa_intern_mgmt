"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Building2, Calendar, Award, Plus, X, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { getMyProfile } from "@/lib/services/interns";
import { toast } from "sonner";

export default function ProfilePage() {
    const { token, user } = useAuth();
    const [profile, setProfile] = useState<any | null>(null);
    const [skills, setSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState("");

    useEffect(() => {
        const load = async () => {
            if (!token || user?.role !== 'INTERN') return;
            try {
                const res = await getMyProfile(token);
                setProfile(res.data);
                setSkills(res.data.skills || []);
            } catch (err: any) {
                console.error('Failed to load intern profile', err);
                toast.error(err?.message || 'Failed to load profile');
            }
        };
        load();
    }, [token, user?.role]);

    function addSkill() {
        const value = newSkill.trim();
        if (!value || skills.includes(value)) return;
        setSkills((prev) => [...prev, value]);
        setNewSkill("");
    }

    function removeSkill(skill: string) {
        setSkills((prev) => prev.filter((s) => s !== skill));
    }

    function saveSkills() {
        // TODO: call update intern API to persist skills. For now, local-only.
        toast.info("Skills updated (local only). Implement API call to persist.");
    }

    const student = profile?.student ?? null;
    const department = profile?.department ?? null;
    const supervisor = profile?.supervisor ?? null;
    const mentor = profile?.mentor ?? null;

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-0.5 sm:gap-1 px-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Personnel Dossier</h1>
                <p className="text-muted-foreground text-[11px] sm:text-sm">Comprehensive view of your professional and technical standing.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 px-1">
                <Card className="shadow-sm border-primary/10 overflow-hidden">
                    <CardHeader className="bg-primary/[0.02] border-b border-primary/5 p-4 sm:p-6 text-center">
                        <div className="flex flex-col items-center">
                            <Avatar className="h-20 w-20 sm:h-28 sm:w-28 border-4 border-background shadow-xl mb-3 sm:mb-4">
                                <AvatarFallback className="bg-[#5ba1a2] text-white text-3xl sm:text-4xl font-black italic">
                                    {(profile?.firstName?.[0] ?? '') + (profile?.lastName?.[0] ?? '')}
                                </AvatarFallback>
                            </Avatar>
                            <h3 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                                {profile?.firstName ?? ''} {profile?.lastName ?? ''}
                            </h3>
                            <p className="text-[10px] sm:text-xs font-mono text-muted-foreground mt-1 uppercase tracking-widest">{profile?.email ?? ''}</p>
                            <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2">
                                <Badge variant="outline" className="text-[9px] sm:text-[10px] font-bold border-[#5ba1a2]/30 text-[#5ba1a2] bg-[#5ba1a2]/5 px-2 h-5">
                                    ID: {profile?.internId ?? '—'}
                                </Badge>
                                <Badge variant="secondary" className="text-[9px] sm:text-[10px] font-bold bg-[#b28b71]/10 text-[#b28b71] px-2 h-5 border-none">
                                    {profile?.status ?? '—'}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                         <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30 border border-dashed flex flex-col items-center gap-1 sm:gap-2">
                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Verification Hash</p>
                            <p className="text-[8px] sm:text-[9px] font-mono text-muted-foreground break-all opacity-50 text-center">
                                {profile?.id}
                            </p>
                         </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 shadow-sm border-primary/10">
                    <CardHeader className="flex flex-row items-center gap-3 sm:gap-4 p-4 sm:p-6">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-[#5ba1a2]/10 flex items-center justify-center border border-[#5ba1a2]/20 shrink-0">
                            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#5ba1a2]" />
                        </div>
                        <div>
                            <CardTitle className="text-base sm:text-lg">Institutional Records</CardTitle>
                            <CardDescription className="text-[11px] sm:text-xs">Verified data from university and corporate systems.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6">
                            <div className="flex items-center gap-3 sm:gap-4 group">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-lg sm:rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                    <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-primary" />
                                </div>
                                <div>
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Student ID</p>
                                    <p className="text-xs sm:text-sm font-bold text-foreground">{student?.studentId ?? '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4 group">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-lg sm:rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                    <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-primary" />
                                </div>
                                <div>
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Corporate Email</p>
                                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">{profile?.email ?? '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4 group">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-lg sm:rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                    <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-primary" />
                                </div>
                                <div>
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mobile Access</p>
                                    <p className="text-xs sm:text-sm font-bold text-foreground">{profile?.phone ?? '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4 group">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-lg sm:rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                    <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-primary" />
                                </div>
                                <div>
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Strategic Unit</p>
                                    <p className="text-xs sm:text-sm font-bold text-foreground">
                                        {department?.name ?? '—'} <span className="text-[9px] sm:text-[10px] font-mono opacity-50 ml-1">[{department?.type ?? '—'}]</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-4 sm:gap-y-6 pt-4 sm:pt-6 border-t font-medium">
                            <div className="flex items-center gap-3 sm:gap-4 group">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-lg sm:rounded-xl bg-[#5ba1a2]/5 flex items-center justify-center border border-[#5ba1a2]/10">
                                    <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#5ba1a2]" />
                                </div>
                                <div>
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#5ba1a2]/60 leading-none mb-1">Technical Mentor</p>
                                    <p className="text-xs sm:text-sm font-bold text-foreground">
                                        {mentor ? `${mentor.firstName} ${mentor.lastName}` : '—'}
                                    </p>
                                    <p className="text-[9px] font-mono text-muted-foreground truncate">{mentor?.email ?? '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4 group">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-lg sm:rounded-xl bg-amber-500/5 flex items-center justify-center border border-amber-500/10">
                                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-700/60 leading-none mb-1">Tenure Window</p>
                                    <p className="text-xs sm:text-sm font-bold text-foreground">
                                        {profile?.startDate ? new Date(profile.startDate).toLocaleDateString() : '—'} 
                                        <span className="mx-2 text-muted-foreground/30 font-light">→</span> 
                                        {profile?.endDate ? new Date(profile.endDate).toLocaleDateString() : '—'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm border-primary/10 mx-1">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-6 pb-4 sm:pb-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-[#8bac99]/10 flex items-center justify-center border border-[#8bac99]/20 shrink-0">
                            <Award className="h-4 w-4 sm:h-5 sm:w-5 text-[#8bac99]" />
                        </div>
                        <div>
                            <CardTitle className="text-base sm:text-lg">Technical Competencies</CardTitle>
                            <CardDescription className="text-[11px] sm:text-xs">Self-declared skill set and professional certifications.</CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                         <Badge variant={profile?.certificateIssued ? "success" : "outline"} className="px-2 sm:px-3 h-6 sm:h-7 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border-none w-full justify-center sm:w-auto">
                            Certificate: {profile?.certificateIssued ? "VERIFIED" : "PENDING"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6 pt-0">
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        {skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="pl-3 pr-1 py-1 text-[10px] sm:text-[11px] font-bold bg-muted/50 border hover:bg-muted/80 transition-all flex items-center gap-2 rounded-full">
                                    {skill}
                                    <button onClick={() => removeSkill(skill)} className="h-5 w-5 rounded-full bg-muted/0 hover:bg-destructive/20 text-destructive/50 hover:text-destructive transition-colors flex items-center justify-center">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 pt-4 sm:pt-6 border-t">
                        <div className="relative flex-1">
                            <Input 
                                placeholder="Add a new skill (e.g., Python, React)" 
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                                className="h-9 sm:h-10 text-xs sm:text-sm pr-10"
                            />
                            <button onClick={addSkill} className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-muted/0 hover:bg-primary/10 text-primary/60 hover:text-primary transition-colors flex items-center justify-center">
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        <Button onClick={saveSkills} size="sm" className="h-9 sm:h-10 text-xs font-bold uppercase tracking-widest w-full sm:w-auto">Save Skills</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
