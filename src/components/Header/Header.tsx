import { useAuth } from '../../contexts/AuthContext';
import styles from './Header.module.css';

interface HeaderProps {
    title?: string;
    subtitle?: string;
}

export function Header({ title = '分一下', subtitle }: HeaderProps) {
    const { user } = useAuth();

    return (
        <header className={styles.header}>
            <div className={styles.navRow}>
                <div className={styles.logo}>{title}</div>
                {user && (
                    <div className={styles.avatarWrap}>
                        <div className={styles.avatar}>{user.emoji || '🙂'}</div>
                        <div className={styles.avatarName}>{user.name}</div>
                    </div>
                )}
            </div>
            {subtitle && (
                <div className={styles.largeTitleRow}>
                    <div className={styles.largeTitle}>账单记录</div>
                    <div className={styles.sub}>{subtitle}</div>
                </div>
            )}
        </header>
    );
}
