import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBills } from '../../contexts/BillsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { fmtMoney, fmtISODate } from '../../utils/format';
import { uploadPaymentProof, getPaymentProofs, addAnger } from '../../services/reactions';
import type { Bill, BillItem, PaymentProof } from '../../types/bill';
import styles from './BillDetailPage.module.css';

function escText(s: string | undefined) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function BillDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { bills, toggleSettled, deleteBill, updateBill } = useBills();
    const { user } = useAuth();
    const { show: showToast } = useToast();
    const navigate = useNavigate();

    const bill = bills.find((b) => b.id === id);
    const [editMode, setEditMode] = useState(false);
    const [editBill, setEditBill] = useState<Bill | null>(null);
    const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);
    const [proofs, setProofs] = useState<PaymentProof[]>([]);
    const [proofsLoading, setProofsLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!bill) {
        return (
            <div className={styles.page}>
                <div className={styles.empty}>账单不存在</div>
                <button className={styles.backBtn} onClick={() => navigate('/')}>← 返回</button>
            </div>
        );
    }

    const currentUserId = user?.id;
    const isPayer = currentUserId === bill.payer_id;

    // Per-member share calculation
    const memberShares: Record<string, number> = {};
    (bill.members || []).forEach(m => { memberShares[m.id] = 0; });
    (bill.items || []).forEach(item => {
        const n = (item.members || []).length || 1;
        const share = (item.price * (item.qty || 1)) / n;
        (item.members || []).forEach(m => {
            memberShares[m.id] = (memberShares[m.id] || 0) + share;
        });
    });

    const otherMembers = (bill.members || []).filter(m => m.id !== bill.payer_id);
    const collectTotal = otherMembers.reduce((s, m) => s + (memberShares[m.id] || 0), 0);
    const myShare = memberShares[currentUserId || ''] || 0;

    const handleToggleSettled = async () => {
        try {
            await toggleSettled(bill.id, !bill.settled);
            showToast(bill.settled ? '已取消结清' : '✓ 已标记结清', 'success');
        } catch {
            showToast('操作失败', 'error');
        }
    };

    const handleDelete = async () => {
        if (!confirm('确定删除这条账单？删除后不可恢复。')) return;
        try {
            await deleteBill(bill.id);
            showToast('已删除', 'success');
            navigate('/');
        } catch {
            showToast('删除失败', 'error');
        }
    };

    // Payment proofs
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (!bill) return;
        setProofsLoading(true);
        getPaymentProofs(bill.id)
            .then(setProofs)
            .catch(() => setProofs([]))
            .finally(() => setProofsLoading(false));
    }, [bill?.id]);

    const handleUploadProof = async (file: File) => {
        if (!user || !bill) return;
        try {
            showToast('上传中...', 'info');
            await uploadPaymentProof(user.id, bill.id, file);
            showToast('✓ 凭证已上传', 'success');
            const updated = await getPaymentProofs(bill.id);
            setProofs(updated);
        } catch {
            showToast('上传失败', 'error');
        }
    };

    const handlePayBtn = async () => {
        const amountStr = myShare.toFixed(2);
        try {
            await navigator.clipboard.writeText(amountStr);
            showToast(`📋 已复制 $${amountStr} 到剪贴板`, 'success');
        } catch {
            showToast(`付款金额: $${amountStr}`, 'info');
        }
    };

    // Protest / anger
    const [protestCount, setProtestCount] = useState(0);
    const handleProtest = async () => {
        if (!user || !bill) return;
        const count = protestCount + 1;
        setProtestCount(count);

        // Spawn floating emoji
        const emoji = document.createElement('div');
        emoji.textContent = '😡';
        emoji.style.cssText = `
            position:fixed;font-size:32px;pointer-events:none;z-index:9999;
            left:${50 + (Math.random() - 0.5) * 30}%;
            bottom:120px;
            animation:angerFloat 1.5s ease-out forwards;
        `;
        document.body.appendChild(emoji);
        setTimeout(() => emoji.remove(), 1600);

        addAnger(user.id, bill.id).catch(() => {});

        if (count % 3 === 0) {
            setTimeout(() => {
                showToast('😡😡😡 您的怒气已传递给发起人！', 'info');
            }, 400);
        }
    };

    // Edit mode
    const startEdit = () => {
        setEditBill(JSON.parse(JSON.stringify(bill)));
        setEditingItemIdx(null);
        setEditMode(true);
    };

    const cancelEdit = () => {
        setEditMode(false);
        setEditBill(null);
        setEditingItemIdx(null);
    };

    const saveEdit = async () => {
        if (!editBill) return;
        try {
            await updateBill(editBill.id, {
                title: editBill.title,
                icon: editBill.icon,
                description: editBill.description || '',
                items: editBill.items.map(item => ({
                    name: item.name,
                    price: item.price,
                    qty: item.qty || 1,
                    member_ids: (item.members || []).map(m => m.id),
                })),
            });
            setEditMode(false);
            setEditBill(null);
            showToast('✓ 已保存', 'success');
        } catch {
            showToast('保存失败', 'error');
        }
    };

    if (editMode && editBill) {
        return (
            <EditView
                bill={editBill}
                setBill={setEditBill}
                editingItemIdx={editingItemIdx}
                setEditingItemIdx={setEditingItemIdx}
                onSave={saveEdit}
                onCancel={cancelEdit}
            />
        );
    }

    // Role banner
    let bannerClass: string;
    let bannerText: string;
    let bannerAmount: number;
    if (isPayer) {
        bannerClass = styles.bannerCollect;
        bannerText = `💰 你垫付了这笔账单，向 ${otherMembers.length} 人收款`;
        bannerAmount = collectTotal;
    } else if (bill.settled) {
        bannerClass = styles.bannerPaid;
        bannerText = `✅ 已完成付款给 ${bill.payer_emoji} ${bill.payer_name}`;
        bannerAmount = myShare;
    } else {
        bannerClass = styles.bannerPay;
        bannerText = `📤 你需要向 ${bill.payer_emoji} ${bill.payer_name} 支付`;
        bannerAmount = myShare;
    }

    return (
        <div className={styles.page}>
            <button className={styles.backBtn} onClick={() => navigate('/')}>← 返回</button>

            {/* Header */}
            <div className={styles.detailHeader}>
                <div className={styles.detailIcon}>{bill.icon}</div>
                <div className={styles.detailTitleCol}>
                    <div className={styles.detailTitle}>{escText(bill.title)}</div>
                    <div className={styles.detailDesc}>{escText(bill.description)}</div>
                </div>
                <div className={styles.detailAmountCol}>
                    <div className={styles.detailTotal}>{fmtMoney(bill.total_amount)}</div>
                    <div className={styles.detailPer}>共 {(bill.members || []).length} 人</div>
                </div>
            </div>

            {/* Role banner */}
            <div className={`${styles.roleBanner} ${bannerClass}`}>
                <span>{bannerText}</span>
                <span className={styles.roleAmount}>{fmtMoney(bannerAmount)}</span>
            </div>

            {/* Meta pills */}
            <div className={styles.metaPills}>
                <span className={styles.metaPill}>📅 {fmtISODate(bill.date)}</span>
                <span className={styles.metaPill}>{bill.settled ? '✅ 已结清' : '⏳ 待结算'}</span>
            </div>

            {/* Items */}
            <div className={styles.itemsHeader}>
                <span>商品 / 服务</span><span>数量</span><span>金额</span><span>分摊</span>
            </div>
            {(bill.items || []).map((item) => {
                const isMine = (item.members || []).some(m => m.id === currentUserId);
                return (
                    <div key={item.id} className={`${styles.itemRow} ${isMine ? styles.itemMine : ''}`}>
                        <span className={styles.itemName}>{escText(item.name)}</span>
                        <span className={styles.itemQty}>×{item.qty || 1}</span>
                        <span className={styles.itemPrice}>{fmtMoney(item.price * (item.qty || 1))}</span>
                        <div className={styles.itemAvatars}>
                            {(item.members || []).map(m => (
                                <div key={m.id} className={styles.cav}>{m.emoji || '😀'}</div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Per-person summary */}
            <div className={styles.summarySection}>
                <div className={styles.summaryTitle}>每人分摊明细</div>
                {(bill.members || []).map(m => {
                    const isMe = m.id === currentUserId;
                    const isP = m.id === bill.payer_id;
                    const share = memberShares[m.id] || 0;
                    return (
                        <div key={m.id} className={`${styles.summaryRow} ${isMe ? styles.summaryMe : ''}`}>
                            <div className={styles.summaryAvatar}>{m.emoji || '😀'}</div>
                            <div className={styles.summaryName}>
                                {escText(m.name || '未知')}
                                {isP && <span className={styles.summaryLabel}>（垫付人）</span>}
                            </div>
                            <div className={styles.summaryAmount}>{fmtMoney(share)}</div>
                        </div>
                    );
                })}
            </div>

            {/* Payment proofs */}
            <div className={styles.proofSection}>
                <div className={styles.proofTitle}>💳 {isPayer ? '付款凭证' : '我的付款凭证'}</div>
                {proofsLoading ? (
                    <div className={styles.proofEmpty}>加载中...</div>
                ) : proofs.length === 0 ? (
                    <div className={styles.proofEmpty}>暂无凭证</div>
                ) : (
                    <div className={styles.proofList}>
                        {proofs.map(p => (
                            <div key={p.id} className={styles.proofItem}>
                                <img
                                    className={styles.proofThumb}
                                    src={p.image_url}
                                    onClick={() => window.open(p.image_url, '_blank')}
                                    alt="凭证"
                                />
                                <div>
                                    <div>{p.user?.emoji || '😀'} {p.user?.name || '?'}</div>
                                    <div className={styles.proofDate}>
                                        {new Date(p.created_at).toLocaleString('zh-CN')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {!isPayer && !bill.settled && (
                    <>
                        <div
                            className={styles.proofUpload}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            📷 点击上传 e-Transfer 截图
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadProof(file);
                                e.target.value = '';
                            }}
                        />
                    </>
                )}
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                {isPayer ? (
                    <>
                        <button className={bill.settled ? styles.unsettleBtn : styles.settleBtn} onClick={handleToggleSettled}>
                            {bill.settled ? '↩ 取消结清' : '✓ 标记已结清'}
                        </button>
                        <button className={styles.editBtn} onClick={startEdit}>✏️ 编辑</button>
                        <button className={styles.deleteBtn} onClick={handleDelete}>🗑</button>
                    </>
                ) : (
                    <>
                        {!bill.settled && (
                            <button className={styles.payBtn} onClick={handlePayBtn}>💳 付款</button>
                        )}
                        <button className={bill.settled ? styles.unsettleBtn : styles.settleBtn} onClick={handleToggleSettled} disabled={bill.settled}>
                            {bill.settled ? '✓ 已结清' : '✓ 标记已结清'}
                        </button>
                        {!bill.settled && (
                            <button className={styles.protestBtn} onClick={handleProtest}>😡 异议!</button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

/** Edit mode view */
function EditView({
    bill,
    setBill,
    editingItemIdx,
    setEditingItemIdx,
    onSave,
    onCancel,
}: {
    bill: Bill;
    setBill: (b: Bill) => void;
    editingItemIdx: number | null;
    setEditingItemIdx: (i: number | null) => void;
    onSave: () => void;
    onCancel: () => void;
}) {
    const updateItem = (idx: number, updates: Partial<BillItem>) => {
        const items = [...bill.items];
        items[idx] = { ...items[idx], ...updates };
        setBill({ ...bill, items });
    };

    const deleteItem = (idx: number) => {
        const items = bill.items.filter((_, i) => i !== idx);
        setBill({ ...bill, items });
        setEditingItemIdx(null);
    };

    const addItem = () => {
        const defaultMembers = bill.items[0]?.members || [];
        const newItem: BillItem = {
            id: `new-${Date.now()}`,
            name: '新项目',
            price: 0,
            qty: 1,
            members: [...defaultMembers],
        };
        setBill({ ...bill, items: [...bill.items, newItem] });
        setEditingItemIdx(bill.items.length);
    };

    return (
        <div className={styles.page}>
            <div className={styles.detailHeader}>
                <div className={styles.detailIcon}>{bill.icon}</div>
                <div className={styles.detailTitleCol}>
                    <input
                        className={styles.editInput}
                        value={bill.title}
                        onChange={e => setBill({ ...bill, title: e.target.value })}
                        placeholder="标题"
                    />
                </div>
            </div>

            <div className={styles.itemsHeader}>
                <span>商品 / 服务</span><span>数量</span><span>金额</span><span>分摊</span>
            </div>

            {bill.items.map((item, idx) => {
                if (editingItemIdx === idx) {
                    return (
                        <div key={item.id} className={`${styles.itemRow} ${styles.itemEditing}`}>
                            <input
                                className={styles.editInput}
                                value={item.name}
                                onChange={e => updateItem(idx, { name: e.target.value })}
                                placeholder="名称"
                            />
                            <input
                                className={styles.editInputSm}
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={e => updateItem(idx, { qty: parseInt(e.target.value) || 1 })}
                            />
                            <input
                                className={styles.editInputSm}
                                type="number"
                                step="0.01"
                                value={item.price}
                                onChange={e => updateItem(idx, { price: parseFloat(e.target.value) || 0 })}
                            />
                            <div className={styles.editItemActions}>
                                <button className={styles.editItemBtn} onClick={() => deleteItem(idx)}>删除</button>
                                <button className={styles.editItemBtn} onClick={() => setEditingItemIdx(null)}>确定</button>
                            </div>
                        </div>
                    );
                }
                return (
                    <div key={item.id} className={styles.itemRow} onClick={() => setEditingItemIdx(idx)}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemQty}>×{item.qty || 1}</span>
                        <span className={styles.itemPrice}>{fmtMoney(item.price * (item.qty || 1))}</span>
                        <div className={styles.itemAvatars}>
                            {(item.members || []).map(m => (
                                <div key={m.id} className={styles.cav}>{m.emoji || '😀'}</div>
                            ))}
                        </div>
                    </div>
                );
            })}

            <button className={styles.addItemBtn} onClick={addItem}>＋ 添加项目</button>

            <div className={styles.editBar}>
                <button className={styles.editCancelBtn} onClick={onCancel}>取消</button>
                <button className={styles.editSaveBtn} onClick={onSave}>💾 保存</button>
            </div>
        </div>
    );
}
