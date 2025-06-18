"use client"

import { useEffect, useState, useCallback } from "react"
import { formatDateTime } from "@/lib/utils"
import {
  getStaffList,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  type StaffMember,
} from "@/lib/staff-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, Edit, Trash2, Loader2, AlertTriangle, CheckCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context" // Import useAuth

export default function StaffPage() {
  const { userProfile } = useAuth()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null)

  // Form state
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<"owner" | "admin" | "kurir">("kurir")
  const [password, setPassword] = useState("")
  const [isActive, setIsActive] = useState(true)

  const { toast } = useToast()

  // Only allow Owner to access this page
  if (userProfile && userProfile.role !== "owner") {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertTriangle className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900">Akses Ditolak</h2>
        <p className="text-gray-600 text-center">Halaman ini hanya dapat diakses oleh Owner.</p>
        <Button onClick={() => window.history.back()} variant="outline">
          Kembali
        </Button>
      </div>
    )
  }

  const fetchStaffData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getStaffList(searchTerm, roleFilter)
      setStaff(data || [])
    } catch (e: any) {
      setError("Terjadi kesalahan saat memuat data staff: " + e.message)
      console.error("Fetch staff error:", e)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, roleFilter])

  useEffect(() => {
    fetchStaffData()
  }, [fetchStaffData])

  const resetForm = () => {
    setFullName("")
    setEmail("")
    setPhone("")
    setRole("kurir")
    setPassword("")
    setIsActive(true)
    setIsEditMode(false)
    setEditingStaffId(null)
  }

  const openNewModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (member: StaffMember) => {
    setFullName(member.full_name)
    setEmail(member.email)
    setPhone(member.phone || "")
    setRole(member.role)
    setPassword("") // Don't pre-fill password for security
    setIsActive(member.is_active)
    setIsEditMode(true)
    setEditingStaffId(member.id)
    setIsModalOpen(true)
  }

  const handleSaveStaff = async () => {
    // Validasi input
    if (!fullName.trim() || !email.trim()) {
      toast({
        title: "Error",
        description: "Nama Lengkap dan Email harus diisi.",
        variant: "destructive",
      })
      return
    }

    if (!isEditMode && !password.trim()) {
      toast({
        title: "Error",
        description: "Password harus diisi untuk staff baru.",
        variant: "destructive",
      })
      return
    }

    if (password && password.length < 6) {
      toast({
        title: "Error",
        description: "Password minimal 6 karakter.",
        variant: "destructive",
      })
      return
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Error",
        description: "Format email tidak valid.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      if (isEditMode && editingStaffId) {
        // Update existing staff
        const updateData: Partial<StaffMember> = {
          full_name: fullName,
          email: email,
          phone: phone || undefined,
          role: role,
          is_active: isActive,
        }

        await updateStaffMember(editingStaffId, updateData)

        toast({
          title: "Sukses! 🎉",
          description: "Data staff berhasil diperbarui.",
        })
      } else {
        // Create new staff
        await createStaffMember({
          full_name: fullName,
          email: email,
          phone: phone || undefined,
          role: role,
          password: password,
          is_active: isActive,
        })

        toast({
          title: "Sukses! 🎉",
          description: "Staff baru berhasil ditambahkan.",
        })
      }

      setIsModalOpen(false)
      resetForm()
      fetchStaffData()
    } catch (error: any) {
      console.error("Error saving staff:", error)
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan data staff",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteStaff = async (member: StaffMember) => {
    // Prevent owner from deactivating themselves or other owners
    if (userProfile?.role === "owner" && member.role === "owner" && userProfile.id === member.id) {
      toast({
        title: "Akses Ditolak",
        description: "Owner tidak bisa menonaktifkan akunnya sendiri.",
        variant: "destructive",
      })
      return
    }
    if (userProfile?.role === "admin" && member.role === "owner") {
      toast({
        title: "Akses Ditolak",
        description: "Admin tidak bisa menonaktifkan akun Owner.",
        variant: "destructive",
      })
      return
    }

    if (!confirm(`Apakah Anda yakin ingin menonaktifkan staff "${member.full_name}"?`)) {
      return
    }

    try {
      await deleteStaffMember(member.id)
      toast({
        title: "Sukses",
        description: "Staff berhasil dinonaktifkan.",
      })
      fetchStaffData()
    } catch (error: any) {
      console.error("Error deleting staff:", error)
      toast({
        title: "Error",
        description: error.message || "Gagal menonaktifkan staff",
        variant: "destructive",
      })
    }
  }

  const getRoleLabel = (roleName?: string) => {
    if (!roleName) return "N/A"
    const labels: { [key: string]: string } = {
      owner: "Owner",
      admin: "Admin",
      kurir: "Kurir",
    }
    return labels[roleName] || roleName
  }

  const getRoleColor = (roleName?: string) => {
    if (!roleName) return "bg-gray-200 text-gray-800"
    const colors: { [key: string]: string } = {
      owner: "bg-purple-100 text-purple-800",
      admin: "bg-blue-100 text-blue-800",
      kurir: "bg-green-100 text-green-800",
    }
    return colors[roleName] || "bg-gray-200 text-gray-800"
  }

  const getStatusColor = (active: boolean) => {
    return active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  // Determine if the current user can delete a specific staff member
  const canDeleteStaff = (member: StaffMember) => {
    if (!userProfile) return false // No user logged in

    // Owner can delete anyone except themselves
    if (userProfile.role === "owner") {
      return userProfile.id !== member.id
    }
    // Admin can delete kurir, but not other admins or owners
    if (userProfile.role === "admin") {
      return member.role === "kurir"
    }
    // Kurir cannot delete anyone
    if (userProfile.role === "kurir") {
      return false
    }
    return false
  }

  if (loading && staff.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-4">Memuat data staff...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
        <p>{error}</p>
        <Button onClick={fetchStaffData} className="mt-4">
          Coba Lagi
        </Button>
      </div>
    )
  }

  const stats = {
    total: staff.length,
    active: staff.filter((s) => s.is_active).length,
    inactive: staff.filter((s) => !s.is_active).length,
    owners: staff.filter((s) => s.role === "owner").length,
    admins: staff.filter((s) => s.role === "admin").length,
    kurirs: staff.filter((s) => s.role === "kurir").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">Kelola pengguna dan hak akses sistem</p>
        </div>
        {userProfile?.role === "owner" && ( // Only owner can add staff
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={openNewModal}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Staff
          </Button>
        )}
      </div>

      {/* Dialog Tambah/Edit Staff */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Staff" : "Tambah Staff Baru"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Perbarui data staff." : "Isi detail untuk staff baru. Semua field wajib diisi."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
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
            <div className="grid grid-cols-4 items-center gap-4">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="passwordStaff" className="text-right">
                Password {isEditMode ? "(Kosongkan jika tidak diubah)" : "*"}
              </Label>
              <Input
                id="passwordStaff"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                placeholder={isEditMode ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"}
                required={!isEditMode}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roleStaff" className="text-right">
                Role *
              </Label>
              <Select onValueChange={(value) => setRole(value as "owner" | "admin" | "kurir")} value={role}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  {userProfile?.role === "owner" && <SelectItem value="owner">Owner</SelectItem>}
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="kurir">Kurir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActiveStaff" className="text-right">
                Status
              </Label>
              <Select onValueChange={(value) => setIsActive(value === "true")} value={String(isActive)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Aktif</SelectItem>
                  <SelectItem value="false">Non-Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
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
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Non-Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
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
      </div>

      {/* Filter & Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
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
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="kurir">Kurir</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Staff ({staff.length})</CardTitle>
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
              {staff.length > 0 ? (
                staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.full_name}</TableCell>
                    <TableCell>
                      <div>{member.email}</div>
                      <div className="text-sm text-gray-500">{member.phone || "-"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(member.role)}>{getRoleLabel(member.role)}</Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(member.created_at)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(member.is_active)}>
                        {member.is_active ? "Aktif" : "Non-Aktif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {(userProfile?.role === "owner" || userProfile?.role === "admin") && ( // Only owner/admin can edit
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
  )
}
