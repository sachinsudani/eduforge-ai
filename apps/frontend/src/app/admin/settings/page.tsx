'use client'

import { useState } from 'react'
import { Settings, Save, Database, Shield, Bell, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface PlatformSettings {
  platformName: string
  maxFileSize: number
  allowedFileTypes: string[]
  maxConcurrentJobs: number
  enableEmailNotifications: boolean
  enableRealTimeUpdates: boolean
  maintenanceMode: boolean
  apiRateLimit: number
  sessionTimeout: number
}

const defaultSettings: PlatformSettings = {
  platformName: 'EduForge AI',
  maxFileSize: 50, // MB
  allowedFileTypes: ['vtt', 'srt'],
  maxConcurrentJobs: 10,
  enableEmailNotifications: true,
  enableRealTimeUpdates: true,
  maintenanceMode: false,
  apiRateLimit: 100, // requests per minute
  sessionTimeout: 24 // hours
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    // Show success message
  }

  const updateSetting = <K extends keyof PlatformSettings>(
    key: K,
    value: PlatformSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">
            Configure platform behavior and preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Platform Name</label>
              <Input
                value={settings.platformName}
                onChange={(e) => updateSetting('platformName', e.target.value)}
                placeholder="Enter platform name"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Max File Size (MB)</label>
              <Input
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => updateSetting('maxFileSize', parseInt(e.target.value))}
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Allowed File Types</label>
              <div className="flex gap-2 mt-2">
                {settings.allowedFileTypes.map((type) => (
                  <Badge key={type} variant="outline" className="uppercase">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Max Concurrent Jobs</label>
              <Input
                type="number"
                value={settings.maxConcurrentJobs}
                onChange={(e) => updateSetting('maxConcurrentJobs', parseInt(e.target.value))}
                min="1"
                max="50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security & Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">API Rate Limit (requests/min)</label>
              <Input
                type="number"
                value={settings.apiRateLimit}
                onChange={(e) => updateSetting('apiRateLimit', parseInt(e.target.value))}
                min="10"
                max="1000"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Session Timeout (hours)</label>
              <Input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                min="1"
                max="168"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Maintenance Mode</label>
                <p className="text-xs text-muted-foreground">
                  Temporarily disable platform access
                </p>
              </div>
              <Button
                variant={settings.maintenanceMode ? "destructive" : "outline"}
                size="sm"
                onClick={() => updateSetting('maintenanceMode', !settings.maintenanceMode)}
              >
                {settings.maintenanceMode ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Email Notifications</label>
                <p className="text-xs text-muted-foreground">
                  Send email alerts for system events
                </p>
              </div>
              <Button
                variant={settings.enableEmailNotifications ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting('enableEmailNotifications', !settings.enableEmailNotifications)}
              >
                {settings.enableEmailNotifications ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Real-time Updates</label>
                <p className="text-xs text-muted-foreground">
                  Enable WebSocket connections for live updates
                </p>
              </div>
              <Button
                variant={settings.enableRealTimeUpdates ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting('enableRealTimeUpdates', !settings.enableRealTimeUpdates)}
              >
                {settings.enableRealTimeUpdates ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="default">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Redis Cache</span>
                <Badge variant="default">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pinecone Vector DB</span>
                <Badge variant="default">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">OpenAI API</span>
                <Badge variant="default">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Processing Queue</span>
                <Badge variant="secondary">3 Active Jobs</Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">System Health</span>
                <Badge variant="default">Healthy</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All systems operational
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
