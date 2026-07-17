'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChatMessage } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Plus, Trash2 } from 'lucide-react'

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  updatedAt: string
}

interface ChatHistoryProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewChat: () => void
  onDelete: (id: string) => void
}

export function ChatHistory({ conversations, activeId, onSelect, onNewChat, onDelete }: ChatHistoryProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chats</CardTitle>
          <Button variant="outline" size="sm" onClick={onNewChat} className="gap-1">
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-2 flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs">Ask your first question to start one</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelect(conversation.id)}
                className={`group flex items-start gap-2 p-2.5 rounded-lg transition-colors cursor-pointer ${
                  conversation.id === activeId ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2">{conversation.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(conversation.id)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
