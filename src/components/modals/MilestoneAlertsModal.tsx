import React, { useState, useMemo } from 'react';
import {
  X,
  Target,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  Building,
  Filter,
  Download,
  Check,
  RefreshCw,
  Flag,
  ArrowRight,
  Flame,
  Bookmark
} from 'lucide-react';
import { Project, Milestone } from '../../types/ngo';
import { MilestoneNotification, UrgencyLevel } from '../../types/notification';
import { formatDate, exportToCSV } from '../../utils/formatters';

interface MilestoneAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: MilestoneNotification[];
  projects: Project[];
  onUpdateMilestoneStatus: (
    milestoneId: string,
    projectId: string,
    status: any,
    completionDate?: string
  ) => void;
  onSaveMilestone: (milestone: Milestone, projectId: string) => void;
  onSelectProject: (projectId: string) => void;
  onRunDailyCheck: () => void;
  lastCheckDate: string | null;
  onToggleUrgent: (notificationId: string) => void;
}

export const MilestoneAlertsModal: React.FC<MilestoneAlertsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  projects,
  onUpdateMilestoneStatus,
  onSaveMilestone,
  onSelectProject,
  onRunDailyCheck,
  lastCheckDate,
  onToggleUrgent
}) => {
  const [selectedManager, setSelectedManager] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [markedUrgentOnly, setMarkedUrgentOnly] = useState<boolean>(false);

  const [rescheduleMilestoneData, setRescheduleMilestoneData] = useState<{
    milestoneId: string;
    projectId: string;
    currentDueDate: string;
    title: string;
  } | null>(null);
  const [newDueDate, setNewDueDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Extract distinct managers
  const distinctManagers = useMemo(() => {
    const set = new Set<string>();
    notifications.forEach((n) => set.add(n.managerName));
    return Array.from(set);
  }, [notifications]);

  // Filtered list with urgency & marked urgent filters
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (selectedManager !== 'all' && n.managerName !== selectedManager) return false;
      if (selectedCategory !== 'all' && n.milestoneCategory !== selectedCategory) return false;
      if (selectedUrgency !== 'all' && n.urgency !== selectedUrgency) return false;
      if (markedUrgentOnly && !n.isUrgent) return false;
      return true;
    });
  }, [notifications, selectedManager, selectedCategory, selectedUrgency, markedUrgentOnly]);

  if (!isOpen) return null;

  // Export CSV of milestones
  const handleExportCSV = () => {
    const headers = [
      'Project Code',
      'Project Title',
      'Milestone Title',
      'Category',
      'Due Date',
      'Days Remaining / Overdue',
      'Urgency',
      'Marked Urgent',
      'Status',
      'Critical Gate',
      'Project Manager',
      'PM Email'
    ];

    const rows = filteredNotifications.map((n) => [
      n.projectCode,
      n.projectTitle,
      n.milestoneTitle,
      n.milestoneCategory,
      n.dueDate,
      n.daysRemaining < 0 ? `${Math.abs(n.daysRemaining)} days overdue` : `${n.daysRemaining} days left`,
      n.urgency,
      n.isUrgent ? 'YES' : 'NO',
      n.status,
      n.isCriticalCheckpoint ? 'YES' : 'NO',
      n.managerName,
      n.managerEmail
    ]);

    exportToCSV(`PENHA_Milestone_Alerts_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleMilestoneData || !newDueDate) return;

    const proj = projects.find((p) => p.id === rescheduleMilestoneData.projectId);
    if (!proj) return;

    const ms = (proj.milestones || []).find((m) => m.id === rescheduleMilestoneData.milestoneId);
    if (!ms) return;

    const updatedMs: Milestone = {
      ...ms,
      dueDate: newDueDate,
      status: 'In Progress',
      notes: `${ms.notes || ''}\n[Rescheduled on ${new Date().toISOString().slice(0, 10)}]: Extended from ${rescheduleMilestoneData.currentDueDate} to ${newDueDate}. Reason: ${rescheduleReason || 'Management adjustment'}`
    };

    onSaveMilestone(updatedMs, proj.id);
    setRescheduleMilestoneData(null);
    setNewDueDate('');
    setRescheduleReason('');
    onRunDailyCheck(); // recheck
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Target className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Project Manager Milestone Notification Center</h2>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-rose-600 text-white rounded-full">
                  {notifications.length} Active Items
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Automated deadline evaluation with urgency labeling (High, Medium, Low) and urgent flagging.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Trigger Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* PM Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Project Manager:</span>
              <select
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Managers ({distinctManagers.length})</option>
                {distinctManagers.map((mgr) => (
                  <option key={mgr} value={mgr}>{mgr}</option>
                ))}
              </select>
            </div>

            {/* Urgency Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-slate-500 font-medium">Urgency:</span>
              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Urgency Levels</option>
                <option value="High">High Urgency</option>
                <option value="Medium">Medium Urgency</option>
                <option value="Low">Low Urgency</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Key Delivery">Key Delivery</option>
                <option value="M&E Review">M&E Review</option>
                <option value="Procurement & Works">Procurement &amp; Works</option>
                <option value="Donor Deliverable">Donor Deliverable</option>
                <option value="Field Checkpoint">Field Checkpoint</option>
                <option value="Community Handover">Community Handover</option>
              </select>
            </div>

            {/* Mark as Urgent Filter Toggle */}
            <button
              onClick={() => setMarkedUrgentOnly(!markedUrgentOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                markedUrgentOnly
                  ? 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${markedUrgentOnly ? 'fill-white' : 'text-rose-500'}`} />
              <span>Marked Urgent Only</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRunDailyCheck}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Run Daily Check Now</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {lastCheckDate && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-900 flex items-center justify-between">
              <span>
                <strong>Daily Check Status:</strong> Last executed for date <strong>{lastCheckDate}</strong>. Urgency labels assigned based on deadline timeline.
              </span>
              <span className="font-mono text-[11px] font-bold text-emerald-800">
                Showing {filteredNotifications.length} of {notifications.length} Active Items
              </span>
            </div>
          )}

          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">No Milestone Alerts Match Current Filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Try clearing filters or clicking "Marked Urgent Only" toggle to view flagged items.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredNotifications.map((notif) => {
                const isOverdue = notif.daysRemaining < 0;
                const urgencyColor =
                  notif.urgency === 'High'
                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                    : notif.urgency === 'Medium'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-blue-50 text-blue-800 border-blue-200';

                return (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border transition-all ${
                      notif.isUrgent
                        ? 'border-rose-500 bg-rose-50/40 shadow-sm'
                        : notif.urgency === 'High'
                        ? 'border-rose-300 bg-rose-50/10 hover:border-rose-400'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {notif.projectCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-600 truncate">
                          {notif.projectTitle}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {notif.milestoneCategory}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Urgency Badge */}
                        <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full font-mono border ${urgencyColor}`}>
                          {notif.urgency} Urgency
                        </span>

                        {/* Days remaining / overdue badge */}
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full font-mono ${
                            isOverdue
                              ? 'bg-rose-600 text-white animate-pulse'
                              : notif.daysRemaining <= 3
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isOverdue
                            ? `${Math.abs(notif.daysRemaining)} Days Overdue`
                            : `${notif.daysRemaining} Days Left`}
                        </span>
                      </div>
                    </div>

                    {/* Milestone Body */}
                    <div className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900">
                            {notif.milestoneTitle}
                          </h4>
                          {notif.isCriticalCheckpoint && (
                            <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded">
                              <Flag className="w-3 h-3 fill-rose-600 text-rose-700" />
                              Critical Gate
                            </span>
                          )}
                          {notif.isUrgent && (
                            <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                              <Bookmark className="w-3 h-3 fill-white" />
                              Flagged Urgent
                            </span>
                          )}
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>Assigned PM: <strong className="text-slate-800">{notif.managerName}</strong> ({notif.managerRole})</span>
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-rose-500" />
                            <span>Deadline: <strong className={`font-mono ${isOverdue ? 'text-rose-700 font-bold' : 'text-slate-800'}`}>{formatDate(notif.dueDate)}</strong></span>
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* Mark as Urgent Toggle Button */}
                        <button
                          onClick={() => onToggleUrgent(notif.id)}
                          title="Toggle urgent flag for filtered review"
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                            notif.isUrgent
                              ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-2xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${notif.isUrgent ? 'fill-white' : ''}`} />
                          <span>{notif.isUrgent ? 'Urgent Flagged' : 'Mark as Urgent'}</span>
                        </button>

                        <button
                          onClick={() => {
                            onUpdateMilestoneStatus(notif.milestoneId, notif.projectId, 'Achieved');
                            onRunDailyCheck();
                          }}
                          className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Achieved</span>
                        </button>

                        <button
                          onClick={() =>
                            setRescheduleMilestoneData({
                              milestoneId: notif.milestoneId,
                              projectId: notif.projectId,
                              currentDueDate: notif.dueDate,
                              title: notif.milestoneTitle
                            })
                          }
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          <span>Reschedule</span>
                        </button>

                        <button
                          onClick={() => {
                            onSelectProject(notif.projectId);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <span>Open Project</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reschedule Dialog overlay */}
        {rescheduleMilestoneData && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <form onSubmit={handleRescheduleSubmit} className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">Reschedule Milestone Due Date</h3>
                <button
                  type="button"
                  onClick={() => setRescheduleMilestoneData(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600">
                <p><strong>Milestone:</strong> {rescheduleMilestoneData.title}</p>
                <p className="mt-1 text-slate-500">Current Due Date: <span className="font-mono text-rose-600 font-bold">{rescheduleMilestoneData.currentDueDate}</span></p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Extended Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Extension / Justification Note
                </label>
                <textarea
                  rows={2}
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Unseasonal rainy spell delayed field water point civil works in Sheikh district."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRescheduleMilestoneData(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Confirm Extended Date
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            PENHA Horn of Africa · Automated Milestone Safeguard Protocol with Urgency Labeling
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-bold transition-colors cursor-pointer"
          >
            Close Notification Center
          </button>
        </div>
      </div>
    </div>
  );
};
