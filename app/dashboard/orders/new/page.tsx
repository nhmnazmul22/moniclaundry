"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useToast } from "@/components/ui/use-toast";
import { useBranch } from "@/contexts/branch-context";
import { getBranchList } from "@/lib/branch-data";
import { getCustomers, getServices } from "@/lib/data";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import type { Branches, Customer, Service } from "@/types/database";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface OrderItemForm {
  service_id: string;
  quantity: number; // This will be weight (kg) or pieces depending on service
  unit_price: number;
  subtotal: number;
  service_name?: string; // For display
}

export default function NewOrderPage() {
  const { currentBranchId } = useBranch();
  const router = useRouter();
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branches[]>([]);
  const [branchId, setBranchId] = useState<string>("");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingDependencies, setLoadingDependencies] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [customerId, setCustomerId] = useState<string>("");
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [paymentStatus, setPaymentStatus] = useState<string>("pending"); // Default to pending

  const fetchDependencies = useCallback(async () => {
    setLoadingDependencies(true);
    try {
      const [customersData, servicesData] = await Promise.all([
        getCustomers(currentBranchId, ""),
        getServices(""),
      ]);
      if (customersData) setCustomers(customersData);
      if (servicesData) setServices(servicesData.filter((s) => s.is_active)); // Only active services
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data customer atau layanan.",
        variant: "destructive",
      });
    } finally {
      setLoadingDependencies(false);
    }
  }, [toast]);

  const fetchBranches = () => {
    getBranchList().then((data) => {
      if (data) setBranches(data);
    });
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies, currentBranchId]);

  const handleAddOrderItem = () => {
    const defaultService = services[0];
    if (!defaultService) {
      toast({
        title: "Info",
        description: "Tidak ada layanan yang tersedia untuk ditambahkan.",
        variant: "default",
      });
      return;
    }
    setOrderItems([
      ...orderItems,
      {
        service_id: "",
        quantity: 1,
        unit_price: 0,
        subtotal: 0,
        service_name: "",
      },
    ]);
  };

  const handleRemoveOrderItem = (index: number) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems);
  };

  const handleOrderItemChange = (
    index: number,
    field: keyof OrderItemForm,
    value: any
  ) => {
    const newItems = [...orderItems];
    const item = newItems[index] as any;
    item[field] = value;

    if (field === "service_id") {
      const selectedService = services.find((s) => s.id === value);
      if (selectedService) {
        item.unit_price = selectedService.price_per_kg; // Assuming price_per_kg for now
        item.service_name = selectedService.name;
      } else {
        item.unit_price = 0;
        item.service_name = "";
      }
    }

    // Recalculate subtotal
    if (field === "service_id" || field === "quantity") {
      item.subtotal = item.quantity * item.unit_price;
    }

    newItems[index] = item;
    setOrderItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    // Add logic for discount and tax if needed
    const discount = 0;
    const taxRate = 0; // Example 10% tax
    const tax = subtotal * taxRate;
    const totalAmount = subtotal - discount + tax;
    return {
      subtotal,
      discount,
      tax,
      totalAmount,
      totalWeight: orderItems.reduce(
        (sum, item) => sum + Number(item.quantity),
        0
      ),
    };
  };

  const { subtotal, discount, tax, totalAmount, totalWeight } =
    calculateTotals();

  const handleSubmitOrder = async () => {
    if (!customerId) {
      toast({
        title: "Error",
        description: "Pelanggan harus dipilih.",
        variant: "destructive",
      });
      return;
    }
    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Minimal harus ada satu item layanan.",
        variant: "destructive",
      });
      return;
    }
    if (orderItems.some((item) => !item.service_id || item.quantity <= 0)) {
      toast({
        title: "Error",
        description:
          "Setiap item harus memiliki layanan dan kuantitas yang valid.",
        variant: "destructive",
      });
      return;
    }

    if (!branchId) {
      toast({
        title: "Error",
        description: "Cabang harus dipilih.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Generate order number (simple example, consider a more robust solution)
    const orderNumber = `ML${new Date().getFullYear()}${(
      new Date().getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}${new Date()
      .getDate()
      .toString()
      .padStart(2, "0")}${Math.random()
      .toString()
      .substring(2, 6)
      .toUpperCase()}`;

    const orderData = {
      order_number: orderNumber,
      customer_id: customerId,
      total_weight: totalWeight,
      subtotal: subtotal,
      discount: discount,
      tax: tax,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      order_status: "received",
      notes: notes,
      current_branch_id: branchId,
    };

    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError || !newOrder) {
      toast({
        title: "Error",
        description: `Gagal membuat order: ${
          orderError?.message || "Unknown error"
        }`,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Insert order items
    const orderItemsData = orderItems.map((item) => ({
      order_id: newOrder.id,
      service_id: item.service_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsData);

    if (itemsError) {
      // Optionally, delete the created order if items fail to insert (rollback logic)
      await supabase.from("orders").delete().eq("id", newOrder.id);
      toast({
        title: "Error",
        description: `Gagal menyimpan item order: ${itemsError.message}. Order dibatalkan.`,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (paymentStatus === "paid" && paymentMethod === "deposit") {
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("total_deposit")
        .eq("id", customerId)
        .single();

      if (customer?.total_deposit > 0 && customer?.total_deposit >= subtotal) {
        await supabase
          .from("customers")
          .update({
            total_deposit: Number(customer?.total_deposit - subtotal),
          })
          .eq("id", customerId);
      } else {
        await supabase.from("orders").delete().eq("id", newOrder.id);
        toast({
          title: "Error",
          description: "Deposit pelanggan tidak cukup untuk menutupi total.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }

    // If payment is made directly (e.g. cash, deposit and paid)
    if (paymentStatus === "paid" && totalAmount > 0) {
      const paymentData = {
        order_id: newOrder.id,
        amount: totalAmount,
        payment_method: paymentMethod,
        payment_date: new Date().toISOString(),
        status: "completed",
        // created_by
      };

      await supabase.from("payments").insert(paymentData);
    }

    toast({
      title: "Sukses",
      description: `Order ${newOrder.order_number} berhasil dibuat.`,
    });
    setIsSubmitting(false);
    router.push("/dashboard/orders"); // Redirect to orders list
  };

  if (loadingDependencies) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Buat Order Baru</CardTitle>
          <CardDescription>Isi detail pesanan laundry baru.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customer">Pelanggan</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger id="customer">
                <SelectValue placeholder="Pilih Pelanggan" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} ({customer.phone || "No Phone"})
                  </SelectItem>
                ))}
                <Link
                  href="/dashboard/customers/new?redirect=/dashboard/orders/new"
                  className="block p-2 text-sm text-blue-600 hover:bg-gray-100"
                >
                  + Tambah Pelanggan Baru
                </Link>
              </SelectContent>
            </Select>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Item Layanan</Label>
              <Button variant="outline" size="sm" onClick={handleAddOrderItem}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Item
              </Button>
            </div>
            {orderItems.map((item, index) => (
              <Card key={index} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <p className="font-medium">Item #{index + 1}</p>
                  <Button
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
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} (
                            {formatCurrency(service.price_per_kg)}/kg)
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
                  <span>Subtotal:</span> <span>{formatCurrency(subtotal)}</span>
                </div>
                {/* <div className="flex justify-between"><span>Diskon:</span> <span>{formatCurrency(discount)}</span></div> */}
                {/* <div className="flex justify-between"><span>Pajak:</span> <span>{formatCurrency(tax)}</span></div> */}
                <div className="flex justify-between font-bold text-md pt-1 border-t mt-1">
                  <span>Total Tagihan:</span>{" "}
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="paymentMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Tunai</SelectItem>
                  <SelectItem value="transfer">Transfer Bank</SelectItem>
                  <SelectItem value="ewallet">E-Wallet</SelectItem>
                  <SelectItem value="cod">COD (Bayar di Tempat)</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Status Pembayaran</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger id="paymentStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Lunas</SelectItem>
                  {/* <SelectItem value="partial">Bayar Sebagian</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Tambahan</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instruksi khusus, preferensi, dll."
            />
          </div>

          <div>
            <Select
              name="current_branch_id"
              value={branchId}
              onValueChange={setBranchId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.length > 0 &&
                  branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} - {`(${branch.type})`}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmitOrder}
            disabled={isSubmitting || orderItems.length === 0 || !customerId}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Order
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
