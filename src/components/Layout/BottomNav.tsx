import { useLocation, useNavigate } from 'react-router-dom'

interface BottomNavProps {
    onAddClick?: () => void
}

export default function BottomNav({ onAddClick }: BottomNavProps) {
    const location = useLocation()
    const navigate = useNavigate()
    const path = location.pathname

    return (
        <div className="bottom-nav">
            <button
                className={`nb${path === '/' ? ' on' : ''}`}
                onClick={() => navigate('/')}
            >
                <div className="nb-icon">📄</div>
                <div>我的账单</div>
            </button>
            <button
                className={`nb${path.startsWith('/contacts') ? ' on' : ''}`}
                onClick={() => navigate('/contacts')}
            >
                <div className="nb-icon">👥</div>
                <div>通讯录</div>
            </button>
            <button
                className="add-btn"
                onClick={() => onAddClick?.()}
            >
                +
            </button>
            <button
                className={`nb${path === '/stats' ? ' on' : ''}`}
                onClick={() => navigate('/stats')}
            >
                <div className="nb-icon">📊</div>
                <div>统计</div>
            </button>
            <button
                className={`nb${path === '/settings' ? ' on' : ''}`}
                onClick={() => navigate('/settings')}
            >
                <div className="nb-icon">⚙️</div>
                <div>设置</div>
            </button>
        </div>
    )
}
