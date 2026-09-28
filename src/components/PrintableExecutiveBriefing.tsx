import React from 'react';
import {
  Printer,
  ArrowLeft,
  Building,
  ShieldCheck,
  MapPin,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Project, Donor, ExpenseRecord, FundInflow } from '../types/ngo';
import { formatUSD, formatSLSH, formatPercent, formatDate, formatNumber } from '../utils/formatters';

interface PrintableExecutiveBriefingProps {
  projects: Project[];
  donors: Donor[];
  expenses: ExpenseRecord[];
  fundInflows: FundInflow[];
  currencyMode: 'USD' | 'SLSH';
  onClose: () => void;
}

export const PrintableExecutiveBriefing: React.FC<PrintableExecutiveBriefingProps> = ({
  projects,
  donors,
  expenses,
  fundInflows,
  currencyMode,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const formatMoney = (usd: number) => {
    return currencyMode === 'USD' ? formatUSD(usd) : formatSLSH(usd);
  };

  // Portfolio Totals
  const totalGrantCeiling = projects.reduce((acc, p) => acc + p.budgetSummary.totalGrantUSD, 0);
  const totalDisbursed = projects.reduce((acc, p) => acc + p.budgetSummary.disbursedUSD, 0);
  const totalSpent = projects.reduce((acc, p) => acc + p.budgetSummary.expendituresUSD, 0);
  const totalRemaining = totalGrantCeiling - totalSpent;
  const portfolioBurnRate = totalGrantCeiling > 0 ? (totalSpent / totalGrantCeiling) * 100 : 0;
  const disbursementRate = totalGrantCeiling > 0 ? (totalDisbursed / totalGrantCeiling) * 100 : 0;

  // Beneficiary Aggregates
  const totalDirectBeneficiaries = projects.reduce((acc, p) => acc + p.beneficiaries.actualDirect, 0);
  const totalDirectTarget = projects.reduce((acc, p) => acc + p.beneficiaries.targetDirect, 0);
  const totalPastoralWomen = projects.reduce((acc, p) => acc + p.beneficiaries.disaggregation.pastoralistWomen, 0);
  const totalHouseholds = projects.reduce((acc, p) => acc + p.beneficiaries.actualHouseholds, 0);
  const totalYouth = projects.reduce((acc, p) => acc + p.beneficiaries.disaggregation.youthUnder25, 0);
  const totalElderly = projects.reduce((acc, p) => acc + p.beneficiaries.disaggregation.elderlyHerders, 0);
  const totalIDP = projects.reduce((acc, p) => acc + p.beneficiaries.disaggregation.idpReturneeHouseholds, 0);

  const womenPercentage = totalDirectBeneficiaries > 0 ? (totalPastoralWomen / totalDirectBeneficiaries) * 100 : 0;
  const directTargetReach = totalDirectTarget > 0 ? (totalDirectBeneficiaries / totalDirectTarget) * 100 : 0;

  // Slow moving and high burn counts
  const slowMovingProjects = projects.filter((p) => p.budgetSummary.burnRatePercent < 20 && p.status === 'Active');
  const highBurnProjects = projects.filter((p) => p.budgetSummary.burnRatePercent > 90 && p.status === 'Active');

  const todayStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="bg-slate-100 min-h-screen py-8 px-4 sm:px-6">
      {/* Action Bar (Hidden during print) */}
      <div className="max-w-5xl mx-auto mb-6 no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Executive Briefing · Optimized for A4 / Letter PDF
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Formal Executive Document */}
      <div className="max-w-5xl mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200 text-slate-900 font-sans print:p-0 print:border-none print:shadow-none">
        {/* Letterhead */}
        <div className="border-b-2 border-emerald-900 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-emerald-900 text-white font-bold flex items-center justify-center text-xl shrink-0">
              P
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-950">
                PENHA · Pastoral &amp; Environmental Network
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Country Office: Jigjiga Yar, Hargeisa, Somaliland | Horn of Africa Regional Directorate
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Email: exec@penha-hargeisa.org · Tel: +252 63 441 2981 · Web: penhanetwork.org
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs">
            <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold font-mono text-xs rounded">
              EXECUTIVE PORTFOLIO BRIEFING
            </span>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">Date Generated: <strong>{todayStr}</strong></p>
            <p className="text-[11px] text-slate-600 font-mono">Ref: PENHA-EXEC-2026-Q3</p>
          </div>
        </div>

        {/* Briefing Title Block */}
        <div className="my-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Document Type</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Executive Portfolio, Burn Rate &amp; Humanitarian Impact Dossier
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Target Audience</span>
              <p className="text-xs font-bold text-emerald-900">Country Director, Board of Trustees &amp; Donor Partners</p>
            </div>
          </div>
        </div>

        {/* Executive Summary Narrative */}
        <div className="mb-6 space-y-2 text-xs text-slate-700 leading-relaxed">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            1. Executive Overview &amp; Operational Status
          </h3>
          <p>
            This summarized executive report provides a high-level consolidation of PENHA Somaliland’s humanitarian and resilience programming across <strong>{projects.length} active grant portfolios</strong> in 6 regions (Maroodi Jeex, Togdheer, Sahil, Awdal, Sanaag, and Sool). Financial burn rates, liquidity milestones, and multi-donor logframe achievements have been reconciled against the primary financial ledger and certified field evidence as of <strong>{todayStr}</strong>.
          </p>
        </div>

        {/* KEY PORTFOLIO METRICS (4 Pillar Boxes) */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
            2. Consolidated Portfolio KPIs &amp; Financial Burn Rate
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Grant Ceiling</span>
              <p className="text-base font-bold font-mono text-slate-900 mt-1">{formatMoney(totalGrantCeiling)}</p>
              <span className="text-[10px] text-slate-500 font-medium">Across {projects.length} donor grants</span>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Cumulative Spent</span>
              <p className="text-base font-bold font-mono text-emerald-800 mt-1">{formatMoney(totalSpent)}</p>
              <span className="text-[10px] text-emerald-700 font-bold">{formatPercent(portfolioBurnRate)} Portfolio Burn</span>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Direct Beneficiaries</span>
              <p className="text-base font-bold font-mono text-slate-900 mt-1">{formatNumber(totalDirectBeneficiaries)}</p>
              <span className="text-[10px] text-slate-600 font-medium">{formatPercent(directTargetReach)} of target reached</span>
            </div>

            <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/50">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Pastoralist Women</span>
              <p className="text-base font-bold font-mono text-rose-900 mt-1">{formatNumber(totalPastoralWomen)}</p>
              <span className="text-[10px] text-rose-700 font-bold">{formatPercent(womenPercentage)} of direct reach</span>
            </div>
          </div>
        </div>

        {/* PROJECT-BY-PROJECT FINANCIAL & BURN RATE BREAKDOWN TABLE */}
        <div className="mb-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              3. Grant-by-Grant Financial Utilization &amp; Burn Rate Analysis
            </h3>
            <span className="text-[11px] text-slate-500">Currency Mode: <strong>{currencyMode}</strong></span>
          </div>

          <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                <th className="py-2 px-3">Project Code &amp; Title</th>
                <th className="py-2 px-2.5">Donor</th>
                <th className="py-2 px-2.5 text-right">Ceiling ({currencyMode})</th>
                <th className="py-2 px-2.5 text-right">Disbursed</th>
                <th className="py-2 px-2.5 text-right">Spent</th>
                <th className="py-2 px-2.5 text-right">Remaining</th>
                <th className="py-2 px-2.5 text-center">Burn %</th>
                <th className="py-2 px-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {projects.map((p) => {
                const burn = p.budgetSummary.burnRatePercent;
                const isVeryLow = burn < 20;
                const isHigh = burn > 90;

                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{p.shortTitle}</div>
                      <div className="text-[10px] font-mono text-slate-500">{p.code}</div>
                    </td>
                    <td className="py-2.5 px-2.5 text-slate-700 font-medium">{p.donorName}</td>
                    <td className="py-2.5 px-2.5 text-right font-mono font-semibold text-slate-900">
                      {formatMoney(p.budgetSummary.totalGrantUSD)}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono text-slate-700">
                      {formatMoney(p.budgetSummary.disbursedUSD)}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono font-bold text-emerald-800">
                      {formatMoney(p.budgetSummary.expendituresUSD)}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono text-slate-700">
                      {formatMoney(p.budgetSummary.remainingBalanceUSD)}
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-mono font-bold">
                      <span className={isVeryLow ? 'text-cyan-800' : isHigh ? 'text-rose-700' : 'text-slate-800'}>
                        {formatPercent(burn)}
                      </span>
                    </td>
                    <td className="py-2.5 px-2.5 text-center">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          isVeryLow
                            ? 'bg-cyan-100 text-cyan-900 border border-cyan-300'
                            : isHigh
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isVeryLow ? 'Slow-Moving (<20%)' : isHigh ? 'High Burn (>90%)' : 'On Schedule'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100/80 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="py-2.5 px-3">Total Portfolio</td>
                <td className="py-2.5 px-2.5">{donors.length} Donors</td>
                <td className="py-2.5 px-2.5 text-right font-mono">{formatMoney(totalGrantCeiling)}</td>
                <td className="py-2.5 px-2.5 text-right font-mono">{formatMoney(totalDisbursed)}</td>
                <td className="py-2.5 px-2.5 text-right font-mono text-emerald-900">{formatMoney(totalSpent)}</td>
                <td className="py-2.5 px-2.5 text-right font-mono">{formatMoney(totalRemaining)}</td>
                <td className="py-2.5 px-2.5 text-center font-mono text-emerald-900">{formatPercent(portfolioBurnRate)}</td>
                <td className="py-2.5 px-2.5 text-center text-[10px] text-emerald-800 font-bold">Consolidated</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* BENEFICIARY DEMOGRAPHIC REACH & INCLUSION SUMMARY */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
            4. Beneficiary Reach &amp; Vulnerability Disaggregation
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium">Direct Pastoralist Beneficiaries:</span>
              <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                {formatNumber(totalDirectBeneficiaries)} <span className="text-[10px] font-normal text-slate-500">/ {formatNumber(totalDirectTarget)} target</span>
              </p>
            </div>
            <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200">
              <span className="text-rose-800 font-medium">Pastoralist Women Reached:</span>
              <p className="text-base font-bold font-mono text-rose-900 mt-0.5">
                {formatNumber(totalPastoralWomen)} <span className="text-[10px] font-bold text-rose-700">({formatPercent(womenPercentage)})</span>
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium">Pastoralist Households:</span>
              <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                {formatNumber(totalHouseholds)} families
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium">Youth (&lt;25 Years):</span>
              <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                {formatNumber(totalYouth)}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium">Elderly Herders &amp; Traditional Elders:</span>
              <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                {formatNumber(totalElderly)}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium">IDP &amp; Returnee Pastoral Families:</span>
              <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                {formatNumber(totalIDP)}
              </p>
            </div>
          </div>
        </div>

        {/* EARLY WARNING ALERTS & RISK SAFEGUARDS */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
            5. Executive Risk Safeguards &amp; Compliance Early Warning
          </h3>
          <div className="space-y-2.5 text-xs">
            {slowMovingProjects.map((p) => (
              <div key={p.id} className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-lg flex items-start gap-2.5">
                <TrendingDown className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-cyan-950">
                    Slow-Moving Grant Alert: {p.code} ({p.shortTitle})
                  </span>
                  <p className="text-cyan-900 mt-0.5">
                    Budget utilization stands at only <strong>{p.budgetSummary.burnRatePercent.toFixed(1)}%</strong>. Leadership action recommended: unfreeze procurement contracts and conduct field coordination mission in {p.targetDistricts.join(', ')}.
                  </p>
                </div>
              </div>
            ))}

            {highBurnProjects.map((p) => (
              <div key={p.id} className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-950">
                    High Burn Rate Alert: {p.code} ({p.shortTitle})
                  </span>
                  <p className="text-rose-900 mt-0.5">
                    Burn rate reached <strong>{p.budgetSummary.burnRatePercent.toFixed(1)}%</strong> with {formatMoney(p.budgetSummary.remainingBalanceUSD)} balance remaining. Freeze secondary operational lines and initiate formal budget realignment if necessary.
                  </p>
                </div>
              </div>
            ))}

            {slowMovingProjects.length === 0 && highBurnProjects.length === 0 && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>All active grant portfolios are operating within nominal expenditure and compliance thresholds.</span>
              </div>
            )}
          </div>
        </div>

        {/* FORMAL SIGN-OFF & CERTIFICATION */}
        <div className="border-t-2 border-slate-300 pt-6 mt-10">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
            6. Institutional Certification &amp; Signatures
          </h3>
          <div className="grid grid-cols-3 gap-6 text-xs text-slate-700">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Prepared By:</p>
              <div className="mt-6 border-b border-slate-300 pb-1 font-semibold text-slate-900">
                Hamda Jama Duale
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Director of M&amp;E and Donor Compliance</p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Financial Verification:</p>
              <div className="mt-6 border-b border-slate-300 pb-1 font-semibold text-slate-900">
                Mohamed Abdi Ahmed
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Head of Finance &amp; Grant Administration</p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Executive Approval:</p>
              <div className="mt-6 border-b border-slate-300 pb-1 font-semibold text-slate-900">
                Dr. Sadia Ahmed
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Country Representative &amp; Regional Director</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>PENHA Hargeisa Office · ISO/IASC Humanitarian Transparency Standards</span>
            <span>Generated on {todayStr} · Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
