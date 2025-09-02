'use client'

import { format } from 'date-fns'
import { MessageSquare, Clock, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Array<{
    id: string
    text: string
    startMs: number
    endMs: number
    videoId?: string
    fileKey: string
    score: number
  }>
}

export function ChatMessage({ role, content, timestamp, sources }: ChatMessageProps) {
  const isUser = role === 'user'

  const formatTimestamp = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleTimestampClick = (startMs: number, videoId?: string) => {
    // This would typically open the video at the specific timestamp
    // For now, we'll just log the action
    console.log(`Opening video ${videoId || 'unknown'} at ${formatTimestamp(startMs)}`)
    
    // Example implementation for YouTube-like URLs:
    // if (videoId) {
    //   window.open(`https://youtube.com/watch?v=${videoId}&t=${Math.floor(startMs / 1000)}`, '_blank')
    // }
  }

  return (
    <div className={cn(
      'flex gap-3 mb-4',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'flex gap-3 max-w-[80%]',
        isUser && 'flex-row-reverse'
      )}>
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary text-secondary-foreground'
        )}>
          {isUser ? 'U' : <MessageSquare className="w-4 h-4" />}
        </div>
        
        <Card className={cn(
          'flex-1',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-card'
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {format(timestamp, 'HH:mm')}
            </div>
            
            <div className="whitespace-pre-wrap">{content}</div>
            
            {sources && sources.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Sources:
                </div>
                {sources.map((source, index) => (
                  <div key={source.id} className="p-3 bg-muted rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        Score: {(source.score * 100).toFixed(1)}%
                      </Badge>
                      <button
                        onClick={() => handleTimestampClick(source.startMs, source.videoId)}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {formatTimestamp(source.startMs)} - {formatTimestamp(source.endMs)}
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {source.text.length > 150 
                        ? `${source.text.substring(0, 150)}...` 
                        : source.text
                      }
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
