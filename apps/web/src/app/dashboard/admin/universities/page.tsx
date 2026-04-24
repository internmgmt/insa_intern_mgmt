"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Building2,
  Mail,
  Phone,
  MapPin,
  Check,
  ChevronsUpDown,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  listUniversities,
  getUniversityById,
  deleteUniversityPermanently,
} from "@/lib/services/universities";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

const ETHIOPIAN_UNIVERSITIES = [
  { name: "Adama Science and Technology University", town: "Adama" },
  {
    name: "Addis Ababa Science and Technology University",
    town: "Addis Ababa",
  },
  { name: "Addis Ababa University", town: "Addis Ababa" },
  { name: "Adigrat University", town: "Adigrat" },
  { name: "Aksum University", town: "Aksum" },
  { name: "Ambo University", town: "Ambo" },
  { name: "Arba Minch University", town: "Arba Minch" },
  { name: "Arsi University", town: "Asella" },
  { name: "Assosa University", town: "Assosa" },
  { name: "Bahir Dar University", town: "Bahir Dar" },
  { name: "Bonga University", town: "Bonga" },
  { name: "Borena University", town: "Yabelo" },
  { name: "Bule Hora University", town: "Bule Hora" },
  { name: "Debark University", town: "Debark" },
  { name: "Debre Berhan University", town: "Debre Berhan" },
  { name: "Debre Markos University", town: "Debre Markos" },
  { name: "Debre Tabor University", town: "Gondar" },
  { name: "Dembi Dolo University", town: "Dembi Dolo" },
  { name: "Dilla University", town: "Dilla" },
  { name: "Dire Dawa University", town: "Dire Dawa" },
  { name: "Ethiopian Civil Service University", town: "Addis Ababa" },
  { name: "Ethiopian Police University", town: "Sendafa" },
  { name: "Gambella University", town: "Gambela" },
  { name: "Haramaya University", town: "Haramaya" },
  { name: "Hawassa University", town: "Awasa" },
  { name: "Injibara University", town: "Injibara" },
  { name: "Jigjiga University", town: "Jigjiga" },
  { name: "Jimma University", town: "Jimma" },
  { name: "Jinka University", town: "Jinka" },
  { name: "Kebri Dehar University", town: "Kebri Dahar" },
  { name: "Kotebe Education University", town: "Addis Ababa" },
  { name: "Madda Walabu University", town: "Bale Robe" },
  { name: "Mattu University", town: "Metu" },
  { name: "Mekdela Amba University", town: "Tulu Awlia" },
  { name: "Mekelle University", town: "Mekelle" },
  { name: "Mizan-Tepi University", town: "Mizan Teferi" },
  { name: "Oda Bultum University", town: "Chiro" },
  { name: "Oromia State University", town: "Ziway" },
  { name: "Raya University", town: "Maichew" },
  { name: "Rift Valley University", town: "Addis Ababa" },
  { name: "Samara University", town: "Semera" },
  { name: "Selale University", town: "Fiche" },
  { name: "Unity University", town: "Addis Ababa" },
  { name: "University of Gondar", town: "Gondar" },
  { name: "Wachamo University", town: "Hosaena" },
  { name: "Werabe University", town: "Worabe" },
  { name: "Wolaita Sodo University", town: "Sodo" },
  { name: "Woldia University", town: "Woldiya" },
  { name: "Wolkite University", town: "Welkite" },
  { name: "Wollega University", town: "Nekemte" },
  { name: "Wollo University", town: "Dessie" },
].sort((a, b) => a.name.localeCompare(b.name));

export default function UniversitiesPage() {
  const { token, user } = useAuth();
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [newUni, setNewUni] = useState({
    name: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
  });
  const [selectedUniversity, setSelectedUniversity] = useState<any | null>(
    null,
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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
      setUniversities(
        items.map((u: any) => ({
          id: u.id,
          name: u.name,
          status: (u as any).isActive !== false ? "active" : "inactive",
          email: (u as any).contactEmail || "",
          phone: (u as any).contactPhone || "",
          address: (u as any).address || "",
        })),
      );
    } catch (error) {
      console.error("Failed to fetch public universities:", error);
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
      const res = await listUniversities(
        { page: 1, limit: 50 },
        token || undefined,
      );
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
          }),
        );
        setUniversities(
          detailed.map((u: any) => ({
            id: u.id,
            name: u.name,
            status: (u as any).isActive !== false ? "active" : "inactive",
            email: (u as any).contactEmail || "",
            phone: (u as any).contactPhone || "",
            address: (u as any).address || "",
          })),
        );
      } else {
        setUniversities(
          items.map((u: any) => ({
            id: u.id,
            name: u.name,
            status: (u as any).isActive !== false ? "active" : "inactive",
            email: (u as any).contactEmail || "",
            phone: (u as any).contactPhone || "",
            address: (u as any).address || "",
          })),
        );
      }
    } catch (error) {
      console.error("Failed to fetch universities:", error);
      setUniversities([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddUniversity() {
    if (!newUni.name.trim()) return;

    try {
      const res = await fetch("/api/universities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
        setNewUni({
          name: "",
          contactEmail: "",
          contactPhone: "",
          address: "",
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Failed to add university:", error);
    }
  }

  const canDelete = user?.role === "ADMIN";
  const canConfirmDelete = deleteConfirmText.trim().toUpperCase() === "DELETE";

  async function handleDeleteUniversity() {
    if (!selectedUniversity?.id || !token) return;

    try {
      setIsDeleting(true);
      await deleteUniversityPermanently(selectedUniversity.id, token);
      toast.success("University deleted permanently");
      setShowDeleteDialog(false);
      setDeleteConfirmText("");
      setSelectedUniversity(null);
      await fetchUniversities();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete university");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Universities</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create and view partner universities
          </p>
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
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between font-normal"
                  >
                    {newUni.name
                      ? ETHIOPIAN_UNIVERSITIES.find(
                          (u) => u.name === newUni.name,
                        )?.name
                      : "Select university..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search university..." />
                    <CommandList>
                      <CommandEmpty>No university found.</CommandEmpty>
                      <CommandGroup>
                        {ETHIOPIAN_UNIVERSITIES.map((uni) => (
                          <CommandItem
                            key={uni.name}
                            value={uni.name}
                            onSelect={(currentValue) => {
                              const selected = ETHIOPIAN_UNIVERSITIES.find(
                                (u) =>
                                  u.name.toLowerCase() ===
                                  currentValue.toLowerCase(),
                              );
                              if (selected) {
                                setNewUni((prev) => ({
                                  ...prev,
                                  name: selected.name,
                                  address: selected.town,
                                }));
                              }
                              setOpenCombobox(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                newUni.name === uni.name
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {uni.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Contact Email</label>
              <Input
                placeholder="contact@university.edu.et"
                value={newUni.contactEmail}
                onChange={(e) =>
                  setNewUni({ ...newUni, contactEmail: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Contact Phone</label>
              <Input
                placeholder="+251 .."
                value={newUni.contactPhone}
                onChange={(e) =>
                  setNewUni({ ...newUni, contactPhone: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Address</label>
              <Input
                placeholder="City, Ethiopia"
                value={newUni.address}
                onChange={(e) =>
                  setNewUni({ ...newUni, address: e.target.value })
                }
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search universities..."
                className="pl-10 h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-10">
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Universities Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading universities...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No universities found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((uni) => (
            <Card
              key={uni.id}
              className="h-full transition-all duration-300 hover:border-primary/30 hover:shadow-md"
            >
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
                  <Badge
                    variant={uni.status === "active" ? "success" : "secondary"}
                  >
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
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between gap-3 border-t pt-4">
                <span className="text-sm text-muted-foreground">
                  University record
                </span>
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/admin/universities/${uni.id}`}>
                      View details
                    </Link>
                  </Button>
                  {canDelete ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedUniversity(uni);
                        setDeleteConfirmText("");
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  ) : null}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Delete university permanently</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              {selectedUniversity?.name || "this university"}. Related
              applications will be removed and linked users will be detached
              from the university.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <div className="text-sm font-medium text-muted-foreground">
              Type DELETE to confirm
            </div>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmText("");
                setSelectedUniversity(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDeleteUniversity()}
              disabled={!canConfirmDelete || isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
