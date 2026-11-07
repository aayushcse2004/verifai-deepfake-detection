import React from 'react';

interface GaugeMeterProps {
  score: number; // 0.00 to 1.00
  size?: number;
  label?: string;
  subLabel?: string;
}

export const GaugeMeter: React.FC<GaugeMeterProps> = ({
  score,
  size = 180,
  label = 'Risk Indicator',
  subLabel = 'Aggregated Multimodal Score',
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(1, Math.max(0, score));
  const strokeDashoffset = circumference - normalizedScore * circumference;

  let strokeColor = '#22C55E'; // green
  if (normalizedScore >= 0.62) {
    strokeColor = '#EF4444'; // red
  } else if (normalizedScore >= 0.38) {
    strokeColor = '#F59E0B'; // orange/amber
  }

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${strokeColor}40)`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
            {Math.round(normalizedScore * 100)}%
          </span>
          <span className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider mt-0.5">
            {normalizedScore < 0.38 ? 'Low Risk' : normalizedScore < 0.62 ? 'Elevated' : 'High Risk'}
          </span>
        </div>
      </div>

      <div className="text-center mt-3">
        <h4 className="text-sm font-semibold text-white">{label}</h4>
        <p className="text-xs text-[#94A3B8]">{subLabel}</p>
      </div>
    </div>
  );
};

