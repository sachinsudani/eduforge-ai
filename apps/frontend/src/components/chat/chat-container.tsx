'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ChatMessage, apiClient } from '@/lib/api'
import { Loader2, MessageSquare } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'
import { ChatHistory } from './chat-history'
import { ChatInput } from './chat-input'

function formatTimestamp(ms: number) {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const updateMessage = (id: string, patch: Partial<ChatMessage> | ((m: ChatMessage) => Partial<ChatMessage>)) => {
    setMessages(prev =>
      prev.map(m => (m.id === id ? { ...m, ...(typeof patch === 'function' ? patch(m) : patch) } : m))
    )
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return

    const history = messages
      .filter(m => m.content)
      .slice(-6)
      .map(m => ({ role: m.role, content: m.content }))

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content,
      timestamp: new Date(),
    }
    const assistantId = `${Date.now()}-assistant`
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setIsStreaming(true)

    try {
      await apiClient.askQuestionStream(content, history, {
        onSources: (sources) => updateMessage(assistantId, { sources }),
        onDelta: (text) => updateMessage(assistantId, (m) => ({ content: m.content + text })),
      })
    } catch (error) {
      console.error('Failed to get answer:', error)
      updateMessage(assistantId, {
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        sources: undefined,
      })
      toast.error('Failed to get answer. Please try again.')
    } finally {
      setIsStreaming(false)
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
                      {message.role === 'assistant' ? (
                        message.content ? (
                          <div className="text-sm space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_code]:bg-background/60 [&_code]:px-1 [&_code]:rounded">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 py-1">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">
                              {message.sources ? 'Generating answer…' : 'Searching course content…'}
                            </span>
                          </div>
                        )
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-1">Sources:</p>
                          {message.sources.map((source, index) => (
                            <div key={index} className="text-xs text-muted-foreground">
                              <span className="font-medium">[{index + 1}]</span> {source.text.substring(0, 100)}...
                              {source.startMs !== undefined && (
                                <span className="ml-2">
                                  ({formatTimestamp(source.startMs)}–{formatTimestamp(source.endMs)})
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
              <div ref={bottomRef} />
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
