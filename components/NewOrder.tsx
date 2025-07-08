"use client";

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
import { useBranch } from "@/contexts/branch-context";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/config/axios";
import { formatCurrency } from "@/lib/utils";
import { AppDispatch, RootState } from "@/store";
import { fetchCustomers, updateCustomerBalance } from "@/store/CustomerSlice";
import { fetchOrders } from "@/store/orderSlice";
import { fetchServices } from "@/store/ServiceSlice";
import { processLaundryTransaction } from "@/store/transactionsSlice";
import type { Branches } from "@/types";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface OrderItemForm {
  service_id: string;
  quantity: number; // This will be weight (kg) or pieces depending on service
  unit_price: number;
  subtotal: number;
  service_name?: string; // For display
}

export default function NewOrderPage() {
  const { currentBranchId } = useBranch();
  const { data: session } = useSession();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [branchId, setBranchId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { items: branches } = useSelector(
    (state: RootState) => state.branchReducer
  );
  const { items: customers } = useSelector(
    (state: RootState) => state.customerReducer
  );
  const { items: services } = useSelector(
    (state: RootState) => state.serviceReducer
  );

  // Form state
  const [customerId, setCustomerId] = useState<string>("");
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [paymentStatus, setPaymentStatus] = useState<string>("belum lunas");

  useEffect(() => {
    dispatch(fetchCustomers(currentBranchId));
    dispatch(fetchServices(currentBranchId));
  }, [currentBranchId]);

  const reset = () => {
    setCustomerId("");
    setOrderItems([]);
    setBranchId("");
    setNotes("");
    return;
  };
  const handleAddOrderItem = () => {
    const defaultService = Array.isArray(services) && services[0];
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
      const selectedService =
        Array.isArray(services) && services?.find((s) => s._id === value);
      if (selectedService) {
        item.unit_price = selectedService.price;
        item.service_name = selectedService.servicename;
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

  // Process laundry transaction
  const handleProcessLaundryTransaction = async (laundryAmount: number) => {
    const customer = customers.find((c) => c._id === customerId);
    if (!customer || !laundryAmount) return;

    try {
      const transactionData: any = {
        customer_id: customer._id,
        branch_id: branchId || currentBranchId,
        amount: laundryAmount,
        payment_method: "deposit",
        description: "Laundry service payment",
      };

      if (customer.deposit_balance! >= laundryAmount) {
        // Full payment with deposit
        transactionData.payment_method = "deposit";
        transactionData.deposit_amount = laundryAmount;
      } else {
        // Mixed payment
        const depositUsed = customer.deposit_balance!;
        const cashNeeded = laundryAmount - depositUsed;

        if (!paymentMethod) {
          toast({
            title: "Failed",
            description:
              "Please select payment method for the remaining amount",
            variant: "destructive",
          });
          return;
        }

        transactionData.payment_method = "mixed";
        transactionData.deposit_amount = depositUsed;
        transactionData.cash_amount = cashNeeded;
      }

      const result = await dispatch(
        processLaundryTransaction(transactionData)
      ).unwrap();

      // Update customer balance in Redux state
      dispatch(
        updateCustomerBalance({
          customerId: customer._id!,
          newBalance: result.customer.deposit_balance,
        })
      );
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

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
    const orderNumber = `TX-${new Date().getFullYear()}${(
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
      payment_status: paymentMethod === "deposit" ? "lunas" : paymentStatus,
      order_status: "diterima",
      notes: notes,
      current_branch_id:
        session?.user.role === "owner" ? branchId : currentBranchId,
    };

    const result = await api.post("/api/orders", orderData);

    if (result.data.data.status === "Failed") {
      toast({
        title: "Successful",
        description: `Gagal membuat order: ${
          result.statusText || "Unknown error"
        }`,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Insert order items
    const orderItemsData = orderItems.map((item) => ({
      order_id: result.data.data._id,
      service_id: item.service_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
      current_branch_id:
        session?.user.role === "owner" ? branchId : currentBranchId,
    }));

    const response = await api.post("/api/order-items", orderItemsData);

    if (response.data.data.status === "Failed") {
      await api.delete(`/api/orders/${result.data.data._id}`);
      toast({
        title: "Error",
        description: `Gagal menyimpan item order: ${response.statusText}. Order dibatalkan.`,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // If payment is made directly (e.g. cash, deposit and paid)
    if (
      (paymentStatus === "lunas" ||
        paymentStatus === "dp" ||
        paymentMethod === "deposit") &&
      totalAmount > 0
    ) {
      const paymentData = {
        order_id: result.data.data._id,
        amount: totalAmount,
        payment_method: paymentMethod,
        payment_date: new Date().toISOString(),
        status: "completed",
        current_branch_id:
          session?.user.role === "owner" ? branchId : currentBranchId,
      };

      const res = await api.post("/api/payments", paymentData);
      if (res.status !== 201) {
        await api.delete(`/api/orders/${result.data.data._id}`);
        return;
      }
    }

    // if customer user deposit payment method
    if (paymentMethod === "deposit") {
      handleProcessLaundryTransaction(totalAmount);
    }

    toast({
      title: "Sukses",
      description: `Order ${result.data.data.order_number} berhasil dibuat.`,
    });
    setIsSubmitting(false);
    reset();
    dispatch(fetchOrders(currentBranchId));
    router.push("/dashboard/orders");
  };

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
                {customers &&
                  customers.map((customer) => (
                    <SelectItem key={customer._id} value={customer._id}>
                      {customer.name} ({customer.phone || "No Phone"})
                    </SelectItem>
                  ))}
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
                        {services &&
                          services.map((service) => (
                            <SelectItem key={service._id} value={service._id!}>
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
                  <span>Subtotal:</span> <span>{formatCurrency(subtotal)}</span>
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

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="paymentMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="qris">Qris</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Status Pembayaran</Label>
              <Select
                value={paymentStatus}
                onValueChange={setPaymentStatus}
                disabled={paymentMethod === "deposit"}
              >
                <SelectTrigger id="paymentStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="belum lunas">Belum Lunas</SelectItem>
                  <SelectItem value="lunas">Lunas</SelectItem>
                  <SelectItem value="dp">DP</SelectItem>
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

          {session?.user.role === "owner" && (
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
                  {branches &&
                    branches.length > 0 &&
                    branches.map((branch: Branches) => (
                      <SelectItem key={branch._id} value={branch._id}>
                        {branch.name} - {`(${branch.type})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => reset()}
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
