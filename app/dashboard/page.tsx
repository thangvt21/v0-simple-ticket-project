import type { Metadata } from "next"
import Link from "next/link"
import IssuesDashboard from "@/components/issues-dashboard"

export const metadata: Metadata = {
  title: "Issues Dashboard",
  description: "Manage all issues in the system",
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Issues Dashboard</h1>
        <Link href="/" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
          Add New Issue
        </Link>
      </div>
      <IssuesDashboard />
    </div>
  )
}
