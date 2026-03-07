import { useState } from 'react';
import { BottomSheet } from '../BottomSheet';
import { IconPicker, TextInput, NumberInput, SegmentedControl } from '../FormGroup';
import { useBills } from '../../contexts/BillsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Toast';
import { BILL_ICONS, BILL_COLORS } from '../../utils/constants';
import styles from './CreateBillModal.module.css';

interface CreateBillModalProps {
    open: boolean;
    onClose: () => void;
}

const PEOPLE_OPTIONS = [
    { value: '2', label: '2人' },
    { value: '3', label: '3人' },
    { value: '4', label: '4人' },
    { value: '5', label: '5人' },
    { value: '6', label: '6人' },
];

export function CreateBillModal({ open, onClose }: CreateBillModalProps) {
    const { createBill, bills } = useBills();
    const { user } = useAuth();
    const { toast: showToast } = useToast();

    const [icon, setIcon] = useState('🧾');
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [payer, setPayer] = useState('');
    const [nPeople, setNPeople] = useState('4');
    const [saving, setSaving] = useState(false);

    const [titleErr, setTitleErr] = useState(false);
    const [amountErr, setAmountErr] = useState(false);
    const [payerErr, setPayerErr] = useState(false);

    const resetForm = () => {
        setIcon('🧾');
        setTitle('');
        setAmount('');
        setPayer('');
        setNPeople('4');
        setTitleErr(false);
        setAmountErr(false);
        setPayerErr(false);
    };

    const handleCreate = async () => {
        if (!user) return;

        let valid = true;
        setTitleErr(false);
        setAmountErr(false);
        setPayerErr(false);

        if (!title.trim()) { setTitleErr(true); valid = false; }
        const amt = parseFloat(amount);
        if (!amt || amt <= 0) { setAmountErr(true); valid = false; }
        if (!payer.trim()) { setPayerErr(true); valid = false; }
        if (!valid) return;

        setSaving(true);
        try {
            const color = BILL_COLORS[bills.length % BILL_COLORS.length];
            const today = new Date().toISOString().slice(0, 10);

            await createBill({
                icon,
                title: title.trim(),
                description: `${payer.trim()} \u00b7 ${nPeople}\u4eba\u5747\u644a`,
                date: today,
                color,
                items: [{
                    name: title.trim(),
                    price: amt,
                    qty: 1,
                    member_ids: [user.id],
                }],
            });

            showToast('\u2713 \u8d26\u5355\u5df2\u521b\u5efa', 'success');
            resetForm();
            onClose();
        } catch (err) {
            showToast('\u521b\u5efa\u5931\u8d25: ' + (err instanceof Error ? err.message : '\u8bf7\u91cd\u8bd5'), 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <BottomSheet open={open} onClose={handleClose} title="\u65b0\u5efa\u8d26\u5355" fullHeight={false}>
            <div className={styles.section}>
                <div className={styles.sectionLabel}>\u7c7b\u578b</div>
                <IconPicker icons={BILL_ICONS} selected={icon} onChange={setIcon} />
            </div>

            <div className={styles.formGroup}>
                <TextInput label="\u540d\u79f0" value={title} onChange={setTitle} placeholder="\u8d85\u5e02\u91c7\u8d2d" error={titleErr} />
                <NumberInput label="\u91d1\u989d" value={amount} onChange={setAmount} placeholder="0.00" error={amountErr} />
                <TextInput label="\u57ab\u4ed8\u4eba" value={payer} onChange={setPayer} placeholder="\u8c01\u5148\u4ed8\u7684\uff1f" error={payerErr} />
            </div>

            <div className={styles.section}>
                <div className={styles.sectionLabel}>\u5206\u8d26\u4eba\u6570</div>
                <SegmentedControl options={PEOPLE_OPTIONS} selected={nPeople} onChange={setNPeople} />
            </div>

            <button className={styles.submitBtn} onClick={handleCreate} disabled={saving}>
                {saving ? '\u4fdd\u5b58\u4e2d\u2026' : '\u521b\u5efa\u8d26\u5355'}
            </button>
        </BottomSheet>
    );
}

/** Add options action sheet (manual vs OCR) */
interface AddOptionsSheetProps {
    open: boolean;
    onClose: () => void;
    onManual: () => void;
    onOCR: () => void;
}

export function AddOptionsSheet({ open, onClose, onManual, onOCR }: AddOptionsSheetProps) {
    return (
        <BottomSheet open={open} onClose={onClose} title="\u9009\u62e9\u6dfb\u52a0\u65b9\u5f0f" fullHeight={false}>
            <button className={styles.optionBtn} onClick={onManual}>
                \u270d\ufe0f \u624b\u52a8\u8f93\u5165
            </button>
            <button className={styles.optionBtn} onClick={onOCR}>
                \ud83d\udcf7 \u62cd\u7167/\u76f8\u518c\u4e0a\u4f20 (OCR)
            </button>
            <button className={`${styles.optionBtn} ${styles.cancelBtn}`} onClick={onClose}>
                \u53d6\u6d88
            </button>
        </BottomSheet>
    );
}
