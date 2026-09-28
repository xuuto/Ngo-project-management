import React, { useMemo } from 'react';
import { Building, DollarSign, Calendar, FileText, CheckCircle2, Shield, ArrowRight, ExternalLink } from 'lucide-react';
import { Donor, Project } from '../types/ngo';
import { useAuth } from '../context/AuthContext';
import { formatUSD, formatSLSH, formatPercent } from '../utils/formatters';

interface DonorsViewProps {
  donors: Donor[];
  projects: Project[];
  currencyMode: 'USD' | 'SLSH';
  onSelectProject: (projectId: string) => void;
  onOpenReportModal: (projectId?: string, donorId?: string) => void;
}

export const DonorsView: React.FC<DonorsViewProps> = ({
  donors,
  projects,
  currencyMode,
  onSelectProject,
  onOpenReportModal
}) => {
  const { currentUser, canAccessDonor, filterAccessibleProjects, hasPermission } = useAuth();

  const accessibleDonors = useMemo(() => {
    return donors.filter((d) => canAccessDonor(d.id));
  }, [donors, currentUser]);

  const accessibleProjects = useMemo(() => {
    return filterAccessibleProjects(projects);
  }, [projects, currentUser]);

  const formatMoney = (usd: number) => {
    return currencyMode === 'USD' ? formatUSD(usd) : formatSLSH(usd);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              PENHA Institutional Partnerships
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Multilateral Donors &amp; Grant Compliance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Donor Partners &amp; Grant Portfolios
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Transparent grant management, reporting covenants, disbursement schedules, and audit requirements.
          </p>
        </div>
      </div>

      {/* Donors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {accessibleDonors.map((donor) => {
          const donorProjects = accessibleProjects.filter((p) => p.donorId === donor.id);
          const totalCommitted = donorProjects.reduce((acc, p) => acc + p.budgetSummary.totalGrantUSD, 0);
          const totalDisbursed = donorProjects.reduce((acc, p) => acc + p.budgetSummary.disbursedUSD, 0);
          const totalSpent = donorProjects.reduce((acc, p) => acc + p.budgetSummary.expendituresUSD, 0);
          const burnRate = totalCommitted > 0 ? (totalSpent / totalCommitted) * 100 : 0;

          return (
            <div
              key={donor.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {donor.code}
                      </span>
                      <span className="text-xs text-slate-500">{donor.country}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{donor.name}</h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg">
                    {donorProjects.length} Active {donorProjects.length === 1 ? 'Grant' : 'Grants'}
                  </span>
                </div>

                {/* Financial Overview Cards */}
                <div className="grid grid-cols-3 gap-3 my-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500 text-[11px]">Committed</span>
                    <p className="font-bold font-mono text-slate-900 text-sm mt-0.5">{formatMoney(totalCommitted)}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500 text-[11px]">Disbursed</span>
                    <p className="font-bold font-mono text-slate-800 text-sm mt-0.5">{formatMoney(totalDisbursed)}</p>
                  </div>
                  <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                    <span className="text-emerald-800 text-[11px] font-medium">Burn Rate</span>
                    <p className="font-bold font-mono text-emerald-900 text-sm mt-0.5">{formatPercent(burnRate)}</p>
                  </div>
                </div>

                {/* Contact Person */}
                <div className="text-xs text-slate-600 bg-slate-50/60 p-3 rounded-lg border border-slate-200/60 space-y-1">
                  <p className="font-semibold text-slate-800">Donor Focal Point:</p>
                  <p>{donor.contactPerson}</p>
                  <p className="text-slate-500 text-[11px] font-mono">{donor.contactEmail} · {donor.phone}</p>
                </div>

                {/* Compliance & Reporting Requirements */}
                <div className="mt-4 text-xs space-y-2">
                  <p className="font-semibold text-slate-800">Grant Compliance &amp; Audit Requirements:</p>
                  <ul className="space-y-1 text-slate-600">
                    {donor.reportingRequirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Associated Projects */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-800 mb-2">Funded Projects in Horn of Africa:</p>
                  <div className="space-y-2">
                    {donorProjects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => onSelectProject(p.id)}
                        className="p-2.5 rounded-lg border border-slate-200 hover:border-emerald-600 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono text-[10px] text-emerald-800 font-semibold">{p.code}</span>
                          <p className="font-medium text-slate-900 line-clamp-1">{p.shortTitle}</p>
                        </div>
                        <span className="text-emerald-800 font-semibold text-[11px] flex items-center gap-1 shrink-0 ml-2">
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Donor Actions */}
              {hasPermission('reports:generate') && (
                <div className="pt-2">
                  <button
                    onClick={() => onOpenReportModal(donorProjects[0]?.id, donor.id)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Generate Donor Report for {donor.shortName}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
