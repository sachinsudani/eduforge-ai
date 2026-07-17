'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, MoreHorizontal, Trash2, RefreshCw, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient, SubtitleChunk } from '@/lib/api'
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

interface ContentFile {
  fileKey: string
  displayName: string
  fileType: string
  chunks: number
  uploadDate: Date | null
  durationMs: number
}

function groupChunksByFile(chunks: SubtitleChunk[]): ContentFile[] {
  const byFile = new Map<string, SubtitleChunk[]>()
  for (const chunk of chunks) {
    const list = byFile.get(chunk.fileKey) || []
    list.push(chunk)
    byFile.set(chunk.fileKey, list)
  }

  return Array.from(byFile.entries()).map(([fileKey, fileChunks]) => {
    // fileKey format: "<timestamp>-<original filename>"
    const match = fileKey.match(/^(\d{13})-(.*)$/)
    const uploadDate = match ? new Date(Number(match[1])) : null
    const displayName = match ? match[2] : fileKey
    const extMatch = displayName.match(/\.(srt|vtt)$/i)
    return {
      fileKey,
      displayName: extMatch ? displayName.slice(0, -extMatch[0].length) : displayName,
      fileType: extMatch ? extMatch[1].toUpperCase() : '—',
      chunks: fileChunks.length,
      uploadDate,
      durationMs: Math.max(...fileChunks.map((c) => c.endMs), 0),
    }
  }).sort((a, b) => (b.uploadDate?.getTime() || 0) - (a.uploadDate?.getTime() || 0))
}

function formatDuration(ms: number) {
  const totalSec = Math.round(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}m ${sec.toString().padStart(2, '0')}s`
}

export default function ContentManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()

  const { data: chunks, isLoading, error } = useQuery({
    queryKey: ['admin-chunks'],
    queryFn: () => apiClient.getSubtitleChunks(),
  })

  const deleteMutation = useMutation({
    mutationFn: (fileKey: string) => apiClient.deleteSubtitleChunks(fileKey),
    onSuccess: () => {
      toast.success('File and its AI index entries deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-chunks'] })
    },
    onError: () => toast.error('Failed to delete file'),
  })

  const ingestMutation = useMutation({
    mutationFn: (fileKey: string) => apiClient.ingestFile(fileKey),
    onSuccess: (data) => toast.success(`Indexed ${data.upserted} sections for AI search`),
    onError: () => toast.error('Failed to index file — check backend logs'),
  })

  const handleDelete = (file: ContentFile) => {
    if (window.confirm(`Delete "${file.displayName}" (${file.chunks} chunks)? The AI will no longer answer from this file.`)) {
      deleteMutation.mutate(file.fileKey)
    }
  }

  const files = groupChunksByFile(chunks || [])
  const filteredFiles = files.filter((f) =>
    f.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">
            Manage uploaded subtitle files and their AI indexing
          </p>
        </div>
        <Link href="/admin/upload">
          <Button>Upload New Content</Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by file name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Content Files ({filteredFiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive py-8 text-center">
              Failed to load content. Make sure the backend is running.
            </p>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No subtitle files yet. Upload one to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Chunks</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow key={file.fileKey}>
                    <TableCell>
                      <div className="font-medium max-w-md truncate" title={file.displayName}>
                        {file.displayName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{file.fileType}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{file.chunks}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDuration(file.durationMs)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {file.uploadDate ? file.uploadDate.toLocaleDateString() : '—'}
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
                          <DropdownMenuItem
                            disabled={ingestMutation.isPending}
                            onClick={() => ingestMutation.mutate(file.fileKey)}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {ingestMutation.isPending ? 'Indexing…' : 'Re-index for AI'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            disabled={deleteMutation.isPending}
                            onClick={() => handleDelete(file)}
                          >
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
