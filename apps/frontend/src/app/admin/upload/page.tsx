'use client'

import { FileUpload } from '@/components/admin/file-upload'
import { ProcessingStatus } from '@/components/admin/processing-status'

export default function AdminUploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">File Upload & Processing</h1>
        <p className="text-muted-foreground">
          Upload subtitle files and monitor their processing status
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FileUpload />
        <ProcessingStatus />
      </div>
    </div>
  )
}
