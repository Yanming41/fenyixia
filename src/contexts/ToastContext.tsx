import { createContext, useState, useCallback, useRef, useContext } from 'react'

interface ToastContextValue {
    showToast: (msg: string, duration?: number) => void
}

export const ToastContext = createContext<ToastContextValue>({
    showToast: () => { },
})

export function useToast() {
    return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [message, setMessage] = useState('')
    const [visible, setVisible] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const showToast = useCallback((msg: string, duration = 2500) => {
        if (timerRef.current) clearTimeout(timerRef.current)
        setMessage(msg)
        setVisible(true)
        timerRef.current = setTimeout(() => {
            setVisible(false)
        }, duration)
    }, [])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className={`toast${visible ? ' show' : ''}`}>
                {message}
            </div>
        </ToastContext.Provider>
    )
}
