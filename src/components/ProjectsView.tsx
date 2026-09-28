import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Layers,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Clock,
  ArrowRight,
  Shield,
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { Project, ProjectStatus, SectorPillar } from '../types/ngo';
import { useAuth } from '../context/AuthContext';
import { formatUSD, formatSLSH, formatPercent, formatDate, formatNumber } from '../utils/formatters';

interface ProjectsViewProps {
  projects: Project[];
  currencyMode: 'USD' | 'SLSH';
  onSelectProject: (projectId: string) => void;
  onOpenNewProjectModal: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  currencyMode,
  onSelectProject,
  onOpenNewProjectModal
}) => {
  const { currentUser, filterAccessibleProjects, hasPermission } = useAuth();
  const accessibleProjects = useMemo(() => filterAccessibleProjects(projects), [projects, currentUser]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pillarFilter, setPillarFilter] = useState<string>('all');

  const filteredProjects = useMemo(() => {
    return accessibleProjects.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (pillarFilter !== 'all' && p.pillar !== pillarFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesCode = p.code.toLowerCase().includes(query);
        const matchesTitle = p.title.toLowerCase().includes(query) || p.shortTitle.toLowerCase().includes(query);
        const matchesDonor = p.donorName.toLowerCase().includes(query);
        const matchesRegion = p.targetRegions.some((r) => r.toLowerCase().includes(query));
        const matchesDistrict = p.targetDistricts.some((d) => d.toLowerCase().includes(query));
        if (!matchesCode && !matchesTitle && !matchesDonor && !matchesRegion && !matchesDistrict) {
          return false;
        }
      }
      return true;
    });
  }, [accessibleProjects, searchQuery, statusFilter, pillarFilter]);

  const formatMoney = (usd: number) => {
    return currencyMode === 'USD' ? formatUSD(usd) : formatSLSH(usd);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              PENHA Hargeisa Office
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Project Operations &amp; Logframe Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Projects &amp; Logical Frameworks (Logframes)
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Operational project matrix: Objectively Verifiable Indicators (OVIs), field activity tracking, and beneficiary targets.
          </p>
        </div>

        {hasPermission('projects:create') && (
          <button
            onClick={onOpenNewProjectModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start md:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Project</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code, title, donor, district or region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Planning">Planning</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Pillar Filter */}
          <select
            value={pillarFilter}
            onChange={(e) => setPillarFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="all">All Thematic Pillars</option>
            <option value="Rangeland & Water Management">Rangeland &amp; Water Management</option>
            <option value="Pastoralist Women Livelihoods">Pastoralist Women Livelihoods</option>
            <option value="Climate Resilience & Drought Early Action">Climate Resilience &amp; Drought</option>
            <option value="Natural Dryland Resins & Value Chains">Natural Resins &amp; Value Chains</option>
          </select>
        </div>

        <span className="text-slate-500 font-medium">
          Showing {filteredProjects.length} of {accessibleProjects.length} projects
        </span>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProjects.map((p) => {
          // Calculate activities count and indicator status
          let totalActivities = 0;
          let completedActivities = 0;
          let totalIndicators = 0;
          let onTrackIndicators = 0;

          p.logframe.outcomes.forEach((oc) => {
            oc.outputs.forEach((out) => {
              out.indicators.forEach((ind) => {
                totalIndicators++;
                if (ind.status === 'Achieved' || ind.status === 'On Track') onTrackIndicators++;
              });
              out.activities.forEach((act) => {
                totalActivities++;
                if (act.status === 'Completed' || act.status === 'Field Verified') completedActivities++;
              });
            });
          });

          const actProgress = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
          const burnRate = p.budgetSummary.burnRatePercent;

          return (
            <div
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className="bg-white rounded-xl border border-slate-200 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer p-5 flex flex-col justify-between group"
            >
              <div>
                {/* Header Tagline */}
                <div className="flex items-start justify-between gap-3 text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-800 font-semibold">{p.code}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 font-medium">{p.donorName}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    {p.status}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {p.logframe.impactGoal}
                </p>

                {/* Locations & Manager */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.targetRegions.join(', ')} ({p.targetDistricts.slice(0, 3).join(', ')})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Lead: {p.leadProjectManager.name}</span>
                  </div>
                </div>

                {/* Financial & Activity Progress Bars */}
                <div className="mt-4 space-y-2 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">Fund Burn Rate:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {formatMoney(p.budgetSummary.expendituresUSD)} / {formatMoney(p.budgetSummary.totalGrantUSD)} ({formatPercent(burnRate)})
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, burnRate)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">Activities Verified in Field:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {completedActivities} / {totalActivities} tasks ({actProgress.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${actProgress}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Next Report: <strong>{formatDate(p.nextDonorReportDate)}</strong></span>
                </div>
                <div className="flex items-center gap-1 text-emerald-800 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Open Logframe Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
