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
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

interface BusinessSettings {
  business_name: string;
  business_phone: string;
  business_email: string;
  business_website: string;
  business_address: string;
  tax_rate: number;
  tax_enabled: boolean;
  invoice_prefix: string;
  currency: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  auto_backup: boolean;
  backup_frequency: string;
  receipt_header: string;
  receipt_footer: string;
  additional_info: string;
  show_logo: boolean;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter()
  const [settings, setSettings] = useState<BusinessSettings>({
    business_name: "Monic Laundry Galaxy",
    business_phone: "+6287710108075",
    business_email: "contact@moniclaundry.com",
    business_website: "www.moniclaundry.com",
    business_address: "Jl. Taman Galaxy Raya No 301 E",
    tax_rate: 11,
    tax_enabled: true,
    invoice_prefix: "ML",
    currency: "IDR",
    email_notifications: true,
    sms_notifications: false,
    auto_backup: true,
    backup_frequency: "daily",
    receipt_header: "Monic Laundry Galaxy - Bersih, Wangi, Rapi",
    receipt_footer: "Terima kasih telah menggunakan jasa kami!",
    additional_info: "CS: +6287710108075",
    show_logo: true,
  });

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

  const handleSave = async (category: string) => {
    setLoading(true);
    try {
      // In a real app, you would save to database
      // For now, we'll just show success message
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast({
        title: "Sukses",
        description: `Pengaturan ${category} berhasil disimpan.`,
      });
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

  const updateSetting = (key: keyof BusinessSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Pengaturan</h1>

      <Tabs defaultValue="business">
        <TabsList className="mb-6">
          <TabsTrigger value="business">Bisnis</TabsTrigger>
          <TabsTrigger value="financial">Keuangan</TabsTrigger>
          <TabsTrigger value="system">Sistem</TabsTrigger>
          <TabsTrigger value="receipt">Struk</TabsTrigger>
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
                    value={settings.business_name}
                    onChange={(e) =>
                      updateSetting("business_name", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Nomor Telepon</Label>
                  <Input
                    id="businessPhone"
                    value={settings.business_phone}
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
                    value={settings.business_email}
                    onChange={(e) =>
                      updateSetting("business_email", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessWebsite">Website</Label>
                  <Input
                    id="businessWebsite"
                    value={settings.business_website}
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
                  value={settings.business_address}
                  onChange={(e) =>
                    updateSetting("business_address", e.target.value)
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("bisnis")} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Perubahan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Keuangan</CardTitle>
              <CardDescription>Konfigurasi pajak dan mata uang</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Mata Uang</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => updateSetting("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">Rp (Rupiah)</SelectItem>
                      <SelectItem value="USD">$ (Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tarif Pajak (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={settings.tax_rate}
                    onChange={(e) =>
                      updateSetting("tax_rate", Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="taxEnabled"
                  checked={settings.tax_enabled}
                  onCheckedChange={(checked) =>
                    updateSetting("tax_enabled", checked)
                  }
                />
                <Label htmlFor="taxEnabled">Aktifkan Pajak</Label>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="invoicePrefix">Prefix Nomor Invoice</Label>
                <Input
                  id="invoicePrefix"
                  value={settings.invoice_prefix}
                  onChange={(e) =>
                    updateSetting("invoice_prefix", e.target.value)
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave("keuangan")}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Perubahan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Sistem</CardTitle>
              <CardDescription>
                Konfigurasi notifikasi dan backup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notifikasi</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailNotifications"
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) =>
                      updateSetting("email_notifications", checked)
                    }
                  />
                  <Label htmlFor="emailNotifications">Notifikasi Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="smsNotifications"
                    checked={settings.sms_notifications}
                    onCheckedChange={(checked) =>
                      updateSetting("sms_notifications", checked)
                    }
                  />
                  <Label htmlFor="smsNotifications">Notifikasi SMS</Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Backup Data</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoBackup"
                    checked={settings.auto_backup}
                    onCheckedChange={(checked) =>
                      updateSetting("auto_backup", checked)
                    }
                  />
                  <Label htmlFor="autoBackup">Backup Otomatis</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Frekuensi Backup</Label>
                  <Select
                    value={settings.backup_frequency}
                    onValueChange={(value) =>
                      updateSetting("backup_frequency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Harian</SelectItem>
                      <SelectItem value="weekly">Mingguan</SelectItem>
                      <SelectItem value="monthly">Bulanan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("sistem")} disabled={loading}>
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
              <div className="space-y-2">
                <Label htmlFor="receiptHeader">Header Struk</Label>
                <Input
                  id="receiptHeader"
                  value={settings.receipt_header}
                  onChange={(e) =>
                    updateSetting("receipt_header", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiptFooter">Footer Struk</Label>
                <Input
                  id="receiptFooter"
                  value={settings.receipt_footer}
                  onChange={(e) =>
                    updateSetting("receipt_footer", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Informasi Tambahan</Label>
                <Input
                  id="additionalInfo"
                  value={settings.additional_info}
                  onChange={(e) =>
                    updateSetting("additional_info", e.target.value)
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showLogo"
                  checked={settings.show_logo}
                  onCheckedChange={(checked) =>
                    updateSetting("show_logo", checked)
                  }
                />
                <Label htmlFor="showLogo">Tampilkan Logo</Label>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("struk")} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Perubahan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
