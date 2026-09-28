import React from 'react';
import { Printer, Download, ArrowLeft, Building, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { DonorReport, Project } from '../types/ngo';
import { formatUSD, formatSLSH, formatPercent, formatDate, formatNumber } from '../utils/formatters';

interface PrintableDonorReportProps {
  report: DonorReport;
  project?: Project;
  onClose: () => void;
}

export const PrintableDonorReport: React.FC<PrintableDonorReportProps> = ({ report, project, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-100 min-h-screen py-8 px-4 sm:px-6">
      {/* Action Bar (Hidden during Print) */}
      <div className="max-w-4xl mx-auto mb-6 no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Formal Donor Document Container */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200 print-shadow-none text-slate-900 font-sans">
        {/* Letterhead */}
        <div className="border-b-2 border-emerald-900 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-emerald-900 text-white font-bold flex items-center justify-center text-xl shrink-0">
              P
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-950">
                PENHA · Pastoral &amp; Environmental Network
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Country Office: Jigjiga Yar, Hargeisa, Somaliland | Horn of Africa Desk
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Email: info@penha-hargeisa.org · Tel: +252 63 441 2981 · Web: penhanetwork.org
              </p>
            </div>
          </div>

          <div className="text-right sm:text-right text-xs">
            <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold font-mono text-[11px] rounded">
              {report.reportNumber}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Submission Date: {formatDate(report.submissionDate)}</p>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">{report.templateType}</p>
          </div>
        </div>

        {/* Document Title Block */}
        <div className="my-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Project Title:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{report.projectTitle}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Funding Donor &amp; Grant Reference:</span>
              <p className="font-semibold text-slate-900 mt-0.5">
                {report.donorName} ({report.grantAgreementCode})
              </p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Project Internal Code:</span>
              <p className="font-mono font-semibold text-emerald-900">{report.projectCode}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Reporting Period:</span>
              <p className="font-semibold text-slate-800">{report.reportingPeriod}</p>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="my-6 space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-950 border-b border-slate-200 pb-1">
            1. Executive Narrative &amp; Operational Overview
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed pt-1">
            {report.executiveSummary}
          </p>
        </div>

        {/* Section 2: Key Milestones & Quantitative Achievements */}
        <div className="my-6 space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-950 border-b border-slate-200 pb-1">
            2. Major Program Achievements During This Cycle
          </h2>
          <ul className="space-y-2 pt-1 text-xs text-slate-700">
            {report.keyAchievements.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 3: Financial Utilization & Burn Rate Table */}
        <div className="my-6 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-950 border-b border-slate-200 pb-1">
            3. Financial Performance &amp; Fund Utilization
          </h2>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-2 px-3">Metric</th>
                  <th className="py-2 px-3 text-right">USD ($)</th>
                  <th className="py-2 px-3 text-right">Somaliland Shillings (SLSH)</th>
                  <th className="py-2 px-3 text-right">% of Approved Grant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                <tr>
                  <td className="py-2 px-3 font-medium">Total Approved Grant Budget</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                    {formatUSD(report.financialOverview.totalBudgetUSD)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">
                    {formatSLSH(report.financialOverview.totalBudgetUSD)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold">100.0%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Expenditure During This Reporting Period</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">
                    {formatUSD(report.financialOverview.expenditureThisPeriodUSD)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">
                    {formatSLSH(report.financialOverview.expenditureThisPeriodUSD)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono">
                    {formatPercent((report.financialOverview.expenditureThisPeriodUSD / report.financialOverview.totalBudgetUSD) * 100)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Cumulative Grant Expenditures to Date</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                    {formatUSD(report.financialOverview.cumulativeExpenditureUSD)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">
                    {formatSLSH(report.financialOverview.cumulativeExpenditureUSD)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">
                    {formatPercent(report.financialOverview.burnRatePercent)}
                  </td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="py-2 px-3 font-medium text-slate-600">Remaining Unexpended Grant Balance</td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800">
                    {formatUSD(report.financialOverview.remainingBalanceUSD)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">
                    {formatSLSH(report.financialOverview.remainingBalanceUSD)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono">
                    {formatPercent(100 - report.financialOverview.burnRatePercent)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Beneficiaries Disaggregation */}
        <div className="my-6 space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-950 border-b border-slate-200 pb-1">
            4. Beneficiary Verification &amp; Gender Disaggregation
          </h2>
          <div className="grid grid-cols-3 gap-3 pt-1 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500">Direct Pastoralists Reached:</span>
              <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                {formatNumber(report.beneficiariesReached.direct)}
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500">Pastoralist Women Share:</span>
              <p className="text-base font-bold font-mono text-rose-800 mt-0.5">
                {formatPercent(report.beneficiariesReached.womenPercent)}
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500">Verified Pastoral Households:</span>
              <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                {formatNumber(report.beneficiariesReached.households)}
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Logframe Indicator Highlights (if project provided) */}
        {project && (
          <div className="my-6 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-950 border-b border-slate-200 pb-1">
              5. Logframe Indicators (OVIs) Performance Status
            </h2>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-2 px-3">OVI Code</th>
                    <th className="py-2 px-3">Indicator Description</th>
                    <th className="py-2 px-3 text-right">Target</th>
                    <th className="py-2 px-3 text-right">Actual Reached</th>
                    <th className="py-2 px-3 text-center">Progress %</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {project.logframe.outcomes.flatMap((oc) =>
                    oc.outputs.flatMap((out) =>
                      out.indicators.map((ind) => {
                        const progress = ind.target > 0 ? (ind.currentActual / ind.target) * 100 : 0;
                        return (
                          <tr key={ind.id}>
                            <td className="py-2 px-3 font-mono font-semibold text-slate-800">{ind.code}</td>
                            <td className="py-2 px-3 text-slate-900 max-w-sm">{ind.description}</td>
                            <td className="py-2 px-3 text-right font-mono">{formatNumber(ind.target)} {ind.unit}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-900">
                              {formatNumber(ind.currentActual)} {ind.unit}
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-semibold text-slate-800">
                              {formatPercent(progress)}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {ind.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 6: Challenges & Mitigation */}
        <div className="my-6 space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-950 border-b border-slate-200 pb-1">
            6. Operational Challenges &amp; Customary Mitigation Strategies
          </h2>
          <ul className="space-y-2 pt-1 text-xs text-slate-700">
            {report.challengesAndMitigations.map((chal, idx) => (
              <li key={idx} className="p-2.5 bg-slate-50 border-l-2 border-amber-600 rounded-r text-xs">
                {chal}
              </li>
            ))}
          </ul>
        </div>

        {/* Signatures & Institutional Signoff Block */}
        <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
          <div className="space-y-1">
            <p className="text-slate-500">Prepared &amp; Certified by:</p>
            <p className="font-bold text-slate-900 text-sm mt-3">{report.preparedBy}</p>
            <p className="text-slate-600">PENHA Horn of Africa Operations Desk</p>
            <div className="mt-4 pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-400 font-mono">
              Digital Signature ID: PENHA-VERIF-{(report.id).toUpperCase()}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-slate-500">Approved for Donor Transmission by:</p>
            <p className="font-bold text-slate-900 text-sm mt-3">{report.approvedBy}</p>
            <p className="text-slate-600">Country Director, PENHA Somaliland Office</p>
            <div className="mt-4 pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-400 font-mono">
              Country Office Seal: JIGJIGA-YAR-HARGEISA
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
