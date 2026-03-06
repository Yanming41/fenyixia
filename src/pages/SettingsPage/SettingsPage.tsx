import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div style={{ padding: 'max(var(--space-md), var(--safe-top)) var(--space-md) calc(var(--bottom-nav-height) + var(--safe-bottom) + 16px)' }}>
            <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>⚙️ 设置</h1>

            {user && (
                <div style={{
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-md)',
                    marginBottom: 'var(--space-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                }}>
                    <span style={{ fontSize: 32 }}>{user.emoji}</span>
                    <div>
                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text3)' }}>{user.email}</div>
                    </div>
                </div>
            )}

            <button
                onClick={handleSignOut}
                style={{
                    width: '100%',
                    padding: 14,
                    background: 'var(--color-surface2)',
                    color: 'var(--color-error)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-md)',
                    fontWeight: 600,
                    border: '1px solid var(--color-border)',
                }}
            >
                退出登录
            </button>
        </div>
    );
}
