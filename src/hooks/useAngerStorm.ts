import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// This matches the DB functions expected in the legacy app
const DB = {
    addAnger: async (billId: string) => {
        try {
            await supabase.rpc('add_anger_reaction', { p_bill_id: billId });
        } catch (e) {
            console.error('addAnger error:', e);
        }
    },
    getUnseenAnger: async () => {
        try {
            const { data, error } = await supabase.rpc('get_unseen_anger');
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('getUnseenAnger error:', e);
            return [];
        }
    },
    markAngerSeen: async (ids: string[]) => {
        if (!ids || ids.length === 0) return;
        try {
            await supabase.rpc('mark_anger_seen', { p_ids: ids });
        } catch (e) {
            console.error('markAngerSeen error:', e);
        }
    }
};

export function useAngerStorm() {
    const [protestCount, setProtestCount] = useState(0);
    const [protestBillId, setProtestBillId] = useState<string | null>(null);

    const spawnAngerEmoji = useCallback(() => {
        const emoji = document.createElement('div');
        emoji.className = 'anger-float';
        emoji.textContent = '😡';

        // Find button position or fallback to center
        const btn = document.querySelector('.detail-btn-protest');
        if (btn) {
            const r = btn.getBoundingClientRect();
            emoji.style.left = (r.left + Math.random() * r.width) + 'px';
            emoji.style.top = (r.top - 10) + 'px';
        } else {
            emoji.style.left = (window.innerWidth / 2 - 18 + (Math.random() - 0.5) * 60) + 'px';
            emoji.style.top = (window.innerHeight * 0.6) + 'px';
        }

        document.body.appendChild(emoji);
        setTimeout(() => emoji.remove(), 1700);
    }, []);

    const protestBill = useCallback((billId: string) => {
        let currentCount = protestCount;
        if (protestBillId !== billId) {
            currentCount = 0;
            setProtestBillId(billId);
        }
        currentCount += 1;
        setProtestCount(currentCount);

        // Float one 😡
        spawnAngerEmoji();

        // Write to DB
        DB.addAnger(billId);

        if (currentCount === 3) {
            // Third hit: show message
            setTimeout(() => {
                const msg = document.createElement('div');
                msg.className = 'anger-msg';
                msg.innerHTML = '😡😡😡<br>您的怒气已经传递给<br>发起此账单的人！';
                document.body.appendChild(msg);
                setTimeout(() => msg.remove(), 3000);
            }, 400);
            setProtestCount(0); // Reset combo
        }
    }, [protestCount, protestBillId, spawnAngerEmoji]);

    // Check for unseen anger when hook mounts (usually on login/home page)
    const checkAngerStorm = useCallback(async () => {
        try {
            const reactions = await DB.getUnseenAnger();
            if (!reactions || reactions.length === 0) return;

            let totalAnger = 0;
            const names: string[] = [];
            const ids: string[] = [];

            reactions.forEach((r: any) => {
                totalAnger += r.anger_count;
                const emoji = r.user_emoji || '😡';
                const name = r.user_name || '?';
                names.push(`${emoji} ${name} ×${r.anger_count}`);
                ids.push(r.id);
            });

            // Float anger storm
            for (let i = 0; i < Math.min(totalAnger, 20); i++) {
                setTimeout(() => {
                    const emoji = document.createElement('div');
                    emoji.className = 'anger-storm';
                    emoji.textContent = '😡';
                    emoji.style.left = (Math.random() * window.innerWidth) + 'px';
                    emoji.style.bottom = '0px';
                    document.body.appendChild(emoji);
                    setTimeout(() => emoji.remove(), 2500);
                }, i * 150);
            }

            // Show summary message
            setTimeout(() => {
                const msg = document.createElement('div');
                msg.className = 'anger-msg';
                msg.innerHTML = `😡 收到怒气 ×${totalAnger}<br><br><span style="font-size:13px;font-weight:400;color:var(--label2)">${names.join('<br>')}</span>`;
                document.body.appendChild(msg);
                setTimeout(() => msg.remove(), 4000);
            }, Math.min(totalAnger, 20) * 150 + 400);

            // Mark as seen
            DB.markAngerSeen(ids);
        } catch (e) {
            console.error('checkAngerStorm error:', e);
        }
    }, []);

    return { protestBill, checkAngerStorm };
}
