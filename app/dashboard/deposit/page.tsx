"use client";

import { DepositReportExport } from "@/components/DepositReportExport";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBranch } from "@/contexts/branch-context";
import { cn } from "@/lib/utils";
import { AppDispatch, RootState } from "@/store";
import {
  fetchCustomers,
  purchaseDeposit,
  updateCustomerBalance,
} from "@/store/CustomerSlice";
import { fetchDepositReportData } from "@/store/depositReportSlice";
import {
  createDepositType,
  deleteDepositType,
  fetchDepositTypes,
  updateDepositType,
} from "@/store/depositTypesSlice";
import {
  cancelTransaction,
  fetchTransactions,
  processLaundryTransaction,
} from "@/store/transactionsSlice";
import { format } from "date-fns";
import {
  AlertTriangle,
  CalendarIcon,
  CreditCard,
  Edit,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

export default function DepositManagement() {
  const { currentBranchId: branchId } = useBranch();

  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const customers = useSelector((state: RootState) => state.customerReducer);
  const depositTypes = useSelector((state: RootState) => state.depositTypes);
  const transactions = useSelector((state: RootState) => state.transactions);
  const dashboard = useSelector((state: RootState) => state.depositReport);

  // Local state
  const [newDepositType, setNewDepositType] = useState({
    name: "",
    purchase_price: 0,
    deposit_value: 0,
    description: "",
  });
  const [editingDepositType, setEditingDepositType] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [laundryAmount, setLaundryAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  // Fetch all data on component mount
  useEffect(() => {
    if (branchId) {
      dispatch(fetchCustomers(branchId));
      dispatch(fetchDepositTypes(branchId));
      dispatch(fetchTransactions({ branchId, limit: 50 }));
      dispatch(fetchDepositReportData(branchId));
    }
  }, [dispatch, branchId]);

  // Handle errors with toast notifications
  useEffect(() => {
    if (customers.error) {
      toast.error(customers.error);
    }
    if (depositTypes.error) {
      toast.error(depositTypes.error);
    }
    if (transactions.error) {
      toast.error(transactions.error);
    }
    if (dashboard.error) {
      toast.error(dashboard.error);
    }
  }, [
    customers.error,
    depositTypes.error,
    transactions.error,
    dashboard.error,
  ]);

  // Add new deposit type
  const handleAddDepositType = async () => {
    if (
      newDepositType.name &&
      newDepositType.purchase_price &&
      newDepositType.deposit_value
    ) {
      try {
        await dispatch(
          createDepositType({
            ...newDepositType,
            branch_id: branchId,
            is_active: true,
          })
        ).unwrap();
        setNewDepositType({
          name: "",
          purchase_price: 0,
          deposit_value: 0,
          description: "",
        });
        toast.success("Deposit type created successfully");
      } catch (error) {
        toast.error("Failed to create deposit type");
      }
    }
  };

  // Edit deposit type
  const handleUpdateDepositType = async () => {
    if (editingDepositType) {
      try {
        await dispatch(
          updateDepositType({
            id: editingDepositType._id,
            data: editingDepositType,
          })
        ).unwrap();
        setEditingDepositType(null);
        toast.success("Deposit type updated successfully");
      } catch (error) {
        toast.error("Failed to update deposit type");
      }
    }
  };

  // Delete deposit type
  const handleDeleteDepositType = async (id: string) => {
    try {
      await dispatch(deleteDepositType(id)).unwrap();
      toast.success("Deposit type deleted successfully");
    } catch (error) {
      toast.error("Failed to delete deposit type");
    }
  };

  // Process laundry transaction
  const handleProcessLaundryTransaction = async () => {
    const customer = customers.items.find((c) => c._id === selectedCustomer);
    if (!customer || !laundryAmount) return;

    try {
      const transactionData: any = {
        customer_id: customer._id,
        branch_id: branchId,
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
          toast.error("Please select payment method for the remaining amount");
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

      setSelectedCustomer("");
      setLaundryAmount(0);
      setPaymentMethod("");
      toast.success("Transaction processed successfully");
    } catch (error) {
      toast.error("Failed to process transaction");
    }
  };

  // Handle deposit purchase
  const handlePurchaseDeposit = async (
    customerId: string,
    depositTypeId: string,
    hasExpiry: boolean,
    expiryDate?: Date
  ) => {
    try {
      await dispatch(
        purchaseDeposit({
          customer_id: customerId,
          deposit_type_id: depositTypeId,
          has_expiry: hasExpiry,
          expiry_date: expiryDate?.toISOString().split("T")[0],
        })
      ).unwrap();

      // Refresh transactions to show the new purchase
      dispatch(fetchTransactions({ branchId, limit: 50 }));
      toast.success("Deposit purchased successfully");
    } catch (error) {
      toast.error("Failed to purchase deposit");
    }
  };

  // Handle transaction cancellation
  const handleCancelTransaction = async (transactionId: string) => {
    try {
      const result = await dispatch(
        cancelTransaction({
          id: transactionId,
          reason: "Cancelled by user",
        })
      ).unwrap();

      // Update customer balance if there was a refund
      if (result.customer) {
        dispatch(
          updateCustomerBalance({
            customerId: result.customer._id,
            newBalance: result.customer.deposit_balance,
          })
        );
      }

      toast.success("Transaction cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel transaction");
    }
  };

  // Get expiring deposits
  const getExpiringDeposits = () => {
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

    return customers.items.filter((c) => {
      if (!c.has_expiry || !c.expiry_date || (c.deposit_balance || 0) <= 0)
        return false;
      const expiryDate = new Date(c.expiry_date);
      return expiryDate <= twoWeeksFromNow;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isLoading =
    customers.loading ||
    depositTypes.loading ||
    transactions.loading ||
    dashboard.loading;

  if (isLoading && customers.items.length === 0) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  const expiringDeposits = getExpiringDeposits();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sistem Deposit Laundry</h1>
        {expiringDeposits.length > 0 && (
          <Badge variant="destructive" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {expiringDeposits.length} Deposit akan berakhir
          </Badge>
        )}
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transaksi</TabsTrigger>
          <TabsTrigger value="customers">Pelanggan</TabsTrigger>
          <TabsTrigger value="deposit-types">Jenis Deposit</TabsTrigger>
          <TabsTrigger value="reports">Laporan</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaksi Laundry Baru</CardTitle>
              <CardDescription>
                Proses pembayaran dengan deposit atau campuran
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pilih Pelanggan</Label>
                  <Select
                    value={selectedCustomer}
                    onValueChange={setSelectedCustomer}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih pelanggan" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.items.map((customer) => (
                        <SelectItem key={customer._id} value={customer._id!}>
                          {customer.name} - Saldo:{" "}
                          {formatCurrency(customer.deposit_balance || 0)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Jumlah Transaksi</Label>
                  <Input
                    type="number"
                    value={laundryAmount || ""}
                    onChange={(e) => setLaundryAmount(Number(e.target.value))}
                    placeholder="Masukkan jumlah"
                  />
                </div>
              </div>

              {selectedCustomer && laundryAmount > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Detail Pembayaran:</h4>
                  {(() => {
                    const customer = customers.items.find(
                      (c) => c._id === selectedCustomer
                    );
                    if (!customer) return null;

                    const customerBalance = customer.deposit_balance || 0;

                    if (customerBalance >= laundryAmount) {
                      return (
                        <div className="space-y-2">
                          <p>✅ Pembayaran penuh dengan deposit</p>
                          <p>
                            Saldo saat ini: {formatCurrency(customerBalance)}
                          </p>
                          <p>
                            Sisa saldo:{" "}
                            {formatCurrency(customerBalance - laundryAmount)}
                          </p>
                        </div>
                      );
                    } else {
                      const shortfall = laundryAmount - customerBalance;
                      return (
                        <div className="space-y-2">
                          <p>⚠️ Saldo tidak mencukupi - Pembayaran campuran</p>
                          <p>
                            Saldo saat ini: {formatCurrency(customerBalance)}
                          </p>
                          <p>Kurang: {formatCurrency(shortfall)}</p>
                          <div className="space-y-2">
                            <Label>Metode pembayaran untuk kekurangan:</Label>
                            <Select
                              value={paymentMethod}
                              onValueChange={setPaymentMethod}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih metode pembayaran" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="transfer">
                                  Transfer
                                </SelectItem>
                                <SelectItem value="qris">QRIS</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}

              <Button
                onClick={handleProcessLaundryTransaction}
                disabled={
                  transactions.processing ||
                  !selectedCustomer ||
                  !laundryAmount ||
                  (() => {
                    const customer = customers.items.find(
                      (c) => c._id === selectedCustomer
                    );
                    const customerBalance = customer?.deposit_balance || 0;
                    return (
                      customer &&
                      customerBalance < laundryAmount &&
                      !paymentMethod
                    );
                  })()
                }
                className="w-full"
              >
                {transactions.processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Proses Transaksi"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Riwayat Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.items.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold">
                        {customers.items.find(
                          (c) => c._id === transaction.customer_id
                        )?.name || "Unknown Customer"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.type === "laundry"
                          ? "Transaksi Laundry"
                          : "Pembelian Deposit"}{" "}
                        - {formatCurrency(transaction.amount)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            transaction.payment_method === "deposit"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {transaction.payment_method === "mixed"
                            ? "DEPOSIT + CASH"
                            : transaction.payment_method.toUpperCase()}
                        </Badge>
                        <Badge
                          variant={
                            transaction.status === "completed"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {transaction.status === "completed"
                            ? "Selesai"
                            : "Dibatalkan"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(transaction.createdAt!),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </p>
                    </div>
                    {transaction.type === "laundry" &&
                      transaction.status === "completed" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Batalkan
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Batalkan Transaksi
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin membatalkan transaksi
                                ini? Saldo deposit akan dikembalikan ke
                                pelanggan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleCancelTransaction(transaction._id!)
                                }
                              >
                                Ya, Batalkan
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Pelanggan</CardTitle>
              <CardDescription>Kelola saldo deposit pelanggan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers.items.map((customer) => (
                  <div
                    key={customer._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {customer.phone}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Saldo: {formatCurrency(customer.deposit_balance || 0)}
                        </Badge>
                        {customer.deposit_type && (
                          <Badge>{customer.deposit_type}</Badge>
                        )}
                        {customer.has_expiry && customer.expiry_date && (
                          <Badge
                            variant={
                              new Date(customer.expiry_date) <=
                              new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            Berakhir:{" "}
                            {format(
                              new Date(customer.expiry_date),
                              "dd/MM/yyyy"
                            )}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Beli Deposit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Pembelian Deposit</DialogTitle>
                          <DialogDescription>
                            Pilih jenis deposit untuk {customer.name}
                          </DialogDescription>
                        </DialogHeader>
                        <DepositPurchaseForm
                          customer={customer}
                          depositTypes={depositTypes.items}
                          onPurchase={handlePurchaseDeposit}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposit-types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kelola Jenis Deposit</CardTitle>
              <CardDescription>
                Tambah, edit, atau hapus jenis deposit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <Input
                  placeholder="Nama deposit"
                  value={newDepositType.name}
                  onChange={(e) =>
                    setNewDepositType({
                      ...newDepositType,
                      name: e.target.value,
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Harga beli"
                  value={newDepositType.purchase_price || ""}
                  onChange={(e) =>
                    setNewDepositType({
                      ...newDepositType,
                      purchase_price: Number(e.target.value),
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Nilai deposit"
                  value={newDepositType.deposit_value || ""}
                  onChange={(e) =>
                    setNewDepositType({
                      ...newDepositType,
                      deposit_value: Number(e.target.value),
                    })
                  }
                />
                <Button
                  onClick={handleAddDepositType}
                  disabled={depositTypes.loading}
                >
                  {depositTypes.loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Tambah
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                {depositTypes.items.map((type) => (
                  <div
                    key={type._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-semibold">{type.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Harga Beli: {formatCurrency(type.purchase_price)} |
                        Nilai Deposit: {formatCurrency(type.deposit_value)}
                      </p>
                      {type.description && (
                        <p className="text-xs text-muted-foreground">
                          {type.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Jenis Deposit</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Nama</Label>
                              <Input
                                value={editingDepositType?.name || type.name}
                                onChange={(e) =>
                                  setEditingDepositType({
                                    ...type,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Harga Beli</Label>
                              <Input
                                type="number"
                                value={
                                  editingDepositType?.purchase_price ||
                                  type.purchase_price
                                }
                                onChange={(e) =>
                                  setEditingDepositType({
                                    ...type,
                                    purchase_price: Number(e.target.value),
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Nilai Deposit</Label>
                              <Input
                                type="number"
                                value={
                                  editingDepositType?.deposit_value ||
                                  type.deposit_value
                                }
                                onChange={(e) =>
                                  setEditingDepositType({
                                    ...type,
                                    deposit_value: Number(e.target.value),
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Deskripsi</Label>
                              <Input
                                value={
                                  editingDepositType?.description ||
                                  type.description ||
                                  ""
                                }
                                onChange={(e) =>
                                  setEditingDepositType({
                                    ...type,
                                    description: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleUpdateDepositType}>
                              Simpan
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Hapus Jenis Deposit
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus jenis deposit{" "}
                              {type.name}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteDepositType(type._id!)}
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Saldo Deposit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(dashboard.data?.total_deposit_balance || 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Transaksi Hari Ini</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {dashboard.data?.today_transactions_count || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Deposit Akan Berakhir</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-destructive">
                  {expiringDeposits.length}
                </p>
              </CardContent>
            </Card>
          </div>

          {expiringDeposits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Deposit yang Akan Berakhir
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expiringDeposits.map((customer) => (
                    <div
                      key={customer._id}
                      className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Saldo: {formatCurrency(customer.deposit_balance || 0)}{" "}
                          | Berakhir:{" "}
                          {customer.expiry_date &&
                            format(
                              new Date(customer.expiry_date),
                              "dd/MM/yyyy"
                            )}
                        </p>
                      </div>
                      <Badge variant="destructive">Segera Berakhir</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Export Component */}
          <DepositReportExport branchId={branchId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DepositPurchaseForm({
  customer,
  depositTypes,
  onPurchase,
}: {
  customer: any;
  depositTypes: any[];
  onPurchase: (
    customerId: string,
    depositTypeId: string,
    hasExpiry: boolean,
    expiryDate?: Date
  ) => void;
}) {
  const [selectedDepositType, setSelectedDepositType] = useState("");
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date>();

  const handlePurchase = () => {
    if (selectedDepositType) {
      onPurchase(customer._id, selectedDepositType, hasExpiry, expiryDate);
    }
  };

  const selectedType = depositTypes.find(
    (dt) => dt._id === selectedDepositType
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Pilih Jenis Deposit</Label>
        <Select
          value={selectedDepositType}
          onValueChange={setSelectedDepositType}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih jenis deposit" />
          </SelectTrigger>
          <SelectContent>
            {depositTypes.map((type) => (
              <SelectItem key={type._id} value={type._id}>
                {type.name} - Beli:{" "}
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(type.purchase_price)}{" "}
                | Dapat:{" "}
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(type.deposit_value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="has-expiry"
          checked={hasExpiry}
          onCheckedChange={setHasExpiry}
        />
        <Label htmlFor="has-expiry">Ada masa berlaku</Label>
      </div>

      {hasExpiry && (
        <div className="space-y-2">
          <Label>Tanggal Berakhir</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !expiryDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {expiryDate ? (
                  format(expiryDate, "PPP")
                ) : (
                  <span>Pilih tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={expiryDate}
                onSelect={setExpiryDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {selectedType && (
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Detail Pembelian:</h4>
          <p>
            Harga Beli:{" "}
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(selectedType.purchase_price)}
          </p>
          <p>
            Nilai Deposit:{" "}
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(selectedType.deposit_value)}
          </p>
          <p>
            Saldo Setelah Pembelian:{" "}
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(
              (customer.deposit_balance || 0) + selectedType.deposit_value
            )}
          </p>
        </div>
      )}

      <DialogFooter>
        <Button
          onClick={handlePurchase}
          disabled={!selectedDepositType || (hasExpiry && !expiryDate)}
        >
          Beli Deposit
        </Button>
      </DialogFooter>
    </div>
  );
}
