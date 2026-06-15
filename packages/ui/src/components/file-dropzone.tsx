"use client"

import { Upload } from "lucide-react"
import { useRef, useState } from "react"
import { cn } from "../lib/cn"

export function FileDropzone({
  onFiles,
  accept,
  multiple,
  className,
}: {
  onFiles: (files: File[]) => void
  accept?: string
  multiple?: boolean
  className?: string
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDragOver(event: React.DragEvent<HTMLElement>) {
    event.preventDefault()
    setDragging(true)
  }

  function handleDragLeave(event: React.DragEvent<HTMLElement>) {
    event.preventDefault()
    setDragging(false)
  }

  function handleDrop(event: React.DragEvent<HTMLElement>) {
    event.preventDefault()
    setDragging(false)
    onFiles(Array.from(event.dataTransfer.files))
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      onFiles(Array.from(event.target.files))
    }
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-bg-subtle px-6 py-10 text-center transition-colors duration-micro ease-standard focus-visible:border-line-strong focus-visible:outline-none",
          dragging && "border-line-strong bg-bg",
        )}
      >
        <Upload className="h-5 w-5 text-ink-faint" />
        <span className="text-sm text-ink-muted">Drop files here or browse</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
