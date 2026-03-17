import { useRef, useState, useEffect, useCallback } from 'react'

interface CropOverlayProps {
  image: HTMLImageElement
  onCropped: (blob: Blob) => void
  onSkip: () => void
}

type Corner = [number, number]

function detectReceiptCorners(img: HTMLImageElement): Corner[] {
  const SCALE = Math.min(1, 600 / Math.max(img.width, img.height))
  const W = Math.round(img.width * SCALE)
  const H = Math.round(img.height * SCALE)

  const off = document.createElement('canvas')
  off.width = W; off.height = H
  const oc = off.getContext('2d')!
  oc.drawImage(img, 0, 0, W, H)
  const px = oc.getImageData(0, 0, W, H).data

  const bright = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++)
    bright[i] = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]

  const sorted = Array.from(bright).sort((a, b) => a - b)
  const medianBright = sorted[Math.floor(sorted.length * 0.7)]
  const threshold = Math.min(medianBright * 0.75, 160)

  const mask = new Uint8Array(W * H)
  for (let i = 0; i < W * H; i++)
    mask[i] = bright[i] > threshold ? 1 : 0

  const margin = Math.floor(Math.min(W, H) * 0.03)
  let x0 = W, y0 = H, x1 = 0, y1 = 0, found = false

  for (let y = margin; y < H - margin; y++) {
    for (let x = margin; x < W - margin; x++) {
      if (!mask[y * W + x]) continue
      let nb = 0
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++)
          if (dx || dy) nb += mask[(y + dy) * W + (x + dx)] || 0
      if (nb < 8) continue

      if (x < x0) x0 = x; if (x > x1) x1 = x
      if (y < y0) y0 = y; if (y > y1) y1 = y
      found = true
    }
  }

  const s = 1 / SCALE
  const pad = 12

  if (!found || (x1 - x0) < W * 0.25 || (y1 - y0) < H * 0.25) {
    const p = 0.08
    return [
      [img.width * p, img.height * p],
      [img.width * (1 - p), img.height * p],
      [img.width * (1 - p), img.height * (1 - p)],
      [img.width * p, img.height * (1 - p)]
    ]
  }

  return [
    [(x0 + pad) * s, (y0 + pad) * s],
    [(x1 - pad) * s, (y0 + pad) * s],
    [(x1 - pad) * s, (y1 - pad) * s],
    [(x0 + pad) * s, (y1 - pad) * s]
  ]
}

export default function CropOverlay({ image, onCropped, onSkip }: CropOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)
  const [corners, setCorners] = useState<Corner[]>([])
  const [dragging, setDragging] = useState(-1)
  const displayScaleRef = useRef(1)
  const HIT_R = 28

  const layoutCanvas = useCallback(() => {
    const cvs = canvasRef.current
    const area = areaRef.current
    if (!cvs || !area) return

    const aW = area.clientWidth
    const aH = area.clientHeight
    const imgAspect = image.width / image.height
    const areaAspect = aW / aH

    let cW: number, cH: number
    if (imgAspect > areaAspect) {
      cW = aW; cH = Math.round(aW / imgAspect)
    } else {
      cH = aH; cW = Math.round(aH * imgAspect)
    }

    const dpr = window.devicePixelRatio || 1
    cvs.width = cW * dpr
    cvs.height = cH * dpr
    cvs.style.width = cW + 'px'
    cvs.style.height = cH + 'px'
    const ctx = cvs.getContext('2d')!
    ctx.scale(dpr, dpr)
    displayScaleRef.current = cW / image.width
  }, [image])

  const drawOverlay = useCallback(() => {
    const cvs = canvasRef.current
    if (!cvs || corners.length !== 4) return
    const ctx = cvs.getContext('2d')!
    const ds = displayScaleRef.current
    const w = cvs.clientWidth
    const h = cvs.clientHeight

    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(image, 0, 0, w, h)

    // Dim outside crop area
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, 0, w, h)

    // Clear crop region
    const pts = corners.map(c => [c[0] * ds, c[1] * ds])
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(pts[0][0], pts[0][1])
    pts.forEach(p => ctx.lineTo(p[0], p[1]))
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(image, 0, 0, w, h)
    ctx.restore()

    // Draw border
    ctx.strokeStyle = '#f0c040'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(pts[0][0], pts[0][1])
    pts.forEach(p => ctx.lineTo(p[0], p[1]))
    ctx.closePath()
    ctx.stroke()

    // Draw handles
    pts.forEach(p => {
      ctx.beginPath()
      ctx.arc(p[0], p[1], 10, 0, Math.PI * 2)
      ctx.fillStyle = '#f0c040'
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
    })
  }, [corners, image])

  useEffect(() => {
    layoutCanvas()
    setCorners(detectReceiptCorners(image))
  }, [image, layoutCanvas])

  useEffect(() => {
    drawOverlay()
  }, [drawOverlay])

  useEffect(() => {
    const onResize = () => { layoutCanvas(); drawOverlay() }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [layoutCanvas, drawOverlay])

  const getPointerPos = (e: React.PointerEvent): [number, number] => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return [e.clientX - rect.left, e.clientY - rect.top]
  }

  const onPointerDown = (e: React.PointerEvent) => {
    const [px, py] = getPointerPos(e)
    const ds = displayScaleRef.current
    for (let i = 0; i < corners.length; i++) {
      const hx = corners[i][0] * ds
      const hy = corners[i][1] * ds
      if (Math.hypot(px - hx, py - hy) < HIT_R) {
        setDragging(i)
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        return
      }
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging < 0) return
    const [px, py] = getPointerPos(e)
    const ds = displayScaleRef.current
    setCorners(prev => {
      const next = [...prev] as Corner[]
      next[dragging] = [px / ds, py / ds]
      return next
    })
  }

  const onPointerUp = () => setDragging(-1)

  const confirmCrop = () => {
    if (corners.length !== 4) return
    const xs = corners.map(c => c[0]), ys = corners.map(c => c[1])
    const x0 = Math.max(0, Math.min(...xs))
    const y0 = Math.max(0, Math.min(...ys))
    const x1 = Math.min(image.width, Math.max(...xs))
    const y1 = Math.min(image.height, Math.max(...ys))
    const cw = x1 - x0, ch = y1 - y0
    if (cw < 10 || ch < 10) return

    const oc = document.createElement('canvas')
    oc.width = cw; oc.height = ch
    const octx = oc.getContext('2d')!

    octx.beginPath()
    octx.moveTo(corners[0][0] - x0, corners[0][1] - y0)
    corners.forEach(c => octx.lineTo(c[0] - x0, c[1] - y0))
    octx.closePath()
    octx.clip()
    octx.drawImage(image, -x0, -y0)

    oc.toBlob(blob => { if (blob) onCropped(blob) }, 'image/jpeg', 0.92)
  }

  return (
    <div className="scanner-crop-overlay">
      <div className="scanner-crop-topbar">
        <button className="scanner-crop-back" onClick={onSkip}>✕</button>
        <span>调整裁剪区域</span>
        <div />
      </div>
      <div className="scanner-crop-canvas-area" ref={areaRef}>
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{ touchAction: 'none' }}
        />
      </div>
      <div className="scanner-crop-actions">
        <button className="scanner-btn-secondary" onClick={onSkip}>跳过裁剪</button>
        <button className="scanner-btn-primary" onClick={confirmCrop}>✂️ 裁剪并继续</button>
      </div>
    </div>
  )
}
