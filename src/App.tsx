import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useBills } from './hooks/useBills'
import { ToastProvider } from './contexts/ToastContext'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import FriendsPage from './pages/FriendsPage'
import SettingsPage from './pages/SettingsPage'
import StatsPage from './pages/StatsPage'
import AddBillOverlay from './components/AddBillOverlay/AddBillOverlay'
import DebugConsole from './components/Debug/DebugConsole'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, profileCompleted } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  // 未完善资料 → 重定向到 login 页的 setup 流程
  if (profileCompleted === false) return <Navigate to="/login" replace />
  // 还在检查 profileCompleted 状态
  if (profileCompleted === null) return null

  return <>{children}</>
}

export default function App() {
  const [showAddOptions, setShowAddOptions] = useState(false)
  const { reload } = useBills()
  const handleAddClick = () => setShowAddOptions(true)

  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage onAddClick={handleAddClick} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <FriendsPage onAddClick={handleAddClick} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <StatsPage onAddClick={handleAddClick} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage onAddClick={handleAddClick} />
            </ProtectedRoute>
          }
        />
      </Routes>
      <AddBillOverlay
        show={showAddOptions}
        onClose={() => setShowAddOptions(false)}
        onCreated={() => { setShowAddOptions(false); reload() }}
      />
      <DebugConsole />
    </ToastProvider>
  )
}
