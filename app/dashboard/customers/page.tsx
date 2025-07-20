"use client";

import DynamicPagination from "@/components/dynamicPagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBranch } from "@/contexts/branch-context";
import { toast } from "@/hooks/use-toast";
import { addNotification } from "@/lib/api";
import api from "@/lib/config/axios";
import { formatCurrency } from "@/lib/utils";
import { AppDispatch, RootState } from "@/store";
import { fetchCustomers } from "@/store/CustomerSlice";
import { fetchNotification } from "@/store/NotificationSlice";
import type { Customer, NotificationType } from "@/types";
import {
  Edit,
  Eye,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function CustomersPage() {
  const { data: session } = useSession();
  const { currentBranchId } = useBranch();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [branchId, setBranchId] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const dispatch = useDispatch<AppDispatch>();
  const { items: customers, loading: customerLoading } = useSelector(
    (state: RootState) => state.customerReducer
  );
  const { items: branches } = useSelector(
    (state: RootState) => state.branchReducer
  );
  const { currentItems } = useSelector(
    (state: RootState) => state.paginationReducer
  );

  useEffect(() => {
    dispatch(fetchCustomers(currentBranchId));
  }, [currentBranchId]);

  // 2. Then filter by search term
  const filteredCustomer = currentItems?.filter((customer) => {
    const search = searchTerm.toLowerCase();
    if (searchTerm) {
      return (
        customer?.name?.toLowerCase().includes(search) ||
        customer?.phone?.includes(search)
      );
    } else {
      return true;
    }
  });

  const handleAddSubmit = async (formData: FormData) => {
    try {
      setLoading(true);
      const data = {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        address: formData.get("address") as string,
        total_deposit: Number(formData.get("total_deposit")) as number,
        current_branch_id: branchId || (currentBranchId as string),
      };

      const result = await api.post("/api/customer", data);
      if (result.status === 201) {
        const notificationData: NotificationType = {
          title: "Customer added successfully",
          description: `Customer ${data.name} added with ${data.email}`,
          status: "unread",
          current_branch_id: branchId || currentBranchId,
        };
        // Send a notification
        const res = await addNotification(notificationData);
        if (res?.status === 201) {
          dispatch(fetchNotification(currentBranchId));
        }
        toast({
          title: "Success",
          description: "Customer added successfully.",
        });
        setIsAddDialogOpen(false);
        dispatch(fetchCustomers(currentBranchId));
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Something went wrong!!",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (formData: FormData) => {
    if (!selectedCustomer) {
      toast({
        title: "Selected Customer not found",
      });
      return;
    }

    try {
      setLoading(true);
      const data = {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        address: formData.get("address") as string,
        total_deposit: Number(formData.get("total_deposit")) as number,
      };

      const result = await api.put(
        `/api/customer/${selectedCustomer._id}`,
        data
      );
      if (result.status === 201 || result.status === 200) {
        const notificationData: NotificationType = {
          title: "Customer updated successfully.",
          description: `Customer ${data.name} info is updated`,
          status: "unread",
          current_branch_id: branchId || currentBranchId,
        };
        // Send a notification
        const res = await addNotification(notificationData);
        if (res?.status === 201) {
          dispatch(fetchNotification(currentBranchId));
        }
        toast({
          title: "Success",
          description: "Customer updated successfully.",
        });
        setIsEditDialogOpen(false);
        setSelectedCustomer(null);
        dispatch(fetchCustomers(currentBranchId)); // Refresh data
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Something went wrong!!",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const result = await api.delete(`/api/customer/${id}`);
      if (result.status === 200 || result.status === 201) {
        const notificationData: NotificationType = {
          title: "Customer deleted successfully.",
          description: `Customer is deleted`,
          status: "unread",
          current_branch_id: branchId || currentBranchId,
        };
        // Send a notification
        const res = await addNotification(notificationData);
        if (res?.status === 201) {
          dispatch(fetchNotification(currentBranchId));
        }
        toast({
          title: "Success",
          description: "Customer deleted successfully.",
        });
        dispatch(fetchCustomers(currentBranchId)); // Refresh data
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const stats = {
    total: customers?.length,
    active: customers?.length,
    vip: 0,
    totalRevenue: customers?.reduce((sum, c) => sum + (c.total_spent || 0), 0),
  };

  const selectedBranch = (id: string) => {
    const branch = branches?.find((b) => b._id === id);
    return branch || null;
  };

  return (
    <div className="space-y-6">
      <div className="flex md:items-center justify-between max-md:flex-col gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Customers Management
          </h1>
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
                        branches.map((branch) => (
                          <SelectItem key={branch._id} value={branch._id}>
                            {branch.name} - {`(${branch.type})`}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats.total
              )}
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
              {customerLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                formatCurrency(stats.totalRevenue)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Customers ({customers?.length})</CardTitle>
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
          {customerLoading ? (
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
                  <TableHead>Total Deposit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers &&
                  filteredCustomer.map((customer) => (
                    <TableRow key={customer._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-500">
                            ID: {customer._id.substring(0, 8)}...
                          </div>
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
                          <span className="line-clamp-2">
                            {customer.address}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {customer.total_orders}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(customer.total_spent)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(customer.deposit_balance)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCustomer(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(session?.user.role === "owner" ||
                            session?.user.role === "admin") && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDelete(customer._id)}
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {customers && (
        <div key={currentBranchId} className="mt-5">
          <DynamicPagination data={customers} />
        </div>
      )}

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
                  <Label className="text-sm font-medium text-gray-500">
                    Nama
                  </Label>
                  <p className="text-sm">{selectedCustomer.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    ID Customer
                  </Label>
                  <p className="text-sm font-mono">{selectedCustomer._id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Telepon
                  </Label>
                  <p className="text-sm">
                    {selectedCustomer.phone || "Tidak ada"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Email
                  </Label>
                  <p className="text-sm">
                    {selectedCustomer.email || "Tidak ada"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Alamat
                  </Label>
                  <p className="text-sm">
                    {selectedCustomer.address || "Tidak ada"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Branch Name
                  </Label>
                  <p className="text-sm">
                    {selectedBranch(selectedCustomer.current_branch_id!)
                      ?.name || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Total Orders
                  </Label>
                  <p className="text-sm">{selectedCustomer.total_orders}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Total Spent
                  </Label>
                  <p className="text-sm">
                    {formatCurrency(selectedCustomer.total_spent)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Total Deposit
                  </Label>
                  <p className="text-sm">
                    {formatCurrency(selectedCustomer.deposit_balance)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Member Since
                  </Label>
                  <p className="text-sm">
                    {new Date(selectedCustomer.createdAt).toLocaleDateString(
                      "id-ID"
                    )}
                  </p>
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
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={selectedCustomer.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Telepon</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  defaultValue={selectedCustomer.phone || ""}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={selectedCustomer.email || ""}
                />
              </div>
              <div>
                <Label htmlFor="edit-address">Alamat</Label>
                <Input
                  id="edit-address"
                  name="address"
                  defaultValue={selectedCustomer.address || ""}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
