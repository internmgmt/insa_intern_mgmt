"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Building2, Calendar, Award, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { ThemePaletteSelector } from "@/components/theme-palette-selector";
import { useAuth } from "@/components/auth-provider";
import { getMyProfile } from "@/lib/services/interns";
import { toast } from "sonner";

const internProfile = {
    id: "uuid-1",
    internId: "INSA-2025-001",
    status: "ACTIVE",
    startDate: "2025-07-01",
    endDate: "2025-10-31",
    skills: ["Go", "Linux", "Monitoring"],
    finalEvaluation: null as number | null,
    certificateUrl: null as string | null,
    certificateIssued: false,
    student: {
        firstName: "Yared",
        lastName: "Getachew",
        studentId: "UGR/1234/13",
        fieldOfStudy: "Computer Science",
        email: "yared.getachew@example.com",
        phone: "+251 91 234 5678",
    },
    department: {
        id: "dept-1",
        name: "Cybersecurity Operations",
        type: "CYBERSECURITY",
    },
    supervisor: {
        id: "sup-1",
        firstName: "Melaku",
        lastName: "Abebe",
        email: "melaku.abebe@example.com",
    },
};

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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Profile</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    View your official records and update your technical skills.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-medium">
                                    {(profile?.firstName?.[0] ?? '') + (profile?.lastName?.[0] ?? '')}
                                </AvatarFallback>
                            </Avatar>
                            <h3 className="text-xl font-semibold">
                                {profile?.firstName ?? ''} {profile?.lastName ?? ''}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">{profile?.email ?? ''}</p>
                            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
                                <Badge variant="outline">Intern ID: {profile?.internId ?? '—'}</Badge>
                                <Badge variant="secondary">Status: {profile?.status ?? '—'}</Badge>
                                <Badge variant="outline">Role: INTERN</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Student and internship details</CardTitle>
                        <CardDescription>These details come from your university and system records.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <User className="h-4 w-4 mt-1" />
                                <div>
                                    <div className="font-medium text-foreground">Student ID</div>
                                    <div>{student?.studentId ?? '—'}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="h-4 w-4 mt-1" />
                                <div>
                                    <div className="font-medium text-foreground">Email</div>
                                    <div>{profile?.email ?? '—'}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="h-4 w-4 mt-1" />
                                <div>
                                    <div className="font-medium text-foreground">Phone</div>
                                    <div>{profile?.phone ?? '—'}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Building2 className="h-4 w-4 mt-1" />
                                <div>
                                    <div className="font-medium text-foreground">Department</div>
                                    <div>
                                        {department?.name ?? '—'} ({department?.type ?? '—'})
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                            <div className="flex items-start gap-3">
                                <User className="h-4 w-4 mt-1" />
                                <div>
                                        <div className="font-medium text-foreground">Supervisor</div>
                                    <div>
                                        {supervisor?.firstName ?? ''} {supervisor?.lastName ?? ''}
                                    </div>
                                    <div className="text-xs">{supervisor?.email ?? ''}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="h-4 w-4 mt-1" />
                                <div>
                                    <div className="font-medium text-foreground">Internship period</div>
                                    <div>
                                        {profile?.startDate ? new Date(profile.startDate).toLocaleDateString() : '—'} → {profile?.endDate ? new Date(profile.endDate).toLocaleDateString() : '—'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Technical skills</CardTitle>
                    <CardDescription>Only your skills are editable from here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2 text-xs">
                        {skills.map((skill) => (
                                <Badge key={skill} variant="outline" className="flex items-center gap-1">
                                    {skill}
                                    <Button variant="ghost" size="icon" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                        ))}
                        {skills.length === 0 && (
                            <span className="text-xs text-muted-foreground">No skills added yet.</span>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 space-y-1">
                            <Label htmlFor="new-skill">Add skill</Label>
                            <Input
                                id="new-skill"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="e.g. Go, React, Network security"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button type="button" className="gap-1" onClick={addSkill}>
                                <Plus className="h-4 w-4" />
                                Add
                            </Button>
                        </div>
                    </div>
                    <div className="pt-2 flex justify-between items-center text-xs text-muted-foreground border-t mt-2">
                        <div className="flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            <span>
                                Certificate: {internProfile.certificateIssued ? "Issued" : "Not yet issued"}
                            </span>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={saveSkills}>
                            Save skills
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Theme & appearance</CardTitle>
                    <CardDescription>Switch light/dark in the header and choose a color palette here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ThemePaletteSelector />
                </CardContent>
            </Card>
        </div>
    );
}
