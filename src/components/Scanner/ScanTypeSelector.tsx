interface ScanTypeSelectorProps {
  value: 'physical' | 'digital'
  onChange: (type: 'physical' | 'digital') => void
}

export default function ScanTypeSelector({ value, onChange }: ScanTypeSelectorProps) {
  return (
    <div className="scanner-type-selector">
      <div className="scanner-type-title">选择小票类型</div>
      <div className="scanner-type-cards">
        <button
          className={`scanner-type-card${value === 'physical' ? ' active' : ''}`}
          onClick={() => onChange('physical')}
        >
          <span className="scanner-type-icon">🧾</span>
          <span className="scanner-type-label">实体小票</span>
          <span className="scanner-type-desc">超市、餐厅纸质收据</span>
        </button>
        <button
          className={`scanner-type-card${value === 'digital' ? ' active' : ''}`}
          onClick={() => onChange('digital')}
        >
          <span className="scanner-type-icon">📱</span>
          <span className="scanner-type-label">数字订单</span>
          <span className="scanner-type-desc">打车、外卖 App 截图</span>
        </button>
      </div>
    </div>
  )
}
