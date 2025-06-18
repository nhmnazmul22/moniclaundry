"use client"

import { useState, useEffect, useTransition } from "react"
import { formatCurrency } from "@/lib/utils"
import { getCustomers } from "@/lib/data"
import type { Customer } from "@/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Eye, Edit, Trash2, Phone, Mail, MapPin, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { addCustomer, updateCustomer, deleteCustomer } from "./actions"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const fetchCustomers = () => {
    setIsLoading(true)
    getCustomers(searchTerm)
      .then((data) => {
        if (data) setCustomers(data)
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCustomers()
    }, 300) // Debounce search
    return () => clearTimeout(handler)
  }, [searchTerm])

  const handleAddSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await addCustomer(formData)
      if (result.success) {
        toast({ title: "Success", description: "Customer added successfully." })
        setIsAddDialogOpen(false)
        fetchCustomers() // Refresh data
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" })
      }
    })
  }

  const handleEditSubmit = async (formData: FormData) => {
    if (!selectedCustomer) return
    startTransition(async () => {
      const result = await updateCustomer(selectedCustomer.id, formData)
      if (result.success) {
        toast({ title: "Success", description: "Customer updated successfully." })
        setIsEditDialogOpen(false)
        setSelectedCustomer(null)
        fetchCustomers() // Refresh data
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" })
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return
    startTransition(async () => {
      const result = await deleteCustomer(id)
      if (result.success) {
        toast({ title: "Success", description: "Customer deleted successfully." })
        fetchCustomers() // Refresh data
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" })
      }
    })
  }

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsViewDialogOpen(true)
  }

  const stats = {
    total: customers.length,
    // These stats would require more complex queries or client-side filtering
    active: customers.length, // Placeholder
    vip: 0, // Placeholder
    totalRevenue: customers.reduce((sum, c) => sum + (c.total_spent || 0), 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers Management</h1>
          <p className="text-muted-foreground">Kelola data pelanggan laundry</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Customer Baru</DialogTitle>
            </DialogHeader>
            <form action={handleAddSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nama</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="phone">Telepon</Label>
                <Input id="phone" name="phone" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div>
                <Label htmlFor="address">Alamat</Label>
                <Input id="address" name="address" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.total}
            </div>
          </CardContent>
        </Card>
        {/* Other stat cards can be added here */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatCurrency(stats.totalRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Customers ({customers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, nomor HP, atau email customer..."
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
                  <TableHead>Customer Info</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Loyalty Points</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">ID: {customer.id.substring(0, 8)}...</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="mr-1 h-3 w-3" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="mr-1 h-3 w-3" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start text-sm">
                        <MapPin className="mr-1 h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{customer.address}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{customer.total_orders}</TableCell>
                    <TableCell>{formatCurrency(customer.total_spent)}</TableCell>
                    <TableCell className="text-center">{customer.loyalty_points}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewCustomer(customer)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(customer.id)}
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Customer</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nama</Label>
                  <p className="text-sm">{selectedCustomer.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">ID Customer</Label>
                  <p className="text-sm font-mono">{selectedCustomer.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Telepon</Label>
                  <p className="text-sm">{selectedCustomer.phone || "Tidak ada"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm">{selectedCustomer.email || "Tidak ada"}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Alamat</Label>
                  <p className="text-sm">{selectedCustomer.address || "Tidak ada"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total Orders</Label>
                  <p className="text-sm">{selectedCustomer.total_orders}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total Spent</Label>
                  <p className="text-sm">{formatCurrency(selectedCustomer.total_spent)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Loyalty Points</Label>
                  <p className="text-sm">{selectedCustomer.loyalty_points}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                  <p className="text-sm">{new Date(selectedCustomer.created_at).toLocaleDateString("id-ID")}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <form action={handleEditSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nama</Label>
                <Input id="edit-name" name="name" defaultValue={selectedCustomer.name} required />
              </div>
              <div>
                <Label htmlFor="edit-phone">Telepon</Label>
                <Input id="edit-phone" name="phone" defaultValue={selectedCustomer.phone || ""} />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" name="email" type="email" defaultValue={selectedCustomer.email || ""} />
              </div>
              <div>
                <Label htmlFor="edit-address">Alamat</Label>
                <Input id="edit-address" name="address" defaultValue={selectedCustomer.address || ""} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
