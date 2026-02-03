"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { CheckCircle, FileText, Users, TrendingUp, Award, Building2 } from "lucide-react";
import { getUniversityById, listUniversities } from "@/lib/services/universities";

export default function UniversityProfilePage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>({
    universityName: "",
    country: "",
    city: "",
    address: "",
    website: "",
    description: "",
    establishedYear: "",
    totalStudents: 0,
    coordinatorName: "",
    coordinatorEmail: "",
    coordinatorPhone: "",
    departments: [],
  });
  const [stats, setStats] = useState({ approvedApplications: 0, studentsPlaced: 0, successRate: 0, partnershipYears: 0 });

  useEffect(() => {
    // Load public profile immediately (best-effort). When token becomes available,
    // re-fetch the detailed profile to populate contact email/phone and other private fields.
    fetchPublicProfile();
    if (token) fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.university?.id]);

  async function fetchPublicProfile() {
    try {
      setLoading(true);
      const universityId = user?.university?.id || (user as any)?.universityId || null;
      if (universityId) {
        // try to get from public list first
        const res = await listUniversities({ page: 1, limit: 50 });
        const list = (res as any)?.data?.items ?? (res as any)?.data ?? [];
        const profile = list.find((u: any) => u.id === universityId) || list[0] || {};
        setProfileData((prev: any) => ({
          ...prev,
          universityName: profile.name || prev.universityName,
          country: profile.country || prev.country,
          city: profile.location || prev.city,
          address: profile.address || prev.address,
          website: profile.website || prev.website,
          description: profile.description || prev.description,
          coordinatorEmail: profile.contactEmail || prev.coordinatorEmail,
          coordinatorPhone: profile.contactPhone || prev.coordinatorPhone,
        }));
      } else {
        const res = await listUniversities({ page: 1, limit: 1 });
        const list = (res as any)?.data?.items ?? (res as any)?.data ?? [];
        const profile = list[0] || {};
        setProfileData((prev: any) => ({
          ...prev,
          universityName: profile.name || prev.universityName,
          country: profile.country || prev.country,
          city: profile.location || prev.city,
          address: profile.address || prev.address,
          website: profile.website || prev.website,
          description: profile.description || prev.description,
          coordinatorEmail: profile.contactEmail || prev.coordinatorEmail,
          coordinatorPhone: profile.contactPhone || prev.coordinatorPhone,
        }));
      }
    } catch (e) {
      // ignore public fetch errors
      console.error('Failed to load public profile', e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile() {
    try {
      setLoading(true);
      let profile: any = null;
      const universityId = user?.university?.id || (user as any)?.universityId || null;
      if (universityId) {
        const res = await getUniversityById(universityId, token || undefined);
        profile = res.data;
      } else {
        const res = await listUniversities({ page: 1, limit: 1 }, token || undefined);
        const list = (res as any)?.data?.items ?? (res as any)?.data ?? [];
        profile = list[0] ?? {};
      }
      setProfileData({
        universityName: profile.name || "Sample University",
        country: profile.country || "",
        city: profile.location || "",
        address: profile.address || "",
        website: profile.website || "",
        description: profile.description || "",
        establishedYear: profile.establishedYear || "",
        totalStudents: profile.students || 0,
        coordinatorName: profile.coordinatorName || "",
        coordinatorEmail: profile.contactEmail || profile.coordinatorEmail || "",
        coordinatorPhone: profile.contactPhone || profile.coordinatorPhone || "",
        departments: profile.departments || ["Computer Science", "Engineering"],
      });

      setStats({
        approvedApplications: profile.approvedApplications || 0,
        studentsPlaced: profile.studentsPlaced || 0,
        successRate: profile.successRate || 0,
        partnershipYears: profile.partnershipYears || 0,
      });
    } catch (e) {
      console.error("Failed to load profile", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    // Attempt to PATCH the first university if it exists
    try {
      setLoading(true);
      const res = await fetch(`/api/universities`, { method: "GET" });
      const json = await res.json();
      const list = Array.isArray(json) ? json : json?.data ?? [];
      const id = list[0]?.id;
      if (!id) {
        setIsEditing(false);
        return;
      }
      const payload: any = {
        name: profileData.universityName,
        location: profileData.city,
        address: profileData.address,
        website: profileData.website,
        description: profileData.description,
      };
      const patch = await fetch(`/api/universities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (patch.ok) {
        setIsEditing(false);
        fetchProfile();
      } else {
        console.error("Failed to save profile");
      }
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="University" description="Your university dashboard and profile" />

      {user?.role === 'UNIVERSITY' && (
        <Card className="border-l-4 border-warning/40 bg-warning/5">
          <CardContent className="p-4">
            <p className="font-semibold">Read-only Profile</p>
            <p className="text-sm text-muted-foreground">Coordinators can view university information. Editing is restricted to administrators.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> University Information
              </CardTitle>
              <CardDescription>{isEditing ? "Update your university details" : "Your university details"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="university-name">University Name</Label>
                <Input id="university-name" value={profileData.universityName} onChange={(e) => setProfileData({ ...profileData, universityName: e.target.value })} disabled={!isEditing} className="font-medium" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={profileData.country} onChange={(e) => setProfileData({ ...profileData, country: e.target.value })} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={profileData.city} onChange={(e) => setProfileData({ ...profileData, city: e.target.value })} disabled={!isEditing} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={profileData.address} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" type="url" value={profileData.website} onChange={(e) => setProfileData({ ...profileData, website: e.target.value })} disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={profileData.description} onChange={(e) => setProfileData({ ...profileData, description: e.target.value })} disabled={!isEditing} rows={4} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="established">Established Year</Label>
                  <Input id="established" value={profileData.establishedYear} onChange={(e) => setProfileData({ ...profileData, establishedYear: e.target.value })} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="students">Total Students</Label>
                  <Input id="students" type="number" value={profileData.totalStudents} onChange={(e) => setProfileData({ ...profileData, totalStudents: Number(e.target.value) })} disabled={!isEditing} />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} size="sm" disabled={user?.role !== 'ADMIN'}>Save</Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} size="sm" disabled={user?.role !== 'ADMIN'}>Edit</Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coordinator Information</CardTitle>
              <CardDescription>Primary contact person for INSA partnership</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coordinator-name">Full Name</Label>
                <Input id="coordinator-name" value={profileData.coordinatorName} onChange={(e) => setProfileData({ ...profileData, coordinatorName: e.target.value })} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coordinator-email">Email Address</Label>
                <Input id="coordinator-email" type="email" value={profileData.coordinatorEmail} onChange={(e) => setProfileData({ ...profileData, coordinatorEmail: e.target.value })} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coordinator-phone">Phone Number</Label>
                <Input id="coordinator-phone" type="tel" value={profileData.coordinatorPhone} onChange={(e) => setProfileData({ ...profileData, coordinatorPhone: e.target.value })} disabled={!isEditing} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Website</p>
                  <Button variant="link" asChild>
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer">Visit Website</a>
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Account Status</p>
                  <p className="text-sm text-success">Active & Verified</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Students Placed</p>
                  <p className="text-sm text-muted-foreground">{stats.studentsPlaced}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Departments</CardTitle>
              <CardDescription>Active academic departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profileData.departments.map((dept: string, idx: number) => (
                  <Badge key={idx} variant="secondary">{dept}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
