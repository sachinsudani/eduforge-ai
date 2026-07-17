'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ChatMessage, apiClient } from '@/lib/api'
import { Bot, ChevronRight, Clock, Loader2, MessageSquare, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'
import { ChatHistory, Conversation } from './chat-history'
import { ChatInput } from './chat-input'

const STORAGE_KEY = 'eduforge-conversations'

function formatTimestamp(ms: number) {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export function ChatContainer() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const active = conversations.find(c => c.id === activeId) ?? null
  const messages = active?.messages ?? []

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        if (Array.isArray(data.conversations)) setConversations(data.conversations)
        if (typeof data.activeId === 'string') setActiveId(data.activeId)
      }
    } catch {
      // corrupted storage — start fresh
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ conversations, activeId }))
    }
  }, [conversations, activeId, loaded])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversations, activeId])

  const updateMessage = (
    convId: string,
    messageId: string,
    patch: Partial<ChatMessage> | ((m: ChatMessage) => Partial<ChatMessage>)
  ) => {
    setConversations(prev =>
      prev.map(c =>
        c.id === convId
          ? {
              ...c,
              messages: c.messages.map(m =>
                m.id === messageId ? { ...m, ...(typeof patch === 'function' ? patch(m) : patch) } : m
              ),
            }
          : c
      )
    )
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return

    const history = messages
      .filter(m => m.content)
      .slice(-6)
      .map(m => ({ role: m.role, content: m.content }))

    const now = Date.now()
    const userMessage: ChatMessage = {
      id: `${now}-user`,
      role: 'user',
      content,
      timestamp: new Date(),
    }
    const assistantId = `${now}-assistant`
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }

    let convId = activeId
    if (!convId || !conversations.some(c => c.id === convId)) {
      convId = `conv-${now}`
      const conversation: Conversation = {
        id: convId,
        title: content.length > 60 ? `${content.slice(0, 60)}…` : content,
        messages: [userMessage, assistantMessage],
        updatedAt: new Date().toISOString(),
      }
      setConversations(prev => [conversation, ...prev])
      setActiveId(convId)
    } else {
      setConversations(prev =>
        prev.map(c =>
          c.id === convId
            ? { ...c, messages: [...c.messages, userMessage, assistantMessage], updatedAt: new Date().toISOString() }
            : c
        )
      )
    }

    setIsStreaming(true)
    try {
      await apiClient.askQuestionStream(content, history, {
        onSources: (sources) => updateMessage(convId!, assistantId, { sources }),
        onDelta: (text) => updateMessage(convId!, assistantId, (m) => ({ content: m.content + text })),
      })
    } catch (error) {
      console.error('Failed to get answer:', error)
      updateMessage(convId!, assistantId, {
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        sources: undefined,
      })
      toast.error('Failed to get answer. Please try again.')
    } finally {
      setIsStreaming(false)
    }
  }

  const handleNewChat = () => setActiveId(null)

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id))
    if (activeId === id) setActiveId(null)
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Conversations Sidebar */}
      <div className="w-72 flex-shrink-0 hidden md:block">
        <ChatHistory
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNewChat={handleNewChat}
          onDelete={handleDeleteConversation}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <MessageSquare className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Welcome to EduForge AI</h3>
                  <p className="text-sm max-w-md">
                    Ask me anything about your course content. Answers come with sources and video timestamps.
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isUser = message.role === 'user'
                  return (
                    <div key={message.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted border'
                        }`}
                      >
                        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className="max-w-[78%] min-w-0">
                        <div
                          className={`rounded-2xl px-4 py-2.5 ${
                            isUser
                              ? 'bg-primary text-primary-foreground rounded-tr-sm'
                              : 'bg-muted rounded-tl-sm'
                          }`}
                        >
                          {isUser ? (
                            <p className="text-sm">{message.content}</p>
                          ) : message.content ? (
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
                          )}
                        </div>

                        {!isUser && message.content && message.sources && message.sources.length > 0 && (
                          <details className="group mt-1.5 ml-1">
                            <summary className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer select-none hover:text-foreground w-fit list-none [&::-webkit-details-marker]:hidden">
                              <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
                              {message.sources.length} source{message.sources.length > 1 ? 's' : ''}
                            </summary>
                            <div className="mt-2 space-y-1.5">
                              {message.sources.map((source, index) => (
                                <div
                                  key={index}
                                  className="rounded-lg border bg-background px-3 py-2 text-xs"
                                >
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="font-semibold text-primary">#{index + 1}</span>
                                    {source.startMs !== undefined && (
                                      <span className="flex items-center gap-1 text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                                        <Clock className="h-3 w-3" />
                                        {formatTimestamp(source.startMs)}–{formatTimestamp(source.endMs)}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-muted-foreground line-clamp-2">{source.text}</p>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    </div>
                  )
                })
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
