"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import { formatCurrency } from "@/lib/utils"
import { getServices } from "@/lib/data"
import type { Service } from "@/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, Trash2, Clock, Weight, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { addService, updateService, deleteService } from "./actions"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const fetchServices = () => {
    setIsLoading(true)
    getServices()
      .then((data) => {
        if (data) setServices(data)
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchServices()
    }, 300)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const handleSubmit = async (action: (formData: FormData) => Promise<any>, formData: FormData) => {
    startTransition(async () => {
      const result = await action(formData)
      if (result.success) {
        toast({ title: "Success", description: result.message })
        setIsAddDialogOpen(false)
        setIsEditDialogOpen(false)
        setSelectedService(null)
        fetchServices()
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" })
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return
    startTransition(async () => {
      const result = await deleteService(id)
      if (result.success) {
        toast({ title: "Success", description: result.message })
        fetchServices()
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" })
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Services Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Service Baru</DialogTitle>
            </DialogHeader>
            <ServiceForm
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit(addService, new FormData(e.currentTarget))
              }}
              isPending={isPending}
              onClose={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Services ({services.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Info</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price/kg</TableHead>
                  <TableHead>Min Weight</TableHead>
                  <TableHead>Estimated Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{service.description}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{service.category}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(service.price_per_kg)}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Weight className="mr-1 h-3 w-3" />
                        {service.min_weight}kg
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-1 h-3 w-3" />
                        {service.estimated_hours}h
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={service.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {service.is_active ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedService(service)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(service.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <ServiceForm
              key={selectedService.id}
              service={selectedService}
              onSubmit={(e) => {
                e.preventDefault()
                const action = updateService.bind(null, selectedService.id)
                handleSubmit(action, new FormData(e.currentTarget))
              }}
              isPending={isPending}
              onClose={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Reusable Service Form Component
function ServiceForm({
  service,
  onSubmit,
  isPending,
  onClose,
}: {
  service?: Service
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isPending: boolean
  onClose: () => void
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Nama Service</Label>
          <Input id="name" name="name" defaultValue={service?.name} required />
        </div>
        <div className="col-span-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea id="description" name="description" defaultValue={service?.description || ""} />
        </div>
        <div>
          <Label htmlFor="price_per_kg">Harga per Kg</Label>
          <Input id="price_per_kg" name="price_per_kg" type="number" defaultValue={service?.price_per_kg} required />
        </div>
        <div>
          <Label htmlFor="min_weight">Berat Minimum (kg)</Label>
          <Input
            id="min_weight"
            name="min_weight"
            type="number"
            step="0.1"
            defaultValue={service?.min_weight}
            required
          />
        </div>
        <div>
          <Label htmlFor="estimated_hours">Estimasi Waktu (jam)</Label>
          <Input
            id="estimated_hours"
            name="estimated_hours"
            type="number"
            defaultValue={service?.estimated_hours}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Kategori</Label>
          <Input id="category" name="category" defaultValue={service?.category || ""} />
        </div>
        <div className="col-span-2 flex items-center space-x-2">
          <Switch id="is_active" name="is_active" defaultChecked={service?.is_active ?? true} />
          <Label htmlFor="is_active">Service Aktif</Label>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan
        </Button>
      </div>
    </form>
  )
}
