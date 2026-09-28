import React, { useState, useMemo } from 'react';
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
  TrendingDown,
  Receipt,
  Download,
  Quote,
  ShieldAlert,
  Edit2,
  Trash2,
  AlertTriangle,
  Filter,
  X,
  MessageSquare,
  Scale,
  Flag,
  Target,
  Sparkles,
  Check,
  Circle,
  CalendarCheck,
  Milestone as MilestoneIcon,
  BarChart2
} from 'lucide-react';
import {
  Project,
  ActivityStatus,
  IndicatorStatus,
  FieldEvidence,
  Activity,
  Indicator,
  RiskItem,
  RiskSeverity,
  RiskStatus,
  BudgetLineItem,
  BudgetCategory,
  Milestone,
  MilestoneStatus,
  MilestoneCategory
} from '../types/ngo';
import { useAuth } from '../context/AuthContext';
import { formatUSD, formatSLSH, formatPercent, formatDate, formatNumber } from '../utils/formatters';
import { ActivityCalendarView } from './ActivityCalendarView';
import { ProjectGanttView } from './ProjectGanttView';

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
  onOpenAddRiskModal?: (projectId: string) => void;
  onEditRisk?: (risk: RiskItem, projectId: string) => void;
  onDeleteRisk?: (riskId: string, projectId: string) => void;
  onUpdateRiskStatus?: (riskId: string, projectId: string, status: RiskStatus) => void;
  onUpdateBudgetLineIntervention?: (projectId: string, lineId: string, intervention: string) => void;
  onOpenMilestoneModal?: (projectId: string) => void;
  onEditMilestone?: (milestone: Milestone, projectId: string) => void;
  onDeleteMilestone?: (milestoneId: string, projectId: string) => void;
  onUpdateMilestoneStatus?: (milestoneId: string, projectId: string, status: MilestoneStatus, completionDate?: string) => void;
}

type TabType = 'overview' | 'logframe' | 'milestones' | 'activities' | 'calendar' | 'gantt' | 'budget' | 'evidence' | 'risks';

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
  onViewReportByProject,
  onOpenAddRiskModal,
  onEditRisk,
  onDeleteRisk,
  onUpdateRiskStatus,
  onUpdateBudgetLineIntervention,
  onOpenMilestoneModal,
  onEditMilestone,
  onDeleteMilestone,
  onUpdateMilestoneStatus
}) => {
  const { currentUser, hasPermission, canAccessProject } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('logframe');
  const [editingIndicatorId, setEditingIndicatorId] = useState<string | null>(null);
  const [indicatorEditVal, setIndicatorEditVal] = useState<number>(0);
  const [indicatorEditStatus, setIndicatorEditStatus] = useState<IndicatorStatus>('On Track');

  // Budget Variance Filter & Intervention Modal State
  const [budgetVarianceFilter, setBudgetVarianceFilter] = useState<'all' | 'flagged' | 'overspent' | 'underspent'>('all');
  const [selectedLineForIntervention, setSelectedLineForIntervention] = useState<BudgetLineItem | null>(null);
  const [interventionText, setInterventionText] = useState<string>('');

  // Milestone Tab State & Filters
  const [milestoneFilter, setMilestoneFilter] = useState<'all' | 'critical' | 'active' | 'achieved' | 'delayed'>('all');
  const [milestoneCategoryFilter, setMilestoneCategoryFilter] = useState<string>('all');
  const [milestoneViewMode, setMilestoneViewMode] = useState<'roadmap' | 'gantt' | 'table'>('gantt');

  const isReadOnlyDonor = currentUser.role === 'Donor';
  const isTeamMember = currentUser.role === 'Team Member';

  const formatMoney = (usd: number) => {
    return currencyMode === 'USD' ? formatUSD(usd) : formatSLSH(usd);
  };

  // Timeline Progress Analysis
  const todayRef = useMemo(() => new Date('2026-09-27'), []);

  const timelineStats = useMemo(() => {
    const startDateObj = new Date(project.startDate);
    const endDateObj = new Date(project.endDate);
    const totalDays = Math.max(1, Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)));
    const elapsedDays = Math.max(0, Math.min(totalDays, Math.ceil((todayRef.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24))));
    const elapsedPercent = Number(((elapsedDays / totalDays) * 100).toFixed(1));
    return {
      totalDays,
      elapsedDays,
      elapsedPercent
    };
  }, [project.startDate, project.endDate, todayRef]);

  // Milestones List & Analytics
  const milestonesList = useMemo(() => project.milestones || [], [project.milestones]);

  const milestoneStats = useMemo(() => {
    const list = milestonesList;
    const totalCount = list.length;
    const achievedCount = list.filter((m) => m.status === 'Achieved').length;
    const inProgressCount = list.filter((m) => m.status === 'In Progress').length;
    const delayedCount = list.filter((m) => m.status === 'Delayed' || m.status === 'Critical').length;
    const pendingCount = list.filter((m) => m.status === 'Pending').length;

    const criticalList = list.filter((m) => m.isCriticalCheckpoint);
    const criticalTotal = criticalList.length;
    const criticalAchieved = criticalList.filter((m) => m.status === 'Achieved').length;
    const criticalDelayed = criticalList.filter((m) => m.status === 'Delayed' || m.status === 'Critical').length;

    const progressPercent = totalCount > 0 ? Math.round((achievedCount / totalCount) * 100) : 0;

    // Next upcoming milestone
    const upcomingList = [...list]
      .filter((m) => m.status !== 'Achieved')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const nextMilestone = upcomingList[0] || null;

    let nextDueDays: number | null = null;
    if (nextMilestone) {
      const diffMs = new Date(nextMilestone.dueDate).getTime() - todayRef.getTime();
      nextDueDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    return {
      totalCount,
      achievedCount,
      inProgressCount,
      delayedCount,
      pendingCount,
      criticalTotal,
      criticalAchieved,
      criticalDelayed,
      progressPercent,
      nextMilestone,
      nextDueDays
    };
  }, [milestonesList, todayRef]);

  const filteredMilestones = useMemo(() => {
    return milestonesList.filter((m) => {
      if (milestoneFilter === 'critical' && !m.isCriticalCheckpoint) return false;
      if (milestoneFilter === 'active' && (m.status === 'Achieved' || m.status === 'Delayed' || m.status === 'Critical')) return false;
      if (milestoneFilter === 'achieved' && m.status !== 'Achieved') return false;
      if (milestoneFilter === 'delayed' && m.status !== 'Delayed' && m.status !== 'Critical') return false;

      if (milestoneCategoryFilter !== 'all' && m.category !== milestoneCategoryFilter) return false;

      return true;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [milestonesList, milestoneFilter, milestoneCategoryFilter]);

  // Gantt Chart Timeline Month Headers & Ranges
  const ganttTimeMonths = useMemo(() => {
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);

    const months: { label: string; year: number; monthIdx: number; dateKey: string; startMs: number; endMs: number }[] = [];
    let cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);

    while (cur <= last) {
      const year = cur.getFullYear();
      const monthIdx = cur.getMonth();
      const monthLabel = cur.toLocaleString('default', { month: 'short' });
      const label = `${monthLabel} '${String(year).slice(-2)}`;
      const startMs = new Date(year, monthIdx, 1).getTime();
      const endMs = new Date(year, monthIdx + 1, 0, 23, 59, 59).getTime();

      months.push({
        label,
        year,
        monthIdx,
        dateKey: `${year}-${String(monthIdx + 1).padStart(2, '0')}`,
        startMs,
        endMs
      });

      cur.setMonth(cur.getMonth() + 1);
    }
    return months;
  }, [project.startDate, project.endDate]);

  const ganttRange = useMemo(() => {
    if (ganttTimeMonths.length === 0) return { startMs: 0, endMs: 1, totalMs: 1 };
    const startMs = ganttTimeMonths[0].startMs;
    const endMs = ganttTimeMonths[ganttTimeMonths.length - 1].endMs;
    const totalMs = Math.max(1, endMs - startMs);
    return { startMs, endMs, totalMs };
  }, [ganttTimeMonths]);

  const allActivitiesList = useMemo(() => {
    return project.logframe.outcomes.flatMap((oc) =>
      oc.outputs.flatMap((out) => out.activities)
    );
  }, [project.logframe]);

  // Budget Variance Analytics per line
  const budgetVarianceLines = useMemo(() => {
    return project.budgetLines.map((bl) => {
      const allocated = bl.totalAllocatedUSD;
      const spent = bl.spentUSD;
      const varianceUSD = allocated - spent;
      const burnRatePercent = allocated > 0 ? (spent / allocated) * 100 : 0;
      // Variance compared to timeline progress:
      const timelineVarianceDelta = Number((burnRatePercent - timelineStats.elapsedPercent).toFixed(1));

      // Overspending if burn rate exceeds timeline by >15% OR if total budget is already >95% exhausted while timeline is not near end
      const isOverspending = timelineVarianceDelta > 15 || burnRatePercent > 100;
      // Underspending if burn rate lags timeline by >15% and spend is <75%
      const isUnderspending = timelineVarianceDelta < -15 && burnRatePercent < 75;
      const isFlagged = isOverspending || isUnderspending;

      return {
        ...bl,
        varianceUSD,
        burnRatePercent,
        timelineVarianceDelta,
        isOverspending,
        isUnderspending,
        isFlagged
      };
    });
  }, [project.budgetLines, timelineStats.elapsedPercent]);

  // Aggregate Category Breakdown
  const categoryBreakdown = useMemo(() => {
    const map = new Map<BudgetCategory, { allocated: number; spent: number; linesCount: number; flaggedCount: number }>();

    budgetVarianceLines.forEach((line) => {
      const cur = map.get(line.category) || { allocated: 0, spent: 0, linesCount: 0, flaggedCount: 0 };
      cur.allocated += line.totalAllocatedUSD;
      cur.spent += line.spentUSD;
      cur.linesCount += 1;
      if (line.isFlagged) cur.flaggedCount += 1;
      map.set(line.category, cur);
    });

    return Array.from(map.entries()).map(([category, stats]) => {
      const burn = stats.allocated > 0 ? (stats.spent / stats.allocated) * 100 : 0;
      const varianceUSD = stats.allocated - stats.spent;
      const varianceDelta = Number((burn - timelineStats.elapsedPercent).toFixed(1));
      return {
        category,
        allocated: stats.allocated,
        spent: stats.spent,
        varianceUSD,
        burnRatePercent: burn,
        varianceDelta,
        linesCount: stats.linesCount,
        flaggedCount: stats.flaggedCount,
        isFlagged: Math.abs(varianceDelta) > 15 || burn > 100
      };
    });
  }, [budgetVarianceLines, timelineStats.elapsedPercent]);

  // Summary counts
  const flaggedCount = useMemo(() => budgetVarianceLines.filter((l) => l.isFlagged).length, [budgetVarianceLines]);
  const overspentCount = useMemo(() => budgetVarianceLines.filter((l) => l.isOverspending).length, [budgetVarianceLines]);
  const underspentCount = useMemo(() => budgetVarianceLines.filter((l) => l.isUnderspending).length, [budgetVarianceLines]);

  // Filtered lines for display
  const filteredBudgetLines = useMemo(() => {
    if (budgetVarianceFilter === 'flagged') return budgetVarianceLines.filter((l) => l.isFlagged);
    if (budgetVarianceFilter === 'overspent') return budgetVarianceLines.filter((l) => l.isOverspending);
    if (budgetVarianceFilter === 'underspent') return budgetVarianceLines.filter((l) => l.isUnderspending);
    return budgetVarianceLines;
  }, [budgetVarianceLines, budgetVarianceFilter]);

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

  const handleOpenInterventionModal = (line: BudgetLineItem) => {
    setSelectedLineForIntervention(line);
    setInterventionText(line.managementIntervention || '');
  };

  const handleSaveIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLineForIntervention) return;
    if (onUpdateBudgetLineIntervention) {
      onUpdateBudgetLineIntervention(project.id, selectedLineForIntervention.id, interventionText.trim());
    }
    setSelectedLineForIntervention(null);
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
            {flaggedCount > 0 && (
              <>
                <div className="h-8 w-px bg-slate-200" />
                <button
                  onClick={() => setActiveTab('budget')}
                  title="Click to inspect significant budget line variances (>15%)"
                  className="text-left cursor-pointer group"
                >
                  <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                    <span>Variance Flags</span>
                  </p>
                  <p className="text-xs font-bold font-mono text-rose-800 group-hover:underline mt-0.5">
                    {flaggedCount} {flaggedCount === 1 ? 'Line >15%' : 'Lines >15%'}
                  </p>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Milestone Visual Progress Tracking Bar Banner */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Target className="w-4 h-4" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Milestone Progress &amp; Delivery Gates</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                    {milestoneStats.progressPercent}% Achieved ({milestoneStats.achievedCount}/{milestoneStats.totalCount})
                  </span>
                  {milestoneStats.criticalDelayed > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600 animate-pulse" />
                      <span>{milestoneStats.criticalDelayed} Critical Gate Delayed</span>
                    </span>
                  )}
                </div>
                {milestoneStats.nextMilestone && (
                  <p className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Next Critical Gate: <strong className="text-slate-800">{milestoneStats.nextMilestone.title}</strong></span>
                    <span className={`font-semibold ${milestoneStats.nextDueDays !== null && milestoneStats.nextDueDays < 0 ? 'text-rose-600 font-bold' : 'text-slate-600 font-mono'}`}>
                      ({milestoneStats.nextDueDays !== null && milestoneStats.nextDueDays < 0 ? `Overdue by ${Math.abs(milestoneStats.nextDueDays)} days` : `Due in ${milestoneStats.nextDueDays} days`})
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => setActiveTab('milestones')}
                className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 hover:underline flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50/70 border border-emerald-200 transition-colors"
              >
                <span>View Full Roadmap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              {hasPermission('projects:edit') && onOpenMilestoneModal && (
                <button
                  onClick={() => onOpenMilestoneModal(project.id)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[11px] font-bold shadow-2xs transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Milestone</span>
                </button>
              )}
            </div>
          </div>

          {/* Multi-Segmented Progress Bar */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner border border-slate-200">
              {milestoneStats.totalCount > 0 ? (
                <>
                  <div
                    style={{ width: `${(milestoneStats.achievedCount / milestoneStats.totalCount) * 100}%` }}
                    className="bg-emerald-600 transition-all duration-500 relative group cursor-pointer"
                    title={`Achieved: ${milestoneStats.achievedCount} milestones`}
                  />
                  <div
                    style={{ width: `${(milestoneStats.inProgressCount / milestoneStats.totalCount) * 100}%` }}
                    className="bg-amber-500 transition-all duration-500 relative group cursor-pointer"
                    title={`In Progress: ${milestoneStats.inProgressCount} milestones`}
                  />
                  <div
                    style={{ width: `${(milestoneStats.delayedCount / milestoneStats.totalCount) * 100}%` }}
                    className="bg-rose-500 transition-all duration-500 relative group cursor-pointer"
                    title={`Delayed/Critical: ${milestoneStats.delayedCount} milestones`}
                  />
                  <div
                    style={{ width: `${(milestoneStats.pendingCount / milestoneStats.totalCount) * 100}%` }}
                    className="bg-slate-300 transition-all duration-500 relative group cursor-pointer"
                    title={`Pending: ${milestoneStats.pendingCount} milestones`}
                  />
                </>
              ) : (
                <div className="h-full w-full bg-slate-200" />
              )}
            </div>

            {/* Checkpoint Nodes Timeline Stepper */}
            {milestonesList.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {milestonesList
                  .slice()
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .map((ms) => {
                    const isAchieved = ms.status === 'Achieved';
                    const isDelayed = ms.status === 'Delayed' || ms.status === 'Critical';
                    const isInProgress = ms.status === 'In Progress';

                    let badgeColor = 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100';
                    let dotColor = 'bg-slate-400';
                    if (isAchieved) {
                      badgeColor = 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100';
                      dotColor = 'bg-emerald-600';
                    } else if (isDelayed) {
                      badgeColor = 'bg-rose-50 border-rose-300 text-rose-900 hover:bg-rose-100';
                      dotColor = 'bg-rose-600';
                    } else if (isInProgress) {
                      badgeColor = 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100';
                      dotColor = 'bg-amber-500';
                    }

                    return (
                      <button
                        key={ms.id}
                        onClick={() => {
                          setActiveTab('milestones');
                          setMilestoneFilter('all');
                        }}
                        className={`group shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-md border text-left transition-all hover:scale-102 ${badgeColor}`}
                        title={`${ms.title} (${ms.status}) - Target: ${formatDate(ms.dueDate)}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                        {ms.isCriticalCheckpoint && (
                          <Flag className="w-3 h-3 text-amber-600 fill-amber-500 shrink-0" />
                        )}
                        <span className="text-[10px] font-bold truncate max-w-[140px]">{ms.title}</span>
                        <span className="text-[9px] font-mono text-slate-500 shrink-0">
                          {formatDate(ms.dueDate).split(' ')[0]} {formatDate(ms.dueDate).split(' ')[1]}
                        </span>
                      </button>
                    );
                  })}
              </div>
            )}
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
            onClick={() => setActiveTab('milestones')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'milestones'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>2. Milestones &amp; Delivery Gates</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 ml-1 font-mono">
              {milestoneStats.achievedCount}/{milestoneStats.totalCount}
            </span>
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
            <span>3. Field Activities</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>4. Activity Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab('gantt')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'gantt'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-emerald-700" />
            <span>Gantt Timeline</span>
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
            <span>5. Budget Lines &amp; Variance Analysis</span>
            {flaggedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 ml-1">
                {flaggedCount} &gt;15%
              </span>
            )}
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
            <span>6. Beneficiaries &amp; Strategy</span>
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
            <span>7. Field Evidence &amp; Stories ({project.fieldEvidences.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'risks'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>8. Risks &amp; Mitigation ({project.risks.length})</span>
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

      {/* TAB 2: Milestones & Delivery Gates */}
      {activeTab === 'milestones' && (
        <div className="space-y-6">
          {/* Milestone Overview & KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Milestones</span>
                <span className="p-2 rounded-lg bg-slate-100 text-slate-700">
                  <Target className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{milestoneStats.totalCount}</p>
              <p className="text-xs text-slate-500 mt-1">Across all project phases</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Achieved Gates</span>
                <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-2xl font-bold font-mono text-emerald-800">{milestoneStats.achievedCount}</p>
                <span className="text-xs font-bold text-emerald-600 font-mono">({milestoneStats.progressPercent}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${milestoneStats.progressPercent}%` }} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Critical Checkpoints</span>
                <span className="p-2 rounded-lg bg-amber-100 text-amber-800">
                  <Flag className="w-4 h-4 fill-amber-500 text-amber-600" />
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-2xl font-bold font-mono text-slate-900">{milestoneStats.criticalAchieved}/{milestoneStats.criticalTotal}</p>
                {milestoneStats.criticalDelayed > 0 && (
                  <span className="text-xs font-bold text-rose-600 font-mono animate-pulse">({milestoneStats.criticalDelayed} Delayed)</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">Mission-critical delivery gates</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Next Deadline</span>
                <span className="p-2 rounded-lg bg-blue-100 text-blue-800">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              {milestoneStats.nextMilestone ? (
                <div className="mt-2">
                  <p className="text-xs font-bold text-slate-900 truncate" title={milestoneStats.nextMilestone.title}>
                    {milestoneStats.nextMilestone.title}
                  </p>
                  <p className={`text-xs font-bold mt-1 font-mono ${milestoneStats.nextDueDays !== null && milestoneStats.nextDueDays < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                    {milestoneStats.nextDueDays !== null && milestoneStats.nextDueDays < 0
                      ? `Overdue by ${Math.abs(milestoneStats.nextDueDays)} days (${formatDate(milestoneStats.nextMilestone.dueDate)})`
                      : `Due in ${milestoneStats.nextDueDays} days (${formatDate(milestoneStats.nextMilestone.dueDate)})`}
                  </p>
                </div>
              ) : (
                <p className="text-sm font-semibold text-slate-500 mt-2">All milestones completed</p>
              )}
            </div>
          </div>

          {/* Detailed Progress Bar Card with Multi-Segmented Visual Indicator */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-800" />
                  <span>Project Delivery Lifecycle &amp; Progress Bar</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time visualization of achieved targets, active engagements, and delivery risk gates
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span className="font-medium">Achieved: <strong>{milestoneStats.achievedCount}</strong></span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="font-medium">In Progress: <strong>{milestoneStats.inProgressCount}</strong></span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="font-medium">Delayed: <strong>{milestoneStats.delayedCount}</strong></span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="font-medium">Pending: <strong>{milestoneStats.pendingCount}</strong></span>
                </span>
              </div>
            </div>

            {/* Visual Tracking Bar */}
            <div className="mt-4">
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner border border-slate-200">
                {milestoneStats.totalCount > 0 ? (
                  <>
                    <div
                      style={{ width: `${(milestoneStats.achievedCount / milestoneStats.totalCount) * 100}%` }}
                      className="bg-emerald-600 transition-all duration-500 hover:brightness-110"
                      title={`Achieved: ${milestoneStats.achievedCount} milestones`}
                    />
                    <div
                      style={{ width: `${(milestoneStats.inProgressCount / milestoneStats.totalCount) * 100}%` }}
                      className="bg-amber-500 transition-all duration-500 hover:brightness-110"
                      title={`In Progress: ${milestoneStats.inProgressCount} milestones`}
                    />
                    <div
                      style={{ width: `${(milestoneStats.delayedCount / milestoneStats.totalCount) * 100}%` }}
                      className="bg-rose-500 transition-all duration-500 hover:brightness-110"
                      title={`Delayed/Critical: ${milestoneStats.delayedCount} milestones`}
                    />
                    <div
                      style={{ width: `${(milestoneStats.pendingCount / milestoneStats.totalCount) * 100}%` }}
                      className="bg-slate-300 transition-all duration-500 hover:brightness-110"
                      title={`Pending: ${milestoneStats.pendingCount} milestones`}
                    />
                  </>
                ) : (
                  <div className="h-full w-full bg-slate-200" />
                )}
              </div>
            </div>
          </div>

          {/* Action Toolbar & Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <button
                onClick={() => setMilestoneFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  milestoneFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Milestones ({milestonesList.length})
              </button>
              <button
                onClick={() => setMilestoneFilter('critical')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  milestoneFilter === 'critical'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Flag className="w-3.5 h-3.5 fill-current" />
                <span>Critical Gates ({milestoneStats.criticalTotal})</span>
              </button>
              <button
                onClick={() => setMilestoneFilter('active')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  milestoneFilter === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                Active &amp; Pending ({milestoneStats.inProgressCount + milestoneStats.pendingCount})
              </button>
              <button
                onClick={() => setMilestoneFilter('achieved')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  milestoneFilter === 'achieved'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                Achieved ({milestoneStats.achievedCount})
              </button>
              {milestoneStats.delayedCount > 0 && (
                <button
                  onClick={() => setMilestoneFilter('delayed')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                    milestoneFilter === 'delayed'
                      ? 'bg-rose-700 text-white'
                      : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Delayed ({milestoneStats.delayedCount})</span>
                </button>
              )}
            </div>

            {/* Category Filter & View Mode & Add Button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={milestoneCategoryFilter}
                  onChange={(e) => setMilestoneCategoryFilter(e.target.value)}
                  className="text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-600 outline-hidden"
                >
                  <option value="all">All Categories</option>
                  <option value="Key Delivery">Key Delivery</option>
                  <option value="M&E Review">M&amp;E Review</option>
                  <option value="Procurement & Works">Procurement &amp; Works</option>
                  <option value="Donor Deliverable">Donor Deliverable</option>
                  <option value="Field Checkpoint">Field Checkpoint</option>
                  <option value="Community Handover">Community Handover</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 p-0.5 text-xs font-semibold">
                <button
                  onClick={() => setMilestoneViewMode('gantt')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    milestoneViewMode === 'gantt' ? 'bg-white shadow-2xs text-emerald-800 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Gantt Chart</span>
                </button>
                <button
                  onClick={() => setMilestoneViewMode('roadmap')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    milestoneViewMode === 'roadmap' ? 'bg-white shadow-2xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Roadmap
                </button>
                <button
                  onClick={() => setMilestoneViewMode('table')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    milestoneViewMode === 'table' ? 'bg-white shadow-2xs text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Table
                </button>
              </div>

              {/* Add Milestone Button */}
              {hasPermission('projects:edit') && onOpenMilestoneModal && (
                <button
                  onClick={() => onOpenMilestoneModal(project.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Define Milestone</span>
                </button>
              )}
            </div>
          </div>

          {/* Milestones Display (Gantt vs Roadmap vs Table) */}
          {filteredMilestones.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Milestones Match the Selected Filter</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try selecting a different filter or define a new delivery checkpoint for this project.
              </p>
              {hasPermission('projects:edit') && onOpenMilestoneModal && (
                <button
                  onClick={() => onOpenMilestoneModal(project.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Define New Milestone</span>
                </button>
              )}
            </div>
          ) : milestoneViewMode === 'gantt' ? (
            /* Gantt-Style Interactive Timeline Chart */
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              {/* Gantt Header Legend */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-800" />
                    <span>Project Gantt Timeline ({formatDate(project.startDate)} — {formatDate(project.endDate)})</span>
                  </span>
                  <span className="text-slate-300">|</span>
                  <div className="flex flex-wrap items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      <span className="text-slate-700">Achieved Gate</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-slate-700">In Progress</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                      <span className="text-rose-700 font-bold">Delayed / Overdue Gate</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="text-slate-700">Activity Bar</span>
                    </span>
                  </div>
                </div>

                <div className="text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2.5 py-1 rounded-md">
                  Today Reference: 27 Sep 2026
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                  {/* Month Columns Header */}
                  <div className="flex border-b border-slate-200 bg-slate-100 text-[10px] font-bold font-mono text-slate-600 uppercase">
                    <div className="w-64 p-2.5 shrink-0 border-r border-slate-200 bg-slate-200/60">
                      Item Title &amp; Lead
                    </div>
                    <div className="flex-1 flex relative">
                      {ganttTimeMonths.map((m) => (
                        <div
                          key={m.dateKey}
                          className="flex-1 p-2 text-center border-r border-slate-200 shrink-0 truncate"
                          title={m.label}
                        >
                          {m.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gantt Body */}
                  <div className="divide-y divide-slate-100 relative">
                    {/* TODAY Reference Line */}
                    {(() => {
                      const todayMs = todayRef.getTime();
                      const todayLeftPercent = ((todayMs - ganttRange.startMs) / ganttRange.totalMs) * 100;
                      if (todayLeftPercent >= 0 && todayLeftPercent <= 100) {
                        return (
                          <div
                            style={{ left: `calc(16rem + ${todayLeftPercent}% * (1 - 16rem / 100%))` }}
                            className="absolute top-0 bottom-0 z-20 border-r-2 border-rose-500 border-dashed pointer-events-none"
                          >
                            <span className="absolute -top-3 -translate-x-1/2 bg-rose-600 text-white text-[9px] font-bold font-mono px-1.5 py-0.5 rounded shadow-2xs whitespace-nowrap">
                              TODAY
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Section 1: Critical Checkpoints & Milestones */}
                    <div className="bg-slate-50/70 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 border-b border-slate-200 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" />
                      <span>Section A: Key Milestones &amp; Critical Delivery Gates ({filteredMilestones.length})</span>
                    </div>

                    {filteredMilestones.map((ms) => {
                      const dueMs = new Date(ms.dueDate).getTime();
                      const leftPercent = Math.max(0, Math.min(98, ((dueMs - ganttRange.startMs) / ganttRange.totalMs) * 100));

                      const isAchieved = ms.status === 'Achieved';
                      const isDelayed = ms.status === 'Delayed' || ms.status === 'Critical' || (!isAchieved && dueMs < todayRef.getTime());
                      const isInProgress = ms.status === 'In Progress';

                      return (
                        <div key={ms.id} className={`flex items-center hover:bg-slate-50 transition-colors ${isDelayed ? 'bg-rose-50/20' : ''}`}>
                          <div className="w-64 p-2.5 shrink-0 border-r border-slate-200 text-xs">
                            <div className="font-bold text-slate-900 truncate flex items-center gap-1" title={ms.title}>
                              {ms.isCriticalCheckpoint && (
                                <Flag className="w-3 h-3 text-amber-600 fill-amber-500 shrink-0" />
                              )}
                              <span>{ms.title}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5 font-mono">
                              <span>Due: {formatDate(ms.dueDate)}</span>
                              <span className="font-semibold text-slate-700">{ms.assignedLead?.split(' ')[0] || 'Lead'}</span>
                            </div>
                          </div>

                          <div className="flex-1 p-2 relative h-12 flex items-center">
                            {/* Milestone Point Marker */}
                            <div
                              style={{ left: `${leftPercent}%` }}
                              className="absolute -translate-x-1/2 flex items-center gap-1 group z-10 cursor-pointer"
                            >
                              <div
                                className={`px-2.5 py-1 rounded-lg shadow-sm border text-[10px] font-bold font-mono flex items-center gap-1 transition-transform group-hover:scale-110 ${
                                  isAchieved
                                    ? 'bg-emerald-600 text-white border-emerald-700'
                                    : isDelayed
                                    ? 'bg-rose-600 text-white border-rose-700 animate-pulse ring-2 ring-rose-300'
                                    : isInProgress
                                    ? 'bg-amber-500 text-white border-amber-600'
                                    : 'bg-slate-700 text-white border-slate-800'
                                }`}
                              >
                                {ms.isCriticalCheckpoint ? (
                                  <Flag className="w-3 h-3 fill-white" />
                                ) : (
                                  <CheckCircle2 className="w-3 h-3" />
                                )}
                                <span className="truncate max-w-[100px]">{ms.title}</span>
                              </div>

                              {/* Overdue Warning Flag */}
                              {isDelayed && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 font-mono text-[9px] font-bold shadow-2xs animate-bounce">
                                  ⚠️ OVERDUE
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Section 2: Operational Field Activities */}
                    <div className="bg-slate-50/70 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-900 border-b border-slate-200 flex items-center gap-1.5 mt-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                      <span>Section B: Logframe Field Activities ({allActivitiesList.length})</span>
                    </div>

                    {allActivitiesList.map((act) => {
                      const startMs = new Date(act.startDate).getTime();
                      const endMs = new Date(act.endDate).getTime();

                      const leftPercent = Math.max(0, Math.min(100, ((startMs - ganttRange.startMs) / ganttRange.totalMs) * 100));
                      const rightPercent = Math.max(0, Math.min(100, ((endMs - ganttRange.startMs) / ganttRange.totalMs) * 100));
                      const widthPercent = Math.max(2, rightPercent - leftPercent);

                      const isCompleted = act.status === 'Completed' || act.progressPercent === 100;

                      return (
                        <div key={act.id} className="flex items-center hover:bg-slate-50 transition-colors">
                          <div className="w-64 p-2.5 shrink-0 border-r border-slate-200 text-xs">
                            <div className="font-mono font-bold text-blue-800 text-[10px]">{act.code}</div>
                            <div className="font-semibold text-slate-900 truncate" title={act.title}>{act.title}</div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                              <span>{act.location}</span>
                              <span className="font-mono font-bold text-slate-700">{act.progressPercent}%</span>
                            </div>
                          </div>

                          <div className="flex-1 p-2 relative h-10 flex items-center">
                            {/* Activity Duration Bar */}
                            <div
                              style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                              className={`absolute h-6 rounded-md shadow-2xs border p-1 text-[9px] font-bold text-white flex items-center justify-between overflow-hidden cursor-pointer transition-all hover:brightness-110 ${
                                isCompleted
                                  ? 'bg-emerald-600 border-emerald-700'
                                  : act.progressPercent > 50
                                  ? 'bg-blue-600 border-blue-700'
                                  : 'bg-amber-500 border-amber-600'
                              }`}
                              title={`${act.code}: ${act.title} (${act.progressPercent}%) - ${formatDate(act.startDate)} to ${formatDate(act.endDate)}`}
                            >
                              <span className="truncate pl-1 font-mono">{act.code} ({act.progressPercent}%)</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : milestoneViewMode === 'roadmap' ? (
            /* Roadmap / Timeline Stream View */
            <div className="space-y-4">
              {filteredMilestones.map((ms, index) => {
                const isAchieved = ms.status === 'Achieved';
                const isDelayed = ms.status === 'Delayed' || ms.status === 'Critical';
                const isInProgress = ms.status === 'In Progress';

                const dueObj = new Date(ms.dueDate);
                const diffDays = Math.ceil((dueObj.getTime() - todayRef.getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={ms.id}
                    className={`bg-white rounded-xl border transition-all p-5 shadow-2xs relative ${
                      ms.isCriticalCheckpoint ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'
                    } ${isAchieved ? 'bg-emerald-50/20' : ''}`}
                  >
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">#{index + 1}</span>

                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {ms.category}
                        </span>

                        {ms.isCriticalCheckpoint && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Flag className="w-3 h-3 fill-amber-600 text-amber-700" />
                            <span>Critical Delivery Gate</span>
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isAchieved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : isInProgress
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : isDelayed
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {ms.status}
                        </span>
                      </div>

                      {/* Right Action Tools */}
                      {hasPermission('projects:edit') && (
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {onUpdateMilestoneStatus && (
                            <select
                              value={ms.status}
                              onChange={(e) =>
                                onUpdateMilestoneStatus(
                                  ms.id,
                                  project.id,
                                  e.target.value as MilestoneStatus,
                                  e.target.value === 'Achieved' ? new Date().toISOString().split('T')[0] : undefined
                                )
                              }
                              className="text-[10px] font-semibold py-1 px-2 border border-slate-300 rounded-md bg-white text-slate-700 focus:ring-1 focus:ring-emerald-600"
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Achieved">Achieved</option>
                              <option value="Delayed">Delayed</option>
                              <option value="Critical">Critical Attention</option>
                            </select>
                          )}

                          {onEditMilestone && (
                            <button
                              onClick={() => onEditMilestone(ms, project.id)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                              title="Edit Milestone"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {onDeleteMilestone && (
                            <button
                              onClick={() => onDeleteMilestone(ms.id, project.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Delete Milestone"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Milestone Details */}
                    <div className="py-3 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">{ms.title}</h4>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1 sm:justify-end">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Due: {formatDate(ms.dueDate)}</span>
                          </span>
                          {isAchieved ? (
                            <span className="text-[10px] font-semibold text-emerald-700 font-mono block">
                              Completed on {formatDate(ms.completionDate || ms.dueDate)}
                            </span>
                          ) : (
                            <span
                              className={`text-[10px] font-semibold font-mono block ${
                                diffDays < 0 ? 'text-rose-600 font-bold' : diffDays <= 30 ? 'text-amber-700' : 'text-slate-500'
                              }`}
                            >
                              {diffDays < 0 ? `Overdue by ${Math.abs(diffDays)} days` : `Due in ${diffDays} days`}
                            </span>
                          )}
                        </div>
                      </div>

                      {ms.description && (
                        <p className="text-xs text-slate-600 leading-relaxed">{ms.description}</p>
                      )}

                      {/* Verification Criteria Box */}
                      {ms.verificationCriteria && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1 mt-2">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                            Means of Verification &amp; Audit Evidence:
                          </span>
                          <p className="text-slate-700 pl-5">{ms.verificationCriteria}</p>
                        </div>
                      )}

                      {/* Action Notes */}
                      {ms.notes && (
                        <div className="text-[11px] text-slate-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60">
                          <strong className="text-amber-950">Status Notes:</strong> {ms.notes}
                        </div>
                      )}
                    </div>

                    {/* Footer Info */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Assigned Lead: <strong className="text-slate-800">{ms.assignedLead || project.leadProjectManager.name}</strong></span>
                      </span>

                      {!isAchieved && onUpdateMilestoneStatus && hasPermission('projects:edit') && (
                        <button
                          onClick={() =>
                            onUpdateMilestoneStatus(
                              ms.id,
                              project.id,
                              'Achieved',
                              new Date().toISOString().split('T')[0]
                            )
                          }
                          className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark as Achieved</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table Grid View */
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Milestone Title &amp; Scope</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Target Date</th>
                      <th className="py-2.5 px-3">Assigned Lead</th>
                      <th className="py-2.5 px-3">Verification Deed</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      {hasPermission('projects:edit') && <th className="py-2.5 px-3 text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMilestones.map((ms, idx) => {
                      const isAchieved = ms.status === 'Achieved';
                      const isDelayed = ms.status === 'Delayed' || ms.status === 'Critical';
                      const isInProgress = ms.status === 'In Progress';

                      return (
                        <tr key={ms.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-slate-400 font-bold">{idx + 1}</td>
                          <td className="py-2.5 px-3 max-w-sm">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {ms.isCriticalCheckpoint && (
                                <span title="Critical Gate">
                                  <Flag className="w-3.5 h-3.5 fill-amber-500 text-amber-600 shrink-0" />
                                </span>
                              )}
                              <span>{ms.title}</span>
                            </div>
                            {ms.description && (
                              <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{ms.description}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {ms.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-800">
                            <div>{formatDate(ms.dueDate)}</div>
                            {isAchieved && ms.completionDate && (
                              <div className="text-[10px] text-emerald-700">Done: {formatDate(ms.completionDate)}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-700">{ms.assignedLead || project.leadProjectManager.name}</td>
                          <td className="py-2.5 px-3 max-w-xs text-[11px] text-slate-600">
                            {ms.verificationCriteria ? (
                              <div className="truncate" title={ms.verificationCriteria}>
                                {ms.verificationCriteria}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {hasPermission('projects:edit') && onUpdateMilestoneStatus ? (
                              <select
                                value={ms.status}
                                onChange={(e) =>
                                  onUpdateMilestoneStatus(
                                    ms.id,
                                    project.id,
                                    e.target.value as MilestoneStatus,
                                    e.target.value === 'Achieved' ? new Date().toISOString().split('T')[0] : undefined
                                  )
                                }
                                className="text-[10px] border border-slate-300 rounded p-1 font-semibold bg-white"
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Achieved">Achieved</option>
                                <option value="Delayed">Delayed</option>
                                <option value="Critical">Critical</option>
                              </select>
                            ) : (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isAchieved
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isInProgress
                                    ? 'bg-amber-100 text-amber-800'
                                    : isDelayed
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {ms.status}
                              </span>
                            )}
                          </td>
                          {hasPermission('projects:edit') && (
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {onEditMilestone && (
                                  <button
                                    onClick={() => onEditMilestone(ms, project.id)}
                                    className="p-1 text-slate-400 hover:text-slate-800 rounded"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {onDeleteMilestone && (
                                  <button
                                    onClick={() => onDeleteMilestone(ms.id, project.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Activities & Field Milestones */}
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
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('calendar')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Activity Calendar View</span>
              </button>
              {hasPermission('tasks:create') && (
                <button
                  onClick={() => onOpenActivityModal(project.id, project.logframe.outcomes[0]?.outputs[0]?.id || '')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Activity Task</span>
                </button>
              )}
            </div>
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

      {/* TAB 4: Activity Calendar View */}
      {activeTab === 'calendar' && (
        <ActivityCalendarView
          project={project}
          onUpdateActivityStatus={onUpdateActivityStatus}
          hasEditPermission={hasPermission('tasks:update_status') || hasPermission('projects:edit')}
        />
      )}

      {/* Gantt Chart Timeline View */}
      {activeTab === 'gantt' && (
        <ProjectGanttView
          project={project}
          onUpdateActivityStatus={onUpdateActivityStatus}
        />
      )}

      {/* TAB 5: Budget Lines & Variance Analysis */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          {/* Executive Variance Alert Banner */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl text-white ${flaggedCount > 0 ? 'bg-rose-700' : 'bg-emerald-800'}`}>
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Actual vs. Budgeted Expenditure Variance Analysis
                    </h3>
                    {flaggedCount > 0 ? (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>{flaggedCount} {flaggedCount === 1 ? 'Variance Flag (>15%)' : 'Variance Flags (>15%)'}</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Within Nominal Limits (±15%)</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Continuous fiscal monitoring benchmarked against elapsed project duration ({timelineStats.elapsedPercent}% timeline elapsed)
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {hasPermission('financials:create_voucher') && (
                  <button
                    onClick={() => onOpenExpenseModal(project.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Record Expense Voucher</span>
                  </button>
                )}
              </div>
            </div>

            {/* 4 KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Timeline Benchmark</span>
                <p className="text-lg font-bold font-mono text-slate-900 mt-1">
                  {timelineStats.elapsedPercent}% <span className="text-xs font-normal text-slate-500">elapsed</span>
                </p>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="bg-slate-700 h-1.5 rounded-full" style={{ width: `${Math.min(100, timelineStats.elapsedPercent)}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Projected Budget Ceiling</span>
                <p className="text-lg font-bold font-mono text-slate-900 mt-1">
                  {formatMoney(project.budgetSummary.totalGrantUSD)}
                </p>
                <span className="text-[10px] text-slate-500">{project.budgetLines.length} approved line items</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Cumulative Spent to Date</span>
                <p className="text-lg font-bold font-mono text-emerald-800 mt-1">
                  {formatMoney(project.budgetSummary.expendituresUSD)}
                </p>
                <span className="text-[10px] text-emerald-700 font-bold">
                  {formatPercent(project.budgetSummary.burnRatePercent)} overall burn
                </span>
              </div>

              <div className={`p-3.5 rounded-xl border ${flaggedCount > 0 ? 'bg-rose-50/70 border-rose-200' : 'bg-emerald-50/70 border-emerald-200'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${flaggedCount > 0 ? 'text-rose-800' : 'text-emerald-800'}`}>
                  Variance Risk Status
                </span>
                <p className={`text-lg font-bold font-mono mt-1 ${flaggedCount > 0 ? 'text-rose-900' : 'text-emerald-900'}`}>
                  {flaggedCount > 0 ? `${flaggedCount} Lines Flagged` : '0 Lines Flagged'}
                </p>
                <span className={`text-[10px] font-medium ${flaggedCount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {flaggedCount > 0 ? `${overspentCount} overspend · ${underspentCount} underspend` : 'All lines within ±15% threshold'}
                </span>
              </div>
            </div>

            {/* Proactive Management Advisory Callout if flagged */}
            {flaggedCount > 0 && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1.5 text-rose-950">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-700" />
                  <span>Management Intervention Advisory (Threshold &gt;15% Variance Detected):</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-900/90 pl-1 font-medium">
                  {overspentCount > 0 && (
                    <li>
                      <strong>Accelerated Outlier Lines:</strong> {overspentCount} budget line(s) are expending funds faster than planned timeline by &gt;15%. If category variance exceeds the donor ±10% threshold ({project.donorName}), initiate a formal realignment dossier before commitments are made.
                    </li>
                  )}
                  {underspentCount > 0 && (
                    <li>
                      <strong>Slow-Moving Outlier Lines:</strong> {underspentCount} budget line(s) lag behind the project timeline by &gt;15%. Expedite pending sub-office requisitions and contractor procurement in {project.targetDistricts.join(', ')} to prevent year-end fund decommitment.
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Cost Category Level Actual vs Budgeted Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Cost Category Variance Breakdown
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryBreakdown.map((cat) => {
                const isOver = cat.varianceDelta > 15 || cat.burnRatePercent > 100;
                const isUnder = cat.varianceDelta < -15 && cat.burnRatePercent < 70;

                return (
                  <div
                    key={cat.category}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isOver
                        ? 'bg-rose-50/30 border-rose-200'
                        : isUnder
                        ? 'bg-cyan-50/30 border-cyan-200'
                        : 'bg-slate-50/50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="font-bold text-xs text-slate-900">{cat.category}</span>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {cat.linesCount} lines · Remaining: {formatMoney(cat.varianceUSD)}
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            isOver
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : isUnder
                              ? 'bg-cyan-100 text-cyan-900 border-cyan-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {cat.varianceDelta > 0 ? `+${cat.varianceDelta}%` : `${cat.varianceDelta}%`} vs Timeline
                        </span>
                      </div>
                    </div>

                    {/* Progress Comparison */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-600 font-medium">Spent: <strong>{formatMoney(cat.spent)}</strong></span>
                        <span className="text-slate-900 font-bold">Budget: {formatMoney(cat.allocated)}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            isOver ? 'bg-rose-600' : isUnder ? 'bg-cyan-600' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${Math.min(100, cat.burnRatePercent)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Burn: {formatPercent(cat.burnRatePercent)}</span>
                        <span>Timeline: {timelineStats.elapsedPercent}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Budget Lines Detailed Table with Variance Flags */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Itemized Budget Lines &amp; Variance Flags
                </h4>
                <p className="text-xs text-slate-500">
                  Detailed line-by-line financial tracking with automated &gt;15% variance intervention alerts
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold self-start sm:self-auto">
                <button
                  onClick={() => setBudgetVarianceFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    budgetVarianceFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({budgetVarianceLines.length})
                </button>
                <button
                  onClick={() => setBudgetVarianceFilter('flagged')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    budgetVarianceFilter === 'flagged'
                      ? 'bg-white text-rose-800 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-rose-700'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  <span>Flagged &gt;15% ({flaggedCount})</span>
                </button>
                <button
                  onClick={() => setBudgetVarianceFilter('overspent')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    budgetVarianceFilter === 'overspent'
                      ? 'bg-white text-rose-800 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-rose-700'
                  }`}
                >
                  <TrendingUp className="w-3 h-3 text-rose-600" />
                  <span>Overspend ({overspentCount})</span>
                </button>
                <button
                  onClick={() => setBudgetVarianceFilter('underspent')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    budgetVarianceFilter === 'underspent'
                      ? 'bg-white text-cyan-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-cyan-800'
                  }`}
                >
                  <TrendingDown className="w-3 h-3 text-cyan-600" />
                  <span>Underspend ({underspentCount})</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50 text-[11px]">
                    <th className="py-2.5 px-3">Line Code</th>
                    <th className="py-2.5 px-3">Cost Category</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Budgeted</th>
                    <th className="py-2.5 px-3 text-right">Actual Spent</th>
                    <th className="py-2.5 px-3 text-right">Balance ($)</th>
                    <th className="py-2.5 px-3 w-28 text-center">Burn %</th>
                    <th className="py-2.5 px-3 text-center">Variance vs Timeline</th>
                    <th className="py-2.5 px-3 text-center">Variance Status</th>
                    <th className="py-2.5 px-3 text-center">Action Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredBudgetLines.map((bl) => {
                    const isOver = bl.isOverspending;
                    const isUnder = bl.isUnderspending;

                    return (
                      <tr
                        key={bl.id}
                        className={`transition-colors ${
                          isOver
                            ? 'bg-rose-50/30 hover:bg-rose-50/60'
                            : isUnder
                            ? 'bg-cyan-50/20 hover:bg-cyan-50/50'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{bl.code}</td>
                        <td className="py-3 px-3 text-slate-700 font-medium">{bl.category}</td>
                        <td className="py-3 px-3 text-slate-900 font-medium max-w-xs">
                          <div>{bl.description}</div>
                          {bl.managementIntervention && (
                            <div className="mt-1 p-1.5 bg-emerald-50 border border-emerald-200 rounded text-[10px] text-emerald-900 flex items-start gap-1">
                              <MessageSquare className="w-3 h-3 text-emerald-700 shrink-0 mt-0.5" />
                              <div>
                                <strong>Intervention Plan:</strong> {bl.managementIntervention}
                                {bl.interventionDate && (
                                  <span className="text-emerald-700 ml-1">({formatDate(bl.interventionDate)})</span>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                          {formatMoney(bl.totalAllocatedUSD)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-800">
                          {formatMoney(bl.spentUSD)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700">
                          {formatMoney(bl.varianceUSD)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center gap-1.5 justify-center">
                            <div className="w-14 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${
                                  isOver ? 'bg-rose-600' : isUnder ? 'bg-cyan-600' : 'bg-emerald-600'
                                }`}
                                style={{ width: `${Math.min(100, bl.burnRatePercent)}%` }}
                              />
                            </div>
                            <span className="font-mono text-[10px] font-bold text-slate-800">
                              {formatPercent(bl.burnRatePercent)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-xs font-bold">
                          <span
                            className={
                              isOver ? 'text-rose-700' : isUnder ? 'text-cyan-800' : 'text-emerald-700'
                            }
                          >
                            {bl.timelineVarianceDelta > 0 ? `+${bl.timelineVarianceDelta}%` : `${bl.timelineVarianceDelta}%`}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                              isOver
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : isUnder
                                ? 'bg-cyan-100 text-cyan-900 border-cyan-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {isOver ? (
                              <>
                                <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                <span>Overspend (&gt;15%)</span>
                              </>
                            ) : isUnder ? (
                              <>
                                <TrendingDown className="w-2.5 h-2.5 text-cyan-700" />
                                <span>Underspend (&gt;15%)</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Nominal (±15%)</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {hasPermission('projects:edit') ? (
                            <button
                              onClick={() => handleOpenInterventionModal(bl)}
                              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                                bl.managementIntervention
                                  ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                                  : bl.isFlagged
                                  ? 'bg-rose-800 text-white hover:bg-rose-900 animate-pulse'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {bl.managementIntervention ? 'Update Plan' : 'Log Action Plan'}
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400">Locked</span>
                          )}
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

      {/* Management Intervention Modal */}
      {selectedLineForIntervention && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-800">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Log Management Intervention Action Plan
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {selectedLineForIntervention.code} — {selectedLineForIntervention.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLineForIntervention(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveIntervention} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Allocated Budget:</span>
                  <span className="font-mono font-bold text-slate-900">{formatMoney(selectedLineForIntervention.totalAllocatedUSD)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Actual Expended:</span>
                  <span className="font-mono font-bold text-emerald-800">{formatMoney(selectedLineForIntervention.spentUSD)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Burn Rate:</span>
                  <span className="font-mono font-bold text-slate-900">{formatPercent((selectedLineForIntervention.spentUSD / selectedLineForIntervention.totalAllocatedUSD) * 100)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-700 font-bold">Timeline Variance:</span>
                  <span className="font-mono font-bold text-rose-700">
                    {(((selectedLineForIntervention.spentUSD / selectedLineForIntervention.totalAllocatedUSD) * 100) - timelineStats.elapsedPercent).toFixed(1)}% vs schedule
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Management Action Plan &amp; Mitigation Decision <span className="text-rose-600">*</span>
                </label>
                <textarea
                  value={interventionText}
                  onChange={(e) => setInterventionText(e.target.value)}
                  required
                  rows={3}
                  placeholder="e.g. Initiated formal ±10% donor budget reallocation request; frozen secondary travel operational expenses; accelerated field equipment procurement..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLineForIntervention(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Management Action</span>
                </button>
              </div>
            </form>
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

      {/* TAB 6: Risk Management & Operational Mitigation */}
      {activeTab === 'risks' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-100 text-rose-800">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Project Risk Matrix &amp; Humanitarian Continuity Protocols
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Proactively log contextual, environmental, and security threats with assigned customary mitigation safeguards
              </p>
            </div>

            {hasPermission('projects:edit') && onOpenAddRiskModal && (
              <button
                onClick={() => onOpenAddRiskModal(project.id)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold self-start sm:self-auto transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New Project Risk</span>
              </button>
            )}
          </div>

          {/* Risks Cards List */}
          <div className="space-y-3">
            {project.risks.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-200 p-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-900">No Active Risks Logged</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Log operational threats, access bottlenecks, or climate hazards to ensure aid delivery continuity.
                </p>
                {hasPermission('projects:edit') && onOpenAddRiskModal && (
                  <button
                    onClick={() => onOpenAddRiskModal(project.id)}
                    className="mt-3 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold"
                  >
                    Log First Risk
                  </button>
                )}
              </div>
            ) : (
              project.risks.map((rk) => {
                const isHigh = rk.riskLevel === 'High' || rk.riskLevel === 'Severe';

                return (
                  <div
                    key={rk.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isHigh ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-slate-50/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                            rk.riskLevel === 'Severe'
                              ? 'bg-purple-100 text-purple-900 border-purple-300'
                              : rk.riskLevel === 'High'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : rk.riskLevel === 'Medium'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {rk.riskLevel} Severity
                        </span>

                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                          {rk.category}
                        </span>

                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                          {rk.status}
                        </span>

                        {rk.humanitarianImpactArea && (
                          <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            Impact Area: <strong>{rk.humanitarianImpactArea}</strong>
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      {hasPermission('projects:edit') && (
                        <div className="flex items-center gap-2">
                          {onUpdateRiskStatus && (
                            <select
                              value={rk.status}
                              onChange={(e) => onUpdateRiskStatus(rk.id, project.id, e.target.value as RiskStatus)}
                              className="text-[10px] font-semibold py-1 px-2 border border-slate-200 rounded-md bg-white text-slate-700"
                            >
                              <option value="Active Monitoring">Active Monitoring</option>
                              <option value="Mitigated">Mitigated</option>
                              <option value="Escalated">Escalate</option>
                            </select>
                          )}

                          {onEditRisk && (
                            <button
                              onClick={() => onEditRisk(rk, project.id)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                              title="Edit Risk"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {onDeleteRisk && (
                            <button
                              onClick={() => onDeleteRisk(rk.id, project.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Delete Risk"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="py-2.5 space-y-2">
                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        {rk.description}
                      </p>

                      <div className="p-3 bg-white rounded-lg border border-emerald-200 text-xs space-y-1">
                        <span className="font-bold text-emerald-900 flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-emerald-700" />
                          Mitigation Safeguard:
                        </span>
                        <p className="text-emerald-950 font-medium pl-4">
                          {rk.mitigationPlan}
                        </p>
                      </div>

                      {rk.earlyWarningTriggers && (
                        <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                          <strong className="text-slate-800">Early Warning Trigger:</strong> {rk.earlyWarningTriggers}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Focal Point: <strong className="text-slate-800">{rk.assignedFocalPoint || project.leadProjectManager.name}</strong></span>
                      <span>Review: <strong className="text-slate-800 font-mono">{formatDate(rk.lastReviewDate || project.nextDonorReportDate)}</strong></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
