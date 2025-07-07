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
import { toast } from "@/hooks/use-toast";
import api from "@/lib/config/axios";
import { formatCurrency } from "@/lib/utils";
import { AppDispatch, RootState } from "@/store";
import { fetchCustomers } from "@/store/CustomerSlice";
import { fetchOrderItems } from "@/store/OrderItemSlice";
import { fetchOrders } from "@/store/orderSlice";
import { fetchServices } from "@/store/ServiceSlice";
import type { Order } from "@/types";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  PlusCircle,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface OrderItemForm {
  _id?: string;
  service_id?: string;
  quantity: number; // This will be weight (kg) or pieces depending on service
  unit_price: number;
  subtotal: number;
  service_name?: string; // For display
}

interface EditOrderPageType {
  orderId: string;
  setIsEditOrder: Dispatch<SetStateAction<boolean>>;
  setOrderId: Dispatch<SetStateAction<string>>;
}

export default function EditOrderPage({
  orderId,
  setIsEditOrder,
  setOrderId,
}: EditOrderPageType) {
  const { currentBranchId } = useBranch();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([]);
  const [hasInitializedOrderItems, setHasInitializedOrderItems] =
    useState(false);

  const { items: customers } = useSelector(
    (state: RootState) => state.customerReducer
  );
  const { items: services } = useSelector(
    (state: RootState) => state.serviceReducer
  );
  const { items: OrdItems } = useSelector(
    (state: RootState) => state.orderItemsReducer
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
      const res = await api.get(`/api/orders/${orderId}`);
      if (res.status === 200) {
        const data = res.data.data;
        setOrder(data);
        setFormData({
          customer_id: data.customerDetails._id || "",
          order_status: data.order_status,
          payment_status: data.payment_status || "",
          notes: data.notes || "",
          estimated_completion: data.estimated_completion
            ? new Date(data.estimated_completion).toISOString().slice(0, 16)
            : "",
        });
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat data order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchData();
      dispatch(fetchOrderItems(orderId));
    }
  }, [orderId]);

  useEffect(() => {
    dispatch(fetchCustomers(currentBranchId));
    dispatch(fetchServices(currentBranchId));
  }, [currentBranchId]);

  useEffect(() => {
    if (!hasInitializedOrderItems && OrdItems && OrdItems?.length > 0) {
      setOrderItems(
        OrdItems.map((item) => ({
          _id: item._id,
          service_id: item.serviceDetails._id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          service_name: item.serviceDetails?.servicename || "",
        }))
      );
      setHasInitializedOrderItems(true);
    }
  }, [OrdItems, hasInitializedOrderItems]);

  const reset = () => {
    setIsEditOrder(false);
    setOrderId("");
    return;
  };

  const handleAddOrderItem = () => {
    setOrderItems((prev) => [
      ...prev,
      {
        quantity: 1,
        unit_price: 0,
        subtotal: 0,
        service_id: "",
        service_name: "",
      },
    ]);
  };

  const handleRemoveOrderItem = async (index: number) => {
    const orderItem = orderItems.filter((_, i) => i === index);
    if (orderItem[0]._id) {
      const res = await api.delete(`/api/order-items/${orderItem[0]._id}`);
      if (res.status === 200) {
        toast({
          title: "Successful",
          description: "Order Items Delete successful",
        });
        setOrderItems(orderItems.filter((_, i) => i !== index));
      } else {
        toast({
          title: "Failed",
          description: "Order Items Delete failed",
          variant: "destructive",
        });
      }
    } else {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const handleOrderItemChange = (
    index: number,
    field: keyof OrderItemForm,
    value: any
  ) => {
    const updatedItems = [...orderItems];
    const item = updatedItems[index];

    (item as any)[field] = value;

    if (field === "service_id") {
      const selectedService = services?.find((s) => s._id === value);
      if (selectedService) {
        item.unit_price = selectedService.price;
        item.service_name = selectedService.servicename;
      }
    }

    if (field === "service_id" || field === "quantity") {
      item.subtotal = item.quantity * item.unit_price;
    }

    setOrderItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const discount = 0;
    const tax = 0;
    const totalAmount = subtotal - discount + tax;
    const totalWeight = orderItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    return { subtotal, discount, tax, totalAmount, totalWeight };
  };

  const { subtotal, discount, tax, totalAmount, totalWeight } =
    calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Order Items added or updated
      const orderItemsData = orderItems.map((item) => ({
        _id: item._id, // optional for existing items
        service_id: item.service_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        order_id: order?._id,
        current_branch_id: currentBranchId,
      }));

      const itemRes = await api.put(`/api/order-items`, orderItemsData);
      if (itemRes.status !== 201) {
        toast({
          title: "Failed",
          description: "Order Items update or added failed",
        });
        return;
      }

      // Payment added or updated
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
          toast({
            title: "Failed",
            description: "Order Items update or added failed",
          });
          return;
        }
      }

      // Order updated
      const updateData: any = {
        customer_id: formData.customer_id || null,
        order_status: formData.order_status,
        payment_status: formData.payment_status || null,
        subtotal: subtotal,
        total_weight: totalWeight,
        total_amount: totalAmount,
        notes: formData.notes || null,
        estimated_completion: formData.estimated_completion
          ? new Date(formData.estimated_completion).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      };

      const res = await api.put(`/api/orders/${orderId}`, updateData);
      if (res.status !== 201) {
        toast({
          title: "Failed",
          description: "Order update failed",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Order berhasil diperbarui!",
      });
      reset();
      dispatch(fetchOrders(currentBranchId));
    } catch (err: any) {
      toast({
        title: "Failed",
        description: `Gagal memperbarui order: ${err.message}`,
        variant: "destructive",
      });
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

            {/* Order Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Item Layanan</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOrderItem}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Tambah Item
                </Button>
              </div>
              {orderItems.map((item, index) => (
                <Card key={index} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <p className="font-medium">Item #{index + 1}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOrderItem(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor={`service-${index}`}>Layanan</Label>
                      <Select
                        value={item.service_id}
                        onValueChange={(value) =>
                          handleOrderItemChange(index, "service_id", value)
                        }
                      >
                        <SelectTrigger id={`service-${index}`}>
                          <SelectValue placeholder="Pilih Layanan" />
                        </SelectTrigger>
                        <SelectContent>
                          {services &&
                            services.map((service) => (
                              <SelectItem
                                key={service._id}
                                value={service._id!}
                              >
                                {service.servicename} (
                                {formatCurrency(service.price)}/kg)
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`quantity-${index}`}>
                        Kuantitas (kg/pcs)
                      </Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleOrderItemChange(
                            index,
                            "quantity",
                            Number.parseFloat(e.target.value) || 0
                          )
                        }
                        min="0.1"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Subtotal</Label>
                      <Input
                        value={formatCurrency(item.subtotal)}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>
                  </div>
                </Card>
              ))}
              {orderItems.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada item layanan.
                </p>
              )}
            </div>

            {/* Totals */}
            {orderItems.length > 0 && (
              <Card className="p-4 bg-slate-50">
                <CardTitle className="text-md mb-2">Ringkasan Biaya</CardTitle>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Berat/Item:</span>{" "}
                    <span>{totalWeight.toFixed(1)} kg/pcs</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>{" "}
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Diskon:</span> <span>{formatCurrency(discount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pajak:</span> <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-md pt-1 border-t mt-1">
                    <span>Total Tagihan:</span>{" "}
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </Card>
            )}

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
              <Button type="button" variant="outline" onClick={() => reset()}>
                Batal
              </Button>

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
