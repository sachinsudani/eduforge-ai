'use client'

import { useState } from 'react'
import { Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ContentItem {
  id: string
  title: string
  description: string
  fileType: 'vtt' | 'srt'
  fileSize: string
  uploadDate: Date
  status: 'processed' | 'processing' | 'failed'
  chunks: number
  owner: string
}

const mockContent: ContentItem[] = [
  {
    id: '1',
    title: 'Introduction to Machine Learning',
    description: 'Basic concepts and fundamentals of ML',
    fileType: 'vtt',
    fileSize: '2.3 MB',
    uploadDate: new Date('2024-01-15'),
    status: 'processed',
    chunks: 156,
    owner: 'admin@eduforge.com'
  },
  {
    id: '2',
    title: 'Deep Learning Fundamentals',
    description: 'Neural networks and deep learning basics',
    fileType: 'srt',
    fileSize: '1.8 MB',
    uploadDate: new Date('2024-01-14'),
    status: 'processing',
    chunks: 0,
    owner: 'instructor@eduforge.com'
  },
  {
    id: '3',
    title: 'Data Science Workshop',
    description: 'Hands-on data science tutorial',
    fileType: 'vtt',
    fileSize: '3.1 MB',
    uploadDate: new Date('2024-01-13'),
    status: 'failed',
    chunks: 0,
    owner: 'admin@eduforge.com'
  },
  {
    id: '4',
    title: 'Python Programming Basics',
    description: 'Introduction to Python programming',
    fileType: 'srt',
    fileSize: '1.5 MB',
    uploadDate: new Date('2024-01-12'),
    status: 'processed',
    chunks: 89,
    owner: 'instructor@eduforge.com'
  }
]

export default function ContentManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all')

  const filteredContent = mockContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.owner.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesFileType = fileTypeFilter === 'all' || item.fileType === fileTypeFilter

    return matchesSearch && matchesStatus && matchesFileType
  })

  const getStatusBadge = (status: ContentItem['status']) => {
    const variants = {
      processed: 'default',
      processing: 'secondary',
      failed: 'destructive'
    } as const

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getFileTypeBadge = (fileType: ContentItem['fileType']) => {
    return (
      <Badge variant="outline" className="uppercase">
        {fileType}
      </Badge>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">
            Manage uploaded subtitle files and their processing status
          </p>
        </div>
        <Button>
          Upload New Content
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by title, description, or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="processed">Processed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={fileTypeFilter}
                onChange={(e) => setFileTypeFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="vtt">VTT</option>
                <option value="srt">SRT</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Content Files ({filteredContent.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Chunks</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.description}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.fileSize}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getFileTypeBadge(item.fileType)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(item.status)}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{item.chunks}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{item.owner}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {item.uploadDate.toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
