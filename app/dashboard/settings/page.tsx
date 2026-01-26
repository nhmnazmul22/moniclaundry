"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBranch } from "@/contexts/branch-context";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/config/axios";
import { AppDispatch, RootState } from "@/store";
import { fetchBranches } from "@/store/BranchSlice";
import { Branches, BusinessSetting } from "@/types";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function SettingsPage() {
  const { currentBranchId } = useBranch();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<BusinessSetting>();
  const [branch, setBranch] = useState<Branches>();

  const { items } = useSelector((state: RootState) => state.branchReducer);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      if (!currentBranchId) return;

      const res = await api.get(`/api/setting?branch_id=${currentBranchId}`);
      if (res.status === 200) {
        setSettings(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Only allow Owner to access this page
  if (session?.user && session?.user?.role !== "owner") {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertTriangle className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900">Akses Ditolak</h2>
        <p className="text-gray-600 text-center">
          Halaman ini hanya dapat diakses oleh Owner.
        </p>
        <Button onClick={() => window.history.back()} variant="outline">
          Kembali
        </Button>
      </div>
    );
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedSetting = { ...settings };
      delete updatedSetting.createdAt;
      delete updatedSetting.updatedAt;
      if (!currentBranchId) return;

      const res = await api.put(
        `/api/setting?branch_id=${currentBranchId}`,
        updatedSetting
      );
      if (res.status === 200) {
        toast({
          title: "Sukses",
          description: `Pengaturan berhasil disimpan.`,
        });
        fetchSettings();
        return;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal menyimpan pengaturan: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof BusinessSetting, value: any) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
  };

  useEffect(() => {
    if (currentBranchId) {
      fetchSettings();
    }
  }, [currentBranchId]);

  useEffect(() => {
    if (currentBranchId) {
      const branch = items?.find((b) => b._id === currentBranchId);
      setBranch(branch);
    }
  }, [currentBranchId, items]);

  if (loading && !settings) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p>Memuat detail settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500 text-lg">
          {error || "Settings tidak ditemukan"}
        </p>
        <Link href="/dashboard/settings">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Settings
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold ">Pengaturan</h1>
        {branch && (
          <p className="text-md md:text-lg">
            {branch?.name} -{" "}
            {branch?.type[0].toUpperCase() + branch?.type.slice(1)}
          </p>
        )}
      </div>

      <Tabs defaultValue="business">
        <TabsList className="mb-6">
          <TabsTrigger value="business">Bisnis</TabsTrigger>
          <TabsTrigger value="receipt">Receipt</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Bisnis</CardTitle>
              <CardDescription>
                Pengaturan informasi dasar bisnis Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nama Bisnis</Label>
                  <Input
                    id="businessName"
                    value={settings?.business_name}
                    onChange={(e) =>
                      updateSetting("business_name", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Nomor Telepon</Label>
                  <Input
                    id="businessPhone"
                    value={settings?.business_phone}
                    onChange={(e) =>
                      updateSetting("business_phone", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Email Bisnis</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={settings?.business_email}
                    onChange={(e) =>
                      updateSetting("business_email", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessWebsite">Website</Label>
                  <Input
                    id="businessWebsite"
                    value={settings?.business_website}
                    onChange={(e) =>
                      updateSetting("business_website", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessAddress">Alamat Bisnis</Label>
                <Input
                  id="businessAddress"
                  value={settings?.business_address}
                  onChange={(e) =>
                    updateSetting("business_address", e.target.value)
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave()} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Perubahan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipt">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Struk</CardTitle>
              <CardDescription>Kustomisasi struk dan nota</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="original_receipt">
                <TabsList>
                  <TabsTrigger value="original_receipt">
                    Original Receipt
                  </TabsTrigger>
                  {/* <TabsTrigger value="payment_receipt">
                    Payment Receipt
                  </TabsTrigger> */}
                  <TabsTrigger value="internal_print">
                    Internal Receipt
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="original_receipt">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="original_receipt_customer_service">
                        Customer Service
                      </Label>
                      <Input
                        id="original_receipt_customer_service"
                        value={settings?.original_receipt_customer_service}
                        onChange={(e) =>
                          updateSetting(
                            "original_receipt_customer_service",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="original_receipt_terms_condition_1">
                        Receipt Condition 1
                      </Label>
                      <Input
                        id="original_receipt_terms_condition_1"
                        value={settings?.original_receipt_terms_condition_1}
                        onChange={(e) =>
                          updateSetting(
                            "original_receipt_terms_condition_1",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="original_receipt_terms_condition_2">
                        Receipt Condition 2
                      </Label>
                      <Input
                        id="original_receipt_terms_condition_2"
                        value={settings?.original_receipt_terms_condition_2}
                        onChange={(e) =>
                          updateSetting(
                            "original_receipt_terms_condition_2",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="original_receipt_hashtag">
                        Receipt Hashtags
                      </Label>
                      <Input
                        id="original_receipt_hashtag"
                        value={settings?.original_receipt_hashtag}
                        onChange={(e) =>
                          updateSetting(
                            "original_receipt_hashtag",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="flex flex-wrap justify-start gap-5 items-center">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="showLogo"
                          checked={settings?.original_receipt_show_logo}
                          onCheckedChange={(checked) =>
                            updateSetting("original_receipt_show_logo", checked)
                          }
                        />
                        <Label htmlFor="showLogo">Tampilkan Logo</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="original_receipt_show_qr"
                          checked={settings?.original_receipt_show_qr}
                          onCheckedChange={(checked) =>
                            updateSetting("original_receipt_show_qr", checked)
                          }
                        />
                        <Label htmlFor="original_receipt_show_qr">
                          Tampilkan QR
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="original_show_estimated_completion"
                          checked={settings?.original_show_estimated_completion}
                          onCheckedChange={(checked) =>
                            updateSetting(
                              "original_show_estimated_completion",
                              checked
                            )
                          }
                        />
                        <Label htmlFor="original_show_estimated_completion">
                          Tampilkan Estimate Completion
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="original_show_customer_deposit"
                          checked={settings?.original_show_customer_deposit}
                          onCheckedChange={(checked) =>
                            updateSetting(
                              "original_show_customer_deposit",
                              checked
                            )
                          }
                        />
                        <Label htmlFor="original_show_customer_deposit">
                          Tampilkan Customer Deposit
                        </Label>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={() => handleSave()} disabled={loading}>
                        {loading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Simpan Perubahan
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                {/* <TabsContent value="payment_receipt">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="payment_receipt_header">
                        Header Struk
                      </Label>
                      <Input
                        id="payment_receipt_header"
                        value={settings?.payment_receipt_header}
                        onChange={(e) =>
                          updateSetting(
                            "payment_receipt_header",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment_receipt_customer_service">
                        Customer Service
                      </Label>
                      <Input
                        id="payment_receipt_customer_service"
                        value={settings?.payment_receipt_customer_service}
                        onChange={(e) =>
                          updateSetting(
                            "payment_receipt_customer_service",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment_receipt_terms_condition_1">
                        Receipt Condition 1
                      </Label>
                      <Input
                        id="payment_receipt_terms_condition_1"
                        value={settings?.payment_receipt_terms_condition_1}
                        onChange={(e) =>
                          updateSetting(
                            "payment_receipt_terms_condition_1",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment_receipt_terms_condition_2">
                        Receipt Condition 2
                      </Label>
                      <Input
                        id="payment_receipt_terms_condition_2"
                        value={settings?.payment_receipt_terms_condition_2}
                        onChange={(e) =>
                          updateSetting(
                            "payment_receipt_terms_condition_2",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment_receipt_hashtag">
                        Receipt Hashtags
                      </Label>
                      <Input
                        id="payment_receipt_hashtag"
                        value={settings?.payment_receipt_hashtag}
                        onChange={(e) =>
                          updateSetting(
                            "payment_receipt_hashtag",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="flex flex-wrap justify-start gap-5 items-center">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="payment_receipt_show_logo"
                          checked={settings?.payment_receipt_show_logo}
                          onCheckedChange={(checked) =>
                            updateSetting("payment_receipt_show_logo", checked)
                          }
                        />
                        <Label htmlFor="payment_receipt_show_logo">
                          Tampilkan Logo
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="payment_receipt_show_transaction_details"
                          checked={
                            settings?.payment_receipt_show_transaction_details
                          }
                          onCheckedChange={(checked) =>
                            updateSetting(
                              "payment_receipt_show_transaction_details",
                              checked
                            )
                          }
                        />
                        <Label htmlFor="payment_receipt_show_transaction_details">
                          Tampilkan Transaction Details
                        </Label>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={() => handleSave()} disabled={loading}>
                        {loading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Simpan Perubahan
                      </Button>
                    </div>
                  </div>
                </TabsContent> */}
                <TabsContent value="internal_print">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="internal_print_header">
                        Header Struk
                      </Label>
                      <Input
                        id="internal_print_header"
                        value={settings?.internal_print_header}
                        onChange={(e) =>
                          updateSetting("internal_print_header", e.target.value)
                        }
                      />
                    </div>

                    <div className="flex flex-wrap justify-start gap-5 items-center">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="internal_print_show_logo"
                          checked={settings?.internal_print_show_logo}
                          onCheckedChange={(checked) =>
                            updateSetting("internal_print_show_logo", checked)
                          }
                        />
                        <Label htmlFor="internal_print_show_logo">
                          Tampilkan Logo
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="internal_show_estimated_completion"
                          checked={settings?.internal_show_estimated_completion}
                          onCheckedChange={(checked) =>
                            updateSetting(
                              "internal_show_estimated_completion",
                              checked
                            )
                          }
                        />
                        <Label htmlFor="internal_show_estimated_completion">
                          Tampilkan Estimate Completion
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="internal_show_customer_deposit"
                          checked={settings?.internal_show_customer_deposit}
                          onCheckedChange={(checked) =>
                            updateSetting(
                              "internal_show_customer_deposit",
                              checked
                            )
                          }
                        />
                        <Label htmlFor="internal_show_customer_deposit">
                          Tampilkan Customer Deposit
                        </Label>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={() => handleSave()} disabled={loading}>
                        {loading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Simpan Perubahan
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
