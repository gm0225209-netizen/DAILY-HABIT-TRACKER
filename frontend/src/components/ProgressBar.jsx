import React from "react";

export const ProgressBar = ({
  progress = 0,
  max = 100,
  height = "h-2.5",
  color = "bg-blue-500",
  showLabel = false,
  label,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((progress / max) * 100)));

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-medium">
          <span className="text-slate-400 light:text-slate-600">{label || "Progress"}</span>
          <span className="text-white light:text-slate-900 font-semibold">{percentage}%</span>
        </div>
      )}
      <div className={`w-full ${height} bg-slate-800 light:bg-slate-200 rounded-full overflow-hidden`}>
        <div
          className={`${height} ${color} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
