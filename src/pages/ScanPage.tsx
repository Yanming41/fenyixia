import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { supabase } from '../lib/supabase'
import { useFriends } from '../hooks/useFriends'
import { scanReceipt, buildScanPrompt, uploadReceiptImage, insertReceiptScan } from '../lib/api/scan'
import { createBill } from '../lib/api/bills'
import { ICON_COLORS } from '../lib/utils'
import type { Member } from '../lib/types'
import type { ScanResult as ScanResultType, ScanResultItem } from '../lib/api/scan'
import ScanTypeSelector from '../components/Scanner/ScanTypeSelector'
import ImageUploader from '../components/Scanner/ImageUploader'
import CropOverlay from '../components/Scanner/CropOverlay'
import MemberSelector from '../components/Scanner/MemberSelector'
import ScanResultView from '../components/Scanner/ScanResult'
import MemberAssignment from '../components/Scanner/MemberAssignment'

type Step = 'type-select' | 'upload' | 'crop' | 'preview' | 'member-select' | 'scanning' | 'result' | 'saving'

// One uploaded (possibly cropped) image ready for scanning
interface ImageEntry {
  src: string   // object URL or data URL for display
  blob: Blob
}

export default function ScanPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  const [step, setStep] = useState<Step>('type-select')
  const [receiptType, setReceiptType] = useState<'physical' | 'digital'>('physical')

  // Accumulated images (multi-upload)
  const [images, setImages] = useState<ImageEntry[]>([])

  // Temporary state for the image currently being uploaded/cropped
  const [pendingOriginal, setPendingOriginal] = useState<HTMLImageElement | null>(null)
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null)
  const [pendingSrc, setPendingSrc] = useState('')

  // Members
  const { friends } = useFriends()
  const allMembers = useMemo(() => {
    if (!user) return []
    const me: Member = { id: user.id, name: user.user_metadata?.name || '我', emoji: user.user_metadata?.emoji || '😀', color: user.user_metadata?.color }
    const hasSelf = friends.some(f => f.id === user.id)
    return hasSelf ? friends : [me, ...friends]
  }, [user, friends])
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([])

  useEffect(() => {
    if (allMembers.length > 0 && selectedMembers.length === 0) {
      setSelectedMembers([allMembers[0]!])
    }
  }, [allMembers, selectedMembers.length])

  // Result
  const [resultData, setResultData] = useState<ScanResultType | null>(null)
  const [items, setItems] = useState<ScanResultItem[]>([])
  const [assignments, setAssignments] = useState<Record<number, Set<string>>>({})
  const [error, setError] = useState('')
  const [userHint, setUserHint] = useState('')

  // ── Image upload/crop handlers ──

  const handleImageLoaded = useCallback((_file: File, img: HTMLImageElement, dataUrl: string) => {
    setPendingOriginal(img)
    setPendingBlob(null)
    setPendingSrc(dataUrl)

    if (receiptType === 'physical') {
      setStep('crop')
    } else {
      // For digital: add directly to images array and go to preview
      const blob = dataUrlToBlob(dataUrl)
      setImages(prev => [...prev, { src: dataUrl, blob }])
      setStep('preview')
    }
  }, [receiptType])

  const handleCropped = useCallback((blob: Blob) => {
    const src = URL.createObjectURL(blob)
    setPendingBlob(blob)
    setPendingSrc(src)
    setImages(prev => [...prev, { src, blob }])
    setStep('preview')
  }, [])

  const handleSkipCrop = useCallback(() => {
    // Use the original image data URL as-is
    const blob = dataUrlToBlob(pendingSrc)
    setImages(prev => [...prev, { src: pendingSrc, blob }])
    setStep('preview')
  }, [pendingSrc])

  const handleAddMore = useCallback(() => {
    setPendingOriginal(null)
    setPendingBlob(null)
    setPendingSrc('')
    setStep('upload')
  }, [])

  const removeImage = useCallback((idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }, [])

  const handleToggleMember = useCallback((member: Member) => {
    setSelectedMembers(prev => {
      const exists = prev.find(m => m.id === member.id)
      if (exists) return prev.filter(m => m.id !== member.id)
      return [...prev, member]
    })
  }, [])

  // ── Scan ──

  const startScan = useCallback(async () => {
    if (images.length === 0) return
    setStep('scanning')
    setError('')

    try {
      const memberNames = selectedMembers.map(m => m.name || m.emoji || '?')
      const prompt = buildScanPrompt(receiptType, memberNames, memberNames.length || 1, userHint.trim() || undefined, images.length)

      // Convert all image blobs to base64
      const imagePayloads = await Promise.all(
        images.map(async img => ({
          base64: await blobToBase64(img.blob),
          mediaType: img.blob.type || 'image/jpeg',
        }))
      )

      const result = await scanReceipt(imagePayloads, prompt)
      setResultData(result)
      const resultItems = result.items || []
      setItems(resultItems)

      const ids = selectedMembers.map(m => m.id)
      const initAssign: Record<number, Set<string>> = {}
      resultItems.forEach((_, idx) => { initAssign[idx] = new Set(ids) })
      setAssignments(initAssign)

      setStep('result')
    } catch (err) {
      setError((err as Error).message)
      setStep('member-select')
    }
  }, [images, receiptType, selectedMembers, userHint])

  // ── Save ──

  const saveBill = useCallback(async () => {
    if (!resultData || !user || images.length === 0) return
    setStep('saving')

    try {
      // Upload first image (primary)
      const firstImage = images[0]!
      const ext = firstImage.blob.type === 'image/png' ? 'png' : 'jpg'
      const imagePath = await uploadReceiptImage(user.id, firstImage.blob, ext)

      const dateStr = resultData.date || ''
      const dateMatch = dateStr.match(/(\d+)月(\d+)日/)
      const isoDate = dateMatch
        ? `${new Date().getFullYear()}-${String(dateMatch[1]).padStart(2, '0')}-${String(dateMatch[2]).padStart(2, '0')}`
        : new Date().toISOString().slice(0, 10)

      const billItems = items.map((item, idx) => {
        const assignedSet = assignments[idx]
        const memberIds = assignedSet && assignedSet.size > 0 ? [...assignedSet] : [user.id]
        return {
          name: item.name,
          price: Number(item.price),
          qty: item.qty || 1,
          member_ids: memberIds,
        }
      })

      const billId = await createBill({
        icon: resultData.icon || '🧾',
        title: resultData.title || '扫描账单',
        description: resultData.desc || resultData.merchant || '',
        date: isoDate,
        color: ICON_COLORS[resultData.icon || '🧾'] || 'linear-gradient(135deg,#8E8E93,#636366)',
        items: billItems,
      })

      await insertReceiptScan(user.id, imagePath, resultData, billId)

      toast.showToast('账单已保存')
      setTimeout(() => navigate('/'), 800)
    } catch (err) {
      setError((err as Error).message)
      setStep('result')
    }
  }, [resultData, items, assignments, images, user, navigate, toast])

  const totalAmount = items.reduce((s, i) => s + i.price * (i.qty || 1), 0)
  const memberCount = selectedMembers.length || 1
  const perAmount = totalAmount / memberCount

  return (
    <div className="scanner-page">
      <div className="scanner-header">
        <button className="scanner-back" onClick={() => navigate(-1)}>← 返回</button>
        <span className="scanner-title">小票扫描</span>
      </div>

      {error && (
        <div className="scanner-error">
          {error}
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {step === 'type-select' && (
        <ScanTypeSelector value={receiptType} onChange={(t) => { setReceiptType(t); setStep('upload') }} />
      )}

      {step === 'upload' && (
        <ImageUploader
          type={receiptType}
          onImageLoaded={handleImageLoaded}
          onMultiLoaded={entries => {
            setImages(prev => [...prev, ...entries])
            setStep('preview')
          }}
        />
      )}

      {step === 'crop' && pendingOriginal && (
        <CropOverlay image={pendingOriginal} onCropped={handleCropped} onSkip={handleSkipCrop} />
      )}

      {/* ── Multi-image preview ── */}
      {step === 'preview' && (
        <div className="scanner-multi-preview">
          <div className="scanner-multi-title">
            已添加 {images.length} 张图片
          </div>
          <div className="scanner-img-grid">
            {images.map((img, idx) => (
              <div key={idx} className="scanner-img-thumb">
                <img src={img.src} alt={`图片 ${idx + 1}`} />
                <button
                  className="scanner-img-thumb-del"
                  onClick={() => removeImage(idx)}
                >×</button>
                <div className="scanner-img-thumb-num">{idx + 1}</div>
              </div>
            ))}
            <button className="scanner-img-add" onClick={handleAddMore}>
              <span>＋</span>
              <span className="scanner-img-add-label">添加</span>
            </button>
          </div>
          <button
            className="scanner-btn-primary"
            onClick={() => setStep('member-select')}
            disabled={images.length === 0}
            style={{ margin: '8px 20px 0' }}
          >
            继续 →
          </button>
        </div>
      )}

      {step === 'member-select' && (
        <>
          <MemberSelector
            allMembers={allMembers}
            selected={selectedMembers}
            onToggle={handleToggleMember}
          />
          <div className="scanner-hint-section">
            <div className="scanner-section-title">识别备注（可选）</div>
            <input
              className="scanner-hint-input"
              type="text"
              placeholder="如：这是Costco的小票、忽略最后一项退款..."
              value={userHint}
              onChange={e => setUserHint(e.target.value)}
            />
          </div>
          <button className="scanner-btn-primary" onClick={startScan} style={{ margin: '16px 20px' }}>
            ✨ 开始识别
          </button>
        </>
      )}

      {step === 'scanning' && (
        <div className="scanner-loading">
          <div className="scanner-spinner" />
          <div>AI 正在识别 {images.length} 张图片...</div>
        </div>
      )}

      {step === 'result' && resultData && (
        <>
          <ScanResultView
            icon={resultData.icon || '🧾'}
            title={resultData.title || '扫描账单'}
            desc={resultData.desc || ''}
            date={resultData.date || ''}
            merchant={resultData.merchant || ''}
            items={items}
            totalAmount={totalAmount}
            perAmount={perAmount}
            onItemsChange={setItems}
          />
          <MemberAssignment
            items={items}
            members={selectedMembers}
            assignments={assignments}
            onAssignmentsChange={setAssignments}
          />
          <button className="scanner-btn-primary" onClick={saveBill} style={{ margin: '16px 20px' }}>
            💾 保存为账单
          </button>
        </>
      )}

      {step === 'saving' && (
        <div className="scanner-loading">
          <div className="scanner-spinner" />
          <div>保存中...</div>
        </div>
      )}
    </div>
  )
}

// ── Helpers ──

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.includes(',') ? result.split(',')[1]! : result)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',')
  const mime = header!.match(/:(.*?);/)?.[1] || 'image/jpeg'
  const binary = atob(data!)
  const arr = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
  return new Blob([arr], { type: mime })
}
