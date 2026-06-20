'use client'

import { useCallback } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import clsx from 'clsx'

interface ImageUploaderProps {
  setImageFile: (file: File | null) => void
  setImagePreview: (preview: string | null) => void
  imagePreview: string | null
  imageFile: File | null
}

export default function ImageUploader({
  setImageFile,
  setImagePreview,
  imagePreview,
  imageFile,
}: ImageUploaderProps) {
  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (PNG, JPG, JPEG)')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    },
    [setImageFile, setImagePreview]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleRemove = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (imagePreview && imageFile) {
    return (
      <div className="space-y-4">
        <div className="relative rounded-2xl overflow-hidden border border-white/10 max-h-72">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt="Chat screenshot preview"
            className="w-full h-full object-contain max-h-72 bg-black/20"
          />
          <button
            onClick={handleRemove}
            className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <ImageIcon size={14} />
            <span className="truncate max-w-[200px]">{imageFile.name}</span>
            <span className="text-gray-600">·</span>
            <span>{formatFileSize(imageFile.size)}</span>
          </div>
          <label className="cursor-pointer text-pink-400 hover:text-pink-300 transition-colors font-medium">
            Change Photo
            <input
              type="file"
              accept="image/png,image/jpg,image/jpeg"
              onChange={handleInputChange}
              className="hidden"
            />
          </label>
        </div>
      </div>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={clsx(
        'relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all',
        'border-white/10 hover:border-pink-500/50 hover:bg-pink-500/5'
      )}
    >
      <input
        type="file"
        accept="image/png,image/jpg,image/jpeg"
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center">
          <Upload size={28} className="text-pink-400" />
        </div>
        <div>
          <p className="text-white font-semibold text-lg mb-1">
            Drop your screenshot here
          </p>
          <p className="text-gray-400 text-sm">
            or <span className="text-pink-400 font-medium">click to browse</span>
          </p>
        </div>
        <p className="text-gray-600 text-xs">
          Supports PNG, JPG, JPEG
        </p>
      </div>
    </div>
  )
}
