"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { useBranch } from "@/contexts/branch-context";
import { getBranchList } from "@/lib/branch-data";
import { cn } from "@/lib/utils";
import { Branches } from "@/types/database";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Package,
  Settings,
  Shirt,
  ShoppingCart,
  Truck,
  User,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";

const navigation = (userProfile: any) => [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Services", href: "/dashboard/services", icon: Shirt },
  { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  { name: "Deliveries", href: "/dashboard/deliveries", icon: Truck },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  // Only show Staff menu for Owner role
  ...(userProfile?.role === "owner"
    ? [{ name: "Staff", href: "/dashboard/staff", icon: UserCheck }]
    : []),
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [branches, setBranches] = useState<Branches[]>([]);
  const pathname = usePathname();
  const { userProfile, loading: authLoading, signOut } = useAuth();
  const { currentBranchId, setCurrentBranchId } = useBranch();
  const fetchBranches = () => {
    getBranchList().then((data) => {
      if (data) setBranches(data);
    });
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (
      branches.length > 0 &&
      !currentBranchId &&
      userProfile?.role === "admin"
    ) {
      setCurrentBranchId(branches[0].id);
    }
  }, [branches, currentBranchId, setCurrentBranchId]);

  // Tampilkan loading jika data auth belum siap
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Jika tidak ada userProfile (belum login), bisa redirect atau tampilkan pesan
  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Sesi Anda telah berakhir. Silakan login kembali.</p>
        <Button
          onClick={() => (window.location.href = "/login")}
          className="ml-4"
        >
          Login
        </Button>
      </div>
    );
  }

  const getInitials = (name: string | undefined) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const selectedBranch = branches.find(
    (branch) => branch.id === currentBranchId
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div
          className={`fixed inset-0 z-50 flex ${
            sidebarOpen ? "block" : "hidden"
          }`}
        >
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="text-gray-300 hover:text-white"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <SidebarContent
              navItems={navigation(userProfile)}
              pathname={pathname}
              userProfile={userProfile}
            />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6">
          <SidebarContent
            navItems={navigation(userProfile)}
            pathname={pathname}
            userProfile={userProfile}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>

            {/* Page title */}
            <div className="flex-1 lg:flex-none">
              <h1 className="text-xl font-semibold text-gray-900">
                {navigation(userProfile).find((item) => item.href === pathname)
                  ?.name || "Dashboard"}
              </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <div>
                <Select
                  name="current_branch_id"
                  value={currentBranchId}
                  onValueChange={setCurrentBranchId}
                >
                  <SelectTrigger className="w-[170px]">
                    <SelectValue
                      placeholder="Select Branch"
                      children={
                        selectedBranch
                          ? `${selectedBranch.name} (${selectedBranch.type})`
                          : ""
                      }
                    />
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

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10 border-[1px] border-gray-200">
                      <AvatarImage src="/avatar.png" alt="Avatar" />
                      <AvatarFallback>
                        {getInitials(userProfile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userProfile?.full_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userProfile?.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userProfile?.role.charAt(0).toUpperCase() +
                          userProfile?.role.slice(1)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  navItems,
  pathname,
  userProfile,
}: {
  navItems: any[];
  pathname: string;
  userProfile: any;
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Shirt className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Monic Laundry</h1>
            <p className="text-sm text-gray-500">POS System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:text-blue-700 hover:bg-blue-50",
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                    )}
                  >
                    <item.icon
                      className={cn(
                        pathname === item.href
                          ? "text-blue-700"
                          : "text-gray-400 group-hover:text-blue-700",
                        "h-6 w-6 shrink-0"
                      )}
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </>
  );
}
