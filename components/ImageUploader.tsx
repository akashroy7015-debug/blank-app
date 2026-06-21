'use client'

import { useCallback } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'

interface ImageUploaderProps {
  setImageFile: (file: File | null) => void
  setImagePreview: (preview: string | null) => void
  imagePreview: string | null
  imageFile: File | null
}

export default function ImageUploader({ setImageFile, setImagePreview, imagePreview, imageFile }: ImageUploaderProps) {
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG)')
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }, [setImageFile, setImagePreview])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (imagePreview && imageFile) {
    return (
      <div className="space-y-4">
        <div className="relative rounded-2xl overflow-hidden max-h-72" style={{ border: '1px solid var(--border)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagePreview} alt="Chat screenshot preview" className="w-full h-full object-contain max-h-72" style={{ background: 'var(--muted)' }} />
          <button onClick={() => { setImageFile(null); setImagePreview(null) }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-80"
            style={{ background: 'oklch(0.18 0.03 340 / 0.7)', backdropFilter: 'blur(4px)' }}>
            <X size={15} />
          </button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>
            <ImageIcon size={13} />
            <span className="truncate max-w-[200px]">{imageFile.name}</span>
            <span>·</span>
            <span>{formatFileSize(imageFile.size)}</span>
          </div>
          <label className="cursor-pointer font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--primary)' }}>
            Change Photo
            <input type="file" accept="image/png,image/jpg,image/jpeg" onChange={handleInputChange} className="hidden" />
          </label>
        </div>
      </div>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="relative rounded-2xl p-10 text-center cursor-pointer transition-all"
      style={{
        border: '2px dashed var(--border)',
        background: 'transparent',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLDivElement).style.background = 'oklch(0.64 0.24 5 / 0.04)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
    >
      <input type="file" accept="image/png,image/jpg,image/jpeg" onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'oklch(0.64 0.24 5 / 0.1)' }}>
          <Upload size={28} style={{ color: 'var(--primary)' }} />
        </div>
        <div>
          <p className="font-semibold text-lg mb-1" style={{ color: 'var(--foreground)' }}>Drop your screenshot here</p>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            or <span className="font-medium" style={{ color: 'var(--primary)' }}>click to browse</span>
          </p>
        </div>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Supports PNG, JPG, JPEG</p>
      </div>
    </div>
  )
}
