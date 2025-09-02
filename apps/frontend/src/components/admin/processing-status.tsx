'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { RefreshCw, Clock, CheckCircle, AlertCircle, Play } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'

export function ProcessingStatus() {
  const { data: jobs, isLoading, error, refetch } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => apiClient.getJobs(),
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'active':
        return <Play className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading jobs...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load processing jobs</p>
            <Button onClick={() => refetch()} variant="outline" className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeJobs = jobs?.filter(job => job.status === 'active' || job.status === 'waiting') || []
  const completedJobs = jobs?.filter(job => job.status === 'completed') || []
  const failedJobs = jobs?.filter(job => job.status === 'failed') || []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Processing Status</CardTitle>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Active Jobs */}
          {activeJobs.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Active Jobs ({activeJobs.length})</h3>
              <div className="space-y-3">
                {activeJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <span className="font-medium text-sm">{job.fileKey}</span>
                      </div>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Started {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Completed Jobs */}
          {completedJobs.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Recently Completed ({completedJobs.length})</h3>
              <div className="space-y-2">
                {completedJobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <span className="text-sm">{job.fileKey}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(job.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Failed Jobs */}
          {failedJobs.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3 text-red-600">Failed Jobs ({failedJobs.length})</h3>
              <div className="space-y-2">
                {failedJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-2 border border-red-200 rounded bg-red-50 dark:bg-red-950">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <span className="text-sm">{job.fileKey}</span>
                    </div>
                    <span className="text-xs text-red-600">
                      {job.error || 'Unknown error'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Jobs */}
          {jobs?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <p>No processing jobs found</p>
              <p className="text-sm">Upload a subtitle file to see processing status</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
