import styles from './FormGroup.module.css';

interface TextInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: boolean;
    type?: 'text' | 'email';
}

export function TextInput({ label, value, onChange, placeholder, error, type = 'text' }: TextInputProps) {
    return (
        <div className={`${styles.field} ${error ? styles.error : ''}`}>
            <div className={styles.label}>{label}</div>
            <input
                className={styles.input}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}

interface NumberInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: boolean;
}

export function NumberInput({ label, value, onChange, placeholder, error }: NumberInputProps) {
    return (
        <div className={`${styles.field} ${error ? styles.error : ''}`}>
            <div className={styles.label}>{label}</div>
            <input
                className={styles.input}
                type="number"
                inputMode="decimal"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                min="0"
                step="0.01"
            />
        </div>
    );
}

interface IconPickerProps {
    icons: string[];
    selected: string;
    onChange: (icon: string) => void;
}

export function IconPicker({ icons, selected, onChange }: IconPickerProps) {
    return (
        <div className={styles.iconPicker}>
            {icons.map((icon) => (
                <button
                    key={icon}
                    className={`${styles.iconBtn} ${icon === selected ? styles.iconActive : ''}`}
                    onClick={() => onChange(icon)}
                    type="button"
                >
                    {icon}
                </button>
            ))}
        </div>
    );
}

interface SegmentedControlProps {
    options: { value: string; label: string }[];
    selected: string;
    onChange: (value: string) => void;
}

export function SegmentedControl({ options, selected, onChange }: SegmentedControlProps) {
    return (
        <div className={styles.segmented}>
            {options.map((opt) => (
                <button
                    key={opt.value}
                    className={`${styles.segment} ${opt.value === selected ? styles.segActive : ''}`}
                    onClick={() => onChange(opt.value)}
                    type="button"
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
