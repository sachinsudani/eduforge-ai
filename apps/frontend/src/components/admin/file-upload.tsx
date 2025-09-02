'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface FileUploadProps {
  onUploadSuccess?: (fileKey: string) => void
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: (file: File) => apiClient.uploadSubtitles(file),
    onSuccess: (data) => {
      setUploadStatus('success')
      setUploadProgress(100)
      onUploadSuccess?.(data.fileKey)
      toast.success('File uploaded successfully! Processing has started.')
      // Invalidate jobs query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
    onError: (error: any) => {
      setUploadStatus('error')
      toast.error(error.message || 'Upload failed. Please try again.')
    }
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadStatus('uploading')
      setUploadProgress(0)
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      uploadMutation.mutate(file, {
        onSettled: () => {
          clearInterval(progressInterval)
        }
      })
    }
  }, [uploadMutation])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/vtt': ['.vtt'],
      'text/plain': ['.srt'],
      'application/x-subrip': ['.srt']
    },
    multiple: false,
    disabled: uploadStatus === 'uploading'
  })

  const resetUpload = () => {
    setUploadStatus('idle')
    setUploadProgress(0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Subtitle Files
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : uploadStatus === 'uploading'
              ? 'border-muted bg-muted/20 cursor-not-allowed'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          
          {uploadStatus === 'idle' && (
            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop the file here' : 'Drag & drop a subtitle file'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports VTT and SRT files
                </p>
              </div>
              <Button variant="outline" disabled={isDragActive}>
                Select File
              </Button>
            </div>
          )}

          {uploadStatus === 'uploading' && (
            <div className="space-y-4">
              <div className="animate-pulse">
                <FileText className="h-12 w-12 mx-auto text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium">Uploading...</p>
                <p className="text-sm text-muted-foreground">
                  Processing your subtitle file
                </p>
              </div>
              <div className="w-full max-w-xs mx-auto">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-muted-foreground mt-1">
                  {uploadProgress}% complete
                </p>
              </div>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <div>
                <p className="text-lg font-medium text-green-600">Upload Successful!</p>
                <p className="text-sm text-muted-foreground">
                  Your file has been queued for processing
                </p>
              </div>
              <Button onClick={resetUpload} variant="outline">
                Upload Another File
              </Button>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
              <div>
                <p className="text-lg font-medium text-red-600">Upload Failed</p>
                <p className="text-sm text-muted-foreground">
                  Please try uploading again
                </p>
              </div>
              <Button onClick={resetUpload} variant="outline">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
