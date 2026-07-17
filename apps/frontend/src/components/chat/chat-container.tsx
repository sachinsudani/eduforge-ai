'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChatMessage, apiClient } from '@/lib/api'
import { ChatInput } from './chat-input'
import { ChatHistory } from './chat-history'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

export function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const queryClient = useQueryClient()

  const askQuestionMutation = useMutation({
    mutationFn: (query: string) => apiClient.askQuestion(query),
    onSuccess: (data) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        sources: data.sources
      }
      setMessages(prev => [...prev, newMessage])
      setIsStreaming(false)
    },
    onError: (error: any) => {
      console.error('Failed to get answer:', error)
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      setIsStreaming(false)
      toast.error('Failed to get answer. Please try again.')
    }
  })

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsStreaming(true)

    try {
      await askQuestionMutation.mutateAsync(content)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const clearHistory = () => {
    setMessages([])
    toast.success('Chat history cleared')
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Chat History Sidebar */}
      <div className="w-80 flex-shrink-0">
        <ChatHistory messages={messages} onClear={clearHistory} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Welcome to EduForge AI</h3>
                  <p className="text-sm max-w-md">
                    Ask me anything about your educational content. I&apos;ll help you find answers with relevant sources and timestamps.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-1">Sources:</p>
                          {message.sources.map((source, index) => (
                            <div key={index} className="text-xs text-muted-foreground">
                              <span className="font-medium">[{index + 1}]</span> {source.text.substring(0, 100)}...
                              {source.startMs && (
                                <span className="ml-2">
                                  ({Math.floor(source.startMs / 1000)}s)
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              
              {isStreaming && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
              <ChatInput onSendMessage={handleSendMessage} disabled={isStreaming} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
