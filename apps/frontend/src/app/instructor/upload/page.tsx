import { FileUpload } from '@/components/admin/file-upload'
import { ProcessingStatus } from '@/components/admin/processing-status'

export default function InstructorUploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Educational Content</h1>
        <p className="text-muted-foreground">
          Upload subtitle files to make your content searchable for students
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FileUpload />
        <ProcessingStatus />
      </div>
    </div>
  )
}
