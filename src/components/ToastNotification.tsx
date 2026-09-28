import React from 'react';
import { Target, X, ArrowRight, CheckCircle } from 'lucide-react';

interface ToastNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  overdueCount: number;
  newCount: number;
  onOpenNotifications: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  isVisible,
  onClose,
  overdueCount,
  newCount,
  onOpenNotifications
}) => {
  if (!isVisible || overdueCount === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5 border border-rose-500/30">
            <Target className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                Daily Background Check
              </h4>
              {newCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[9px] font-bold rounded-full font-mono">
                  NEW
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-white mt-0.5">
              {overdueCount} {overdueCount === 1 ? 'Milestone Passed Deadline' : 'Milestones Passed Deadline'}
            </p>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              Unachieved milestone dates evaluated today. Visual alerts issued to project managers.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={onClose}
          className="text-[11px] text-slate-400 hover:text-slate-200"
        >
          Dismiss
        </button>

        <button
          onClick={() => {
            onClose();
            onOpenNotifications();
          }}
          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
        >
          <span>Review PM Alerts</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
