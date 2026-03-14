interface IncomeExpenseToggleProps {
  value: 'expense' | 'income'
  onChange: (v: 'expense' | 'income') => void
}

export default function IncomeExpenseToggle({ value, onChange }: IncomeExpenseToggleProps) {
  return (
    <div style={{
      display: 'flex',
      background: 'var(--bg2)',
      borderRadius: 10,
      padding: 3,
      gap: 2,
    }}>
      {(['expense', 'income'] as const).map(v => (
        <button
          key={v}
          onClick={() => onChange(v)}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: 8,
            border: 'none',
            background: value === v ? 'var(--bg4)' : 'transparent',
            color: value === v ? 'var(--label)' : 'var(--label3)',
            fontSize: 14,
            fontWeight: value === v ? 600 : 400,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all .2s',
          }}
        >
          {v === 'expense' ? '支出' : '入账'}
        </button>
      ))}
    </div>
  )
}
