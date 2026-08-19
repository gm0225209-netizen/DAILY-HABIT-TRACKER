import React from "react";
import { PlusCircle, Sparkles } from "lucide-react";

export const EmptyState = ({
  icon: Icon = Sparkles,
  title = "No items found",
  description = "Get started by adding your first record.",
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-800 light:border-slate-300 bg-slate-900/30 light:bg-slate-50 my-6">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-white light:text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 light:text-slate-600 max-w-md mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-150 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
