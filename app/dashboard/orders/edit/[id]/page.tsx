"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBranch } from "@/contexts/branch-context";
import api from "@/lib/config/axios";
import { AppDispatch, RootState } from "@/store";
import { fetchCustomers } from "@/store/CustomerSlice";
import type { Order } from "@/types";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

export default function EditOrderPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { currentBranchId } = useBranch();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { items: customers } = useSelector(
    (state: RootState) => state.customerReducer
  );

  const [formData, setFormData] = useState({
    customer_id: "",
    order_status: "",
    payment_status: "",
    notes: "",
    estimated_completion: "",
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch order
      const res = await api.get(`/api/orders/${orderId}`);
      if (res.status === 200) {
        setOrder(res.data.data);
      }

      // Set form data
      setFormData({
        customer_id: res.data.data.customerDetails._id || "",
        order_status: res.data.data.order_status,
        payment_status: res.data.data.payment_status || "",
        notes: res.data.data.notes || "",
        estimated_completion: res.data.data.estimated_completion
          ? new Date(res.data.data.estimated_completion)
              .toISOString()
              .slice(0, 16)
          : "",
      });
    } catch (err: any) {
      setError(err.message || "Gagal memuat data order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchData();
    }
  }, [orderId]);

  useEffect(() => {
    dispatch(fetchCustomers(currentBranchId));
  }, [currentBranchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

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
      };

      const res = await api.put(`/api/orders/${orderId}`, updateData);

      if (res.status !== 201) throw new Error("Order update failed");

      if (
        order?.payment_status === "belum lunas" &&
        (formData.payment_status === "lunas" ||
          formData.payment_status === "dp")
      ) {
        const paymentData = {
          order_id: order._id,
          amount: order.total_amount,
          payment_method: order.payment_method,
          payment_date: new Date().toISOString(),
          status: "completed",
          current_branch_id: currentBranchId,
        };

        const res = await api.post("/api/payments", paymentData);
        if (res.status !== 201) {
          await api.delete(`/api/orders/${order._id}`);
          console.log(res.data);
          return;
        }
      }

      toast.success("Order berhasil diperbarui!");
      router.push(`/dashboard/orders/${orderId}`);
    } catch (err: any) {
      toast.error(`Gagal memperbarui order: ${err.message}`);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    console.log(loading);
    return (
      <div className="space-y-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p>Memuat data order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500 text-lg">
          {error || "Order tidak ditemukan"}
        </p>
        <Link href="/dashboard/orders">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Orders
          </Button>
        </Link>
      </div>
    );
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
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, customer_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers &&
                      customers.map((customer) => (
                        <SelectItem key={customer._id} value={customer._id}>
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
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, order_status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diterima">Diterima</SelectItem>
                    <SelectItem value="diproses">Diproses</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_status">Status Pembayaran</Label>
                <Select
                  value={formData.payment_status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, payment_status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="belum lunas">Belum Lunas</SelectItem>
                    <SelectItem value="lunas">Lunas</SelectItem>
                    <SelectItem value="dp">DP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_completion">Estimasi Selesai</Label>
                <Input
                  id="estimated_completion"
                  type="datetime-local"
                  value={formData.estimated_completion}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      estimated_completion: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                placeholder="Catatan tambahan untuk order ini..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
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
  );
}
