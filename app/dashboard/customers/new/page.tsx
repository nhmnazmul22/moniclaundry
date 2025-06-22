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
import { useToast } from "@/components/ui/use-toast";
import { getBranchList } from "@/lib/branch-data";
import { supabase } from "@/lib/supabase/client";
import { Branches } from "@/types/database";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewCustomerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branches[]>([]);
  const [branchId, setBranchId] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitCustomer = async () => {
    if (!name || !phone) {
      toast({
        title: "Error",
        description: "Nama dan Nomor Telepon harus diisi.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);

    const customerData = {
      name,
      phone,
      email: email || null,
      address: address || null,
      current_branch_id: branchId || null,
      // Default values for loyalty_points, total_orders, total_spent will be set by DB or triggers if any
    };

    const { data: newCustomer, error } = await supabase
      .from("customers")
      .insert(customerData)
      .select()
      .single();

    if (error || !newCustomer) {
      toast({
        title: "Error",
        description: `Gagal menambah pelanggan: ${
          error?.message || "Unknown error"
        }`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sukses",
        description: `Pelanggan ${newCustomer.name} berhasil ditambahkan.`,
      });
      const redirectUrl = searchParams.get("redirect");
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push("/dashboard/customers");
      }
    }
    setIsSubmitting(false);
  };

  const fetchBranches = () => {
    getBranchList().then((data) => {
      if (data) setBranches(data);
    });
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Tambah Pelanggan Baru</CardTitle>
          <CardDescription>
            Isi detail informasi pelanggan baru.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Nama Lengkap *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Nomor Telepon *</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="081234567890"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email (Opsional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@example.com"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="address">Alamat (Opsional)</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Merdeka No. 123"
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
            onClick={handleSubmitCustomer}
            disabled={isSubmitting || !name || !phone}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Pelanggan
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
