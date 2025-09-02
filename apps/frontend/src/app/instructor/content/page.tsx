'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Clock, Trash2 } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

export default function InstructorContentPage() {
  const { data: chunks, isLoading, refetch } = useQuery({
    queryKey: ['instructor-content'],
    queryFn: () => apiClient.getSubtitleChunks(),
  })

  const handleDeleteFile = async (fileKey: string) => {
    try {
      await apiClient.deleteSubtitleChunks(fileKey)
      toast.success('File deleted successfully')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete file')
    }
  }

  // Group chunks by fileKey
  const files = chunks?.reduce((acc, chunk) => {
    if (!acc[chunk.fileKey]) {
      acc[chunk.fileKey] = {
        fileKey: chunk.fileKey,
        chunks: [],
        createdAt: chunk.createdAt
      }
    }
    acc[chunk.fileKey].chunks.push(chunk)
    return acc
  }, {} as Record<string, { fileKey: string; chunks: any[]; createdAt: Date }>) || {}

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Content</h1>
          <p className="text-muted-foreground">
            Manage your uploaded educational content
          </p>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Content</h1>
        <p className="text-muted-foreground">
          Manage your uploaded educational content
        </p>
      </div>

      {Object.keys(files).length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No content uploaded yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first subtitle file to get started
            </p>
            <Button asChild>
              <a href="/instructor/upload">Upload Content</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {Object.values(files).map((file) => (
            <Card key={file.fileKey}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {file.fileKey}
                    </CardTitle>
                    <CardDescription>
                      Uploaded {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {file.chunks.length} chunks
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteFile(file.fileKey)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Sample content:
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {file.chunks.slice(0, 5).map((chunk, index) => (
                      <div key={index} className="text-sm p-2 bg-muted rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs text-muted-foreground">
                            {Math.floor(chunk.startMs / 1000)}s - {Math.floor(chunk.endMs / 1000)}s
                          </span>
                        </div>
                        <p className="text-xs">{chunk.text.substring(0, 100)}...</p>
                      </div>
                    ))}
                    {file.chunks.length > 5 && (
                      <p className="text-xs text-muted-foreground">
                        ... and {file.chunks.length - 5} more chunks
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
