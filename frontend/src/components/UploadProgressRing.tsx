type UploadProgressRingProps = {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export default function UploadProgressRing({
  value,
  size = 56,
  stroke = 6,
  label,
}: UploadProgressRingProps) {
  const v = clamp(value);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (v / 100) * circumference;

  return (
    <div className="inline-flex items-center gap-3 rounded-full bg-secondary/70 px-3 py-2">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted/40"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-primary transition-all duration-200"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <span className="absolute text-xs font-semibold text-card-foreground">{v}%</span>
      </div>
      {label ? <span className="text-xs text-muted-foreground">{label}</span> : null}
    </div>
  );
}
