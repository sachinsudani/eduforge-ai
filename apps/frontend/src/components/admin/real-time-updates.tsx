'use client'

import { useEffect, useState } from 'react'
import { socketManager } from '@/lib/socket'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Bell, Wifi, WifiOff } from 'lucide-react'

interface JobUpdate {
  id: string
  fileName: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  startedAt?: string
  completedAt?: string
  error?: string
}

interface SystemNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  timestamp: string
}

export function RealTimeUpdates() {
  const [isConnected, setIsConnected] = useState(false)
  const [jobUpdates, setJobUpdates] = useState<JobUpdate[]>([])
  const [notifications, setNotifications] = useState<SystemNotification[]>([])

  useEffect(() => {
    // Connect to socket
    socketManager.connect()

    // Listen for connection status
    const checkConnection = () => {
      setIsConnected(socketManager.isConnected())
    }

    checkConnection()
    const interval = setInterval(checkConnection, 5000)

    // Listen for job updates
    socketManager.on('job:update', (data: JobUpdate) => {
      setJobUpdates(prev => {
        const existing = prev.find(job => job.id === data.id)
        if (existing) {
          return prev.map(job => job.id === data.id ? data : job)
        }
        return [data, ...prev.slice(0, 9)] // Keep last 10 updates
      })
    })

    socketManager.on('job:completed', (data: JobUpdate) => {
      setJobUpdates(prev => {
        const existing = prev.find(job => job.id === data.id)
        if (existing) {
          return prev.map(job => job.id === data.id ? data : job)
        }
        return [data, ...prev.slice(0, 9)]
      })
    })

    socketManager.on('job:failed', (data: JobUpdate) => {
      setJobUpdates(prev => {
        const existing = prev.find(job => job.id === data.id)
        if (existing) {
          return prev.map(job => job.id === data.id ? data : job)
        }
        return [data, ...prev.slice(0, 9)]
      })
    })

    // Listen for system notifications
    socketManager.on('system:notification', (data: SystemNotification) => {
      setNotifications(prev => [data, ...prev.slice(0, 4)]) // Keep last 5 notifications
    })

    return () => {
      clearInterval(interval)
      socketManager.disconnect()
    }
  }, [])

  const getStatusBadge = (status: JobUpdate['status']) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      processing: 'secondary',
      queued: 'outline'
    } as const

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getNotificationIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'success':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />
      case 'warning':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />
      default:
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            Real-time Updates
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            {isConnected 
              ? 'Receiving live updates from the server'
              : 'Connection lost. Trying to reconnect...'
            }
          </p>
        </CardContent>
      </Card>

      {/* Recent Job Updates */}
      {jobUpdates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bell className="w-4 h-4" />
              Recent Job Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobUpdates.slice(0, 5).map((job) => (
                <div key={job.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {job.fileName}
                    </span>
                    {getStatusBadge(job.status)}
                  </div>
                  {job.status === 'processing' && (
                    <Progress value={job.progress} className="h-2" />
                  )}
                  <p className="text-xs text-muted-foreground">
                    {job.startedAt && `Started: ${new Date(job.startedAt).toLocaleTimeString()}`}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bell className="w-4 h-4" />
              System Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
