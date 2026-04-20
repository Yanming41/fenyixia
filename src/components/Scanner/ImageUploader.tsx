import { useRef, useState, useCallback } from 'react'

interface ImageUploaderProps {
  type: 'physical' | 'digital'
  // Single file: goes through crop flow (physical) or direct add (digital)
  onImageLoaded: (file: File, img: HTMLImageElement, dataUrl: string) => void
  // Multiple files selected at once: skip crop, add all directly
  onMultiLoaded: (entries: { src: string; blob: Blob }[]) => void
}

export default function ImageUploader({ type, onImageLoaded, onMultiLoaded }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = ev => resolve(ev.target!.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleFiles = useCallback(async (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith('image/'))
    if (valid.length === 0) return

    if (valid.length === 1) {
      // Single file — use existing flow (crop for physical, direct for digital)
      const file = valid[0]!
      const dataUrl = await readFileAsDataUrl(file)
      const img = new Image()
      img.onload = () => onImageLoaded(file, img, dataUrl)
      img.src = dataUrl
    } else {
      // Multiple files — load all and skip crop
      const entries = await Promise.all(
        valid.map(async file => {
          const dataUrl = await readFileAsDataUrl(file)
          return { src: dataUrl, blob: dataUrlToBlob(dataUrl) }
        })
      )
      onMultiLoaded(entries)
    }
  }, [onImageLoaded, onMultiLoaded])

  return (
    <div
      className={`scanner-upload-zone${dragging ? ' drag-over' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        e.preventDefault()
        setDragging(false)
        handleFiles(Array.from(e.dataTransfer.files))
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => {
          const files = Array.from(e.target.files || [])
          if (files.length) handleFiles(files)
          e.target.value = ''
        }}
      />
      <div className="scanner-upload-icon">{type === 'physical' ? '🧾' : '📱'}</div>
      <div className="scanner-upload-title">
        {type === 'physical' ? '拍照或上传实体小票' : '上传 App 订单截图'}
      </div>
      <div className="scanner-upload-hint">
        {type === 'physical'
          ? '支持 JPG、PNG、HEIC · 可同时选多张'
          : 'Uber / Lyft / DoorDash / Uber Eats · 可同时选多张'}
      </div>
    </div>
  )
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',')
  const mime = header!.match(/:(.*?);/)?.[1] || 'image/jpeg'
  const binary = atob(data!)
  const arr = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
  return new Blob([arr], { type: mime })
}
