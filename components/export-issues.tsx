"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

type Issue = {
  id: number
  issue_title: string
  type_name?: string
  time_issued: string
  description: string
  solution: string | null
  time_start: string | null
  time_finish: string | null
  creator_username: string
  assignee_username: string | null
}

interface ExportIssuesProps {
  issues: Issue[]
}

export function ExportIssues({ issues }: ExportIssuesProps) {
  const [isExporting, setIsExporting] = useState(false)

  function exportToCsv() {
    setIsExporting(true)

    try {
      // Define CSV headers
      const headers = [
        "ID",
        "Title",
        "Type",
        "Status",
        "Created By",
        "Assigned To",
        "Time Issued",
        "Time Started",
        "Time Finished",
        "Description",
        "Solution",
      ]

      // Convert issues to CSV rows
      const rows = issues.map((issue) => {
        let status = "Open"
        if (issue.time_finish) status = "Completed"
        else if (issue.time_start) status = "In Progress"

        return [
          issue.id,
          issue.issue_title,
          issue.type_name || "None",
          status,
          issue.creator_username,
          issue.assignee_username || "Unassigned",
          new Date(issue.time_issued).toLocaleString(),
          issue.time_start ? new Date(issue.time_start).toLocaleString() : "",
          issue.time_finish ? new Date(issue.time_finish).toLocaleString() : "",
          issue.description.replace(/"/g, '""'), // Escape quotes
          issue.solution ? issue.solution.replace(/"/g, '""') : "", // Escape quotes
        ]
      })

      // Convert to CSV string
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row
            .map((cell) =>
              typeof cell === "string" && (cell.includes(",") || cell.includes("\n") || cell.includes('"'))
                ? `"${cell}"`
                : cell,
            )
            .join(","),
        ),
      ].join("\n")

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `issues-export-${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Failed to export issues:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={exportToCsv}
      disabled={isExporting || issues.length === 0}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      {isExporting ? "Exporting..." : "Export to CSV"}
    </Button>
  )
}
