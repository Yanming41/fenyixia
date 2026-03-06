import styles from './ScanPage.module.css';

export function ScanPage() {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>📷 小票扫描</h1>
                <p className={styles.desc}>拍照或上传小票图片，AI 自动识别账单明细</p>
            </div>
            <div className={styles.placeholder}>
                <div className={styles.icon}>📸</div>
                <p>OCR 扫描功能迁移中</p>
                <p className={styles.hint}>原 receipt-scanner 功能将在后续版本完整迁移</p>
            </div>
        </div>
    );
}
