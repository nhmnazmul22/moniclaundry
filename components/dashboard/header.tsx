"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, LogOut, Settings, User } from "lucide-react"
import Link from "next/link" // Import Link from next/link
import type { User as AppUser } from "@/types/database"

interface HeaderProps {
  user: AppUser
}

export function Header({ user }: HeaderProps) {
  const { signOut } = useAuth()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      owner: "Owner",
      admin: "Admin",
      kurir: "Kurir",
    }
    return labels[role as keyof typeof labels] || role
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">Welcome, {user.full_name}!</h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || ""} alt={user.full_name} />
                  <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">{getRoleLabel(user.role)}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Correct way to use Link with DropdownMenuItem */}
              <Link href="/dashboard/profile" passHref legacyBehavior>
                <DropdownMenuItem asChild>
                  <Button variant="ghost" className="w-full justify-start cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Button>
                </DropdownMenuItem>
              </Link>
              <Link href="/dashboard/settings" passHref legacyBehavior>
                <DropdownMenuItem asChild>
                  <Button variant="ghost" className="w-full justify-start cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Button>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
