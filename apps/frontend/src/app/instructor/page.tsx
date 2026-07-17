'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Upload, 
  FileText, 
  Users, 
  TrendingUp,
  Plus,
  Eye,
  MessageSquare
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import Link from 'next/link'

export default function InstructorDashboard() {
  const { data: analytics } = useQuery({
    queryKey: ['instructor-analytics'],
    queryFn: () => apiClient.getAnalytics(),
  })

  const { data: chunks } = useQuery({
    queryKey: ['instructor-chunks'],
    queryFn: () => apiClient.getSubtitleChunks(),
  })

  const stats = [
    {
      title: 'Total Files',
      value: new Set(chunks?.map((chunk) => chunk.fileKey)).size,
      icon: FileText,
      description: 'Uploaded subtitle files',
    },
    {
      title: 'Total Chunks',
      value: chunks?.length || 0,
      icon: TrendingUp,
      description: 'Processed text chunks',
    },
    {
      title: 'Student Views',
      value: analytics?.totalQueries || 0,
      icon: Users,
      description: 'Student interactions',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your educational content and track student engagement
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
              Common tasks for managing your content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/instructor/upload">
              <Button className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                Upload New File
              </Button>
            </Link>
            <Link href="/instructor/content">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Eye className="h-4 w-4" />
                View My Content
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and student interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {analytics.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent activity to display
              </p>
            )}
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
