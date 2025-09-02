'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, apiClient } from '@/lib/api'

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<User>
    signup: (data: any) => Promise<User>
    logout: () => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('accessToken')
            if (token) {
                const userData = await apiClient.getCurrentUser()
                setUser(userData)
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            localStorage.removeItem('accessToken')
        } finally {
            setLoading(false)
        }
    }

    const login = async (email: string, password: string): Promise<User> => {
        try {
            const response = await apiClient.login({ email, password })
            localStorage.setItem('accessToken', response.accessToken)
            const userData = await apiClient.getCurrentUser()
            setUser(userData)
            return userData
        } catch (error) {
            console.error('Login failed:', error)
            throw error
        }
    }

    const signup = async (data: any): Promise<User> => {
        try {
            const response = await apiClient.signup(data)
            localStorage.setItem('accessToken', response.accessToken)
            const userData = await apiClient.getCurrentUser()
            setUser(userData)
            return userData
        } catch (error) {
            console.error('Signup failed:', error)
            throw error
        }
    }

    const logout = () => {
        localStorage.removeItem('accessToken')
        setUser(null)
    }

    const value = {
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
