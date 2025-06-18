"use client"

import { useEffect, useState, useCallback } from "react"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { getStaffList } from "@/lib/staff-data"
import { getOrders } from "@/lib/data"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, Eye, Edit, Trash2, Loader2, AlertTriangle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

type DeliveryWithDetails = {
  id: string
  order_id: string
  kurir_id: string
  delivery_type: "pickup" | "delivery"
  scheduled_time: string
  actual_time?: string
  status: string
  customer_address?: string
  delivery_fee: number
  notes?: string
  created_at: string
  order?: {
    order_number: string
    customer?: {
      name: string
      phone: string
      address: string
    }
  }
  kurir?: {
    full_name: string
    email: string
  }
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DeliveryWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [kurirList, setKurirList] = useState<any[]>([])
  const [orderList, setOrderList] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<string>("")
  const [selectedKurir, setSelectedKurir] = useState<string>("")
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("delivery")
  const [scheduledTime, setScheduledTime] = useState<string>("")
  const [deliveryFee, setDeliveryFee] = useState<number>(5000)
  const [customerAddress, setCustomerAddress] = useState<string>("")
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryWithDetails | null>(null)

  const { toast } = useToast()

  const fetchDeliveries = useCallback(async () => {
    try {
      console.log("Fetching deliveries...")

      // Simple query first to check if table exists
      const { data, error } = await supabase.from("deliveries").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        return []
      }

      console.log("Deliveries data:", data)
      return data || []
    } catch (error) {
      console.error("Error fetching deliveries:", error)
      return []
    }
  }, [searchTerm, statusFilter])

  const fetchPageData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("Starting to fetch page data...")

      const [deliveriesData, staffData, ordersData] = await Promise.all([
        fetchDeliveries(),
        getStaffList("", "kurir"), // Get kurir from staff table using the correct function
        getOrders(), // Get all orders
      ])

      console.log("Raw orders data:", ordersData)
      console.log("Staff data:", staffData)

      // Filter orders that can be delivered (completed or ready)
      const availableOrders = ordersData.filter((o: any) => {
        const validStatuses = ["delivered", "ready", "completed"]
        return validStatuses.includes(o.order_status)
      })

      console.log("Available orders for delivery:", availableOrders)

      setDeliveries(deliveriesData as DeliveryWithDetails[])
      setKurirList(staffData.filter((s: any) => s.role === "kurir"))
      setOrderList(availableOrders)

      console.log(
        "Final kurir list:",
        staffData.filter((s: any) => s.role === "kurir"),
      )
      console.log("Final order list:", availableOrders)
    } catch (e) {
      setError("Terjadi kesalahan saat memuat data.")
      console.error("Error in fetchPageData:", e)
    } finally {
      setLoading(false)
    }
  }, [fetchDeliveries])

  useEffect(() => {
    fetchPageData()
  }, [fetchPageData])

  useEffect(() => {
    if (selectedOrder) {
      const order = orderList.find((o) => o.id === selectedOrder)
      if (order && order.customer?.address) {
        setCustomerAddress(order.customer.address)
      } else {
        setCustomerAddress("")
      }
    }
  }, [selectedOrder, orderList])

  const getStatusLabel = (status?: string) => {
    if (!status) return "N/A"
    const labels: { [key: string]: string } = {
      scheduled: "Dijadwalkan",
      in_progress: "Sedang Berlangsung",
      completed: "Selesai",
      failed: "Gagal",
      cancelled: "Dibatalkan",
    }
    return labels[status] || status
  }

  const getDeliveryStatusColor = (status?: string) => {
    if (!status) return "bg-gray-200 text-gray-800"
    const colors: { [key: string]: string } = {
      scheduled: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    }
    return colors[status] || "bg-gray-200 text-gray-800"
  }

  const handleViewDelivery = (delivery: DeliveryWithDetails) => {
    setSelectedDelivery(delivery)
    setIsViewDialogOpen(true)
  }

  const handleEditDelivery = (delivery: DeliveryWithDetails) => {
    setSelectedDelivery(delivery)
    setSelectedOrder(delivery.order_id)
    setSelectedKurir(delivery.kurir_id)
    setDeliveryType(delivery.delivery_type)
    setScheduledTime(delivery.scheduled_time.slice(0, 16)) // Format for datetime-local
    setCustomerAddress(delivery.customer_address || "")
    setDeliveryFee(delivery.delivery_fee || 0)
    setIsEditDialogOpen(true)
  }

  const handleUpdateDelivery = async () => {
    if (!selectedDelivery || !selectedOrder || !selectedKurir || !scheduledTime) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang diperlukan.",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedDelivery = {
        order_id: selectedOrder,
        kurir_id: selectedKurir,
        delivery_type: deliveryType,
        scheduled_time: new Date(scheduledTime).toISOString(),
        customer_address: deliveryType === "delivery" ? customerAddress : null,
        delivery_fee: deliveryType === "delivery" ? deliveryFee : 0,
        notes: `${deliveryType === "delivery" ? "Pengiriman" : "Pickup"} diupdate`,
      }

      const { error: updateError } = await supabase
        .from("deliveries")
        .update(updatedDelivery)
        .eq("id", selectedDelivery.id)

      if (updateError) {
        console.error("Update error:", updateError)
        toast({
          title: "Error",
          description: `Gagal mengupdate pengiriman: ${updateError.message}`,
          variant: "destructive",
        })
      } else {
        toast({ title: "Sukses", description: "Pengiriman berhasil diupdate." })
        setIsEditDialogOpen(false)
        setSelectedDelivery(null)
        fetchPageData() // Refresh data
        // Reset form
        setSelectedOrder("")
        setSelectedKurir("")
        setDeliveryType("delivery")
        setScheduledTime("")
        setDeliveryFee(5000)
        setCustomerAddress("")
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan yang tidak terduga.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus jadwal pengiriman ini?")) return

    const { error: deleteError } = await supabase.from("deliveries").delete().eq("id", id)

    if (deleteError) {
      toast({
        title: "Error",
        description: `Gagal menghapus pengiriman: ${deleteError.message}`,
        variant: "destructive",
      })
    } else {
      toast({ title: "Sukses", description: "Pengiriman berhasil dihapus." })
      fetchPageData()
    }
  }

  const handleCreateDelivery = async () => {
    console.log("Creating delivery with data:", {
      selectedOrder,
      selectedKurir,
      scheduledTime,
      deliveryType,
      customerAddress,
      deliveryFee,
    })

    if (!selectedOrder || !selectedKurir || !scheduledTime) {
      console.log("Validation failed:", { selectedOrder, selectedKurir, scheduledTime })
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang diperlukan.",
        variant: "destructive",
      })
      return
    }

    try {
      const newDelivery = {
        order_id: selectedOrder,
        kurir_id: selectedKurir,
        delivery_type: deliveryType,
        scheduled_time: new Date(scheduledTime).toISOString(),
        status: "scheduled",
        customer_address: deliveryType === "delivery" ? customerAddress : null,
        delivery_fee: deliveryType === "delivery" ? deliveryFee : 0,
        notes: `${deliveryType === "delivery" ? "Pengiriman" : "Pickup"} dijadwalkan`,
      }

      console.log("Inserting delivery:", newDelivery)

      const { data, error: insertError } = await supabase.from("deliveries").insert(newDelivery).select().single()

      if (insertError) {
        console.error("Insert error:", insertError)
        toast({
          title: "Error",
          description: `Gagal membuat jadwal pengiriman: ${insertError.message}`,
          variant: "destructive",
        })
      } else {
        console.log("Delivery created successfully:", data)
        toast({ title: "Sukses", description: "Jadwal pengiriman berhasil dibuat." })
        setIsModalOpen(false)
        fetchPageData() // Refresh data
        // Reset form
        setSelectedOrder("")
        setSelectedKurir("")
        setDeliveryType("delivery")
        setScheduledTime("")
        setDeliveryFee(5000)
        setCustomerAddress("")
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan yang tidak terduga.",
        variant: "destructive",
      })
    }
  }

  if (loading && deliveries.length === 0) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p>Memuat data pengiriman...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500 text-lg">{error}</p>
        <Button onClick={fetchPageData} className="mt-4">
          Coba Lagi
        </Button>
      </div>
    )
  }

  const stats = {
    total: deliveries.length,
    scheduled: deliveries.filter((d) => d.status === "scheduled").length,
    in_progress: deliveries.filter((d) => d.status === "in_progress").length,
    completed: deliveries.filter((d) => d.status === "completed").length,
    failed: deliveries.filter((d) => d.status === "failed").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deliveries Management</h1>
          <p className="text-muted-foreground">Kelola pengiriman dan pickup laundry</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Jadwalkan Delivery
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Jadwalkan Pengiriman/Pickup Baru</DialogTitle>
              <DialogDescription>Isi detail untuk jadwal pengiriman atau pickup baru.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="order" className="text-right">
                  Order
                </Label>
                <Select onValueChange={setSelectedOrder} value={selectedOrder}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih Order" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderList.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.order_number} - {order.customer?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="kurir" className="text-right">
                  Kurir
                </Label>
                <Select onValueChange={setSelectedKurir} value={selectedKurir}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih Kurir" />
                  </SelectTrigger>
                  <SelectContent>
                    {kurirList.map((kurir) => (
                      <SelectItem key={kurir.id} value={kurir.id}>
                        {kurir.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deliveryType" className="text-right">
                  Tipe
                </Label>
                <Select onValueChange={(value) => setDeliveryType(value as "pickup" | "delivery")} value={deliveryType}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Pengiriman ke Customer</SelectItem>
                    <SelectItem value="pickup">Pickup dari Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="scheduledTime" className="text-right">
                  Waktu Dijadwalkan
                </Label>
                <Input
                  id="scheduledTime"
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="col-span-3"
                />
              </div>
              {deliveryType === "delivery" && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="customerAddress" className="text-right">
                      Alamat Customer
                    </Label>
                    <Input
                      id="customerAddress"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="col-span-3"
                      placeholder="Alamat pengiriman"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="deliveryFee" className="text-right">
                      Ongkir
                    </Label>
                    <Input
                      id="deliveryFee"
                      type="number"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(Number.parseInt(e.target.value))}
                      className="col-span-3"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button type="button" onClick={handleCreateDelivery}>
                Simpan Jadwal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dijadwalkan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Berlangsung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.in_progress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gagal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
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
                placeholder="Cari order number, nama customer, kurir..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="scheduled">Dijadwalkan</SelectItem>
                <SelectItem value="in_progress">Berlangsung</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="failed">Gagal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Deliveries ({deliveries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Info</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Kurir</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Waktu Dijadwalkan</TableHead>
                <TableHead>Waktu Aktual</TableHead>
                <TableHead>Ongkir</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{delivery.order?.order_number || delivery.order_id}</div>
                      <div className="text-sm text-gray-500">ID: {delivery.id.substring(0, 8)}...</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{delivery.order?.customer?.name || "N/A"}</div>
                      <div className="text-sm text-gray-500">{delivery.order?.customer?.phone || "N/A"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{delivery.kurir?.full_name || "N/A"}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={delivery.delivery_type === "delivery" ? "default" : "secondary"}>
                      {delivery.delivery_type === "delivery" ? "Pengiriman" : "Pickup"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDateTime(delivery.scheduled_time)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{delivery.actual_time ? formatDateTime(delivery.actual_time) : "N/A"}</div>
                  </TableCell>
                  <TableCell>{formatCurrency(delivery.delivery_fee)}</TableCell>
                  <TableCell>
                    <Badge className={getDeliveryStatusColor(delivery.status)}>{getStatusLabel(delivery.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDelivery(delivery)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditDelivery(delivery)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(delivery.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Pengiriman</DialogTitle>
          </DialogHeader>
          {selectedDelivery && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Order Number</Label>
                  <p className="text-sm">{selectedDelivery.order?.order_number || selectedDelivery.order_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Customer</Label>
                  <p className="text-sm">{selectedDelivery.order?.customer?.name || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Kurir</Label>
                  <p className="text-sm">{selectedDelivery.kurir?.full_name || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tipe</Label>
                  <p className="text-sm">{selectedDelivery.delivery_type === "delivery" ? "Pengiriman" : "Pickup"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Waktu Dijadwalkan</Label>
                  <p className="text-sm">{formatDateTime(selectedDelivery.scheduled_time)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Waktu Aktual</Label>
                  <p className="text-sm">
                    {selectedDelivery.actual_time ? formatDateTime(selectedDelivery.actual_time) : "Belum selesai"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={getDeliveryStatusColor(selectedDelivery.status)}>
                    {getStatusLabel(selectedDelivery.status)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Ongkir</Label>
                  <p className="text-sm">{formatCurrency(selectedDelivery.delivery_fee)}</p>
                </div>
                {selectedDelivery.customer_address && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-500">Alamat Pengiriman</Label>
                    <p className="text-sm">{selectedDelivery.customer_address}</p>
                  </div>
                )}
                {selectedDelivery.notes && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-500">Catatan</Label>
                    <p className="text-sm">{selectedDelivery.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Pengiriman</DialogTitle>
            <DialogDescription>Update detail pengiriman atau pickup.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-order" className="text-right">
                Order
              </Label>
              <Select onValueChange={setSelectedOrder} value={selectedOrder}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Order" />
                </SelectTrigger>
                <SelectContent>
                  {orderList.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.order_number} - {order.customer?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-kurir" className="text-right">
                Kurir
              </Label>
              <Select onValueChange={setSelectedKurir} value={selectedKurir}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Kurir" />
                </SelectTrigger>
                <SelectContent>
                  {kurirList.map((kurir) => (
                    <SelectItem key={kurir.id} value={kurir.id}>
                      {kurir.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-deliveryType" className="text-right">
                Tipe
              </Label>
              <Select onValueChange={(value) => setDeliveryType(value as "pickup" | "delivery")} value={deliveryType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">Pengiriman ke Customer</SelectItem>
                  <SelectItem value="pickup">Pickup dari Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-scheduledTime" className="text-right">
                Waktu Dijadwalkan
              </Label>
              <Input
                id="edit-scheduledTime"
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="col-span-3"
              />
            </div>
            {deliveryType === "delivery" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-customerAddress" className="text-right">
                    Alamat Customer
                  </Label>
                  <Input
                    id="edit-customerAddress"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="col-span-3"
                    placeholder="Alamat pengiriman"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-deliveryFee" className="text-right">
                    Ongkir
                  </Label>
                  <Input
                    id="edit-deliveryFee"
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Number.parseInt(e.target.value))}
                    className="col-span-3"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setSelectedDelivery(null)
              }}
            >
              Batal
            </Button>
            <Button type="button" onClick={handleUpdateDelivery}>
              Update Jadwal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
