"use client";

import DynamicPagination from "@/components/dynamicPagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBranch } from "@/contexts/branch-context";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import type { AppDispatch, RootState } from "@/store";
import { fetchBranches } from "@/store/BranchSlice";
import { fetchServices } from "@/store/ServiceSlice";
import { Download, FileText, Loader2, Search, Upload } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { importServicesJSON } from "./actions";

export default function ServicesPage() {
  const { currentBranchId } = useBranch();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { currentItems } = useSelector(
    (state: RootState) => state.paginationReducer
  );

  // JSON Import states
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { items: services, loading: serviceLoading } = useSelector(
    (state: RootState) => state.serviceReducer
  );

  useEffect(() => {
    dispatch(fetchServices(currentBranchId));
  }, [currentBranchId]);

  useEffect(() => {
    dispatch(fetchBranches());
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      setJsonFile(file);
    } else {
      toast({
        title: "Error",
        description: "Please select a valid JSON file",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!jsonFile) {
      toast({
        title: "Error",
        description: "Please select a JSON file first",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      const formData = new FormData();
      formData.append("jsonFile", jsonFile);
      const result = await importServicesJSON(formData, currentBranchId);

      if (result.success) {
        toast({
          title: "Import Success",
          description: `Successfully imported ${result.count} services`,
        });
        dispatch(fetchServices(currentBranchId));
        setIsImportOpen(false);
        setJsonFile(null);
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

  const handleExport = async () => {
    try {
      if (services?.services) {
        const blob = new Blob([JSON.stringify(services, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `services_${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast({
          title: "Export Success",
          description: `Exported services`,
        });
      } else {
        toast({
          title: "Export Failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Export Error",
        description: "An error occurred during export",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Services Management
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            className="bg-blue-50 hover:bg-blue-100"
          >
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>

          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-green-50 hover:bg-green-100"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import JSON
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Import Services JSON</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="jsonFile">Select JSON File</Label>
                  <Input
                    id="jsonFile"
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="mt-1"
                  />
                </div>

                {jsonFile && (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Selected: {jsonFile.name} (
                      {(jsonFile.size / 1024).toFixed(1)} KB)
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsImportOpen(false);
                      setJsonFile(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={!jsonFile || isImporting}
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
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Services (
            {Array.isArray(services?.services) && services?.services?.length})
          </CardTitle>
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
                  <TableHead>Price/kg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services && currentItems.length > 0 ? (
                  currentItems.map((service, index) => (
                    <TableRow key={`${service.servicename}-${index}`}>
                      <TableCell>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          Satuan
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
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="text-center italic my-5" colSpan={4}>
                      No Service Data Found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {services?.services && (
        <div key={currentBranchId} className="mt-5">
          <DynamicPagination
            data={Array.isArray(services?.services) ? services?.services : []}
          />
        </div>
      )}
    </div>
  );
}
