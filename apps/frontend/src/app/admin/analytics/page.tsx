'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  FileText,
  Clock,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  totalQueries: number
  totalUsers: number
  totalFiles: number
  avgResponseTime: number
  popularQueries: Array<{
    query: string
    count: number
    percentage: number
  }>
  dailyQueries: Array<{
    date: string
    count: number
  }>
  userActivity: Array<{
    hour: number
    activeUsers: number
  }>
}

const mockAnalytics: AnalyticsData = {
  totalQueries: 8901,
  totalUsers: 1234,
  totalFiles: 567,
  avgResponseTime: 2.3,
  popularQueries: [
    { query: "What is machine learning?", count: 156, percentage: 23 },
    { query: "Explain neural networks", count: 134, percentage: 19 },
    { query: "How does deep learning work?", count: 98, percentage: 14 },
    { query: "What are the types of ML?", count: 87, percentage: 12 },
    { query: "Explain supervised learning", count: 76, percentage: 11 }
  ],
  dailyQueries: [
    { date: '2024-01-10', count: 245 },
    { date: '2024-01-11', count: 312 },
    { date: '2024-01-12', count: 289 },
    { date: '2024-01-13', count: 356 },
    { date: '2024-01-14', count: 423 },
    { date: '2024-01-15', count: 398 },
    { date: '2024-01-16', count: 467 }
  ],
  userActivity: [
    { hour: 0, activeUsers: 12 },
    { hour: 1, activeUsers: 8 },
    { hour: 2, activeUsers: 5 },
    { hour: 3, activeUsers: 3 },
    { hour: 4, activeUsers: 2 },
    { hour: 5, activeUsers: 4 },
    { hour: 6, activeUsers: 15 },
    { hour: 7, activeUsers: 45 },
    { hour: 8, activeUsers: 89 },
    { hour: 9, activeUsers: 156 },
    { hour: 10, activeUsers: 234 },
    { hour: 11, activeUsers: 198 },
    { hour: 12, activeUsers: 167 },
    { hour: 13, activeUsers: 189 },
    { hour: 14, activeUsers: 245 },
    { hour: 15, activeUsers: 267 },
    { hour: 16, activeUsers: 289 },
    { hour: 17, activeUsers: 234 },
    { hour: 18, activeUsers: 198 },
    { hour: 19, activeUsers: 167 },
    { hour: 20, activeUsers: 145 },
    { hour: 21, activeUsers: 123 },
    { hour: 22, activeUsers: 89 },
    { hour: 23, activeUsers: 45 }
  ]
}

export default function AnalyticsPage() {
  const maxActivity = Math.max(...mockAnalytics.userActivity.map(h => h.activeUsers))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Platform usage statistics and insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.totalQueries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +23% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.totalFiles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.avgResponseTime}s</div>
            <p className="text-xs text-muted-foreground">
              -15% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Queries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Popular Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalytics.popularQueries.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate flex-1">
                      {item.query}
                    </span>
                    <Badge variant="outline">{item.count}</Badge>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.percentage}% of total queries
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Activity by Hour */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              User Activity (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-48 space-x-1">
              {mockAnalytics.userActivity.map((hour, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary rounded-t transition-all"
                    style={{
                      height: `${(hour.activeUsers / maxActivity) * 100}%`,
                      minHeight: '4px'
                    }}
                  />
                  <span className="text-xs text-muted-foreground mt-1">
                    {hour.hour}:00
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Peak activity: {Math.max(...mockAnalytics.userActivity.map(h => h.activeUsers))} users at 15:00
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Queries Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Daily Query Volume (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-48 space-x-2">
            {mockAnalytics.dailyQueries.map((day, index) => {
              const maxQueries = Math.max(...mockAnalytics.dailyQueries.map(d => d.count))
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary rounded-t transition-all"
                    style={{
                      height: `${(day.count / maxQueries) * 100}%`,
                      minHeight: '4px'
                    }}
                  />
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-xs font-medium mt-1">
                    {day.count}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
