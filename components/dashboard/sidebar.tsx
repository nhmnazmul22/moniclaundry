"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context"; // Import useAuth
import { cn } from "@/lib/utils";
import {
  BarChart3,
  CreditCard,
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  Shirt,
  ShoppingCart,
  Truck,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type SidebarProps = {};

const navigation: any = {
  owner: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
    { name: "Services", href: "/dashboard/services", icon: Shirt },
    { name: "Inventory", href: "/dashboard/inventory", icon: Package },
    { name: "Deliveries", href: "/dashboard/deliveries", icon: Truck },
    { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Staff", href: "/dashboard/staff", icon: UserCheck },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
  admin: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
    { name: "Inventory", href: "/dashboard/inventory", icon: Package },
    { name: "Deliveries", href: "/dashboard/deliveries", icon: Truck },
    { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
    { name: "Reports", href: "/dashboard/reports", icon: FileText },
  ],
  kurir: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Deliveries", href: "/dashboard/my-deliveries", icon: Truck },
    { name: "Route Map", href: "/dashboard/route-map", icon: LayoutDashboard },
  ],
};

export function Sidebar({}: SidebarProps) {
  // Removed userRole prop
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { userProfile } = useAuth(); // Get user profile from auth context

  const userRole = userProfile?.role || "kurir"; // Default to kurir if no role found
  const navItems = navigation[userRole] || [];

  return (
    <>
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div
          className="fixed inset-0 z-50 flex"
          style={{ display: sidebarOpen ? "flex" : "none" }}
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
            <SidebarContent navItems={navItems} pathname={pathname} />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6">
          <SidebarContent navItems={navItems} pathname={pathname} />
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
}

function SidebarContent({
  navItems,
  pathname,
}: {
  navItems: any[];
  pathname: string;
}) {
  return (
    <>
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
