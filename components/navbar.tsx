"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { ChevronDown, LogOut, UserCog, ClipboardList, Home } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout, isAdmin } = useAuth()

  // Skip rendering navbar on login and register pages
  if (pathname === "/login" || pathname === "/register") {
    return null
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            Issue Tracker
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium ${
                pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              New Issue
            </Link>
            <Link
              href="/dashboard"
              className={`text-sm font-medium ${
                pathname === "/dashboard" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dashboard
            </Link>
            {isAdmin() && (
              <Link
                href="/admin/users"
                className={`text-sm font-medium ${
                  pathname === "/admin/users" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                User Management
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  {user.username}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/" className="flex items-center gap-2 cursor-pointer">
                    <Home className="h-4 w-4" />
                    <span>New Issue</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <ClipboardList className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin() && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users" className="flex items-center gap-2 cursor-pointer">
                      <UserCog className="h-4 w-4" />
                      <span>User Management</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500"
                  onClick={() => logout()}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
