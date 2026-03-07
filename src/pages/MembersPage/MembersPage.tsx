import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import styles from './MembersPage.module.css';

interface Member {
    id: string;
    name: string;
    email: string | null;
    emoji: string | null;
    color: string | null;
}

export function MembersPage() {
    const { user } = useAuth();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        supabase
            .from('users')
            .select('id, name, email, emoji, color')
            .order('created_at', { ascending: true })
            .then(({ data, error }) => {
                if (error) {
                    console.error('[Members] 加载失败:', error);
                    setMembers([]);
                } else {
                    setMembers(data || []);
                }
            })
            .finally(() => setLoading(false));
    }, [user]);

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>👥 群组成员</h1>

            {loading ? (
                <div className={styles.empty}>加载中...</div>
            ) : members.length === 0 ? (
                <div className={styles.empty}>暂无成员</div>
            ) : (
                <div className={styles.list}>
                    {members.map((m) => (
                        <div key={m.id} className={styles.member}>
                            <div
                                className={styles.avatar}
                                style={{ background: m.color || 'var(--color-surface2)' }}
                            >
                                {m.emoji || '😀'}
                            </div>
                            <div className={styles.info}>
                                <div className={styles.name}>{m.name || '未命名'}</div>
                                {m.email && <div className={styles.email}>{m.email}</div>}
                            </div>
                            {m.id === user?.id && (
                                <span className={styles.you}>我</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
