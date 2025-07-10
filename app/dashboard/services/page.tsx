"use client";

import DynamicPagination from "@/components/dynamicPagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import api from "@/lib/config/axios";
import { formatCurrency } from "@/lib/utils";
import type { AppDispatch, RootState } from "@/store";
import { fetchServices } from "@/store/ServiceSlice";
import { Branches, Service } from "@/types";
import {
  Download,
  Edit,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useSession } from "next-auth/react";
import type React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleExport, importServicesJSON } from "./actions";

export default function ServicesPage() {
  const { data: session } = useSession();
  const { currentBranchId } = useBranch();
  const [searchTerm, setSearchTerm] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { currentItems } = useSelector(
    (state: RootState) => state.paginationReducer
  );
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branches | null>(null);
  const [serviceType, setServiceType] = useState<string>("satuan");
  const [serviceForm, setServiceForm] = useState({
    category: "",
    servicename: "",
    price: "",
  });
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // JSON Import states
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { items: services, loading: serviceLoading } = useSelector(
    (state: RootState) => state.serviceReducer
  );
  const { items: branches } = useSelector(
    (state: RootState) => state.branchReducer
  );

  useEffect(() => {
    dispatch(fetchServices(currentBranchId));
  }, [currentBranchId]);

  useEffect(() => {
    if (currentBranchId && branches) {
      const branch = branches?.filter((b) => b._id === currentBranchId);
      setSelectedBranch(branch[0]);
    }
  }, [currentBranchId, branches]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      (file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel")
    ) {
      setExcelFile(file);
    } else {
      toast({
        title: "Error",
        description: "Please select a valid Excel file exe- .xlsx or .xls",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!excelFile) {
      toast({
        title: "Error",
        description: "Please select a Excel file first",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      const formData = new FormData();
      formData.append("excelFile", excelFile);

      const branch = branches?.filter((b) => b._id === currentBranchId);
      let secondBranch = null;
      let branchIds: string[] = [];

      if (branch) {
        secondBranch = branches?.filter(
          (b) => b.code.split("-")[0] === branch[0].code.split("-")[0]
        );
        branchIds.push(secondBranch![0]._id!);
        branchIds.push(secondBranch![1]._id!);
      }

      if (branchIds && branchIds.length < 2) {
        toast({
          title: "Import Failed",
          description: "Branch Ids not found",
          variant: "destructive",
        });
        return;
      }

      const result = await importServicesJSON(formData, branchIds!);

      if (result.success) {
        toast({
          title: "Import Success",
          description: `Successfully imported ${result?.count} services`,
        });
        dispatch(fetchServices(currentBranchId));
        setIsImportOpen(false);
        setExcelFile(null);
      } else {
        toast({
          title: "Import Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Import Error",
        description: "An error occurred during import",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const exportFile = async () => {
    try {
      setSubmitting(true);
      if (services && selectedBranch) {
        const result = await handleExport(services, selectedBranch);
        if (result.success) {
          const url = window.URL.createObjectURL(result.data!);
          const a = document.createElement("a");
          a.href = url;
          a.download = `services_${
            new Date().toISOString().split("T")[0]
          }.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);

          toast({
            title: "Successful",
            description: result.message,
          });
          return;
        }
        toast({
          title: "Failed",
          description: result.message,
          variant: "destructive",
        });
        return;
      } else {
        toast({
          title: "Failed",
          description: "Services and Branch not found",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setServiceForm({
      category: "",
      servicename: "",
      price: "",
    });
    setServiceType("");
    setSelectedBranchIds([]);
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedService(null);
  };

  const handleCheckedChange = (checked: boolean, id: string) => {
    setSelectedBranchIds((prev) =>
      checked ? [...prev, id] : prev.filter((val) => val !== id)
    );
  };

  const handleAddService = async () => {
    console.log(currentBranchId);
    const serviceData = {
      ...serviceForm,
      type: serviceType || "",
      current_branch_id:
        selectedBranchIds.length > 0 ? selectedBranchIds : [currentBranchId],
    };

    console.log(serviceData);

    try {
      setLoading(true);
      const res = await api.post("/api/services", serviceData);

      if (res.status === 201) {
        toast({
          title: "Successful",
          description: `Service create successful`,
        });
        reset();
        dispatch(fetchServices(currentBranchId));
      }
    } catch (err: any) {
      toast({
        title: "Failed",
        description: `${
          err.message || "Something went wrong create service!!"
        }`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditService = async () => {
    const serviceData = {
      ...serviceForm,
      type: serviceType || "",
      current_branch_id:
        selectedBranchIds.length > 0 ? selectedBranchIds : [currentBranchId],
    };

    try {
      setLoading(true);
      const res = await api.put(
        `/api/services/${selectedService?._id}`,
        serviceData
      );

      if (res.status === 201) {
        toast({
          title: "Successful",
          description: `Service updated successful`,
        });
        reset();
        dispatch(fetchServices(currentBranchId));
      }
    } catch (err: any) {
      toast({
        title: "Failed",
        description: `${
          err.message || "Something went wrong updating service!!"
        }`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.delete(`/api/services/${id}`);

      if (res.status === 200) {
        toast({
          title: "Successful",
          description: `Service Deleted successful`,
        });
        dispatch(fetchServices(currentBranchId));
      }
    } catch (err: any) {
      toast({
        title: "Failed",
        description: `${
          err.message || "Something went wrong deleting service!!"
        }`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedService) {
      setServiceForm({
        category: selectedService.category,
        servicename: selectedService.servicename,
        price: String(selectedService.price),
      });

      setServiceType(selectedService.type || "Satuan");

      // If it's a single branch ID:
      if (typeof selectedService.current_branch_id === "string") {
        setSelectedBranchIds([selectedService.current_branch_id]);
      }
      // If it's an array:
      else if (Array.isArray(selectedService.current_branch_id)) {
        setSelectedBranchIds(selectedService.current_branch_id);
      }
    }
  }, [selectedService]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-2 lg:items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Services Management
        </h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size={"sm"}
            onClick={exportFile}
            className="bg-blue-50 hover:bg-blue-100  w-full sm:w-auto"
            disabled={isSubmitting}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button
                size={"sm"}
                variant="outline"
                className="bg-green-50 hover:bg-green-100 w-full sm:w-auto"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Excel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Import Services Excel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="xlsxFile">Select Excel File</Label>
                  <Input
                    id="xlsxFile"
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    className="mt-1"
                  />
                </div>

                {excelFile && (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Selected: {excelFile.name} (
                      {(excelFile.size / 1024).toFixed(1)} KB)
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsImportOpen(false);
                      setExcelFile(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={!excelFile || isImporting}
                  >
                    {isImporting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Import
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size={"sm"}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                onClick={() => reset()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Service Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => e.preventDefault()} className="">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <Select value={serviceType} onValueChange={setServiceType}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Pilih type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Satuan">Satuan</SelectItem>
                        <SelectItem value="Kiloan">Kiloan</SelectItem>
                        <SelectItem value="Meter">Meter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label htmlFor="category">Category Service</Label>
                    <Input
                      id="category"
                      name="category"
                      value={serviceForm?.category}
                      onChange={(e) =>
                        setServiceForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label htmlFor="servicename">Service Name</Label>
                    <Input
                      id="servicename"
                      name="servicename"
                      value={serviceForm?.servicename}
                      onChange={(e) =>
                        setServiceForm((prev) => ({
                          ...prev,
                          servicename: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      type="number"
                      id="price"
                      name="price"
                      value={serviceForm?.price}
                      onChange={(e) =>
                        setServiceForm((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  {session?.user.role === "owner" && (
                    <div className="col-span-2 flex flex-col gap-2">
                      {branches &&
                        branches.map((branch) => (
                          <div
                            key={branch._id}
                            className="flex gap-2 items-center"
                          >
                            <Checkbox
                              id={branch._id}
                              checked={selectedBranchIds.includes(branch._id)}
                              onCheckedChange={(checked) =>
                                handleCheckedChange(!!checked, branch._id)
                              }
                            />
                            <Label htmlFor={branch._id} className="m-0">
                              {branch.name} - ({branch.type})
                            </Label>
                          </div>
                        ))}
                    </div>
                  )}
                  <div className="col-span-2 flex gap-2 items-center space-y-1">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      disabled={loading}
                    >
                      Batal
                    </Button>
                    <Button onClick={handleAddService} disabled={loading}>
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Simpan Layanan
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Services ({services?.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          {serviceLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Info</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services && currentItems.length > 0 ? (
                  currentItems.map((service, index) => (
                    <TableRow key={`${service.servicename}-${index}`}>
                      <TableCell>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {service.type}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {service.servicename}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{service.category}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(service.price)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedService(service);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(service._id)}
                            disabled={loading}
                          >
                            {loading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="text-center italic my-5" colSpan={5}>
                      No Service Data Found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {services && (
        <div key={currentBranchId} className="mt-5">
          <DynamicPagination data={services} />
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Layanan</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => e.preventDefault()} className="">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Pilih type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Satuan">Satuan</SelectItem>
                    <SelectItem value="Kiloan">Kiloan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label htmlFor="category">Category Service</Label>
                <Input
                  id="category"
                  name="category"
                  value={serviceForm?.category}
                  onChange={(e) =>
                    setServiceForm((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label htmlFor="servicename">Service Name</Label>
                <Input
                  id="servicename"
                  name="servicename"
                  value={serviceForm?.servicename}
                  onChange={(e) =>
                    setServiceForm((prev) => ({
                      ...prev,
                      servicename: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label htmlFor="price">Price</Label>
                <Input
                  type="number"
                  id="price"
                  name="price"
                  value={serviceForm?.price}
                  onChange={(e) =>
                    setServiceForm((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              {session?.user.role === "owner" && (
                <div className="col-span-2 flex flex-col gap-2">
                  {branches &&
                    branches.map((branch) => (
                      <div key={branch._id} className="flex gap-2 items-center">
                        <Checkbox
                          id={branch._id}
                          checked={selectedBranchIds.includes(branch._id)}
                          onCheckedChange={(checked) =>
                            handleCheckedChange(!!checked, branch._id)
                          }
                        />
                        <Label htmlFor={branch._id} className="m-0">
                          {branch.name} - ({branch.type})
                        </Label>
                      </div>
                    ))}
                </div>
              )}
              <div className="col-span-2 flex gap-2 items-center space-y-1">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button onClick={handleEditService} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Layanan
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
