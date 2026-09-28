import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, Calendar, ArrowRight, Check, Play, Filter, ShieldAlert, X, Flame, Bookmark } from 'lucide-react';
import { MilestoneNotification } from '../types/notification';
import { formatDate } from '../utils/formatters';

interface NotificationPopoverProps {
  notifications: MilestoneNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onAcknowledge: (id: string) => void;
  onSelectProject: (projectId: string) => void;
  onOpenMilestoneAlertsModal: () => void;
  onRunDailyCheck: () => void;
  onMarkAchievedDirect: (milestoneId: string, projectId: string) => void;
  currentUserName: string;
  onToggleUrgent: (notificationId: string) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onAcknowledge,
  onSelectProject,
  onOpenMilestoneAlertsModal,
  onRunDailyCheck,
  onMarkAchievedDirect,
  currentUserName,
  onToggleUrgent
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'my_projects' | 'urgent'>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filterMode === 'my_projects') {
      const matchManager = n.managerName.toLowerCase().includes(currentUserName.toLowerCase()) ||
                           currentUserName.toLowerCase().includes(n.managerName.toLowerCase());
      return matchManager;
    }
    if (filterMode === 'urgent') {
      return n.isUrgent || n.urgency === 'High';
    }
    return true;
  });

  const unreadCount = filteredNotifications.filter((n) => !n.read).length;
  const urgentCount = notifications.filter((n) => n.isUrgent || n.urgency === 'High').length;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 md:w-[420px] bg-white rounded-xl shadow-2xl border border-slate-200 py-0 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
              <span>PM Milestone Alerts</span>
              {unreadCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {unreadCount} Unread
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-400">
              Evaluator with urgency labels (High, Medium, Low)
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Sub-bar Controls */}
      <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilterMode('urgent')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
              filterMode === 'urgent'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Urgent ({urgentCount})</span>
          </button>
          <button
            onClick={() => setFilterMode('my_projects')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
              filterMode === 'my_projects'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My PM
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onRunDailyCheck}
            title="Execute background milestone evaluation now"
            className="flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[11px] font-bold transition-colors cursor-pointer"
          >
            <Play className="w-3 h-3 text-emerald-700" />
            <span>Run Check</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-[11px] text-slate-500 hover:text-slate-900 underline"
            >
              Mark Read
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-900">No Milestone Alerts Match Filter</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              All milestones are on track or achieved.
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isOverdue = n.daysRemaining < 0;
            const urgencyBg =
              n.urgency === 'High'
                ? 'bg-rose-100 text-rose-900 border-rose-200'
                : n.urgency === 'Medium'
                ? 'bg-amber-100 text-amber-900 border-amber-200'
                : 'bg-blue-50 text-blue-800 border-blue-200';

            return (
              <div
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                className={`p-3.5 transition-colors group relative hover:bg-slate-50/80 ${
                  !n.read ? 'bg-amber-50/40 font-medium' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {n.projectCode}
                    </span>

                    {/* Urgency Badge */}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono border ${urgencyBg}`}>
                      {n.urgency} Urgency
                    </span>

                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        isOverdue
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isOverdue ? `${Math.abs(n.daysRemaining)}d overdue` : `${n.daysRemaining}d left`}
                    </span>

                    {n.isUrgent && (
                      <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <Bookmark className="w-2.5 h-2.5 fill-white" /> Urgent
                      </span>
                    )}
                  </div>

                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1" title="Unread Alert" />
                  )}
                </div>

                {/* Title & PM */}
                <h4 className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-2 leading-snug">
                  {n.milestoneTitle}
                </h4>

                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="truncate">PM: <strong className="text-slate-800">{n.managerName}</strong></span>
                  <span>Due: <strong className={isOverdue ? 'text-rose-700 font-bold' : 'text-slate-800'}>{formatDate(n.dueDate)}</strong></span>
                </div>

                {/* Actions */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleUrgent(n.id);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        n.isUrgent
                          ? 'bg-rose-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {n.isUrgent ? 'Flagged Urgent' : 'Mark Urgent'}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAchievedDirect(n.milestoneId, n.projectId);
                      }}
                      className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold transition-colors shadow-2xs"
                    >
                      Mark Achieved
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(n.projectId);
                      onClose();
                    }}
                    className="text-[10px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-0.5 hover:underline"
                  >
                    <span>Project</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-900 text-slate-200 border-t border-slate-800 text-center flex items-center justify-between px-4">
        <span className="text-[11px] text-slate-400">
          Total Alerts: <strong className="text-white">{notifications.length}</strong>
        </span>
        <button
          onClick={() => {
            onClose();
            onOpenMilestoneAlertsModal();
          }}
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors underline flex items-center gap-1"
        >
          <span>Open PM Notification Manager</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
