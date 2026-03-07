import { useLocation, useNavigate } from 'react-router-dom';
import styles from './BottomNav.module.css';

const TABS = [
    { path: '/', icon: '📋', label: '账单' },
    { path: '/members', icon: '👥', label: '成员' },
    { path: '/__add__', icon: '＋', label: '', isAdd: true },
    { path: '/stats', icon: '📊', label: '统计' },
    { path: '/settings', icon: '⚙️', label: '设置' },
] as const;

interface BottomNavProps {
    onAdd?: () => void;
}

export function BottomNav({ onAdd }: BottomNavProps) {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <nav className={styles.nav}>
            {TABS.map((tab) => {
                if ('isAdd' in tab && tab.isAdd) {
                    return (
                        <button key="add" className={styles.addBtn} onClick={onAdd}>
                            {tab.icon}
                        </button>
                    );
                }
                const active = location.pathname === tab.path;
                return (
                    <button
                        key={tab.path}
                        className={`${styles.tab} ${active ? styles.active : ''}`}
                        onClick={() => navigate(tab.path)}
                    >
                        <span className={styles.icon}>{tab.icon}</span>
                        {tab.label}
                    </button>
                );
            })}
        </nav>
    );
}
