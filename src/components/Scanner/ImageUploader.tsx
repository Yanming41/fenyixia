import { useRef, useState, useCallback } from 'react'

interface ImageUploaderProps {
  type: 'physical' | 'digital'
  onImageLoaded: (file: File, img: HTMLImageElement, dataUrl: string) => void
}

export default function ImageUploader({ type, onImageLoaded }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => onImageLoaded(file, img, ev.target!.result as string)
      img.src = ev.target!.result as string
    }
    reader.readAsDataURL(file)
  }, [onImageLoaded])

  return (
    <div
      className={`scanner-upload-zone${dragging ? ' drag-over' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        const f = e.dataTransfer.files[0]
        if (f) loadFile(f)
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f) }}
      />
      <div className="scanner-upload-icon">{type === 'physical' ? '🧾' : '📱'}</div>
      <div className="scanner-upload-title">
        {type === 'physical' ? '拍照或上传实体小票' : '上传 App 订单截图'}
      </div>
      <div className="scanner-upload-hint">
        {type === 'physical'
          ? '支持 JPG、PNG、HEIC · 点击选择 / 拖拽'
          : 'Uber / Lyft / DoorDash / Uber Eats 等'}
      </div>
    </div>
  )
}
