import React from "react";

export const CircularProgress = ({
  percentage = 0,
  size = 110,
  strokeWidth = 10,
  color = "#3B82F6",
  trackColor = "#1e293b",
  showValue = true,
  subtitle,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const normalizedPct = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (normalizedPct / 100) * circumference;

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Animated progress circle */}
        <circle
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold text-white light:text-slate-900 leading-tight">
            {normalizedPct}%
          </span>
          {subtitle && (
            <span className="text-[10px] text-slate-400 light:text-slate-500 font-medium mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
