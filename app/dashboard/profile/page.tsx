"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Camera } from "lucide-react"

export default function ProfilePage() {
  const { userProfile, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || "",
        phone: userProfile.phone || "",
        address: userProfile.address || "",
      })
    }
  }, [userProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userProfile) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userProfile.id)

      if (error) throw error

      toast({
        title: "Sukses",
        description: "Profile berhasil diperbarui.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal memperbarui profile: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      owner: "Owner",
      admin: "Admin",
      kurir: "Kurir",
    }
    return labels[role as keyof typeof labels] || role
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p>Data profile tidak tersedia</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Informasi Profil</CardTitle>
            <CardDescription>Informasi dasar akun Anda</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={userProfile.avatar_url || ""} alt={userProfile.full_name} />
                <AvatarFallback className="text-2xl">{getInitials(userProfile.full_name)}</AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute bottom-2 right-2 rounded-full p-2"
                onClick={() => toast({ title: "Info", description: "Fitur upload foto akan segera tersedia" })}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-xl font-semibold">{userProfile.full_name}</h2>
            <p className="text-muted-foreground">{userProfile.email}</p>
            <div className="mt-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              {getRoleLabel(userProfile.role)}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Bergabung: {new Date(userProfile.created_at).toLocaleDateString("id-ID")}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Edit Profil</CardTitle>
            <CardDescription>Perbarui informasi profil Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nama Lengkap</Label>
                  <Input
                    id="fullName"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={userProfile.email} disabled className="bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={getRoleLabel(userProfile.role)} disabled className="bg-gray-100" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Alamat lengkap"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
