const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export interface ChatMessage {
    id: string
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

export interface AskResponse {
    answer: string
    sources: Array<{
        id: string
        text: string
        startMs: number
        endMs: number
        videoId?: string
        fileKey: string
        score: number
    }>
}

export interface User {
    _id: string
    email: string
    firstName: string
    lastName: string
    role: 'student' | 'instructor' | 'admin'
    headline?: string
    avatarUrl?: string
    createdAt: Date
    updatedAt: Date
}

export interface AuthResponse {
    accessToken: string
}

export interface SignupRequest {
    email: string
    firstName: string
    lastName: string
    password: string
    role: 'student' | 'instructor' | 'admin'
    headline?: string
    avatarUrl?: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface UploadResponse {
    queued: boolean
    fileKey: string
}

export interface ProcessingJob {
    id: string
    fileKey: string
    status: 'waiting' | 'active' | 'completed' | 'failed'
    progress: number
    error?: string
    createdAt: Date
    updatedAt: Date
}

export interface SubtitleChunk {
    id: string
    fileKey: string
    text: string
    startMs: number
    endMs: number
    contentId?: string
    createdAt: Date
}

export interface AnalyticsData {
    totalUsers: number
    totalFiles: number
    totalQueries: number
    popularQueries: Array<{
        query: string
        count: number
    }>
    recentActivity: Array<{
        type: string
        description: string
        timestamp: Date
    }>
}

class ApiClient {
    private getAuthHeaders(): Record<string, string> {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
        return token ? { Authorization: `Bearer ${token}` } : {}
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE}${endpoint}`
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders(),
                ...options.headers,
            },
            ...options,
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`API request failed: ${response.status} - ${errorText}`)
        }

        return response.json()
    }

    // Authentication
    async signup(data: SignupRequest): Promise<AuthResponse> {
        return this.request<AuthResponse>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async login(data: LoginRequest): Promise<AuthResponse> {
        return this.request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async getCurrentUser(): Promise<User> {
        return this.request<User>('/users/me')
    }

    // RAG Operations
    async askQuestion(query: string, topK: number = 5): Promise<AskResponse> {
        const params = new URLSearchParams({ q: query, k: topK.toString() })
        return this.request<AskResponse>(`/rag/ask?${params}`)
    }

    async ingestFile(fileKey: string, videoId?: string): Promise<{ upserted: number }> {
        return this.request<{ upserted: number }>('/rag/ingest', {
            method: 'POST',
            body: JSON.stringify({ fileKey, videoId }),
        })
    }

    // File Upload
    async uploadSubtitles(file: File): Promise<UploadResponse> {
        const formData = new FormData()
        formData.append('file', file)

        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
        const response = await fetch(`${API_BASE}/upload/subtitles`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Upload failed: ${response.status} - ${errorText}`)
        }

        return response.json()
    }

    // Content Management
    async getSubtitleChunks(fileKey?: string): Promise<SubtitleChunk[]> {
        const params = fileKey ? `?fileKey=${encodeURIComponent(fileKey)}` : ''
        return this.request<SubtitleChunk[]>(`/upload/chunks${params}`)
    }

    async deleteSubtitleChunks(fileKey: string): Promise<void> {
        return this.request<void>(`/upload/chunks/${encodeURIComponent(fileKey)}`, {
            method: 'DELETE',
        })
    }

    // User Management (Admin only)
    async getUsers(): Promise<User[]> {
        return this.request<User[]>('/users')
    }

    async updateUserRole(userId: string, role: string): Promise<User> {
        return this.request<User>(`/users/${userId}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role }),
        })
    }

    async deleteUser(userId: string): Promise<void> {
        return this.request<void>(`/users/${userId}`, {
            method: 'DELETE',
        })
    }

    // Analytics (Admin only)
    async getAnalytics(): Promise<AnalyticsData> {
        return this.request<AnalyticsData>('/analytics')
    }

    // Job Status
    async getJobStatus(jobId: string): Promise<ProcessingJob> {
        return this.request<ProcessingJob>(`/upload/jobs/${jobId}`)
    }

    async getJobs(): Promise<ProcessingJob[]> {
        return this.request<ProcessingJob[]>('/upload/jobs')
    }
}

export const apiClient = new ApiClient()
