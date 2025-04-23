"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

type AnalyticsData = {
  issuesByType: { name: string; value: number }[]
  issuesByStatus: { name: string; value: number }[]
  issuesByMonth: { name: string; count: number }[]
}

export function DashboardAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/analytics")

        if (response.ok) {
          const analyticsData = await response.json()
          setData(analyticsData)
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Failed to load analytics data</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="text-muted-foreground">No data available</div>
        </CardContent>
      </Card>
    )
  }

  // Mock data for demonstration
  const mockData = {
    issuesByType: [
      { name: "Bug", value: 12 },
      { name: "Feature Request", value: 8 },
      { name: "Technical Issue", value: 15 },
      { name: "Customer Support", value: 7 },
      { name: "Documentation", value: 3 },
    ],
    issuesByStatus: [
      { name: "Open", value: 20 },
      { name: "In Progress", value: 15 },
      { name: "Completed", value: 10 },
    ],
    issuesByMonth: [
      { name: "Jan", count: 5 },
      { name: "Feb", count: 8 },
      { name: "Mar", count: 12 },
      { name: "Apr", count: 7 },
      { name: "May", count: 10 },
      { name: "Jun", count: 15 },
    ],
  }

  // Use mock data for now
  const displayData = mockData

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <CardDescription>Overview of your issues</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="types">
          <TabsList className="mb-4">
            <TabsTrigger value="types">By Type</TabsTrigger>
            <TabsTrigger value="status">By Status</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="types" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayData.issuesByType}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {displayData.issuesByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="status" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayData.issuesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {displayData.issuesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="timeline" className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayData.issuesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
