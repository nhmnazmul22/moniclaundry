"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import type { Order, Customer } from "@/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function EditOrderPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    customer_id: "",
    order_status: "",
    payment_status: "",
    notes: "",
    estimated_completion: "",
  })

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single()

      if (orderError) throw orderError

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase.from("customers").select("*").order("name")

      if (customersError) throw customersError

      setOrder(orderData)
      setCustomers(customersData || [])

      // Set form data
      setFormData({
        customer_id: orderData.customer_id || "",
        order_status: orderData.order_status,
        payment_status: orderData.payment_status || "",
        notes: orderData.notes || "",
        estimated_completion: orderData.estimated_completion
          ? new Date(orderData.estimated_completion).toISOString().slice(0, 16)
          : "",
      })
    } catch (err: any) {
      setError(err.message || "Gagal memuat data order.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      fetchData()
    }
  }, [orderId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updateData: any = {
        customer_id: formData.customer_id || null,
        order_status: formData.order_status,
        payment_status: formData.payment_status || null,
        notes: formData.notes || null,
        estimated_completion: formData.estimated_completion
          ? new Date(formData.estimated_completion).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("orders").update(updateData).eq("id", orderId)

      if (error) throw error

      alert("Order berhasil diperbarui!")
      router.push(`/dashboard/orders/${orderId}`)
    } catch (err: any) {
      alert(`Gagal memperbarui order: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p>Memuat data order...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500 text-lg">{error || "Order tidak ditemukan"}</p>
        <Link href="/dashboard/orders">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Orders
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/dashboard/orders/${orderId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Order</h1>
          <p className="text-muted-foreground">Order #{order.order_number}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Informasi Order</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select
                  value={formData.customer_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, customer_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order_status">Status Order</Label>
                <Select
                  value={formData.order_status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, order_status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">Diterima</SelectItem>
                    <SelectItem value="washing">Sedang Dicuci</SelectItem>
                    <SelectItem value="drying">Sedang Dikeringkan</SelectItem>
                    <SelectItem value="ironing">Sedang Disetrika</SelectItem>
                    <SelectItem value="ready">Siap Diambil</SelectItem>
                    <SelectItem value="out_for_delivery">Sedang Diantar</SelectItem>
                    <SelectItem value="delivered">Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_status">Status Pembayaran</Label>
                <Select
                  value={formData.payment_status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, payment_status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Lunas</SelectItem>
                    <SelectItem value="partial">Sebagian</SelectItem>
                    <SelectItem value="refunded">Dikembalikan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_completion">Estimasi Selesai</Label>
                <Input
                  id="estimated_completion"
                  type="datetime-local"
                  value={formData.estimated_completion}
                  onChange={(e) => setFormData((prev) => ({ ...prev, estimated_completion: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                placeholder="Catatan tambahan untuk order ini..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Link href={`/dashboard/orders/${orderId}`}>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
