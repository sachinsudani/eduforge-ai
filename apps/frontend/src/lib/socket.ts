import { io, Socket } from 'socket.io-client'

class SocketManager {
    private socket: Socket | null = null
    private listeners: Map<string, Function[]> = new Map()

    connect(token?: string) {
        if (this.socket?.connected) return

        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

        this.socket = io(SOCKET_URL, {
            auth: token ? { token } : undefined,
            transports: ['websocket', 'polling']
        })

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id)
        })

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected')
        })

        this.socket.on('error', (error) => {
            console.error('Socket error:', error)
        })

        // Set up event listeners
        this.setupEventListeners()
    }

    private setupEventListeners() {
        if (!this.socket) return

        // Processing job updates
        this.socket.on('job:update', (data) => {
            this.emit('job:update', data)
        })

        this.socket.on('job:completed', (data) => {
            this.emit('job:completed', data)
        })

        this.socket.on('job:failed', (data) => {
            this.emit('job:failed', data)
        })

        // System notifications
        this.socket.on('system:notification', (data) => {
            this.emit('system:notification', data)
        })

        // User activity
        this.socket.on('user:activity', (data) => {
            this.emit('user:activity', data)
        })

        // Analytics updates
        this.socket.on('analytics:update', (data) => {
            this.emit('analytics:update', data)
        })
    }

    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, [])
        }
        this.listeners.get(event)!.push(callback)
    }

    off(event: string, callback?: Function) {
        if (!callback) {
            this.listeners.delete(event)
            return
        }

        const callbacks = this.listeners.get(event)
        if (callbacks) {
            const index = callbacks.indexOf(callback)
            if (index > -1) {
                callbacks.splice(index, 1)
            }
        }
    }

    private emit(event: string, data: any) {
        const callbacks = this.listeners.get(event)
        if (callbacks) {
            callbacks.forEach(callback => callback(data))
        }
    }

    emit(event: string, data: any) {
        if (this.socket?.connected) {
            this.socket.emit(event, data)
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }
        this.listeners.clear()
    }

    isConnected() {
        return this.socket?.connected || false
    }
}

export const socketManager = new SocketManager()
