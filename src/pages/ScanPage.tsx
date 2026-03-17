import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { supabase } from '../lib/supabase'
import { scanReceipt, buildScanPrompt, uploadReceiptImage, insertReceiptScan } from '../lib/api/scan'
import { createBill } from '../lib/api/bills'
import { ICON_COLORS } from '../lib/utils'
import type { Member } from '../lib/types'
import type { ScanResult as ScanResultType, ScanResultItem } from '../lib/api/scan'
import ScanTypeSelector from '../components/Scanner/ScanTypeSelector'
import ImageUploader from '../components/Scanner/ImageUploader'
import CropOverlay from '../components/Scanner/CropOverlay'
import ImagePreview from '../components/Scanner/ImagePreview'
import MemberSelector from '../components/Scanner/MemberSelector'
import ScanResultView from '../components/Scanner/ScanResult'
import MemberAssignment from '../components/Scanner/MemberAssignment'

type Step = 'type-select' | 'upload' | 'crop' | 'preview' | 'member-select' | 'scanning' | 'result' | 'saving'

export default function ScanPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  const [step, setStep] = useState<Step>('type-select')
  const [receiptType, setReceiptType] = useState<'physical' | 'digital'>('physical')

  // Image state
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null)
  const [previewSrc, setPreviewSrc] = useState('')
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null)
  const [wasCropped, setWasCropped] = useState(false)

  // Members
  const [allMembers, setAllMembers] = useState<Member[]>([])
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([])

  // Result
  const [resultData, setResultData] = useState<ScanResultType | null>(null)
  const [items, setItems] = useState<ScanResultItem[]>([])
  const [assignments, setAssignments] = useState<Record<number, Set<string>>>({})
  const [error, setError] = useState('')

  // Load all users
  useEffect(() => {
    if (!user) return
    supabase
      .from('users')
      .select('id, name, emoji, color')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) {
          const members = data as Member[]
          setAllMembers(members)
          // Auto-select current user
          const me = members.find(m => m.id === user.id)
          if (me) setSelectedMembers([me])
        }
      })
  }, [user])

  const handleImageLoaded = useCallback((_file: File, img: HTMLImageElement, dataUrl: string) => {
    setCurrentFile(_file)
    setOriginalImage(img)
    setPreviewSrc(dataUrl)
    setCroppedBlob(null)
    setWasCropped(false)

    if (receiptType === 'physical') {
      setStep('crop')
    } else {
      setStep('preview')
    }
  }, [receiptType])

  const handleCropped = useCallback((blob: Blob) => {
    setCroppedBlob(blob)
    setWasCropped(true)
    setPreviewSrc(URL.createObjectURL(blob))
    setStep('preview')
  }, [])

  const handleSkipCrop = useCallback(() => {
    setStep('preview')
  }, [])

  const handleRotated = useCallback((blob: Blob) => {
    setCroppedBlob(blob)
    setPreviewSrc(URL.createObjectURL(blob))
  }, [])

  const handleToggleMember = useCallback((member: Member) => {
    setSelectedMembers(prev => {
      const exists = prev.find(m => m.id === member.id)
      if (exists) return prev.filter(m => m.id !== member.id)
      return [...prev, member]
    })
  }, [])

  const startScan = useCallback(async () => {
    if (!currentFile) return
    setStep('scanning')
    setError('')

    try {
      const memberNames = selectedMembers.map(m => m.name || m.emoji || '?')
      const prompt = buildScanPrompt(receiptType, memberNames, memberNames.length || 1)
      const src = croppedBlob || currentFile
      const b64 = await toBase64(src)
      const mime = croppedBlob ? 'image/jpeg' : (currentFile.type || 'image/jpeg')

      const result = await scanReceipt(b64, mime, prompt)
      setResultData(result)
      const resultItems = result.items || []
      setItems(resultItems)

      // Init assignments: all selected members for all items
      const ids = selectedMembers.map(m => m.id)
      const initAssign: Record<number, Set<string>> = {}
      resultItems.forEach((_, idx) => { initAssign[idx] = new Set(ids) })
      setAssignments(initAssign)

      setStep('result')
    } catch (err) {
      setError((err as Error).message)
      setStep('member-select')
    }
  }, [currentFile, croppedBlob, receiptType, selectedMembers])

  const saveBill = useCallback(async () => {
    if (!resultData || !user) return
    setStep('saving')

    try {
      // Upload image
      const imageBlob = croppedBlob || currentFile!
      const ext = croppedBlob ? 'jpg' : (currentFile!.name.split('.').pop() || 'jpg')
      const imagePath = await uploadReceiptImage(user.id, imageBlob, ext)

      // Parse date
      const dateStr = resultData.date || ''
      const dateMatch = dateStr.match(/(\d+)月(\d+)日/)
      const isoDate = dateMatch
        ? `${new Date().getFullYear()}-${String(dateMatch[1]).padStart(2, '0')}-${String(dateMatch[2]).padStart(2, '0')}`
        : new Date().toISOString().slice(0, 10)

      // Build items with member assignments
      const billItems = items.map((item, idx) => {
        const assignedSet = assignments[idx]
        const memberIds = assignedSet && assignedSet.size > 0
          ? [...assignedSet]
          : [user.id]
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
  }, [resultData, items, assignments, croppedBlob, currentFile, user, navigate, toast])

  // Calculate totals
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
        <>
          <ScanTypeSelector value={receiptType} onChange={(t) => { setReceiptType(t); setStep('upload') }} />
        </>
      )}

      {step === 'upload' && (
        <ImageUploader type={receiptType} onImageLoaded={handleImageLoaded} />
      )}

      {step === 'crop' && originalImage && (
        <CropOverlay image={originalImage} onCropped={handleCropped} onSkip={handleSkipCrop} />
      )}

      {step === 'preview' && previewSrc && (
        <ImagePreview
          src={previewSrc}
          wasCropped={wasCropped}
          type={receiptType}
          onRotated={handleRotated}
          onContinue={() => setStep('member-select')}
        />
      )}

      {step === 'member-select' && (
        <>
          <MemberSelector
            allMembers={allMembers}
            selected={selectedMembers}
            onToggle={handleToggleMember}
          />
          <button className="scanner-btn-primary" onClick={startScan} style={{ margin: '16px 20px' }}>
            ✨ 开始识别
          </button>
        </>
      )}

      {step === 'scanning' && (
        <div className="scanner-loading">
          <div className="scanner-spinner" />
          <div>AI 正在识别中...</div>
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

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip data URL prefix
      const base64 = result.includes(',') ? result.split(',')[1]! : result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
