import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  FileText,
  FileCheck,
  Building,
  Shield,
  Layers,
  ChevronRight,
  TrendingUp,
  Receipt,
  Download,
  Quote
} from 'lucide-react';
import { Project, ActivityStatus, IndicatorStatus, FieldEvidence, Activity, Indicator } from '../types/ngo';
import { useAuth } from '../context/AuthContext';
import { formatUSD, formatSLSH, formatPercent, formatDate, formatNumber } from '../utils/formatters';

interface ProjectDetailViewProps {
  project: Project;
  currencyMode: 'USD' | 'SLSH';
  onBack: () => void;
  onUpdateActivityStatus: (projectId: string, activityId: string, status: ActivityStatus, progressPercent: number) => void;
  onUpdateIndicatorActual: (projectId: string, indicatorId: string, actual: number, status: IndicatorStatus) => void;
  onOpenActivityModal: (projectId: string, outputId: string) => void;
  onOpenIndicatorModal: (projectId: string, outputId: string) => void;
  onOpenExpenseModal: (projectId: string) => void;
  onOpenEvidenceModal: (projectId: string) => void;
  onOpenReportModal: (projectId: string) => void;
  onViewReportByProject: (projectId: string) => void;
}

type TabType = 'overview' | 'logframe' | 'activities' | 'budget' | 'evidence';

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  currencyMode,
  onBack,
  onUpdateActivityStatus,
  onUpdateIndicatorActual,
  onOpenActivityModal,
  onOpenIndicatorModal,
  onOpenExpenseModal,
  onOpenEvidenceModal,
  onOpenReportModal,
  onViewReportByProject
}) => {
  const { currentUser, hasPermission, canAccessProject } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('logframe');
  const [editingIndicatorId, setEditingIndicatorId] = useState<string | null>(null);
  const [indicatorEditVal, setIndicatorEditVal] = useState<number>(0);
  const [indicatorEditStatus, setIndicatorEditStatus] = useState<IndicatorStatus>('On Track');

  const isReadOnlyDonor = currentUser.role === 'Donor';
  const isTeamMember = currentUser.role === 'Team Member';

  const formatMoney = (usd: number) => {
    return currencyMode === 'USD' ? formatUSD(usd) : formatSLSH(usd);
  };

  const handleStartEditIndicator = (ind: Indicator) => {
    if (!hasPermission('projects:edit')) return;
    setEditingIndicatorId(ind.id);
    setIndicatorEditVal(ind.currentActual);
    setIndicatorEditStatus(ind.status);
  };

  const handleSaveIndicator = (indicatorId: string) => {
    onUpdateIndicatorActual(project.id, indicatorId, indicatorEditVal, indicatorEditStatus);
    setEditingIndicatorId(null);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects List</span>
        </button>

        <div className="flex items-center gap-2">
          {hasPermission('reports:generate') && (
            <button
              onClick={() => onOpenReportModal(project.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Donor Report</span>
            </button>
          )}

          {hasPermission('financials:create_voucher') && (
            <button
              onClick={() => onOpenExpenseModal(project.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Record Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Project Banner Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-emerald-800 font-bold">{project.code}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-700 font-semibold">{project.donorName}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-mono text-[11px]">Grant: {project.grantAgreementCode}</span>
              <span className="text-slate-300">·</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                {project.status}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1.5">{project.title}</h1>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {project.targetRegions.join(', ')} ({project.targetDistricts.join(', ')})
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDate(project.startDate)} — {formatDate(project.endDate)}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Lead: {project.leadProjectManager.name} ({project.leadProjectManager.email})
              </span>
            </p>
          </div>

          {/* Key Financial Metric Chip */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 shrink-0">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Grant Value</p>
              <p className="text-base font-bold font-mono text-slate-900">{formatMoney(project.budgetSummary.totalGrantUSD)}</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Burn Rate</p>
              <p className="text-base font-bold font-mono text-emerald-800">
                {formatPercent(project.budgetSummary.burnRatePercent)}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex border-b border-slate-200 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('logframe')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'logframe'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Logframe &amp; Indicators (OVIs)</span>
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'activities'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>2. Activities &amp; Field Milestones</span>
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'budget'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>3. Budget Lines &amp; Expenses</span>
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>4. Beneficiaries &amp; Strategy</span>
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'evidence'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Quote className="w-4 h-4" />
            <span>5. Field Evidence &amp; Stories ({project.fieldEvidences.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Logframe & Indicators */}
      {activeTab === 'logframe' && (
        <div className="space-y-6">
          {/* Overall Goal Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
              Overall Project Goal &amp; Long-Term Impact
            </span>
            <p className="text-sm text-slate-800 font-medium mt-1 leading-relaxed">
              {project.logframe.impactGoal}
            </p>
          </div>

          {/* Outcomes & Outputs Tree */}
          {project.logframe.outcomes.map((oc) => (
            <div key={oc.id} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="pb-3 border-b border-slate-100 flex items-start gap-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-bold text-xs rounded">
                  {oc.code}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{oc.title}</h3>
                </div>
              </div>

              {/* Outputs within this Outcome */}
              {oc.outputs.map((out) => (
                <div key={out.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-slate-200 text-slate-800 font-mono text-[11px] font-semibold rounded">
                        {out.code}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800">{out.title}</h4>
                    </div>
                    {hasPermission('projects:edit') && (
                      <button
                        onClick={() => onOpenIndicatorModal(project.id, out.id)}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 self-start sm:self-auto"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add OVI Indicator</span>
                      </button>
                    )}
                  </div>

                  {/* Indicators Table for this Output */}
                  <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-100/70 text-[11px]">
                          <th className="py-2 px-3">OVI Code</th>
                          <th className="py-2 px-3">Indicator Description</th>
                          <th className="py-2 px-3 text-right">Baseline</th>
                          <th className="py-2 px-3 text-right">Target</th>
                          <th className="py-2 px-3 text-right">Current Actual</th>
                          <th className="py-2 px-3 w-28 text-center">Progress %</th>
                          <th className="py-2 px-3">Means of Verification</th>
                          <th className="py-2 px-3 text-center">Status</th>
                          {hasPermission('projects:edit') && <th className="py-2 px-3 text-center">Action</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {out.indicators.map((ind) => {
                          const progress = ind.target > 0 ? (ind.currentActual / ind.target) * 100 : 0;
                          const isEditing = editingIndicatorId === ind.id;

                          return (
                            <tr key={ind.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{ind.code}</td>
                              <td className="py-2.5 px-3 font-medium text-slate-900 max-w-xs">
                                <div>{ind.description}</div>
                                {ind.disaggregationNote && (
                                  <div className="text-[10px] text-slate-500 mt-0.5 italic">{ind.disaggregationNote}</div>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-600">{ind.baseline}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">
                                {formatNumber(ind.target)} {ind.unit}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-800">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={indicatorEditVal}
                                    onChange={(e) => setIndicatorEditVal(Number(e.target.value))}
                                    className="w-20 px-1 py-0.5 border border-emerald-500 rounded text-right font-mono"
                                  />
                                ) : (
                                  `${formatNumber(ind.currentActual)} ${ind.unit}`
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <div className="flex items-center gap-1.5 justify-center">
                                  <div className="w-14 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className="bg-emerald-600 h-1.5 rounded-full"
                                      style={{ width: `${Math.min(100, progress)}%` }}
                                    />
                                  </div>
                                  <span className="font-mono text-[10px] font-semibold text-slate-700">
                                    {formatPercent(progress)}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-[11px] text-slate-500 max-w-[200px] truncate" title={ind.meansOfVerification}>
                                {ind.meansOfVerification}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {isEditing ? (
                                  <select
                                    value={indicatorEditStatus}
                                    onChange={(e) => setIndicatorEditStatus(e.target.value as IndicatorStatus)}
                                    className="text-[10px] border border-slate-300 rounded p-1"
                                  >
                                    <option value="On Track">On Track</option>
                                    <option value="Achieved">Achieved</option>
                                    <option value="Delayed">Delayed</option>
                                  </select>
                                ) : (
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                      ind.status === 'Achieved'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : ind.status === 'On Track'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {ind.status}
                                  </span>
                                )}
                              </td>
                              {hasPermission('projects:edit') && (
                                <td className="py-2.5 px-3 text-center">
                                  {isEditing ? (
                                    <button
                                      onClick={() => handleSaveIndicator(ind.id)}
                                      className="px-2 py-1 bg-emerald-700 text-white text-[10px] font-bold rounded hover:bg-emerald-800"
                                    >
                                      Save
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleStartEditIndicator(ind)}
                                      className="text-slate-500 hover:text-emerald-700 text-[11px] font-semibold"
                                    >
                                      Update
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Activities & Field Milestones */}
      {activeTab === 'activities' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Operational Field Activities &amp; Milestone Execution
              </h3>
              <p className="text-xs text-slate-500">
                Tasks assigned to PENHA field agronomists, engineers, and community mobilizers across districts
              </p>
            </div>
            {hasPermission('tasks:create') && (
              <button
                onClick={() => onOpenActivityModal(project.id, project.logframe.outcomes[0]?.outputs[0]?.id || '')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold self-start sm:self-auto transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Activity Task</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Activity Title &amp; Description</th>
                  <th className="py-2.5 px-3">Field Assignee</th>
                  <th className="py-2.5 px-3">Location &amp; District</th>
                  <th className="py-2.5 px-3">Timeline</th>
                  <th className="py-2.5 px-3 text-right">Budget</th>
                  <th className="py-2.5 px-3 w-28 text-center">Progress %</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {project.logframe.outcomes.flatMap((oc) =>
                  oc.outputs.flatMap((out) =>
                    out.activities.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{act.code}</td>
                        <td className="py-2.5 px-3 max-w-sm">
                          <div className="font-semibold text-slate-900">{act.title}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{act.description}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-800">{act.assignedTo}</div>
                          <div className="text-[10px] text-slate-500">{act.assignedRole}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {act.location} ({act.district})
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                          {formatDate(act.startDate)} - {formatDate(act.endDate)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900 font-semibold">
                          {formatMoney(act.budgetAllocatedUSD)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {hasPermission('tasks:update_status') ? (
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={act.progressPercent}
                              onChange={(e) =>
                                onUpdateActivityStatus(
                                  project.id,
                                  act.id,
                                  Number(e.target.value) === 100 ? 'Completed' : 'In Progress',
                                  Number(e.target.value)
                                )
                              }
                              className="w-20 cursor-pointer accent-emerald-700"
                            />
                          ) : (
                            <span className="font-mono text-xs">{act.progressPercent}%</span>
                          )}
                          <div className="text-[10px] font-mono text-slate-500">{act.progressPercent}%</div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {hasPermission('tasks:update_status') ? (
                            <select
                              value={act.status}
                              onChange={(e) =>
                                onUpdateActivityStatus(
                                  project.id,
                                  act.id,
                                  e.target.value as ActivityStatus,
                                  e.target.value === 'Completed' ? 100 : act.progressPercent
                                )
                              }
                              className="text-[10px] border border-slate-300 rounded p-1 font-medium bg-white"
                            >
                              <option value="Not Started">Not Started</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Field Verified">Field Verified</option>
                              <option value="Completed">Completed</option>
                            </select>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                              {act.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Budget Lines & Expenses */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Project Budget Lines &amp; Cost Control
                </h3>
                <p className="text-xs text-slate-500">
                  Approved donor allocation, expenditures to date, and available operational variance
                </p>
              </div>

              {hasPermission('financials:create_voucher') && (
                <button
                  onClick={() => onOpenExpenseModal(project.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold self-start sm:self-auto transition-colors"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Record Expense against Project</span>
                </button>
              )}
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50">
                    <th className="py-2.5 px-3">Line Code</th>
                    <th className="py-2.5 px-3">Cost Category</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Unit Qty</th>
                    <th className="py-2.5 px-3 text-right">Allocated</th>
                    <th className="py-2.5 px-3 text-right">Spent to Date</th>
                    <th className="py-2.5 px-3 text-right">Variance Balance</th>
                    <th className="py-2.5 px-3 w-28 text-center">Burn %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.budgetLines.map((bl) => {
                    const variance = bl.totalAllocatedUSD - bl.spentUSD;
                    const burn = bl.totalAllocatedUSD > 0 ? (bl.spentUSD / bl.totalAllocatedUSD) * 100 : 0;
                    return (
                      <tr key={bl.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{bl.code}</td>
                        <td className="py-2.5 px-3 text-slate-700">{bl.category}</td>
                        <td className="py-2.5 px-3 text-slate-900 font-medium max-w-sm">{bl.description}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                          {bl.quantity} {bl.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900 font-semibold">
                          {formatMoney(bl.totalAllocatedUSD)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-800 font-semibold">
                          {formatMoney(bl.spentUSD)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                          {formatMoney(variance)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                              burn > 90 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {formatPercent(burn)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Beneficiaries & Strategy */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Beneficiary Target Reach &amp; Disaggregation</h3>
            <p className="text-xs text-slate-500">
              Verified community reach disaggregated by gender, vulnerable pastoralist households, and marginalized herders
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500">Direct Pastoralists</span>
                <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  {formatNumber(project.beneficiaries.actualDirect)}
                </p>
                <span className="text-[10px] text-slate-400">/ {formatNumber(project.beneficiaries.targetDirect)} target</span>
              </div>
              <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-100">
                <span className="text-[11px] text-rose-800 font-medium">Pastoralist Women</span>
                <p className="text-lg font-bold font-mono text-rose-900 mt-0.5">
                  {formatNumber(project.beneficiaries.disaggregation.pastoralistWomen)}
                </p>
                <span className="text-[10px] text-rose-700">
                  {formatPercent((project.beneficiaries.disaggregation.pastoralistWomen / project.beneficiaries.actualDirect) * 100)} proportion
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500">Pastoral Households</span>
                <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  {formatNumber(project.beneficiaries.actualHouseholds)}
                </p>
                <span className="text-[10px] text-slate-400">Target: {formatNumber(project.beneficiaries.targetHouseholds)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500">Youth Under 25</span>
                <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  {formatNumber(project.beneficiaries.disaggregation.youthUnder25)}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500">Elderly Herders</span>
                <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  {formatNumber(project.beneficiaries.disaggregation.elderlyHerders)}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500">IDP &amp; Returnee Families</span>
                <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  {formatNumber(project.beneficiaries.disaggregation.idpReturneeHouseholds)}
                </p>
              </div>
            </div>
          </div>

          {/* Operational Risks & Customary Mitigation */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Contextual Risks &amp; Mitigation</h3>
            <div className="space-y-3">
              {project.risks.map((rk) => (
                <div key={rk.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{rk.category}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        rk.riskLevel === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rk.riskLevel}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{rk.description}</p>
                  <p className="text-emerald-800 text-[11px] font-medium pt-1 border-t border-slate-200">
                    <strong>Mitigation:</strong> {rk.mitigationPlan}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Field Evidence & Stories */}
      {activeTab === 'evidence' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                M&amp;E Field Verification Logs &amp; Beneficiary Testimonials
              </h3>
              <p className="text-xs text-slate-500">
                Audited field inspections, GPS geo-tags, and direct quotes from pastoralist community leaders
              </p>
            </div>
            {hasPermission('evidence:submit') && (
              <button
                onClick={() => onOpenEvidenceModal(project.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold self-start sm:self-auto transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New Field Evidence</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {project.fieldEvidences.map((ev) => (
              <div key={ev.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{ev.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {ev.verifiedStatus}
                    </span>
                  </div>
                  <span className="font-mono text-slate-500 text-[11px]">{formatDate(ev.date)}</span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-mono text-emerald-800 font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    GPS: {ev.gpsCoordinates}
                  </span>
                  <span>·</span>
                  <span>Location: {ev.location}</span>
                  <span>·</span>
                  <span>Monitored By: {ev.monitoredBy}</span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{ev.summary}</p>

                {ev.beneficiaryQuote && (
                  <div className="p-3 bg-white rounded-lg border-l-4 border-emerald-700 shadow-2xs text-xs italic text-slate-800">
                    <Quote className="w-4 h-4 text-emerald-700 mb-1" />
                    <p className="mb-2">"{ev.beneficiaryQuote.text}"</p>
                    <p className="not-italic text-[11px] font-semibold text-slate-700 text-right">
                      — {ev.beneficiaryQuote.speakerName}, {ev.beneficiaryQuote.role} ({ev.beneficiaryQuote.village})
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
