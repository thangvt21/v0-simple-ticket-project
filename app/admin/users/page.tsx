import type { Metadata } from "next"
import UserManagement from "@/components/user-management"

export const metadata: Metadata = {
  title: "User Management - Issue Tracker",
  description: "Manage users in the system",
}

export default function UserManagementPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <UserManagement />
    </div>
  )
}
