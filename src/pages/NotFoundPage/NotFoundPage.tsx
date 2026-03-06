import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-md)',
        }}>
            <div style={{ fontSize: 64 }}>🤔</div>
            <div style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>页面不存在</div>
            <div style={{ color: 'var(--color-text3)' }}>找不到你要访问的页面</div>
            <button
                onClick={() => navigate('/')}
                style={{
                    marginTop: 'var(--space-md)',
                    padding: '12px 24px',
                    background: 'var(--color-accent)',
                    color: 'var(--color-bg)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                }}
            >
                返回首页
            </button>
        </div>
    );
}
