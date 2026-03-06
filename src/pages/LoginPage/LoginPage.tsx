import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './LoginPage.module.css';

export function LoginPage() {
    const { user, signIn, signUp, error, clearError } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [emoji, setEmoji] = useState('😀');
    const [submitting, setSubmitting] = useState(false);

    if (user) return <Navigate to="/" replace />;

    const EMOJIS = ['😀', '😎', '🐱', '🐻', '🦊', '🐰', '🐸', '🦋', '🌸', '🔥', '⭐', '🎮'];

    const handleSubmit = async () => {
        if (!email || !password) return;
        setSubmitting(true);
        clearError();
        try {
            if (mode === 'login') {
                await signIn(email, password);
            } else {
                if (!name) return;
                await signUp(email, password, name, emoji);
            }
            navigate('/');
        } catch {
            // error is set via context
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.orbs}>
                <div className={`${styles.orb} ${styles.orb1}`} />
                <div className={`${styles.orb} ${styles.orb2}`} />
            </div>

            <div className={styles.content}>
                <div className={styles.logo}>分一下</div>
                <div className={styles.tagline}>室友 AA 分账</div>

                <div className={styles.form}>
                    {mode === 'register' && (
                        <>
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="你的名字"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <div className={styles.emojiPicker}>
                                {EMOJIS.map((e) => (
                                    <button
                                        key={e}
                                        className={`${styles.emojiBtn} ${e === emoji ? styles.emojiActive : ''}`}
                                        onClick={() => setEmoji(e)}
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                    <input
                        className={styles.input}
                        type="email"
                        placeholder="邮箱"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className={styles.input}
                        type="password"
                        placeholder="PIN / 密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && <div className={styles.error}>{error}</div>}

                    <button
                        className={styles.primaryBtn}
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? '处理中...' : mode === 'login' ? '登录' : '注册'}
                    </button>

                    <button
                        className={styles.switchBtn}
                        onClick={() => {
                            setMode(mode === 'login' ? 'register' : 'login');
                            clearError();
                        }}
                    >
                        {mode === 'login' ? '没有账号？注册' : '已有账号？登录'}
                    </button>
                </div>
            </div>
        </div>
    );
}
