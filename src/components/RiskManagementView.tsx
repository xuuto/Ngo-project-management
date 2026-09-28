import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Download,
  ExternalLink,
  Edit2,
  Trash2,
  Users,
  Calendar,
  Layers,
  Shield,
  Activity,
  ArrowRight,
  TrendingDown,
  Clock,
  MapPin
} from 'lucide-react';
import { Project, RiskItem, RiskSeverity, RiskCategory, RiskStatus } from '../types/ngo';
import { useAuth } from '../context/AuthContext';
import { formatDate, exportToCSV } from '../utils/formatters';

interface RiskManagementViewProps {
  projects: Project[];
  onOpenAddRiskModal: (projectId?: string) => void;
  onEditRisk: (risk: RiskItem, projectId: string) => void;
  onDeleteRisk: (riskId: string, projectId: string) => void;
  onUpdateRiskStatus: (riskId: string, projectId: string, status: RiskStatus) => void;
  onSelectProject: (projectId: string) => void;
}

export const RiskManagementView: React.FC<RiskManagementViewProps> = ({
  projects,
  onOpenAddRiskModal,
  onEditRisk,
  onDeleteRisk,
  onUpdateRiskStatus,
  onSelectProject
}) => {
  const { hasPermission } = useAuth();

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Flatten all risks with project association
  const allRisksWithProject = useMemo(() => {
    const list: Array<{ risk: RiskItem; project: Project }> = [];
    projects.forEach((p) => {
      p.risks.forEach((rk) => {
        list.push({ risk: rk, project: p });
      });
    });
    return list;
  }, [projects]);

  // Filtered risks
  const filteredRisks = useMemo(() => {
    return allRisksWithProject.filter(({ risk, project }) => {
      if (selectedProjectId !== 'all' && project.id !== selectedProjectId) return false;
      if (selectedSeverity !== 'all' && risk.riskLevel !== selectedSeverity) return false;
      if (selectedCategory !== 'all' && risk.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && risk.status !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = risk.description.toLowerCase().includes(q);
        const matchMit = risk.mitigationPlan.toLowerCase().includes(q);
        const matchProj = project.title.toLowerCase().includes(q) || project.code.toLowerCase().includes(q);
        const matchFocal = risk.assignedFocalPoint?.toLowerCase().includes(q) || false;
        if (!matchDesc && !matchMit && !matchProj && !matchFocal) return false;
      }

      return true;
    });
  }, [allRisksWithProject, selectedProjectId, selectedSeverity, selectedCategory, selectedStatus, searchQuery]);

  // Metric aggregates
  const metrics = useMemo(() => {
    let highSevereCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    let activeMonitoringCount = 0;
    let mitigatedCount = 0;
    let escalatedCount = 0;

    allRisksWithProject.forEach(({ risk }) => {
      if (risk.riskLevel === 'High' || risk.riskLevel === 'Severe') highSevereCount++;
      if (risk.riskLevel === 'Medium') mediumCount++;
      if (risk.riskLevel === 'Low') lowCount++;

      if (risk.status === 'Active Monitoring') activeMonitoringCount++;
      if (risk.status === 'Mitigated') mitigatedCount++;
      if (risk.status === 'Escalated') escalatedCount++;
    });

    const total = allRisksWithProject.length;
    const criticalRate = total > 0 ? (highSevereCount / total) * 100 : 0;

    return {
      total,
      highSevereCount,
      mediumCount,
      lowCount,
      activeMonitoringCount,
      mitigatedCount,
      escalatedCount,
      criticalRate
    };
  }, [allRisksWithProject]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Risk ID',
      'Project Code',
      'Project Title',
      'Donor',
      'Severity Level',
      'Category',
      'Risk Statement',
      'Mitigation Strategy',
      'Humanitarian Area',
      'Assigned Focal Person',
      'Status',
      'Early Warning Triggers',
      'Last Review Date'
    ];

    const rows = filteredRisks.map(({ risk, project }) => [
      risk.id,
      project.code,
      project.shortTitle,
      project.donorName,
      risk.riskLevel,
      risk.category,
      risk.description,
      risk.mitigationPlan,
      risk.humanitarianImpactArea || 'General Ops',
      risk.assignedFocalPoint || project.leadProjectManager.name,
      risk.status,
      risk.earlyWarningTriggers || 'None',
      risk.lastReviewDate || 'N/A'
    ]);

    exportToCSV('PENHA_Humanitarian_Risk_Register', headers, rows);
  };

  const getSeverityBadge = (level: RiskSeverity) => {
    switch (level) {
      case 'Severe':
        return 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
      case 'High':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
      case 'Low':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusBadge = (status: RiskStatus) => {
    switch (status) {
      case 'Active Monitoring':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Mitigated':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Escalated':
        return 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 text-white shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                Humanitarian Risk Management &amp; Delivery Safeguards
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Proactive risk logging, severity categorization, and customary mitigation protocols to prevent humanitarian delivery disruption
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Risk Register (CSV)</span>
            </button>

            {hasPermission('projects:edit') && (
              <button
                onClick={() => onOpenAddRiskModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Log New Project Risk</span>
              </button>
            )}
          </div>
        </div>

        {/* Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5 pt-5 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Total Active Risks</span>
              <Activity className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-xl font-bold font-mono text-slate-900 mt-1">{metrics.total}</p>
            <span className="text-[10px] text-slate-500">Across {projects.length} pastoral grant portfolios</span>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">High / Severe Threats</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-xl font-bold font-mono text-rose-700 mt-1">{metrics.highSevereCount}</p>
            <span className="text-[10px] text-rose-700 font-medium">Require active leadership monitoring</span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Moderate / Medium</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xl font-bold font-mono text-amber-800 mt-1">{metrics.mediumCount}</p>
            <span className="text-[10px] text-amber-700">Under field officer supervision</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Mitigated Safeguards</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <p className="text-xl font-bold font-mono text-emerald-800 mt-1">{metrics.mitigatedCount}</p>
            <span className="text-[10px] text-emerald-700 font-medium">Successfully de-escalated via Xeer</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search risks, mitigation strategies, focal points..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-slate-800"
            />
          </div>

          {/* Project Filter */}
          <div>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} ({p.shortTitle})
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
            >
              <option value="all">All Severities</option>
              <option value="Severe">Severe</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
            >
              <option value="all">All Statuses</option>
              <option value="Active Monitoring">Active Monitoring</option>
              <option value="Mitigated">Mitigated</option>
              <option value="Escalated">Escalated</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(selectedProjectId !== 'all' || selectedSeverity !== 'all' || selectedCategory !== 'all' || selectedStatus !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Showing {filteredRisks.length} of {allRisksWithProject.length} risks</span>
            <button
              onClick={() => {
                setSelectedProjectId('all');
                setSelectedSeverity('all');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSearchQuery('');
              }}
              className="text-emerald-800 hover:underline font-semibold text-[11px]"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Risk Cards List */}
      <div className="space-y-3.5">
        {filteredRisks.length === 0 ? (
          <div className="py-12 bg-white border border-slate-200 rounded-xl text-center flex flex-col items-center justify-center p-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2" />
            <p className="text-base font-bold text-slate-900">No Risks Found</p>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              No logged operational threats match your selected filters. All active interventions are operating within standard parameters.
            </p>
            {hasPermission('projects:edit') && (
              <button
                onClick={() => onOpenAddRiskModal()}
                className="mt-4 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Log a Risk Entry
              </button>
            )}
          </div>
        ) : (
          filteredRisks.map(({ risk, project }) => {
            const isCritical = risk.riskLevel === 'High' || risk.riskLevel === 'Severe';

            return (
              <div
                key={risk.id}
                className={`bg-white rounded-xl border transition-all p-5 shadow-2xs hover:shadow-xs ${
                  isCritical ? 'border-rose-300/80 bg-gradient-to-br from-white via-rose-50/10 to-white' : 'border-slate-200'
                }`}
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Severity Badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs border ${getSeverityBadge(risk.riskLevel)}`}>
                      {risk.riskLevel} Severity
                    </span>

                    {/* Category */}
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {risk.category}
                    </span>

                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(risk.status)}`}>
                      {risk.status}
                    </span>

                    {risk.humanitarianImpactArea && (
                      <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        Impact: <strong>{risk.humanitarianImpactArea}</strong>
                      </span>
                    )}
                  </div>

                  {/* Project Tag & Link */}
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => onSelectProject(project.id)}
                      className="font-mono font-bold text-slate-800 hover:text-emerald-800 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors"
                      title="Open project logframe & workspace"
                    >
                      <span>{project.code}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 truncate max-w-[160px]">{project.donorName}</span>
                  </div>
                </div>

                {/* Risk Statement & Details */}
                <div className="py-3.5 space-y-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                      Threat Description
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {risk.description}
                    </h3>
                  </div>

                  {/* Mitigation Strategy Box */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                      <Shield className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Mitigation Strategy &amp; Customary Continuity Protocol:</span>
                    </div>
                    <p className="text-emerald-900 leading-relaxed font-medium pl-5">
                      {risk.mitigationPlan}
                    </p>
                  </div>

                  {/* Early Warning Triggers if specified */}
                  {risk.earlyWarningTriggers && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-200 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800">Early Warning Triggers:</strong> {risk.earlyWarningTriggers}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Focal Point, Review Date & Quick Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>
                      Focal Person: <strong className="text-slate-800">{risk.assignedFocalPoint || project.leadProjectManager.name}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Review Date: <strong className="text-slate-800 font-mono">{formatDate(risk.lastReviewDate || project.nextDonorReportDate)}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status quick toggle */}
                    {hasPermission('projects:edit') && (
                      <select
                        value={risk.status}
                        onChange={(e) => onUpdateRiskStatus(risk.id, project.id, e.target.value as RiskStatus)}
                        className="text-[11px] font-semibold py-1 px-2 border border-slate-200 rounded-md bg-white text-slate-700 hover:border-slate-300"
                      >
                        <option value="Active Monitoring">Active Monitoring</option>
                        <option value="Mitigated">Mitigated</option>
                        <option value="Escalated">Escalate</option>
                      </select>
                    )}

                    {hasPermission('projects:edit') && (
                      <button
                        onClick={() => onEditRisk(risk, project.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                        title="Edit risk details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {hasPermission('projects:edit') && (
                      <button
                        onClick={() => onDeleteRisk(risk.id, project.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete risk entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Humanitarian Delivery Continuity Framework Box */}
      <div className="p-4 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 text-xs space-y-2">
        <div className="flex items-center gap-2 text-white font-bold">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Somaliland Pastoralist Humanitarian Access &amp; Delivery Continuity Framework</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          PENHA adheres to the customary <em>Xeer</em> pastoral dispute resolution mechanisms, maintaining continuous dialogue with village elders, traditional Sultans, and district peace committees. All drought emergency interventions, livestock water trucking, and solar borehole operations incorporate early warning contingency triggers to prevent aid interruptions during seasonal hardship.
        </p>
      </div>
    </div>
  );
};
