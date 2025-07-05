"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/config/axios";
import { Edit, Loader2, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";

interface ExpenseFormProps {
  onExpenseAdded: () => void;
  currentBranchId: string;
}

interface ExpenseCategory {
  _id: string;
  category: string;
}

const expenseCategories = [
  "Aqua",
  "Bensin Kurir",
  "Bensin Mobil",
  "Gas",
  "Kasbon",
  "Kebutuhan Laundry",
  "Lainnya",
  "Lembur",
  "Medis",
  "Traktir Karyawan",
  "Uang Training",
];

export function ExpenseForm({
  onExpenseAdded,
  currentBranchId,
}: ExpenseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [expensesCategory, setExpensesCategory] = useState<ExpenseCategory[]>();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const { toast } = useToast();

  const fetchExpensesCategory = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/expenses/category`);

      if (response.status === 200) {
        setExpensesCategory(response.data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: Number.parseFloat(formData.amount),
          current_branch_id: currentBranchId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Expense added successfully",
        });
        setFormData({
          category: "",
          amount: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
        });
        onExpenseAdded();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add expense",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySubmit = async () => {
    try {
      setIsLoading(true);

      const data = {
        category: categoryName,
      };

      const res = await api.post("/api/expenses/category", data);

      if (res.status === 201) {
        setCategoryName("");
        setIsAddDialogOpen(false);
        toast({
          title: "Successful",
          description: "Expense Category added successful",
        });
        fetchExpensesCategory();
        return;
      }

      setCategoryName("");
      setIsAddDialogOpen(false);
      toast({
        title: "Failed",
        description: "Expense Category added Failed",
      });
      return;
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryEdit = async () => {
    try {
      setIsLoading(true);
      if (!categoryId) {
        toast({
          title: "Failed",
          description: "Expense Category Id not found",
          variant: "destructive",
        });
        return;
      }

      const data = {
        category: categoryName,
      };

      const res = await api.put(`/api/expenses/category/${categoryId}`, data);

      if (res.status === 201) {
        setCategoryName("");
        setIsEditDialogOpen(false);
        toast({
          title: "Successful",
          description: "Expense Category updated successful",
        });
        fetchExpensesCategory();
        return;
      }

      setCategoryName("");
      setIsEditDialogOpen(false);
      toast({
        title: "Failed",
        description: "Expense Category updated Failed",
        variant: "destructive",
      });
      return;
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryDelete = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await api.delete(`/api/expenses/category/${id}`);

      if (res.status === 200) {
        toast({
          title: "Successful",
          description: "Expense Category delete successful",
        });
        fetchExpensesCategory();
        return;
      }

      toast({
        title: "Failed",
        description: "Expense Category updated Failed",
        variant: "destructive",
      });
      return;
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      const category = expensesCategory?.filter((c) => c._id === categoryId);
      setCategoryName(category![0].category);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchExpensesCategory();
  }, []);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Add New Expense</CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus /> Add new category
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Jenis Pengeluaran</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori pengeluaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories &&
                      expensesCategory?.map((category) => (
                        <div className="flex gap-2 flex-col relative">
                          <SelectItem
                            key={category._id}
                            value={category.category}
                          >
                            <div className="flex flex-row justify-between items-center w-[400px]">
                              <div>{category.category}</div>
                            </div>
                          </SelectItem>
                          <div className="flex gap-2 justify-end w-full absolute top-[50%] -translate-y-2/4 right-[3%]">
                            <span
                              className="cursor-pointer"
                              onClick={() => {
                                setIsEditDialogOpen(true);
                                setCategoryId(category._id);
                              }}
                            >
                              <Edit size={14} />
                            </span>
                            <span
                              className="cursor-pointer"
                              onClick={() => handleCategoryDelete(category._id)}
                            >
                              <Trash size={14} />
                            </span>
                          </div>
                        </div>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Jumlah (Rp)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                  min="0"
                  step="1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Keterangan</Label>
                <Textarea
                  id="description"
                  placeholder="Masukkan keterangan..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  rows={3}
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Adding..." : "Add Expense"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* New Category adding form */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Customer Baru</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div>
              <Label htmlFor="category">Pengeluaran Jenis</Label>
              <Input
                id="category"
                name="category"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Batal
              </Button>
              <Button disabled={isLoading} onClick={handleCategorySubmit}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category form */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Customer Baru</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div>
              <Label htmlFor="category">Pengeluaran Jenis</Label>
              <Input
                id="category"
                name="category"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
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
              <Button disabled={isLoading} onClick={handleCategoryEdit}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
