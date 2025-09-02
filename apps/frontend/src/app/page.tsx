'use client'

import { useAuth } from '@/contexts/auth-context'
import { ChatContainer } from '@/components/chat/chat-container'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LoginForm } from '@/components/auth/login-form'
import { SignupForm } from '@/components/auth/signup-form'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HomePage() {
  const { user, loading, isAuthenticated, logout } = useAuth()
  const [showSignup, setShowSignup] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              EduForge AI
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              AI-powered educational platform with intelligent question answering
            </p>
          </div>
          
          {showSignup ? <SignupForm /> : <LoginForm />}
          
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setShowSignup(!showSignup)}
              className="text-blue-600 hover:text-blue-500"
            >
              {showSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">EduForge AI</h1>
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.firstName} {user?.lastName}
            </span>
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full capitalize">
              {user?.role}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {user?.role === 'admin' && (
              <Link href="/admin">
                <Button variant="outline">Admin Dashboard</Button>
              </Link>
            )}
            {user?.role === 'instructor' && (
              <Link href="/instructor">
                <Button variant="outline">Instructor Panel</Button>
              </Link>
            )}
            <ThemeToggle />
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <ChatContainer />
      </main>
    </div>
  )
}
