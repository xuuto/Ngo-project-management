import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  ArrowUpRight,
  Shield,
  Download,
  Building,
  Target,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import { Project, Donor, ExpenseRecord, FundInflow, DonorReport } from '../types/ngo';
import { useAuth } from '../context/AuthContext';
import { formatUSD, formatSLSH, formatPercent, formatDate, formatNumber, exportToCSV } from '../utils/formatters';
import { ExpenditureVsBudgetChart } from '../features/dashboard/components/ExpenditureVsBudgetChart';

interface DashboardViewProps {
  projects: Project[];
  donors: Donor[];
  expenses: ExpenseRecord[];
  fundInflows: FundInflow[];
  reports: DonorReport[];
  currencyMode: 'USD' | 'SLSH';
  onSelectProject: (projectId: string) => void;
  onOpenReportModal?: (projectId?: string) => void;
  onViewReport: (report: DonorReport) => void;
  setActiveView: (view: string) => void;
}

type DateRangeOption = 'all' | '2026' | 'past12' | 'q2_2026' | 'q1_2026' | 'custom';

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  donors,
  expenses,
  fundInflows,
  reports,
  currencyMode,
  onSelectProject,
  onOpenReportModal,
  onViewReport,
  setActiveView
}) => {
  const { currentUser, filterAccessibleProjects, filterAccessibleExpenses, filterAccessibleReports, hasPermission } = useAuth();

  // Role Scoping
  const accessibleProjects = useMemo(() => filterAccessibleProjects(projects), [projects, currentUser]);
  const accessibleExpenses = useMemo(() => filterAccessibleExpenses(expenses, projects), [expenses, projects, currentUser]);
  const accessibleReports = useMemo(() => filterAccessibleReports(reports), [reports, currentUser]);

  // Date Range Filtering
  const [dateRange, setDateRange] = useState<DateRangeOption>('all');
  const [customStartDate, setCustomStartDate] = useState('2026-01-01');
  const [customEndDate, setCustomEndDate] = useState('2026-09-30');
  const [selectedDonorFilter, setSelectedDonorFilter] = useState<string>('all');

  // Compliance Alerts State
  const [alertFilter, setAlertFilter] = useState<'all' | 'high_burn' | 'approaching_end'>('all');
  const [isAlertsCollapsed, setIsAlertsCollapsed] = useState(false);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  // Compliance & Grant Expiry Alerts Analysis
  const todayRef = useMemo(() => new Date('2026-09-27'), []);

  const complianceAlerts = useMemo(() => {
    const list: Array<{
      id: string;
      project: Project;
      types: ('high_burn' | 'approaching_end')[];
      severity: 'critical' | 'warning';
      burnRatePercent: number;
      daysRemaining: number;
      isOverdue: boolean;
      totalGrantUSD: number;
      expendituresUSD: number;
      remainingUSD: number;
      recommendations: string[];
    }> = [];

    accessibleProjects.forEach((p) => {
      const burnRate = p.budgetSummary.totalGrantUSD > 0
        ? (p.budgetSummary.expendituresUSD / p.budgetSummary.totalGrantUSD) * 100
        : 0;

      const endDateObj = new Date(p.endDate);
      const diffTime = endDateObj.getTime() - todayRef.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isApproachingEnd = daysRemaining <= 90 && p.status === 'Active';
      const isHighBurn = burnRate > 90;

      if (isHighBurn || isApproachingEnd) {
        const types: ('high_burn' | 'approaching_end')[] = [];
        if (isHighBurn) types.push('high_burn');
        if (isApproachingEnd) types.push('approaching_end');

        const severity: 'critical' | 'warning' =
          (isHighBurn && daysRemaining > 30) || (daysRemaining <= 30 && daysRemaining >= 0) || daysRemaining < 0
            ? 'critical'
            : 'warning';

        const recommendations: string[] = [];

        if (isHighBurn) {
          recommendations.push(
            `Burn rate reached ${burnRate.toFixed(1)}% with only ${formatUSD(p.budgetSummary.remainingBalanceUSD)} available. Freeze non-essential operational costs and review budget lines.`
          );
          if (daysRemaining > 45) {
            recommendations.push(
              `Initiate formal donor budget realignment under approved ±10% variance clause before funds are exhausted.`
            );
          }
        }

        if (isApproachingEnd) {
          if (daysRemaining <= 0) {
            recommendations.push(
              `Grant agreement ended on ${formatDate(p.endDate)}. Finalize terminal financial report and archive physical vouchers for external audit.`
            );
          } else if (daysRemaining <= 30) {
            recommendations.push(
              `Only ${daysRemaining} days remaining until grant closure (${formatDate(p.endDate)}). Submit final No-Cost Extension (NCE) request immediately or accelerate final closeout procurement.`
            );
          } else {
            recommendations.push(
              `Project end date approaching in ${daysRemaining} days (${formatDate(p.endDate)}). Review logframe milestone completion and schedule terminal evaluation mission.`
            );
          }

          if (p.budgetSummary.remainingBalanceUSD > 50000 && daysRemaining <= 60) {
            recommendations.push(
              `Unexpended balance of ${formatUSD(p.budgetSummary.remainingBalanceUSD)} risks donor clawback. Expedite commitments or notify ${p.donorName} task manager.`
            );
          }
        }

        list.push({
          id: `alert-${p.id}`,
          project: p,
          types,
          severity,
          burnRatePercent: burnRate,
          daysRemaining,
          isOverdue: daysRemaining <= 0,
          totalGrantUSD: p.budgetSummary.totalGrantUSD,
          expendituresUSD: p.budgetSummary.expendituresUSD,
          remainingUSD: p.budgetSummary.remainingBalanceUSD,
          recommendations
        });
      }
    });

    return list.sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (a.severity !== 'critical' && b.severity === 'critical') return 1;
      return a.daysRemaining - b.daysRemaining;
    });
  }, [accessibleProjects, todayRef]);

  const activeAlerts = useMemo(() => {
    return complianceAlerts.filter((a) => !dismissedAlertIds.includes(a.id));
  }, [complianceAlerts, dismissedAlertIds]);

  const filteredAlerts = useMemo(() => {
    if (alertFilter === 'all') return activeAlerts;
    if (alertFilter === 'high_burn') return activeAlerts.filter((a) => a.types.includes('high_burn'));
    if (alertFilter === 'approaching_end') return activeAlerts.filter((a) => a.types.includes('approaching_end'));
    return activeAlerts;
  }, [activeAlerts, alertFilter]);

  const highBurnCount = useMemo(() => activeAlerts.filter((a) => a.types.includes('high_burn')).length, [activeAlerts]);
  const approachingEndCount = useMemo(() => activeAlerts.filter((a) => a.types.includes('approaching_end')).length, [activeAlerts]);

  // Filter expenses and metrics by date range
  const filteredExpenses = useMemo(() => {
    return accessibleExpenses.filter((e) => {
      if (dateRange === 'all') return true;
      const d = e.date;
      if (dateRange === '2026') return d.startsWith('2026');
      if (dateRange === 'q2_2026') return d >= '2026-04-01' && d <= '2026-06-30';
      if (dateRange === 'q1_2026') return d >= '2026-01-01' && d <= '2026-03-31';
      if (dateRange === 'custom') return d >= customStartDate && d <= customEndDate;
      return true;
    });
  }, [accessibleExpenses, dateRange, customStartDate, customEndDate]);

  // Overall Financial Calculations
  const financialTotals = useMemo(() => {
    let totalAllocated = 0;
    let totalDisbursed = 0;
    let totalSpent = 0;

    accessibleProjects.forEach((p) => {
      totalAllocated += p.budgetSummary.totalGrantUSD;
      totalDisbursed += p.budgetSummary.disbursedUSD;
      totalSpent += p.budgetSummary.expendituresUSD;
    });

    const remaining = totalAllocated - totalSpent;
    const burnRate = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
    const disbursementRatio = totalAllocated > 0 ? (totalDisbursed / totalAllocated) * 100 : 0;

    return {
      totalAllocated,
      totalDisbursed,
      totalSpent,
      remaining,
      burnRate,
      disbursementRatio
    };
  }, [accessibleProjects]);

  // Overall NGO Impact KPI Aggregations
  const kpiTotals = useMemo(() => {
    let directBeneficiaries = 0;
    let targetDirect = 0;
    let pastoralistWomen = 0;
    let households = 0;
    let totalHectaresRehabilitated = 0;
    let solarWaterPoints = 0;
    let trainingSessionsCompleted = 0;

    accessibleProjects.forEach((p) => {
      directBeneficiaries += p.beneficiaries.actualDirect;
      targetDirect += p.beneficiaries.targetDirect;
      pastoralistWomen += p.beneficiaries.disaggregation.pastoralistWomen;
      households += p.beneficiaries.actualHouseholds;

      // Extract outputs & indicators
      p.logframe.outcomes.forEach((oc) => {
        oc.outputs.forEach((out) => {
          out.indicators.forEach((ind) => {
            if (ind.unit === 'Hectares') {
              totalHectaresRehabilitated += ind.currentActual;
            }
            if (ind.unit === 'Water Points' || ind.unit === 'Boreholes') {
              solarWaterPoints += ind.currentActual;
            }
          });
          out.activities.forEach((act) => {
            if (act.title.toLowerCase().includes('train') && (act.status === 'Completed' || act.status === 'Field Verified')) {
              trainingSessionsCompleted += 1;
            }
          });
        });
      });
    });

    const womenPercentage = directBeneficiaries > 0 ? (pastoralistWomen / directBeneficiaries) * 100 : 0;
    const targetReachPercentage = targetDirect > 0 ? (directBeneficiaries / targetDirect) * 100 : 0;

    return {
      directBeneficiaries,
      targetDirect,
      pastoralistWomen,
      womenPercentage,
      households,
      totalHectaresRehabilitated,
      solarWaterPoints,
      trainingSessionsCompleted,
      targetReachPercentage
    };
  }, [accessibleProjects]);

  // Filtered Donors list for Donor Module
  const filteredDonors = useMemo(() => {
    if (selectedDonorFilter === 'all') {
      if (currentUser.role === 'Donor') {
        return donors.filter((d) => d.id === currentUser.donorId);
      }
      return donors;
    }
    return donors.filter((d) => d.id === selectedDonorFilter);
  }, [donors, selectedDonorFilter, currentUser]);

  // Export Dashboard Summary CSV
  const handleExportDashboardSummary = () => {
    const headers = [
      'Project Code',
      'Title',
      'Donor',
      'Total Budget (USD)',
      'Disbursed (USD)',
      'Spent (USD)',
      'Burn Rate (%)',
      'Direct Beneficiaries',
      'Women Beneficiaries',
      'Next Donor Report'
    ];

    const rows = accessibleProjects.map((p) => [
      p.code,
      p.shortTitle,
      p.donorName,
      p.budgetSummary.totalGrantUSD,
      p.budgetSummary.disbursedUSD,
      p.budgetSummary.expendituresUSD,
      p.budgetSummary.burnRatePercent.toFixed(1) + '%',
      p.beneficiaries.actualDirect,
      p.beneficiaries.disaggregation.pastoralistWomen,
      p.nextDonorReportDate
    ]);

    exportToCSV(`PENHA_Hargeisa_Portfolio_Summary_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const formatMoney = (usd: number) => {
    return currencyMode === 'USD' ? formatUSD(usd) : formatSLSH(usd);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Range Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              PENHA Hargeisa Office
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Horn of Africa Humanitarian &amp; Pastoral Development</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Program Portfolio &amp; Donor Utilization Dashboard
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time tracking of grant performance, logframe impact indicators, and field fund execution across Somaliland regions.
          </p>
        </div>

        {/* Date Filter & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
              className="bg-transparent text-slate-800 font-medium text-xs focus:outline-hidden pr-2 cursor-pointer"
            >
              <option value="all">Full Grant Lifecycle</option>
              <option value="2026">Current Year (2026)</option>
              <option value="q2_2026">Q2 2026 (Apr - Jun)</option>
              <option value="q1_2026">Q1 2026 (Jan - Mar)</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-1 text-xs">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 bg-white"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 bg-white"
              />
            </div>
          )}

          <button
            onClick={handleExportDashboardSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* COMPLIANCE & RISK ALERTS PANEL */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Panel Header Banner */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-rose-50/70 via-amber-50/50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                activeAlerts.length > 0
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-emerald-600 text-white shadow-xs'
              }`}
            >
              {activeAlerts.length > 0 ? (
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Grant Compliance &amp; Closeout Risk Alerts
                </h2>
                {activeAlerts.length > 0 ? (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                    {activeAlerts.length} {activeAlerts.length === 1 ? 'Action Required' : 'Actions Required'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    All Grants Compliant
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Proactive early-warning system monitoring high burn rates (&gt;90%) and approaching grant end dates (&lt;90 days)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {activeAlerts.length > 0 && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setAlertFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    alertFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({activeAlerts.length})
                </button>
                <button
                  onClick={() => setAlertFilter('high_burn')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    alertFilter === 'high_burn'
                      ? 'bg-white text-rose-800 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-rose-700'
                  }`}
                >
                  <TrendingUp className="w-3 h-3 text-rose-600" />
                  <span>High Burn &gt;90% ({highBurnCount})</span>
                </button>
                <button
                  onClick={() => setAlertFilter('approaching_end')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    alertFilter === 'approaching_end'
                      ? 'bg-white text-amber-800 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-amber-700'
                  }`}
                >
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Ending &lt;90d ({approachingEndCount})</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setIsAlertsCollapsed(!isAlertsCollapsed)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title={isAlertsCollapsed ? 'Expand Alerts Panel' : 'Collapse Alerts Panel'}
            >
              {isAlertsCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Panel Body */}
        {!isAlertsCollapsed && (
          <div className="p-4 sm:p-5 space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="py-6 px-4 text-center bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-2" />
                <p className="text-sm font-bold text-slate-900">
                  {alertFilter === 'all'
                    ? 'All Portfolios Operating Within Safe Compliance Margins'
                    : alertFilter === 'high_burn'
                    ? 'No Projects Exceeding 90% Burn Rate'
                    : 'No Projects with Approaching End Dates (<90 Days)'}
                </p>
                <p className="text-xs text-slate-500 max-w-md mt-1">
                  Budget execution rates are balanced against timeline milestones. Routine quarterly monitoring continues across all field sub-offices.
                </p>
                {dismissedAlertIds.length > 0 && (
                  <button
                    onClick={() => setDismissedAlertIds([])}
                    className="mt-3 text-xs text-emerald-800 hover:underline font-semibold"
                  >
                    Restore {dismissedAlertIds.length} dismissed alerts
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredAlerts.map((alert) => {
                  const p = alert.project;
                  const isHighBurn = alert.types.includes('high_burn');
                  const isApproachingEnd = alert.types.includes('approaching_end');
                  const isBoth = isHighBurn && isApproachingEnd;

                  return (
                    <div
                      key={alert.id}
                      className={`rounded-xl border p-4 sm:p-5 transition-all ${
                        alert.severity === 'critical'
                          ? 'border-rose-300 bg-rose-50/30 shadow-2xs hover:border-rose-400'
                          : 'border-amber-300 bg-amber-50/20 shadow-2xs hover:border-amber-400'
                      }`}
                    >
                      {/* Top Header of Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Alert Badges */}
                          {isBoth && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white shadow-2xs">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Dual Critical Trigger: High Burn + Grant Expiry
                            </span>
                          )}
                          {!isBoth && isHighBurn && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white shadow-2xs">
                              <TrendingUp className="w-3.5 h-3.5" />
                              High Burn Rate ({alert.burnRatePercent.toFixed(1)}% &gt; 90%)
                            </span>
                          )}
                          {!isBoth && isApproachingEnd && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white shadow-2xs">
                              <Clock className="w-3.5 h-3.5" />
                              {alert.isOverdue
                                ? 'Grant Expired'
                                : `Approaching End Date (${alert.daysRemaining} Days Left)`}
                            </span>
                          )}

                          <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {p.code}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            · {p.donorName} ({p.grantAgreementCode})
                          </span>
                        </div>

                        {/* Dismiss & Manager Details */}
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>Lead: <strong className="text-slate-800">{p.leadProjectManager.name}</strong></span>
                          <span>·</span>
                          <button
                            onClick={() => setDismissedAlertIds([...dismissedAlertIds, alert.id])}
                            className="text-slate-400 hover:text-slate-700 text-[11px] underline"
                            title="Dismiss this alert for current session"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>

                      {/* Title & Core Metrics Row */}
                      <div className="py-3 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        <div className="lg:col-span-6">
                          <h3
                            onClick={() => onSelectProject(p.id)}
                            className="text-sm sm:text-base font-bold text-slate-900 hover:text-emerald-800 cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{p.title}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          </h3>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {p.logframe.impactGoal}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span>Regions: <strong>{p.targetRegions.join(', ')}</strong></span>
                            <span>·</span>
                            <span>Direct Beneficiaries: <strong>{formatNumber(p.beneficiaries.actualDirect)}</strong> / {formatNumber(p.beneficiaries.targetDirect)}</span>
                          </div>
                        </div>

                        {/* Metric Highlights Strip */}
                        <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                          {/* Metric 1: Burn Rate */}
                          <div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                              <span>Burn Rate</span>
                              <span className={`font-bold font-mono ${
                                alert.burnRatePercent > 90 ? 'text-rose-700 font-bold' : 'text-slate-900'
                              }`}>
                                {alert.burnRatePercent.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${
                                  alert.burnRatePercent > 90 ? 'bg-rose-600' : 'bg-amber-500'
                                }`}
                                style={{ width: `${Math.min(100, alert.burnRatePercent)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {formatMoney(alert.expendituresUSD)} of {formatMoney(alert.totalGrantUSD)}
                            </span>
                          </div>

                          {/* Metric 2: Remaining Runway */}
                          <div>
                            <span className="text-[11px] text-slate-500 block">Remaining Cash</span>
                            <span className={`text-sm font-bold font-mono tabular-nums block mt-0.5 ${
                              alert.remainingUSD < 100000 ? 'text-rose-700' : 'text-slate-900'
                            }`}>
                              {formatMoney(alert.remainingUSD)}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              Available balance
                            </span>
                          </div>

                          {/* Metric 3: Time Remaining */}
                          <div className="col-span-2 sm:col-span-1">
                            <span className="text-[11px] text-slate-500 block">End Date &amp; Days</span>
                            <span className={`text-sm font-bold font-mono block mt-0.5 ${
                              alert.daysRemaining <= 30 ? 'text-rose-700' : 'text-amber-800'
                            }`}>
                              {alert.daysRemaining <= 0 ? 'Expired' : `${alert.daysRemaining} Days`}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {formatDate(p.endDate)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actionable Proactive Compliance Advisory */}
                      <div className="mt-1 bg-white/90 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                          <Shield className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Proactive Compliance Recommendations for Project Team &amp; Finance:</span>
                        </div>
                        <ul className="space-y-1 pl-4 list-disc text-slate-700 text-[11px] leading-relaxed">
                          {alert.recommendations.map((rec, rIdx) => (
                            <li key={rIdx}>{rec}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500">
                          Next Donor Milestone: <strong>{formatDate(p.nextDonorReportDate)}</strong> ({p.reportingFrequency} report)
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => onSelectProject(p.id)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <span>Open Project Workspace</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => setActiveView('financials')}
                            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <DollarSign className="w-3 h-3 text-emerald-700" />
                            <span>Audit Budget vs. Actuals</span>
                          </button>

                          {onOpenReportModal && (
                            <button
                              onClick={() => onOpenReportModal(p.id)}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <FileText className="w-3 h-3 text-emerald-700" />
                              <span>Draft Donor Report</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODULE 4: Key Performance Indicators (KPIs) Relevant to NGO Work */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-700" />
            Key Performance Indicators (Pastoral Impact &amp; Community Reach)
          </h2>
          <span className="text-xs text-slate-500">
            {formatPercent(kpiTotals.targetReachPercentage)} of global portfolio target achieved
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Direct Beneficiaries */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Direct Pastoralists Reached</span>
              <span className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {formatNumber(kpiTotals.directBeneficiaries)}
              </span>
              <span className="text-xs text-slate-500">/ {formatNumber(kpiTotals.targetDirect)} target</span>
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, kpiTotals.targetReachPercentage)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Households:</span>
              <strong className="text-slate-800 font-mono">{formatNumber(kpiTotals.households)}</strong>
            </p>
          </div>

          {/* Card 2: Women Pastoralist Proportion */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Pastoralist Women Reached</span>
              <span className="p-1.5 bg-rose-50 text-rose-800 rounded-lg">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {formatPercent(kpiTotals.womenPercentage)}
              </span>
              <span className="text-xs text-emerald-700 font-semibold font-mono">
                {formatNumber(kpiTotals.pastoralistWomen)}
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, kpiTotals.womenPercentage)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Target Standard:</span>
              <strong className="text-slate-800">&gt; 50% Gender Marker</strong>
            </p>
          </div>

          {/* Card 3: Rangelands Rehabilitated */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Rangeland Protected &amp; Reseeded</span>
              <span className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg">
                <Layers className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {formatNumber(kpiTotals.totalHectaresRehabilitated)}
              </span>
              <span className="text-xs font-medium text-slate-500">Hectares</span>
            </div>
            <p className="mt-2.5 text-[11px] text-slate-600 line-clamp-1">
              Communal bunds &amp; perennial Cenchrus grass
            </p>
            <p className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Verification:</span>
              <span className="text-emerald-700 font-medium">NDVI Satellite + GPS</span>
            </p>
          </div>

          {/* Card 4: Solar Boreholes & Water Points */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Solar Water Points &amp; Boreholes</span>
              <span className="p-1.5 bg-blue-50 text-blue-800 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {kpiTotals.solarWaterPoints}
              </span>
              <span className="text-xs text-slate-500">Strategic Stations</span>
            </div>
            <p className="mt-2.5 text-[11px] text-slate-600 line-clamp-1">
              Zero-diesel solar submersible pumping
            </p>
            <p className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Coverage:</span>
              <span className="text-slate-800 font-medium">Sahil, Togdheer, Sool</span>
            </p>
          </div>
        </div>
      </div>

      {/* DATA VISUALIZATION: Projected Budget vs. Actual Expenditure Bar Chart */}
      <ExpenditureVsBudgetChart
        projects={accessibleProjects}
        currencyMode={currencyMode}
        onSelectProject={onSelectProject}
        setActiveView={setActiveView}
      />

      {/* MODULE 2: Fund Utilization (Spent vs Allocated for each project and overall) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              Fund Utilization &amp; Grant Burn Rate Analysis
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Consolidated financial status: committed grants, cash disbursed, and verified field expenditures
            </p>
          </div>
          <button
            onClick={() => setActiveView('financials')}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View Full Financial Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Global Financial Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Committed Grants</p>
            <p className="text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
              {formatMoney(financialTotals.totalAllocated)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Approved donor agreements</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Funds Disbursed to Date</p>
            <p className="text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
              {formatMoney(financialTotals.totalDisbursed)}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
              {formatPercent(financialTotals.disbursementRatio)} transferred
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Cumulative Field Expenditures</p>
            <p className="text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
              {formatMoney(financialTotals.totalSpent)}
            </p>
            <p className="text-[11px] text-blue-700 font-medium mt-0.5">
              {formatPercent(financialTotals.burnRate)} Portfolio Burn Rate
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Remaining Cash Balance</p>
            <p className="text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
              {formatMoney(financialTotals.remaining)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Committed pipeline</p>
          </div>
        </div>

        {/* Project by Project Fund Utilization Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50">
                <th className="py-2.5 px-3">Project &amp; Code</th>
                <th className="py-2.5 px-3">Donor</th>
                <th className="py-2.5 px-3 text-right">Allocated</th>
                <th className="py-2.5 px-3 text-right">Disbursed</th>
                <th className="py-2.5 px-3 text-right">Spent</th>
                <th className="py-2.5 px-3 text-right">Remaining</th>
                <th className="py-2.5 px-3 w-36">Burn Rate %</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accessibleProjects.map((p) => {
                const burnRate = p.budgetSummary.burnRatePercent;
                const isSlowBurn = burnRate < 50;
                const isOptimal = burnRate >= 60 && burnRate <= 85;

                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelectProject(p.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{p.shortTitle}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{p.code}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{p.donorName}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900">
                      {formatMoney(p.budgetSummary.totalGrantUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                      {formatMoney(p.budgetSummary.disbursedUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-emerald-800">
                      {formatMoney(p.budgetSummary.expendituresUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                      {formatMoney(p.budgetSummary.remainingBalanceUSD)}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              isOptimal ? 'bg-emerald-600' : isSlowBurn ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(100, burnRate)}%` }}
                          />
                        </div>
                        <span className="font-mono tabular-nums text-[11px] font-semibold text-slate-800 shrink-0">
                          {formatPercent(burnRate)}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isOptimal
                            ? 'bg-emerald-100 text-emerald-800'
                            : isSlowBurn
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isOptimal ? 'On Schedule' : isSlowBurn ? 'Under-utilized' : 'Advanced'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODULE 1 & 3: Project Status Overview & Donor Reporting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module 1: Project Status Overview (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                Project Status &amp; Milestone Timeline Overview
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Current operational progress and imminent donor reporting cycles
              </p>
            </div>
            <button
              onClick={() => setActiveView('projects')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
            >
              <span>All Projects</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {accessibleProjects.map((p) => {
              // Calculate overall activity progress %
              let totalActs = 0;
              let completedActs = 0;
              let totalIndicators = 0;
              let onTrackIndicators = 0;

              p.logframe.outcomes.forEach((oc) => {
                oc.outputs.forEach((out) => {
                  out.indicators.forEach((ind) => {
                    totalIndicators++;
                    if (ind.status === 'Achieved' || ind.status === 'On Track') onTrackIndicators++;
                  });
                  out.activities.forEach((act) => {
                    totalActs++;
                    if (act.status === 'Completed' || act.status === 'Field Verified') completedActs++;
                  });
                });
              });

              const actPercent = totalActs > 0 ? (completedActs / totalActs) * 100 : 0;
              const indPercent = totalIndicators > 0 ? (onTrackIndicators / totalIndicators) * 100 : 0;

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-emerald-600 hover:bg-slate-50/50 transition-all cursor-pointer text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] text-slate-500">{p.code}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {p.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mt-1 line-clamp-1">{p.shortTitle}</h3>
                  <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">
                    {p.targetRegions.join(', ')} · Lead: {p.leadProjectManager.name.split(' ')[1] || p.leadProjectManager.name}
                  </p>

                  <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100 text-[11px]">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Activities Completed:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {completedActs} / {totalActs} ({actPercent.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${actPercent}%` }} />
                    </div>

                    <div className="flex justify-between items-center text-slate-500 text-[10px] pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Next Donor Report:
                      </span>
                      <strong className="text-slate-800 font-mono">{formatDate(p.nextDonorReportDate)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module 3: Donor Reporting & Transparency (1 column) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                Donor Reporting Center
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Submitted reports &amp; compliance</p>
            </div>
            <button
              onClick={() => setActiveView('reports')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
            >
              View All
            </button>
          </div>

          {/* Filter by Donor Select */}
          <div className="text-xs">
            <label className="block text-slate-500 font-medium mb-1">Filter by Donor Agency:</label>
            <select
              value={selectedDonorFilter}
              onChange={(e) => setSelectedDonorFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-hidden"
            >
              <option value="all">All Partner Donors ({donors.length})</option>
              {donors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.shortName}
                </option>
              ))}
            </select>
          </div>

          {/* Reports List */}
          <div className="space-y-2.5">
            {accessibleReports.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                No formal reports generated yet for this filter.
              </div>
            ) : (
              accessibleReports.map((r) => (
                <div
                  key={r.id}
                  onClick={() => onViewReport(r)}
                  className="p-3 rounded-lg border border-slate-200 hover:border-emerald-600 hover:bg-slate-50 cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{r.donorName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{formatDate(r.submissionDate)}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">{r.reportingPeriod}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">{r.projectTitle}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100">
                    <span className="text-emerald-700 font-medium">Burn Rate: {formatPercent(r.financialOverview.burnRatePercent)}</span>
                    <span className="text-slate-400">Click to Preview &amp; Print</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Generate Report Quick Button */}
          {hasPermission('reports:generate') && (
            <button
              onClick={() => onOpenReportModal && onOpenReportModal()}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate New Donor Report</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
