'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  FileText, 
  BarChart3, 
  Upload,
  MessageSquare,
  Plus,
  Eye,
  Settings
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import { RealTimeUpdates } from '@/components/admin/real-time-updates'

export default function AdminDashboard() {
  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => apiClient.getAnalytics(),
  })

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.getUsers(),
  })

  const stats = [
    {
      title: 'Total Users',
      value: users?.length || 0,
      icon: Users,
      description: 'Registered users',
    },
    {
      title: 'Total Files',
      value: analytics?.totalFiles || 0,
      icon: FileText,
      description: 'Uploaded subtitle files',
    },
    {
      title: 'Total Queries',
      value: analytics?.totalQueries || 0,
      icon: BarChart3,
      description: 'Student questions asked',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your educational platform and monitor activity
          </p>
        </div>
        <Link href="/">
          <Button className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Open Chat Interface
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/admin/upload">
              <Button className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                Upload Files
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/content">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Eye className="h-4 w-4" />
                View Content
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest platform updates and user interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RealTimeUpdates />
          </CardContent>
        </Card>
      </div>

      {/* Popular Queries */}
      {analytics?.popularQueries && analytics.popularQueries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Popular Student Queries</CardTitle>
            <CardDescription>
              Most asked questions by students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.popularQueries.slice(0, 5).map((query, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <p className="text-sm font-medium">{query.query}</p>
                  <span className="text-xs text-muted-foreground">
                    {query.count} times
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
