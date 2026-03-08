interface AvatarProps {
    emoji: string
    color?: string
    size?: number
    name?: string
}

export default function Avatar({ emoji, color, size = 42, name }: AvatarProps) {
    return (
        <div className="av-wrap">
            <div
                className="av"
                style={{
                    width: size,
                    height: size,
                    fontSize: size * 0.48,
                    background: color || 'linear-gradient(135deg, #30D158, #0A84FF)',
                }}
            >
                {emoji}
            </div>
            {name && <div className="av-name">{name}</div>}
        </div>
    )
}
