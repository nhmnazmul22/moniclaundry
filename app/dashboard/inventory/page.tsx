"use client";

import { Badge } from "@/components/ui/badge";
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
import { getBranchList } from "@/lib/branch-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Branches } from "@/types";
import {
  AlertTriangle,
  Edit,
  Eye,
  Package,
  Plus,
  Search,
  Settings,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  cost_per_unit: number;
  selling_price: number;
  supplier: string;
  last_restock: string;
  expiry_date?: string;
  created_at: string;
}

export default function InventoryPage() {
  const { currentBranchId } = useBranch();
  const [branches, setBranches] = useState<Branches[]>([]);
  const [branchId, setBranchId] = useState<string>("");

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] =
    useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    fetchInventory();
    fetchCategories();
  }, []);

  const fetchInventory = async (search?: string) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (currentBranchId) params.append("branchId", currentBranchId);

      const response = await fetch(`/api/inventory?${params}`);
      const result = await response.json();

      if (response.ok) {
        setInventory(result.data || []);
      } else {
        console.error("Error fetching inventory:", result.error);
        toast({
          title: "Error",
          description: "Failed to fetch inventory data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const result = await response.json();

      if (response.ok) {
        setCategories(result.data || []);
        if (result.message) {
          console.log(result.message);
        }
      } else {
        console.error("Error fetching categories:", result.error);
        // Don't show error toast if it's just that the table doesn't exist
        if (!result.error?.includes("table not found")) {
          toast({
            title: "Warning",
            description:
              "Categories table not found. Please run database migration.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBranches = () => {
    getBranchList().then((data) => {
      if (data) setBranches(data);
    });
  };

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchInventory(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentBranchId]);

  useEffect(() => {
    fetchBranches();
  }, []);

  const lowStockItems = inventory.filter(
    (item) => item.current_stock <= item.min_stock
  );
  const totalValue = inventory.reduce(
    (sum, item) => sum + item.current_stock * item.cost_per_unit,
    0
  );
  const totalItems = inventory.reduce(
    (sum, item) => sum + item.current_stock,
    0
  );

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock <= item.min_stock) return "low";
    if (item.current_stock >= item.max_stock * 0.8) return "high";
    return "normal";
  };

  const getStockStatusColor = (status: string) => {
    const colors = {
      low: "bg-red-100 text-red-800",
      normal: "bg-green-100 text-green-800",
      high: "bg-blue-100 text-blue-800",
    };
    return colors[status as keyof typeof colors];
  };

  const handleViewItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const handleAddItem = async (formData: FormData) => {
    try {
      const itemData = {
        item_name: formData.get("itemName") as string,
        category: formData.get("category") as string,
        current_stock: Number(formData.get("currentStock")),
        min_stock: Number(formData.get("minStock")),
        max_stock: Number(formData.get("maxStock")),
        unit: formData.get("unit") as string,
        cost_per_unit: Number(formData.get("costPerUnit")),
        selling_price: Number(formData.get("sellingPrice")),
        supplier: formData.get("supplier") as string,
        expiry_date: (formData.get("expiryDate") as string) || null,
        current_branch_id: branchId || null,
      };

      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });

      const result = await response.json();

      if (response.ok) {
        setInventory([result.data, ...inventory]);
        setIsAddDialogOpen(false);
        toast({
          title: "Success",
          description: "Item added successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add item",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = async (formData: FormData) => {
    if (!selectedItem) return;

    try {
      const itemData = {
        item_name: formData.get("itemName") as string,
        category: formData.get("category") as string,
        current_stock: Number(formData.get("currentStock")),
        min_stock: Number(formData.get("minStock")),
        max_stock: Number(formData.get("maxStock")),
        unit: formData.get("unit") as string,
        cost_per_unit: Number(formData.get("costPerUnit")),
        selling_price: Number(formData.get("sellingPrice")),
        supplier: formData.get("supplier") as string,
        expiry_date: (formData.get("expiryDate") as string) || null,
      };

      const response = await fetch(`/api/inventory/${selectedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });

      const result = await response.json();

      if (response.ok) {
        setInventory(
          inventory.map((item) =>
            item.id === selectedItem.id ? result.data : item
          )
        );
        setIsEditDialogOpen(false);
        setSelectedItem(null);
        toast({
          title: "Success",
          description: "Item updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update item",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Yakin ingin menghapus item ini?")) return;

    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setInventory(inventory.filter((item) => item.id !== id));
        toast({
          title: "Success",
          description: "Item deleted successfully",
        });
      } else {
        const result = await response.json();
        toast({
          title: "Error",
          description: result.error || "Failed to delete item",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleAddCategory = async (formData: FormData) => {
    try {
      const categoryData = {
        name: formData.get("categoryName") as string,
        description: (formData.get("categoryDescription") as string) || "",
      };

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });

      const result = await response.json();

      if (response.ok) {
        setCategories([...categories, result.data]);
        setIsAddCategoryDialogOpen(false);
        toast({
          title: "Success",
          description: "Category added successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add category",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = async (formData: FormData) => {
    if (!selectedCategory) return;

    try {
      const categoryData = {
        name: formData.get("categoryName") as string,
        description: (formData.get("categoryDescription") as string) || "",
        oldName: selectedCategory.name, // For updating inventory items
      };

      const response = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });

      const result = await response.json();

      if (response.ok) {
        setCategories(
          categories.map((cat) =>
            cat.id === selectedCategory.id ? result.data : cat
          )
        );
        setIsEditCategoryDialogOpen(false);
        setSelectedCategory(null);
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
        // Refresh inventory to update category names
        fetchInventory();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update category",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCategories(categories.filter((cat) => cat.id !== id));
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
        // Refresh inventory to handle items with deleted categories
        fetchInventory();
      } else {
        const result = await response.json();
        toast({
          title: "Error",
          description: result.error || "Failed to delete category",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Kelola stok barang dan supplies laundry
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Item Baru</DialogTitle>
            </DialogHeader>
            <form action={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="itemName">Nama Item</Label>
                  <Input id="itemName" name="itemName" required />
                </div>
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currentStock">Stok Saat Ini</Label>
                  <Input
                    id="currentStock"
                    name="currentStock"
                    type="number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="minStock">Stok Minimum</Label>
                  <Input id="minStock" name="minStock" type="number" required />
                </div>
                <div>
                  <Label htmlFor="maxStock">Stok Maksimum</Label>
                  <Input id="maxStock" name="maxStock" type="number" required />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    name="unit"
                    placeholder="pcs, kg, liter"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="costPerUnit">Harga Beli</Label>
                  <Input
                    id="costPerUnit"
                    name="costPerUnit"
                    type="number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sellingPrice">Harga Jual</Label>
                  <Input
                    id="sellingPrice"
                    name="sellingPrice"
                    type="number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input id="supplier" name="supplier" required />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Tanggal Kadaluarsa</Label>
                  <Input id="expiryDate" name="expiryDate" type="date" />
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
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {inventory.length} jenis item
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">Nilai inventory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {lowStockItems.length}
            </div>
            <p className="text-xs text-muted-foreground">Perlu restock</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setIsCategoryDialogOpen(true)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Kelola kategori</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Peringatan Stok Rendah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <span className="text-red-700">
                    {item.item_name} - Stok: {item.current_stock} {item.unit}
                  </span>
                  <Button size="sm" variant="outline">
                    Restock
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama item, kategori, atau supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Inventory ({inventory.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Info</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Last Restock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => {
                const status = getStockStatus(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.item_name}</div>
                        <div className="text-sm text-gray-500">
                          Min: {item.min_stock} | Max: {item.max_stock}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.category || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">
                          {item.current_stock} {item.unit}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          Beli: {formatCurrency(item.cost_per_unit)}
                        </div>
                        <div className="text-sm">
                          Jual: {formatCurrency(item.selling_price)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(item.current_stock * item.cost_per_unit)}
                    </TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>{formatDate(item.last_restock)}</TableCell>
                    <TableCell>
                      <Badge className={getStockStatusColor(status)}>
                        {status === "low"
                          ? "LOW STOCK"
                          : status === "high"
                          ? "HIGH STOCK"
                          : "NORMAL"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewItem(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Item Inventory</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Nama Item
                  </Label>
                  <p className="text-sm">{selectedItem.item_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Kategori
                  </Label>
                  <p className="text-sm">
                    {selectedItem.category || "Uncategorized"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Stok Saat Ini
                  </Label>
                  <p className="text-sm">
                    {selectedItem.current_stock} {selectedItem.unit}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Stok Min/Max
                  </Label>
                  <p className="text-sm">
                    {selectedItem.min_stock} / {selectedItem.max_stock}{" "}
                    {selectedItem.unit}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Harga Beli
                  </Label>
                  <p className="text-sm">
                    {formatCurrency(selectedItem.cost_per_unit)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Harga Jual
                  </Label>
                  <p className="text-sm">
                    {formatCurrency(selectedItem.selling_price)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Total Value
                  </Label>
                  <p className="text-sm">
                    {formatCurrency(
                      selectedItem.current_stock * selectedItem.cost_per_unit
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Supplier
                  </Label>
                  <p className="text-sm">{selectedItem.supplier}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Last Restock
                  </Label>
                  <p className="text-sm">
                    {formatDate(selectedItem.last_restock)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Expiry Date
                  </Label>
                  <p className="text-sm">
                    {selectedItem.expiry_date
                      ? formatDate(selectedItem.expiry_date)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Status
                  </Label>
                  <Badge
                    className={getStockStatusColor(
                      getStockStatus(selectedItem)
                    )}
                  >
                    {getStockStatus(selectedItem) === "low"
                      ? "LOW STOCK"
                      : getStockStatus(selectedItem) === "high"
                      ? "HIGH STOCK"
                      : "NORMAL"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <form action={handleEditItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-itemName">Nama Item</Label>
                  <Input
                    id="edit-itemName"
                    name="itemName"
                    defaultValue={selectedItem.item_name}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Kategori</Label>
                  <Select
                    name="category"
                    defaultValue={selectedItem.category}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-currentStock">Stok Saat Ini</Label>
                  <Input
                    id="edit-currentStock"
                    name="currentStock"
                    type="number"
                    defaultValue={selectedItem.current_stock}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-minStock">Stok Minimum</Label>
                  <Input
                    id="edit-minStock"
                    name="minStock"
                    type="number"
                    defaultValue={selectedItem.min_stock}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-maxStock">Stok Maksimum</Label>
                  <Input
                    id="edit-maxStock"
                    name="maxStock"
                    type="number"
                    defaultValue={selectedItem.max_stock}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Input
                    id="edit-unit"
                    name="unit"
                    defaultValue={selectedItem.unit}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-costPerUnit">Harga Beli</Label>
                  <Input
                    id="edit-costPerUnit"
                    name="costPerUnit"
                    type="number"
                    defaultValue={selectedItem.cost_per_unit}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-sellingPrice">Harga Jual</Label>
                  <Input
                    id="edit-sellingPrice"
                    name="sellingPrice"
                    type="number"
                    defaultValue={selectedItem.selling_price}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-supplier">Supplier</Label>
                  <Input
                    id="edit-supplier"
                    name="supplier"
                    defaultValue={selectedItem.supplier}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-expiryDate">Tanggal Kadaluarsa</Label>
                  <Input
                    id="edit-expiryDate"
                    name="expiryDate"
                    type="date"
                    defaultValue={selectedItem.expiry_date || ""}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedItem(null);
                  }}
                >
                  Batal
                </Button>
                <Button type="submit">Update</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Category Management Dialog */}
      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Kelola Kategori
              <Dialog
                open={isAddCategoryDialogOpen}
                onOpenChange={setIsAddCategoryDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Kategori
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Kategori Baru</DialogTitle>
                  </DialogHeader>
                  <form action={handleAddCategory} className="space-y-4">
                    <div>
                      <Label htmlFor="categoryName">Nama Kategori</Label>
                      <Input id="categoryName" name="categoryName" required />
                    </div>
                    <div>
                      <Label htmlFor="categoryDescription">
                        Deskripsi (Opsional)
                      </Label>
                      <Input
                        id="categoryDescription"
                        name="categoryDescription"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddCategoryDialogOpen(false)}
                      >
                        Batal
                      </Button>
                      <Button type="submit">Simpan</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Kategori yang tersedia:
            </div>
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="font-medium">{category.name}</div>
                  {category.description && (
                    <div className="text-sm text-gray-500">
                      {category.description}
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    {
                      inventory.filter(
                        (item) => item.category === category.name
                      ).length
                    }{" "}
                    items
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsEditCategoryDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog
        open={isEditCategoryDialogOpen}
        onOpenChange={setIsEditCategoryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kategori</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <form action={handleEditCategory} className="space-y-4">
              <div>
                <Label htmlFor="edit-categoryName">Nama Kategori</Label>
                <Input
                  id="edit-categoryName"
                  name="categoryName"
                  defaultValue={selectedCategory.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-categoryDescription">
                  Deskripsi (Opsional)
                </Label>
                <Input
                  id="edit-categoryDescription"
                  name="categoryDescription"
                  defaultValue={selectedCategory.description || ""}
                />
              </div>
              <div className="text-sm text-gray-600">
                Mengubah kategori ini akan mempengaruhi{" "}
                {
                  inventory.filter(
                    (item) => item.category === selectedCategory.name
                  ).length
                }{" "}
                item inventory.
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditCategoryDialogOpen(false);
                    setSelectedCategory(null);
                  }}
                >
                  Batal
                </Button>
                <Button type="submit">Update</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
