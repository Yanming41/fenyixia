import { useState, useCallback } from 'react'

interface ImagePreviewProps {
  src: string
  wasCropped: boolean
  type: 'physical' | 'digital'
  onRotated: (blob: Blob) => void
  onContinue: () => void
}

export default function ImagePreview({ src, wasCropped, type, onRotated, onContinue }: ImagePreviewProps) {
  const [rotation, setRotation] = useState(0)

  const rotate = useCallback((deg: number) => {
    const newDeg = (rotation + deg) % 360
    setRotation(newDeg)

    // Generate rotated blob
    const img = new Image()
    img.onload = () => {
      const swap = newDeg === 90 || newDeg === 270
      const w = swap ? img.height : img.width
      const h = swap ? img.width : img.height
      const cvs = document.createElement('canvas')
      cvs.width = w; cvs.height = h
      const ctx = cvs.getContext('2d')!
      ctx.translate(w / 2, h / 2)
      ctx.rotate((newDeg * Math.PI) / 180)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)
      cvs.toBlob(blob => { if (blob) onRotated(blob) }, 'image/jpeg', 0.92)
    }
    img.src = src
  }, [rotation, src, onRotated])

  return (
    <div className="scanner-preview">
      <div className="scanner-preview-badge">
        {type === 'physical'
          ? `🧾 实体小票${wasCropped ? ' · 已裁剪' : ''}`
          : '📱 数字订单'}
      </div>
      <div className="scanner-preview-image-wrap">
        <img
          src={src}
          alt="preview"
          style={{ transform: `rotate(${rotation}deg)`, maxWidth: '100%', maxHeight: '50vh' }}
        />
      </div>
      <div className="scanner-preview-rotate-bar">
        <button onClick={() => rotate(90)}>↻ 90°</button>
        <button onClick={() => rotate(180)}>↻ 180°</button>
        <button onClick={() => rotate(270)}>↻ 270°</button>
      </div>
      <button className="scanner-btn-primary" onClick={onContinue} style={{ marginTop: 16 }}>
        继续 →
      </button>
    </div>
  )
}
