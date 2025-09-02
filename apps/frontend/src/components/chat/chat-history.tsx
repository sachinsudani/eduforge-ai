'use client'

import { ChatMessage } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ChatHistoryProps {
  messages: ChatMessage[]
  onClear: () => void
}

export function ChatHistory({ messages, onClear }: ChatHistoryProps) {
  const userMessages = messages.filter(msg => msg.role === 'user')

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chat History</CardTitle>
          {userMessages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto">
          {userMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No questions yet</p>
              <p className="text-xs">Start asking questions to see your history here</p>
            </div>
          ) : (
            userMessages.map((message) => (
              <div
                key={message.id}
                className="p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
              >
                <p className="text-sm font-medium line-clamp-2">
                  {message.content}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
