import React, { useState } from 'react';
import { X, FileText, CheckCircle2, Sparkles, Building, DollarSign } from 'lucide-react';
import { Project, DonorReport, Donor } from '../../types/ngo';
import { useAuth } from '../../context/AuthContext';
import { formatUSD, formatPercent } from '../../utils/formatters';
import { SOMALILAND_SHILLING_RATE } from '../../data/mockData';

interface ReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  donors: Donor[];
  preselectedProjectId?: string;
  preselectedDonorId?: string;
  onSaveReport: (report: DonorReport) => void;
}

export const ReportGeneratorModal: React.FC<ReportGeneratorModalProps> = ({
  isOpen,
  onClose,
  projects,
  donors,
  preselectedProjectId,
  preselectedDonorId,
  onSaveReport
}) => {
  const { currentUser, filterAccessibleProjects } = useAuth();
  const accessibleProjects = filterAccessibleProjects(projects);

  const [projectId, setProjectId] = useState<string>(
    preselectedProjectId || accessibleProjects[0]?.id || ''
  );

  const selectedProject = accessibleProjects.find((p) => p.id === projectId) || accessibleProjects[0];

  const [reportingPeriod, setReportingPeriod] = useState<string>('Q3 2026 (Jul - Sep 2026)');
  const [templateType, setTemplateType] = useState<
    'EU Progress Report' | 'Danida Results-Based Report' | 'OCHA 5W Matrix' | 'Comprehensive Impact Audit'
  >('EU Progress Report');

  const [periodExpenditureUSD, setPeriodExpenditureUSD] = useState<number>(185000);
  const [executiveSummary, setExecutiveSummary] = useState<string>(
    `During this reporting period, the project achieved notable field progress across target districts in Somaliland. Pastoralist community resilience and natural resource protection milestones were verified through joint missions with regional authorities. All budget expenditures remain aligned with the approved multi-year agreement.`
  );
  const [preparedBy, setPreparedBy] = useState<string>(
    `${currentUser.name} (${currentUser.jobTitle})`
  );
  const [approvedBy, setApprovedBy] = useState<string>(
    'Dr. Mohamoud Hersi (Country Director, PENHA Somaliland)'
  );

  if (!isOpen) return null;

  // Compute key achievements from project data
  const achievements: string[] = [];
  selectedProject?.logframe.outcomes.forEach((oc) => {
    oc.outputs.forEach((out) => {
      out.indicators.forEach((ind) => {
        achievements.push(
          `${ind.description}: Reached ${ind.currentActual.toLocaleString()} ${ind.unit} against target of ${ind.target.toLocaleString()} ${ind.unit} (${ind.status})`
        );
      });
    });
  });

  const challenges = selectedProject?.risks.map((r) => `${r.category}: ${r.description} — Mitigation: ${r.mitigationPlan}`) || [
    'Erratic seasonal rainfall mitigated through contour moisture-retention structures.',
    'Dry-season pastoral herd migrations addressed via customary Xeer conflict agreements.'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const reportNumber = `REP-PENHA-${selectedProject.donorName.slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newReport: DonorReport = {
      id: `rep-${Date.now()}`,
      reportNumber,
      projectId: selectedProject.id,
      projectCode: selectedProject.code,
      projectTitle: selectedProject.title,
      donorId: selectedProject.donorId,
      donorName: selectedProject.donorName,
      grantAgreementCode: selectedProject.grantAgreementCode,
      reportingPeriod,
      submissionDate: new Date().toISOString().slice(0, 10),
      preparedBy,
      approvedBy,
      templateType,
      executiveSummary,
      keyAchievements: achievements.slice(0, 4),
      challengesAndMitigations: challenges.slice(0, 2),
      financialOverview: {
        totalBudgetUSD: selectedProject.budgetSummary.totalGrantUSD,
        expenditureThisPeriodUSD: periodExpenditureUSD,
        cumulativeExpenditureUSD: selectedProject.budgetSummary.expendituresUSD,
        remainingBalanceUSD: selectedProject.budgetSummary.remainingBalanceUSD,
        burnRatePercent: selectedProject.budgetSummary.burnRatePercent,
        currency: 'USD',
        slshEquivalent: selectedProject.budgetSummary.expendituresUSD * SOMALILAND_SHILLING_RATE
      },
      indicatorSummary: {
        totalIndicators: 3,
        achievedCount: 1,
        onTrackCount: 2,
        delayedCount: 0,
        overallTargetReachPercent: 88.5
      },
      beneficiariesReached: {
        direct: selectedProject.beneficiaries.actualDirect,
        womenPercent:
          (selectedProject.beneficiaries.disaggregation.pastoralistWomen /
            selectedProject.beneficiaries.actualDirect) *
          100,
        households: selectedProject.beneficiaries.actualHouseholds
      }
    };

    onSaveReport(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Generate Official Donor Report</h2>
              <p className="text-[11px] text-slate-500">Automated narrative, M&amp;E logframe matrices, and financial audit</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Project Selection */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Project to Report:</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:ring-1 focus:ring-emerald-700 focus:outline-hidden"
            >
              {accessibleProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.shortTitle} ({p.donorName})
                </option>
              ))}
            </select>
          </div>

          {/* Reporting Period & Template */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reporting Period:</label>
              <input
                type="text"
                required
                value={reportingPeriod}
                onChange={(e) => setReportingPeriod(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Donor Template Standard:</label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:ring-1 focus:ring-emerald-700 focus:outline-hidden"
              >
                <option value="EU Progress Report">EU Progress Report (Annex III)</option>
                <option value="Danida Results-Based Report">Danida Results-Based Report</option>
                <option value="OCHA 5W Matrix">OCHA 5W Cluster Matrix</option>
                <option value="Comprehensive Impact Audit">Comprehensive Impact Audit</option>
              </select>
            </div>
          </div>

          {/* Financial Breakdown Preview */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <span className="font-semibold text-slate-800">Financial Utilization Data (Auto-aggregated):</span>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500">Total Budget:</span>
                <p className="font-mono font-bold text-slate-900">
                  {formatUSD(selectedProject?.budgetSummary.totalGrantUSD || 0)}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Cumulative Spent:</span>
                <p className="font-mono font-bold text-emerald-800">
                  {formatUSD(selectedProject?.budgetSummary.expendituresUSD || 0)}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Burn Rate:</span>
                <p className="font-mono font-bold text-blue-700">
                  {formatPercent(selectedProject?.budgetSummary.burnRatePercent || 0)}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <label className="block text-slate-600 font-medium mb-1">Expenditure This Specific Period (USD $):</label>
              <input
                type="number"
                min="0"
                value={periodExpenditureUSD}
                onChange={(e) => setPeriodExpenditureUSD(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono font-bold bg-white"
              />
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Executive Narrative &amp; Operational Overview:
            </label>
            <textarea
              rows={4}
              required
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:outline-hidden"
            />
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Prepared By (Lead Officer):</label>
              <input
                type="text"
                required
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Approved By (Country Director):</label>
              <input
                type="text"
                required
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Generate &amp; Review Formal Dossier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
