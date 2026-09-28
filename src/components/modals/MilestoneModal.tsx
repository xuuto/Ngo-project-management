import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  Flag,
  FileCheck,
  Building2,
  Clock
} from 'lucide-react';
import {
  Project,
  Milestone,
  MilestoneStatus,
  MilestoneCategory
} from '../../types/ngo';

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  defaultProjectId?: string;
  onSaveMilestone: (milestone: Milestone, projectId: string) => void;
  initialMilestone?: Milestone | null;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isOpen,
  onClose,
  projects,
  defaultProjectId,
  onSaveMilestone,
  initialMilestone
}) => {
  const [projectId, setProjectId] = useState<string>(
    initialMilestone?.projectId || defaultProjectId || (projects[0]?.id ?? '')
  );
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [completionDate, setCompletionDate] = useState<string>('');
  const [status, setStatus] = useState<MilestoneStatus>('Pending');
  const [category, setCategory] = useState<MilestoneCategory>('Key Delivery');
  const [assignedLead, setAssignedLead] = useState<string>('');
  const [isCriticalCheckpoint, setIsCriticalCheckpoint] = useState<boolean>(true);
  const [verificationCriteria, setVerificationCriteria] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (initialMilestone) {
      setProjectId(initialMilestone.projectId || defaultProjectId || (projects[0]?.id ?? ''));
      setTitle(initialMilestone.title);
      setDescription(initialMilestone.description);
      setDueDate(initialMilestone.dueDate);
      setCompletionDate(initialMilestone.completionDate || '');
      setStatus(initialMilestone.status);
      setCategory(initialMilestone.category);
      setAssignedLead(initialMilestone.assignedLead || '');
      setIsCriticalCheckpoint(initialMilestone.isCriticalCheckpoint ?? false);
      setVerificationCriteria(initialMilestone.verificationCriteria || '');
      setNotes(initialMilestone.notes || '');
    } else {
      setProjectId(defaultProjectId || (projects[0]?.id ?? ''));
      setTitle('');
      setDescription('');
      setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setCompletionDate('');
      setStatus('Pending');
      setCategory('Key Delivery');
      const selectedProj = projects.find((p) => p.id === (defaultProjectId || projects[0]?.id));
      setAssignedLead(selectedProj?.leadProjectManager.name || '');
      setIsCriticalCheckpoint(true);
      setVerificationCriteria('');
      setNotes('');
    }
  }, [initialMilestone, defaultProjectId, projects, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate || !projectId) return;

    const selectedProj = projects.find((p) => p.id === projectId);

    const newMilestone: Milestone = {
      id: initialMilestone?.id || `ms-${Date.now()}`,
      projectId,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      completionDate: status === 'Achieved' ? (completionDate || new Date().toISOString().split('T')[0]) : undefined,
      status,
      category,
      assignedLead: assignedLead.trim() || (selectedProj?.leadProjectManager.name ?? 'Project Focal Point'),
      isCriticalCheckpoint,
      verificationCriteria: verificationCriteria.trim() || undefined,
      notes: notes.trim() || undefined
    };

    onSaveMilestone(newMilestone, projectId);
    onClose();
  };

  const categories: MilestoneCategory[] = [
    'Key Delivery',
    'M&E Review',
    'Procurement & Works',
    'Donor Deliverable',
    'Field Checkpoint',
    'Community Handover'
  ];

  const statuses: MilestoneStatus[] = [
    'Pending',
    'In Progress',
    'Achieved',
    'Delayed',
    'Critical'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialMilestone ? 'Edit Project Milestone & Checkpoint' : 'Define New Critical Milestone & Checkpoint'}
              </h3>
              <p className="text-xs text-slate-500">
                Establish delivery target dates, verification gates, and accountability leads
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Project Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Project <span className="text-rose-600">*</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                const proj = projects.find((p) => p.id === e.target.value);
                if (proj && !assignedLead) {
                  setAssignedLead(proj.leadProjectManager.name);
                }
              }}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-hidden"
              required
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.shortTitle || p.title} ({p.donorName})
                </option>
              ))}
            </select>
          </div>

          {/* Milestone Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Milestone Title / Delivery Checkpoint <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete Solar Inverter Commissioning for 14 Deep Boreholes"
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-hidden"
              required
            />
          </div>

          {/* Critical Checkpoint Flag (Highlight Box) */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 flex items-start gap-3">
            <input
              type="checkbox"
              id="isCriticalCheckpoint"
              checked={isCriticalCheckpoint}
              onChange={(e) => setIsCriticalCheckpoint(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="isCriticalCheckpoint" className="cursor-pointer text-xs">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                Critical Delivery Gate / Key Checkpoint
              </span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Flag this milestone as a high-impact delivery gate essential for tranche disbursements, donor reporting, or community handover.
              </p>
            </label>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Milestone Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MilestoneCategory)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-hidden"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Execution Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MilestoneStatus)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-hidden"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates: Due Date & Completion Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Target Due Date <span className="text-rose-600">*</span></span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Actual Completion Date</span>
              </label>
              <input
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                placeholder="Optional if pending"
                disabled={status !== 'Achieved'}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
          </div>

          {/* Assigned Lead */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Assigned Focal Lead / Engineer</span>
            </label>
            <input
              type="text"
              value={assignedLead}
              onChange={(e) => setAssignedLead(e.target.value)}
              placeholder="e.g. Eng. Abdillahi Warsame Muse"
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-hidden"
            />
          </div>

          {/* Means of Verification / Verification Criteria */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Means of Verification / Verification Deeds</span>
            </label>
            <input
              type="text"
              value={verificationCriteria}
              onChange={(e) => setVerificationCriteria(e.target.value)}
              placeholder="e.g. Signed Ministry of Water Commissioning Certificate & Flowmeter telemetry deeds"
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-hidden"
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description &amp; Operational Scope
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the technical specifications, community engagement steps, or donor deliverable prerequisites..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-hidden"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Action Notes &amp; Status Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any current bottlenecks, progress remarks, or audit confirmations..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-hidden"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialMilestone ? 'Save Milestone Changes' : 'Create Project Milestone'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
