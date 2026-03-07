import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BillsProvider } from './contexts/BillsContext';
import { ToastProvider } from './components/Toast';
import { AuthGuard } from './components/AuthGuard';
import { BottomNav } from './components/BottomNav';
import { CreateBillModal, AddOptionsSheet } from './components/CreateBillModal';

import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { BillDetailPage } from './pages/BillDetailPage';
import { ScanPage } from './pages/ScanPage';
import { MembersPage } from './pages/MembersPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

function AppLayout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const [showAddOptions, setShowAddOptions] = useState(false);
    const [showCreateBill, setShowCreateBill] = useState(false);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflow: 'auto' }}>
                {children}
            </div>
            <BottomNav onAdd={() => setShowAddOptions(true)} />

            <AddOptionsSheet
                open={showAddOptions}
                onClose={() => setShowAddOptions(false)}
                onManual={() => {
                    setShowAddOptions(false);
                    setTimeout(() => setShowCreateBill(true), 250);
                }}
                onOCR={() => {
                    setShowAddOptions(false);
                    setTimeout(() => navigate('/scan'), 250);
                }}
            />

            <CreateBillModal
                open={showCreateBill}
                onClose={() => setShowCreateBill(false)}
            />
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <BillsProvider>
                    <ToastProvider>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route
                                path="/"
                                element={
                                    <AuthGuard>
                                        <AppLayout><HomePage /></AppLayout>
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/bills/:id"
                                element={
                                    <AuthGuard>
                                        <AppLayout><BillDetailPage /></AppLayout>
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/scan"
                                element={
                                    <AuthGuard>
                                        <AppLayout><ScanPage /></AppLayout>
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/members"
                                element={
                                    <AuthGuard>
                                        <AppLayout><MembersPage /></AppLayout>
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/settings"
                                element={
                                    <AuthGuard>
                                        <AppLayout><SettingsPage /></AppLayout>
                                    </AuthGuard>
                                }
                            />
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </ToastProvider>
                </BillsProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
