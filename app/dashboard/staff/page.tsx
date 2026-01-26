"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "@/hooks/use-toast";
import api from "@/lib/config/axios";
import { formatDateTime } from "@/lib/utils";
import { AppDispatch, RootState } from "@/store";
import { fetchBranches } from "@/store/BranchSlice";
import { fetchUsers } from "@/store/StaffSlice";
import { User } from "@/types";
import {
  AlertTriangle,
  CheckCircle,
  Edit,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function StaffPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<string>("kurir");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);

  const {
    items: staffs,
    loading: staffsLoading,
    error: staffsError,
  } = useSelector((state: RootState) => state.staffsReducer);

  const { items: branches } = useSelector(
    (state: RootState) => state.branchReducer
  );

  // Only allow Owner to access this page
  if (session?.user && session?.user?.role !== "owner") {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertTriangle className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900">Akses Ditolak</h2>
        <p className="text-gray-600 text-center">
          Halaman ini hanya dapat diakses oleh Owner.
        </p>
        <Button onClick={() => window.history.back()} variant="outline">
          Kembali
        </Button>
      </div>
    );
  }

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchBranches());
  }, []);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setRole("kurir");
    setPassword("");
    setIsActive(true);
    setIsEditMode(false);
    setEditingStaffId(null);
  };

  const openNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (member: User) => {
    setFullName(member.full_name);
    setEmail(member.email);
    setPhone(member.phone || "");
    setRole(member.role);
    setPassword(""); // Don't pre-fill password for security
    setIsActive(member.is_active);
    setIsEditMode(true);
    setEditingStaffId(member._id!);
    setIsModalOpen(true);
    setSelectedBranchIds(member.current_branch_id);
  };

  const handleSaveStaff = async () => {
    // Validasi input
    if (!fullName.trim() || !email.trim()) {
      toast({
        title: "Error",
        description: "Nama Lengkap dan Email harus diisi.",
        variant: "destructive",
      });
      return;
    }

    if (!isEditMode && !password.trim()) {
      toast({
        title: "Error",
        description: "Password harus diisi untuk staff baru.",
        variant: "destructive",
      });
      return;
    }

    if (password && password.length < 6) {
      toast({
        title: "Error",
        description: "Password minimal 6 karakter.",
        variant: "destructive",
      });
      return;
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Error",
        description: "Format email tidak valid.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      if (isEditMode && editingStaffId) {
        // Update existing staff
        const updateData = {
          full_name: fullName,
          email: email,
          phone: phone || undefined,
          role: role,
          password: password,
          is_active: isActive,
        };

        const res = await api.put(
          `/api/users/staff/${editingStaffId}`,
          updateData
        );

        if (res.status !== 201) {
          toast({
            title: "Error",
            description: res.data.message || "Gagal menyimpan data staff",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Sukses! 🎉",
          description: "Data staff berhasil diperbarui.",
        });
      } else {
        // Create new staff
        const res = await api.post("/api/users", {
          full_name: fullName,
          email: email,
          phone: phone || undefined,
          role: role,
          password: password,
          current_branch_id: selectedBranchIds,
        });

        if (res.status !== 201) {
          toast({
            title: "Error",
            description: res.data.message || "Gagal menyimpan data staff",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Sukses! 🎉",
          description: "Staff baru berhasil ditambahkan.",
        });
      }

      setIsModalOpen(false);
      resetForm();
      dispatch(fetchUsers());
    } catch (error: any) {
      console.error("Error saving staff:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan data staff",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStaff = async (member: User) => {
    // Prevent owner from deactivating themselves or other owners
    if (
      session?.user.role === "owner" &&
      member.role === "owner" &&
      session.user.id === member._id
    ) {
      toast({
        title: "Akses Ditolak",
        description: "Owner tidak bisa menonaktifkan akunnya sendiri.",
        variant: "destructive",
      });
      return;
    }
    if (session?.user.role === "admin" && member.role === "owner") {
      toast({
        title: "Akses Ditolak",
        description: "Admin tidak bisa menonaktifkan akun Owner.",
        variant: "destructive",
      });
      return;
    }

    if (
      !confirm(
        `Apakah Anda yakin ingin menonaktifkan staff "${member.full_name}"?`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/api/users/staff/${member._id}`);
      toast({
        title: "Sukses",
        description: "Staff berhasil dinonaktifkan.",
      });
      dispatch(fetchUsers());
    } catch (error: any) {
      console.error("Error deleting staff:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal menonaktifkan staff",
        variant: "destructive",
      });
    }
  };

  const getRoleLabel = (roleName?: string) => {
    if (!roleName) return "N/A";
    const labels: { [key: string]: string } = {
      owner: "Owner",
      admin: "Admin",
      kurir: "Kurir",
      kasir: "Kasir",
    };
    return labels[roleName] || roleName;
  };

  const getRoleColor = (roleName?: string) => {
    if (!roleName) return "bg-gray-200 text-gray-800";
    const colors: { [key: string]: string } = {
      owner: "bg-purple-100 text-purple-800",
      admin: "bg-blue-100 text-blue-800",
      kurir: "bg-green-100 text-green-800",
      kasir: "bg-yellow-100 text-yellow-800",
    };
    return colors[roleName] || "bg-gray-200 text-gray-800";
  };

  const getStatusColor = (active: boolean) => {
    return active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  // Determine if the current user can delete a specific staff member
  const canDeleteStaff = (member: User) => {
    if (!session?.user) return false; // No user logged in

    // Owner can delete anyone except themselves
    if (session?.user.role === "owner") {
      return session?.user.id !== member._id;
    }
    // Admin can delete kurir, but not other admins or owners
    if (session?.user.role === "admin") {
      return member.role === "kurir";
    }
    // Kurir cannot delete anyone
    if (session?.user.role === "kurir") {
      return false;
    }
    return false;
  };

  const handleCheckedChange = (checked: boolean, id: string) => {
    setSelectedBranchIds((prev) =>
      checked ? [...prev, id] : prev.filter((val) => val !== id)
    );
  };

  if (staffsLoading && staffs?.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-4">Memuat data staff...</p>
      </div>
    );
  }

  if (staffsError) {
    return (
      <div className="text-center text-red-500 p-8">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
        <p>{staffsError}</p>
        <Button onClick={() => dispatch(fetchUsers())} className="mt-4">
          Coba Lagi
        </Button>
      </div>
    );
  }

  const stats = {
    total: staffs?.length,
    active: staffs?.filter((s) => s.is_active).length,
    inactive: staffs?.filter((s) => !s.is_active).length,
    owners: staffs?.filter((s) => s.role === "owner").length,
    admins: staffs?.filter((s) => s.role === "admin").length,
    kurirs: staffs?.filter((s) => s.role === "kurir").length,
    kasir: staffs?.filter((s) => s.role === "kasir").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex max-sm:flex-col gap-2 sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Staff Management
          </h1>
          <p className="text-muted-foreground">
            Kelola pengguna dan hak akses sistem
          </p>
        </div>
        {session?.user?.role === "owner" && ( // Only owner can add staff
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={openNewModal}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Staff
          </Button>
        )}
      </div>

      {/* Dialog Tambah/Edit Staff */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Staff" : "Tambah Staff Baru"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Perbarui data staff."
                : "Isi detail untuk staff baru. Semua field wajib diisi."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-start gap-2">
              <Label htmlFor="fullName" className="text-right">
                Nama Lengkap *
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="col-span-3"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>
            <div className="flex flex-col items-start gap-2">
              <Label htmlFor="emailStaff" className="text-right">
                Email *
              </Label>
              <Input
                id="emailStaff"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                placeholder="contoh@email.com"
                required
                disabled={isEditMode} // Don't allow email change in edit mode
              />
            </div>
            <div className="flex flex-col items-start gap-2">
              <Label htmlFor="passwordStaff" className="text-right">
                Password {isEditMode ? "(Kosongkan jika tidak diubah)" : "*"}
              </Label>
              <Input
                id="passwordStaff"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                placeholder={
                  isEditMode
                    ? "Kosongkan jika tidak diubah"
                    : "Minimal 6 karakter"
                }
                required={!isEditMode}
              />
            </div>
            <div className="flex flex-col items-start gap-2">
              <Label htmlFor="phoneStaff" className="text-right">
                Telepon
              </Label>
              <Input
                id="phoneStaff"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="col-span-3"
                placeholder="08xxxxxxxxxx (opsional)"
              />
            </div>
            <div className="flex flex-col items-start gap-2">
              <Label htmlFor="roleStaff" className="text-right">
                Role *
              </Label>
              <Select
                onValueChange={(value) =>
                  setRole(value as "owner" | "admin" | "kurir" | "kasir")
                }
                value={role}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  {session?.user?.role === "owner" && (
                    <SelectItem value="owner">Owner</SelectItem>
                  )}
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="kurir">Kurir</SelectItem>
                  <SelectItem value="kasir">Kasir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col items-start gap-2">
              {branches &&
                role !== "owner" &&
                branches.map((branch) => (
                  <div key={branch._id} className="flex gap-2 items-center">
                    <Checkbox
                      id={branch._id}
                      checked={selectedBranchIds.includes(branch._id)}
                      onCheckedChange={(checked) =>
                        handleCheckedChange(!!checked, branch._id)
                      }
                    />
                    <Label htmlFor={branch._id} className="m-0">
                      {branch.name} - ({branch.type})
                    </Label>
                  </div>
                ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              Batal
            </Button>
            <Button type="button" onClick={handleSaveStaff} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Memperbarui..." : "Menambah..."}
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {isEditMode ? "Perbarui Staff" : "Tambah Staff"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Owners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.owners}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Kurirs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kurirs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Kasir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kasir}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Non-Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.inactive}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex max-sm:flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, email, atau nomor HP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="max-sm:w-full w-[200px]">
                <SelectValue placeholder="Filter Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="kurir">Kurir</SelectItem>
                <SelectItem value="kasir">Kasir</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Staff ({stats.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Info</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffs && staffs.length > 0 ? (
                staffs
                  ?.filter((member) => {
                    const search = searchTerm.toLowerCase();
                    const matchSearch =
                      member.full_name.toLowerCase().includes(search) ||
                      member.email.toLowerCase().includes(search) ||
                      (member.phone?.toLowerCase().includes(search) ?? false);

                    const matchRole =
                      roleFilter === "all" || member.role === roleFilter;

                    return matchSearch && matchRole;
                  })
                  .map((member) => (
                    <TableRow key={member._id}>
                      <TableCell className="font-medium">
                        {member.full_name}
                      </TableCell>
                      <TableCell>
                        <div>{member.email}</div>
                        <div className="text-sm text-gray-500">
                          {member.phone || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(member.role)}>
                          {getRoleLabel(member.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(member.createdAt)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(member.is_active)}>
                          {member.is_active ? "Aktif" : "Non-Aktif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {(session?.user?.role === "owner" ||
                            session?.user?.role === "admin") && ( // Only owner/admin can edit
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(member)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDeleteStaff(member) && ( // Only show delete button if user has permission
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteStaff(member)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Tidak ada data staff ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
