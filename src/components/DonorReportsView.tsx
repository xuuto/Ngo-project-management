import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Printer,
  Calendar,
  Building,
  CheckCircle2,
  Download,
  Filter,
  Eye,
  Shield,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { DonorReport, Project, Donor } from '../types/ngo';
import { useAuth } from '../context/AuthContext';
import { formatUSD, formatSLSH, formatPercent, formatDate, exportToCSV, exportToJSON } from '../utils/formatters';

interface DonorReportsViewProps {
  reports: DonorReport[];
  projects: Project[];
  donors: Donor[];
  currencyMode: 'USD' | 'SLSH';
  onViewReport: (report: DonorReport) => void;
  onOpenReportModal: () => void;
}

export const DonorReportsView: React.FC<DonorReportsViewProps> = ({
  reports,
  projects,
  donors,
  currencyMode,
  onViewReport,
  onOpenReportModal
}) => {
  const { currentUser, filterAccessibleReports, hasPermission } = useAuth();
  const accessibleReports = useMemo(() => filterAccessibleReports(reports), [reports, currentUser]);

  const [selectedDonor, setSelectedDonor] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  const filteredReports = useMemo(() => {
    return accessibleReports.filter((r) => {
      if (selectedDonor !== 'all' && r.donorId !== selectedDonor) return false;
      if (selectedPeriod !== 'all' && !r.reportingPeriod.includes(selectedPeriod)) return false;
      return true;
    });
  }, [accessibleReports, selectedDonor, selectedPeriod]);

  const handleExportAllReportsCSV = () => {
    const headers = [
      'Report No',
      'Submission Date',
      'Donor',
      'Grant Code',
      'Project Title',
      'Reporting Period',
      'Total Budget USD',
      'Period Expenditure USD',
      'Cumulative Spent USD',
      'Burn Rate %',
      'Direct Beneficiaries',
      'Women %',
      'Template'
    ];

    const rows = filteredReports.map((r) => [
      r.reportNumber,
      r.submissionDate,
      r.donorName,
      r.grantAgreementCode,
      r.projectTitle,
      r.reportingPeriod,
      r.financialOverview.totalBudgetUSD,
      r.financialOverview.expenditureThisPeriodUSD,
      r.financialOverview.cumulativeExpenditureUSD,
      r.financialOverview.burnRatePercent.toFixed(1) + '%',
      r.beneficiariesReached.direct,
      r.beneficiariesReached.womenPercent.toFixed(1) + '%',
      r.templateType
    ]);

    exportToCSV(`PENHA_Donor_Reports_Register_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              PENHA Accountability &amp; Transparency
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Multilateral Donor Dossiers</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Donor Impact &amp; Financial Reporting Center
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Automated narrative progress reports, verified logframe indicator reach, and financial audit statements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('reports:generate') && (
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start md:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate Donor Report</span>
            </button>
          )}

          <button
            onClick={handleExportAllReportsCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Donor Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Filter by Donor:</span>
            <select
              value={selectedDonor}
              onChange={(e) => setSelectedDonor(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-hidden"
            >
              <option value="all">All Donors ({donors.length})</option>
              {donors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.shortName}
                </option>
              ))}
            </select>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Period:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-hidden"
            >
              <option value="all">All Quarters &amp; Cycles</option>
              <option value="Q2 2026">Q2 2026</option>
              <option value="Q1 2026">Q1 2026</option>
              <option value="2025">Year 2025</option>
            </select>
          </div>
        </div>

        <span className="text-slate-500 font-medium">
          Showing {filteredReports.length} formal reports
        </span>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between hover:border-emerald-600 transition-all space-y-4"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {report.reportNumber}
                  </span>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {report.donorName} · {report.grantAgreementCode}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatDate(report.submissionDate)}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">{report.projectTitle}</h3>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">{report.reportingPeriod} ({report.templateType})</p>
              <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {report.executiveSummary}
              </p>

              {/* Metric Highlights */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-500">Period Spend</span>
                  <p className="font-bold font-mono text-slate-900 text-xs mt-0.5">
                    {formatUSD(report.financialOverview.expenditureThisPeriodUSD)}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-500">Burn Rate</span>
                  <p className="font-bold font-mono text-emerald-800 text-xs mt-0.5">
                    {formatPercent(report.financialOverview.burnRatePercent)}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-500">Direct Reached</span>
                  <p className="font-bold font-mono text-slate-900 text-xs mt-0.5">
                    {report.beneficiariesReached.direct.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Key Highlights */}
              <div className="mt-3 text-xs space-y-1">
                <p className="text-[11px] font-semibold text-slate-700">Verified Achievements:</p>
                {report.keyAchievements.slice(0, 2).map((ach, idx) => (
                  <p key={idx} className="text-[11px] text-slate-600 line-clamp-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />
                    <span>{ach}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Prepared by: <strong>{report.preparedBy.split(' ')[0]}</strong>
              </span>

              <button
                onClick={() => onViewReport(report)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview &amp; Print</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
