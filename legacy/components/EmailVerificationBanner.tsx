import { useState } from 'react'
import { resendVerification } from '../lib/api/auth'

export default function EmailVerificationBanner({ email }: { email: string }) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleResend = async () => {
    setSending(true)
    try {
      await resendVerification(email)
      setSent(true)
    } catch {
      // silent fail
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{
      padding: '10px 16px',
      background: '#FF9500',
      color: '#fff',
      fontSize: 13,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    }}>
      <span>请验证邮箱 {email}</span>
      <button
        onClick={handleResend}
        disabled={sending || sent}
        style={{
          background: 'rgba(255,255,255,0.25)',
          border: 'none',
          color: '#fff',
          padding: '4px 12px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {sent ? '已发送' : sending ? '...' : '重新发送'}
      </button>
    </div>
  )
}
