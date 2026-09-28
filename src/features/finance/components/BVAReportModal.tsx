import React, { useState } from 'react';
import { X, Printer, Download, AlertTriangle, CheckCircle2, ShieldCheck, Building, Filter } from 'lucide-react';
import { Project, Donor } from '../../../types/ngo';
import { BudgetVarianceAnalysis } from '../../../types/finance';
import { formatUSD, formatPercent } from '../../../utils/formatters';

interface BVAReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  donors: Donor[];
  varianceRows: BudgetVarianceAnalysis[];
}

export const BVAReportModal: React.FC<BVAReportModalProps> = ({
  isOpen,
  onClose,
  projects,
  donors,
  varianceRows
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [allowableVarianceThreshold, setAllowableVarianceThreshold] = useState<number>(10); // Standard NGO donor limit 10%

  if (!isOpen) return null;

  const currentProject = projects.find((p) => p.id === selectedProjectId);
  const matchingDonor = currentProject ? donors.find((d) => d.id === currentProject.donorId) : null;

  const filteredRows = selectedProjectId === 'all'
    ? varianceRows
    : varianceRows.filter((r) => r.lineCode.startsWith(currentProject?.code || ''));

  const totalAllocated = filteredRows.reduce((acc, r) => acc + r.allocatedUSD, 0);
  const totalCommitted = filteredRows.reduce((acc, r) => acc + r.commitmentsUSD, 0);
  const totalExpended = filteredRows.reduce((acc, r) => acc + r.expendituresUSD, 0);
  const totalCommittedAndSpent = totalCommitted + totalExpended;
  const totalBalance = totalAllocated - totalCommittedAndSpent;
  const overallBurnRate = totalAllocated > 0 ? (totalExpended / totalAllocated) * 100 : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Institutional Budget vs. Actuals (BVA) Report</h2>
              <p className="text-xs text-slate-400">Donor compliance statement &amp; variance threshold analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print BVA Statement</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar (No Print) */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Filter by Project:
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-hidden"
            >
              <option value="all">All Active Portfolios</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} ({p.donorName})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Donor Variance Threshold:</span>
            <select
              value={allowableVarianceThreshold}
              onChange={(e) => setAllowableVarianceThreshold(Number(e.target.value))}
              className="text-xs px-2.5 py-1 border border-slate-200 rounded-lg bg-white font-semibold"
            >
              <option value={10}>±10% (EU EUTF / Danida standard)</option>
              <option value={15}>±15% (FCDO / Flexible)</option>
              <option value={5}>±5% (Strict USAID / Strict Ear-marking)</option>
            </select>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Institutional Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900">PENHA HORN OF AFRICA</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  Hargeisa Country Desk
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pastoral and Environmental Network for the Horn of Africa · Somaliland Operational Office
              </p>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Report Ref: BVA-PENHA-{new Date().getFullYear()}-{selectedProjectId.toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Official Grant Variance Report
              </span>
              <span className="text-xs text-slate-500">Period: FY {new Date().getFullYear()} to Date</span>
              {matchingDonor && (
                <span className="text-xs font-semibold text-emerald-700 block mt-0.5">
                  Financed by: {matchingDonor.name}
                </span>
              )}
            </div>
          </div>

          {/* High Level KPI Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Approved Allocation</span>
              <span className="text-base font-bold text-slate-900">{formatUSD(totalAllocated)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Open Encumbrances</span>
              <span className="text-base font-bold text-indigo-700">{formatUSD(totalCommitted)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Expended to Date</span>
              <span className="text-base font-bold text-emerald-700">{formatUSD(totalExpended)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Burn Rate &amp; Free Cash</span>
              <span className="text-base font-bold text-slate-900">
                {overallBurnRate.toFixed(1)}% <span className="text-xs font-normal text-slate-500">({formatUSD(totalBalance)} uncommitted)</span>
              </span>
            </div>
          </div>

          {/* Detailed Budget Variance Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Budget Heading / Code</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Allocated</th>
                  <th className="py-2.5 px-3 text-right">Encumbered</th>
                  <th className="py-2.5 px-3 text-right">Expended</th>
                  <th className="py-2.5 px-3 text-right">Free Balance</th>
                  <th className="py-2.5 px-3 text-right">Burn %</th>
                  <th className="py-2.5 px-3 text-center">Donor Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRows.map((r, idx) => {
                  const isOverrun = r.expendituresUSD > r.allocatedUSD;
                  const isHighVariance = r.burnRatePercent > (100 + allowableVarianceThreshold);
                  const isSlowBurn = r.burnRatePercent < 35;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {r.lineCode}
                        <p className="text-[10px] font-normal text-slate-500 line-clamp-1">{r.description}</p>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">{r.category}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                        {formatUSD(r.allocatedUSD)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-indigo-700">
                        {formatUSD(r.commitmentsUSD)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-semibold">
                        {formatUSD(r.expendituresUSD)}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                        r.availableBalanceUSD < 0 ? 'text-rose-700' : 'text-slate-800'
                      }`}>
                        {formatUSD(r.availableBalanceUSD)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold">
                        {r.burnRatePercent.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isOverrun ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <AlertTriangle className="w-3 h-3" />
                            Over Budget
                          </span>
                        ) : isHighVariance ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3" />
                            Amendment Req.
                          </span>
                        ) : isSlowBurn ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
                            Slow Burn
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Compliant
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                <tr>
                  <td className="py-2.5 px-3" colSpan={2}>Grand Total Portfolio Summary</td>
                  <td className="py-2.5 px-3 text-right font-mono">{formatUSD(totalAllocated)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-indigo-700">{formatUSD(totalCommitted)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-700">{formatUSD(totalExpended)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-900">{formatUSD(totalBalance)}</td>
                  <td className="py-2.5 px-3 text-right">{overallBurnRate.toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-center text-emerald-800">Audit Ready ✓</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Compliance & Sign-off Block */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Donor Compliance &amp; Earmarking Certification</h4>
              <p className="text-[11px] leading-relaxed">
                We certify that expenditures recorded above comply with approved grant agreements, donor procurement policies, and Somaliland Ministry of Planning and National Development (MoPND) NGO financial guidelines.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="border-t border-slate-400 pt-2 mt-4">
                <span className="font-bold text-slate-900 block text-xs">Eng. Ismail Jama Farah</span>
                <span className="text-[10px] text-slate-500">Project Operations Lead</span>
              </div>
              <div className="border-t border-slate-400 pt-2 mt-4">
                <span className="font-bold text-slate-900 block text-xs">Dr. Mohamoud Hersi</span>
                <span className="text-[10px] text-slate-500">Head of Finance &amp; Grants</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
