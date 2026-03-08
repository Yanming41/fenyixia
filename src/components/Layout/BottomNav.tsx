export default function BottomNav() {
    return (
        <div className="bottom-nav">
            <button className="nb on">
                <div className="nb-icon">📄</div>
                <div>我的账单</div>
            </button>
            <button
                className="add-btn"
                onClick={() => {
                    // TODO: Open "Add Bill" flow
                    alert('Add Bill clicked! Form coming soon.')
                }}
            >
                +
            </button>
            <button className="nb">
                <div className="nb-icon">📊</div>
                <div>统计数据</div>
            </button>
        </div>
    )
}
