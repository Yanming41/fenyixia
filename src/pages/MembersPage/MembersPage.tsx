import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as friendsService from '../../services/friends';
import type { UserRef } from '../../types/user';
import styles from './MembersPage.module.css';

export function MembersPage() {
    const { user } = useAuth();
    const [friends, setFriends] = useState<UserRef[]>([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) return;
        friendsService.getFriends(user.id)
            .then(setFriends)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const handleAdd = async () => {
        if (!user || !email.trim()) return;
        setAdding(true);
        setError('');
        try {
            const friend = await friendsService.addFriend(user.id, email.trim());
            setFriends((prev) => [...prev, friend]);
            setEmail('');
        } catch (e) {
            setError(e instanceof Error ? e.message : '添加失败');
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>👥 群组成员</h1>

            <div className={styles.addSection}>
                <input
                    className={styles.input}
                    type="email"
                    placeholder="输入好友邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button className={styles.addBtn} onClick={handleAdd} disabled={adding}>
                    {adding ? '...' : '添加'}
                </button>
            </div>
            {error && <div className={styles.error}>{error}</div>}

            {loading ? (
                <div className={styles.empty}>加载中...</div>
            ) : friends.length === 0 ? (
                <div className={styles.empty}>还没有好友，通过邮箱添加</div>
            ) : (
                <div className={styles.list}>
                    {user && (
                        <div className={styles.member}>
                            <span className={styles.emoji}>{user.emoji}</span>
                            <span>{user.name}</span>
                            <span className={styles.you}>我</span>
                        </div>
                    )}
                    {friends.map((f) => (
                        <div key={f.id} className={styles.member}>
                            <span className={styles.emoji}>{f.emoji}</span>
                            <span>{f.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
