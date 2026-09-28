import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Plus,
  FileText,
  Download,
  Receipt,
  ArrowDownLeft,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileCheck,
  TrendingUp,
  Percent,
  Calculator,
  RefreshCw,
  Wallet,
  Landmark,
  Scale,
  Paperclip
} from 'lucide-react';
import { Project, ExpenseRecord, FundInflow, BudgetCategory, Donor } from '../types/ngo';
import { BankAccount, FinancialCommitment, ProcurementOrder, FieldImprestAccount, BudgetVarianceAnalysis } from '../types/finance';
import { useAuth } from '../context/AuthContext';
import { formatUSD, formatSLSH, formatPercent, formatDate, exportToCSV } from '../utils/formatters';
import { SOMALILAND_SHILLING_RATE } from '../data/mockData';
import { CommitmentModal } from '../features/finance/components/CommitmentModal';
import { ProcurementModal } from '../features/finance/components/ProcurementModal';
import { ImprestModal } from '../features/finance/components/ImprestModal';
import { BVAReportModal } from '../features/finance/components/BVAReportModal';

interface FinanceSectionProps {
  projects: Project[];
  donors: Donor[];
  expenses: ExpenseRecord[];
  fundInflows: FundInflow[];
  bankAccounts: BankAccount[];
  commitments: FinancialCommitment[];
  procurementOrders: ProcurementOrder[];
  imprestAccounts: FieldImprestAccount[];
  currencyMode: 'USD' | 'SLSH';
  onOpenExpenseModal: () => void;
  onOpenInflowModal: () => void;
  onOpenCommitmentModal?: () => void;
  onOpenProcurementModal?: () => void;
  onAddCommitment?: (commitment: Omit<FinancialCommitment, 'id'>) => void;
  onAddProcurementOrder?: (order: Omit<ProcurementOrder, 'id'>) => void;
  onReplenishImprest?: (accountId: string, amountUSD: number, vouchersCount: number) => void;
}

type FinanceTab = 
  | 'overview'
  | 'three_way_control'
  | 'commitments'
  | 'vouchers'
  | 'bank_accounts'
  | 'procurement'
  | 'field_imprest';

export const FinanceSection: React.FC<FinanceSectionProps> = ({
  projects,
  donors,
  expenses,
  fundInflows,
  bankAccounts,
  commitments,
  procurementOrders,
  imprestAccounts,
  currencyMode,
  onOpenExpenseModal,
  onOpenInflowModal,
  onAddCommitment,
  onAddProcurementOrder,
  onReplenishImprest
}) => {
  const { currentUser, filterAccessibleProjects, filterAccessibleExpenses, hasPermission } = useAuth();

  const accessibleProjects = useMemo(() => filterAccessibleProjects(projects), [projects, currentUser]);
  const accessibleProjectIds = useMemo(() => new Set(accessibleProjects.map((p) => p.id)), [accessibleProjects]);

  const accessibleExpenses = useMemo(() => filterAccessibleExpenses(expenses, projects), [expenses, projects, currentUser]);
  const accessibleCommitments = useMemo(() => {
    if (currentUser.role === 'Super Admin') return commitments;
    return commitments.filter((c) => accessibleProjectIds.has(c.projectId));
  }, [commitments, accessibleProjectIds, currentUser]);

  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedReceiptDoc, setSelectedReceiptDoc] = useState<ExpenseRecord | null>(null);

  // Modals state
  const [isCommitmentModalOpen, setIsCommitmentModalOpen] = useState(false);
  const [isProcurementModalOpen, setIsProcurementModalOpen] = useState(false);
  const [isImprestModalOpen, setIsImprestModalOpen] = useState(false);
  const [isBVAReportModalOpen, setIsBVAReportModalOpen] = useState(false);

  // Live Currency Converter Calculator State
  const [calcUSD, setCalcUSD] = useState<number>(1000);

  // Filtered Project for 3-way control
  const targetProjects = useMemo(() => {
    if (selectedProjectId === 'all') return accessibleProjects;
    return accessibleProjects.filter((p) => p.id === selectedProjectId);
  }, [selectedProjectId, accessibleProjects]);

  // Overall Financial Aggregations
  const globalFinancials = useMemo(() => {
    let totalApprovedGrants = 0;
    let totalDisbursedFromDonors = 0;
    let totalActualExpended = 0;

    accessibleProjects.forEach((p) => {
      totalApprovedGrants += p.budgetSummary.totalGrantUSD;
      totalDisbursedFromDonors += p.budgetSummary.disbursedUSD;
      totalActualExpended += p.budgetSummary.expendituresUSD;
    });

    let totalActiveEncumbrances = 0;
    accessibleCommitments.forEach((c) => {
      if (c.status === 'Active Encumbrance' || c.status === 'Partially Disbursed') {
        totalActiveEncumbrances += c.remainingEncumbranceUSD;
      }
    });

    let totalBankLiquidity = 0;
    bankAccounts.forEach((b) => {
      totalBankLiquidity += b.currentBalance;
    });

    const uncommittedCashBalance = totalDisbursedFromDonors - totalActualExpended - totalActiveEncumbrances;
    const globalBurnRate = totalApprovedGrants > 0 ? (totalActualExpended / totalApprovedGrants) * 100 : 0;
    const encumbranceRate = totalApprovedGrants > 0 ? ((totalActualExpended + totalActiveEncumbrances) / totalApprovedGrants) * 100 : 0;

    return {
      totalApprovedGrants,
      totalDisbursedFromDonors,
      totalActualExpended,
      totalActiveEncumbrances,
      totalBankLiquidity,
      uncommittedCashBalance,
      globalBurnRate,
      encumbranceRate
    };
  }, [accessibleProjects, accessibleCommitments, bankAccounts]);

  // Comprehensive 3-Way Budget Variance Matrix
  const budgetVarianceRows = useMemo(() => {
    const rows: BudgetVarianceAnalysis[] = [];

    targetProjects.forEach((p) => {
      p.budgetLines.forEach((bl) => {
        // Find matching commitments for this budget line
        const lineCommitments = accessibleCommitments
          .filter((c) => c.projectId === p.id && c.budgetLineCode === bl.code)
          .reduce((acc, c) => acc + c.remainingEncumbranceUSD, 0);

        const totalCommittedAndSpent = bl.spentUSD + lineCommitments;
        const availableBalance = bl.totalAllocatedUSD - totalCommittedAndSpent;
        const burnRate = bl.totalAllocatedUSD > 0 ? (bl.spentUSD / bl.totalAllocatedUSD) * 100 : 0;

        let varianceStatus: BudgetVarianceAnalysis['varianceStatus'] = 'Normal (<85%)';
        if (totalCommittedAndSpent > bl.totalAllocatedUSD) {
          varianceStatus = 'Overrun Alert (>100%)';
        } else if (burnRate >= 85) {
          varianceStatus = 'Approaching Ceiling (85-95%)';
        } else if (burnRate < 40) {
          varianceStatus = 'Slow Burn (<40%)';
        }

        rows.push({
          lineId: bl.id,
          lineCode: `${p.code} / ${bl.code}`,
          category: bl.category,
          description: bl.description,
          allocatedUSD: bl.totalAllocatedUSD,
          commitmentsUSD: lineCommitments,
          expendituresUSD: bl.spentUSD,
          totalCommittedAndSpentUSD: totalCommittedAndSpent,
          availableBalanceUSD: availableBalance,
          burnRatePercent: burnRate,
          varianceStatus
        });
      });
    });

    if (selectedCategory !== 'all') {
      return rows.filter((r) => r.category === selectedCategory);
    }

    return rows;
  }, [targetProjects, accessibleCommitments, selectedCategory]);

  const formatMoney = (usd: number) => {
    return currencyMode === 'USD' ? formatUSD(usd) : formatSLSH(usd);
  };

  const handleExportVarianceCSV = () => {
    const headers = [
      'Line Code',
      'Category',
      'Description',
      'Approved Allocation USD',
      'Open Encumbrances USD',
      'Actual Expended USD',
      'Total Committed & Spent USD',
      'Available Balance USD',
      'Burn Rate %',
      'Status'
    ];

    const rows = budgetVarianceRows.map((r) => [
      r.lineCode,
      r.category,
      r.description,
      r.allocatedUSD,
      r.commitmentsUSD,
      r.expendituresUSD,
      r.totalCommittedAndSpentUSD,
      r.availableBalanceUSD,
      r.burnRatePercent.toFixed(1) + '%',
      r.varianceStatus
    ]);

    exportToCSV(`PENHA_Fund_Accounting_3Way_Matrix_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              PENHA Financial Operations &amp; Comptroller
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Fund Accounting, Commitments &amp; Multi-Donor Controls</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            NGO Financial Management &amp; Grant Comptroller
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Strict restricted fund separation, 3-way encumbrance controls (Budget $\to$ PO $\to$ Actuals), bank accounts, and 3-quote tender compliance.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {hasPermission('financials:create_voucher') && (
            <button
              onClick={onOpenExpenseModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Payment Voucher</span>
            </button>
          )}

          {hasPermission('financials:approve') && (
            <button
              onClick={onOpenInflowModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Record Donor Inflow</span>
            </button>
          )}

          <button
            onClick={() => setIsBVAReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Formal BVA Statement</span>
          </button>

          <button
            onClick={handleExportVarianceCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Statement</span>
          </button>
        </div>
      </div>

      {/* Financial Health Cockpit Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Bank & Cash Liquidity */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Bank &amp; Cash Liquidity</span>
            <Landmark className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {formatMoney(globalFinancials.totalBankLiquidity)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Across 5 designated donor &amp; ZAAD accounts
          </p>
        </div>

        {/* Card 2: Actual Expenditures */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Verified Expenditures</span>
            <Receipt className="w-4 h-4 text-blue-700" />
          </div>
          <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {formatMoney(globalFinancials.totalActualExpended)}
          </p>
          <p className="text-[11px] text-blue-700 font-medium mt-1">
            {formatPercent(globalFinancials.globalBurnRate)} Cash Burn Rate
          </p>
        </div>

        {/* Card 3: Open Encumbrances / POs */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Open Encumbrances (POs)</span>
            <Scale className="w-4 h-4 text-amber-700" />
          </div>
          <p className="text-xl font-bold font-mono tabular-nums text-amber-800 mt-1">
            {formatMoney(globalFinancials.totalActiveEncumbrances)}
          </p>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            Signed contracts reserving grant funds
          </p>
        </div>

        {/* Card 4: Uncommitted Free Cash Runway */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Uncommitted Cash Margin</span>
            <Wallet className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-xl font-bold font-mono tabular-nums text-emerald-800 mt-1">
            {formatMoney(globalFinancials.uncommittedCashBalance)}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            Disbursed minus spent &amp; encumbered
          </p>
        </div>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Comptroller Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('three_way_control')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'three_way_control'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>3-Way Budget vs. POs vs. Actuals</span>
        </button>
        <button
          onClick={() => setActiveTab('commitments')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'commitments'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Supplier Commitments &amp; POs ({accessibleCommitments.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('vouchers')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'vouchers'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Voucher Audit Ledger ({accessibleExpenses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('bank_accounts')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'bank_accounts'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Designated Bank Accounts &amp; Forex</span>
        </button>
        <button
          onClick={() => setActiveTab('procurement')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'procurement'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>3-Quote Tender Compliance ({procurementOrders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('field_imprest')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'field_imprest'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Field Sub-Office Imprest ({imprestAccounts.length})</span>
        </button>
      </div>

      {/* TAB 0: Comptroller Overview & Live FX Calculator */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Grant Fund Separation Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Restricted Grant Fund Allocation &amp; Disbursement Separation
            </h3>
            <p className="text-xs text-slate-500">
              International NGO compliance mandates complete fund segregation. Each donor portfolio operates under dedicated bank accounts and restricted activity codes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              {accessibleProjects.map((p) => {
                const burn = p.budgetSummary.burnRatePercent;
                return (
                  <div key={p.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-emerald-800 font-bold">{p.code}</span>
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {p.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 line-clamp-1">{p.shortTitle}</h4>
                    <p className="text-slate-500 text-[11px]">Donor: {p.donorName}</p>

                    <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Grant Total:</span>
                        <strong className="font-mono">{formatMoney(p.budgetSummary.totalGrantUSD)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Expended:</span>
                        <strong className="font-mono text-emerald-800">{formatMoney(p.budgetSummary.expendituresUSD)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Burn Rate:</span>
                        <strong className="font-mono text-slate-800">{formatPercent(burn)}</strong>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mt-1">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, burn)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Somaliland FX Converter & Forex Reconciliation Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live FX Converter */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-sm font-bold text-slate-900">Somaliland Multi-Currency FX Engine</h3>
                </div>
                <span className="font-mono text-[11px] text-slate-500">Benchmark: 1 USD = 8,500 SLSH</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Field per diems, seed multipliers, local earth-bunding casual laborers, and diesel fuel vouchers operate in Somaliland Shillings (SLSH) or Telesom ZAAD.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Enter USD Amount ($):</label>
                  <input
                    type="number"
                    min="1"
                    value={calcUSD}
                    onChange={(e) => setCalcUSD(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Somaliland Shilling Equivalent:</label>
                  <div className="p-2 border border-emerald-300 rounded-lg font-mono font-bold text-emerald-900 bg-emerald-50 truncate">
                    {(calcUSD * SOMALILAND_SHILLING_RATE).toLocaleString()} SLSH
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex justify-between">
                <span>EUR Equivalent (~0.92): €{(calcUSD * 0.92).toFixed(2)}</span>
                <span>GBP Equivalent (~0.77): £{(calcUSD * 0.77).toFixed(2)}</span>
              </div>
            </div>

            {/* Donor Audit Covenants */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Donor Financial Covenants &amp; Variance Rules</h3>
              </div>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>10% Reallocation Rule:</strong> Budget line adjustments exceeding 10% require formal written amendment from EU / Danida task manager.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Dual Authorization:</strong> All payments &gt;$500 require certification by Lead Project Manager and counter-signature by Country Director.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Zero Co-Mingling:</strong> Separate bank accounts maintained for EU-EUTF, Danida, and FCDO grants at Dahabshiil and Premier Bank.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: 3-Way Control (Budget vs Commitments vs Actuals vs Available) */}
      {activeTab === 'three_way_control' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-700" />
                3-Way Fund Control Matrix (Budget $\to$ Commitments $\to$ Actuals)
              </h3>
              <p className="text-xs text-slate-500">
                Audits allowable budget limits against open signed Purchase Orders (Encumbrances) and verified expenditures
              </p>
            </div>

            {/* Project Filter */}
            <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
              <label className="text-slate-600 font-medium">Filter Project:</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium"
              >
                <option value="all">All Accessible Projects</option>
                {accessibleProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.shortTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Grant Line</th>
                  <th className="py-2.5 px-3">Cost Category</th>
                  <th className="py-2.5 px-3">Budget Description</th>
                  <th className="py-2.5 px-3 text-right">Approved Allocation</th>
                  <th className="py-2.5 px-3 text-right">Open Encumbrances (POs)</th>
                  <th className="py-2.5 px-3 text-right">Actual Expended</th>
                  <th className="py-2.5 px-3 text-right">Total Committed &amp; Spent</th>
                  <th className="py-2.5 px-3 text-right">Available Free Balance</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {budgetVarianceRows.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{r.lineCode}</td>
                    <td className="py-2.5 px-3 text-slate-600">{r.category}</td>
                    <td className="py-2.5 px-3 text-slate-900 font-medium max-w-xs">{r.description}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatMoney(r.allocatedUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-800 font-semibold">
                      {formatMoney(r.commitmentsUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-blue-800 font-semibold">
                      {formatMoney(r.expendituresUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800 font-bold">
                      {formatMoney(r.totalCommittedAndSpentUSD)}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                      r.availableBalanceUSD < 0 ? 'text-rose-700' : 'text-emerald-800'
                    }`}>
                      {formatMoney(r.availableBalanceUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        r.varianceStatus.includes('Overrun')
                          ? 'bg-rose-100 text-rose-800'
                          : r.varianceStatus.includes('Approaching')
                          ? 'bg-amber-100 text-amber-800'
                          : r.varianceStatus.includes('Slow')
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {r.varianceStatus.split(' ')[0]} ({formatPercent(r.burnRatePercent)})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Commitments & Supplier Encumbrances */}
      {activeTab === 'commitments' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-700" />
                Supplier Contracts &amp; Purchase Order Commitments (Encumbrances)
              </h3>
              <p className="text-xs text-slate-500">
                Formal legally-binding contracts that encumber donor budget lines prior to final payment voucher dispatch
              </p>
            </div>
            {hasPermission('financials:create_voucher') && (
              <button
                onClick={() => setIsCommitmentModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Encumber Funds / PO</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Encumbrance Ref</th>
                  <th className="py-2.5 px-3">Project &amp; Line</th>
                  <th className="py-2.5 px-3">Contractor / Supplier</th>
                  <th className="py-2.5 px-3">Purpose &amp; Scope</th>
                  <th className="py-2.5 px-3 text-right">Committed</th>
                  <th className="py-2.5 px-3 text-right">Disbursed to Date</th>
                  <th className="py-2.5 px-3 text-right">Open Encumbrance</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {accessibleCommitments.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{c.commitmentNumber}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-800">{c.projectCode}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{c.budgetLineCode}</div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{c.supplierName}</td>
                    <td className="py-2.5 px-3 max-w-sm">
                      <div className="text-slate-700 line-clamp-1">{c.purpose}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.contractRef}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatMoney(c.committedAmountUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-800 font-semibold">
                      {formatMoney(c.disbursedAmountUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-800">
                      {formatMoney(c.remainingEncumbranceUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Voucher Audit Ledger */}
      {activeTab === 'vouchers' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-700" />
                Payment Voucher Audit Ledger &amp; Attached Receipts
              </h3>
              <p className="text-xs text-slate-500">
                Certified payment vouchers linked to budget line allocations with digitized invoice attachments
              </p>
            </div>

            {hasPermission('financials:create_voucher') && (
              <button
                onClick={onOpenExpenseModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Payment Voucher</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Voucher #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Project &amp; Line</th>
                  <th className="py-2.5 px-3">Payee &amp; Description</th>
                  <th className="py-2.5 px-3 text-right">Amount (USD)</th>
                  <th className="py-2.5 px-3 text-right">Amount (SLSH)</th>
                  <th className="py-2.5 px-3 text-center">Receipt Reference</th>
                  <th className="py-2.5 px-3 text-center">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {accessibleExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{exp.voucherNumber}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{formatDate(exp.date)}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-800">{exp.projectCode}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{exp.budgetLineCode}</div>
                    </td>
                    <td className="py-2.5 px-3 max-w-sm">
                      <div className="font-semibold text-slate-900">{exp.payee}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{exp.description}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                      {formatUSD(exp.amountUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500 text-[11px]">
                      {formatSLSH(exp.amountUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedReceiptDoc(exp)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded text-[10px] font-semibold"
                      >
                        <Paperclip className="w-3 h-3" />
                        <span>{exp.receiptReference}</span>
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                        {exp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Bank Accounts & Multi-Currency Liquidity */}
      {activeTab === 'bank_accounts' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-700" />
                Designated Donor Grant Bank Accounts &amp; Mobile Wallets
              </h3>
              <p className="text-xs text-slate-500">
                Institutional bank ledgers with Dahabshiil, Premier Bank, and Telesom ZAAD API Float
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccounts.map((b) => (
              <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 text-xs">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900">{b.bankName}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
                    {b.currency}
                  </span>
                </div>
                <p className="font-mono text-xs text-slate-600">{b.accountNumber}</p>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-slate-500">Current Balance:</span>
                  <strong className="font-mono text-base text-emerald-800">{formatMoney(b.currentBalance)}</strong>
                </div>
                {b.allocatedDonorName && (
                  <p className="text-[11px] text-slate-500">
                    Earmarked Donor: <strong>{b.allocatedDonorName}</strong>
                  </p>
                )}
                <div className="pt-1.5 border-t border-slate-200 text-[10px] text-slate-400">
                  <span>Authorized Signatories: {b.signatories.join(' · ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: 3-Quote Procurement Compliance & Tender Board */}
      {activeTab === 'procurement' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                3-Quote Competitive Procurement Compliance &amp; Tender Evaluation
              </h3>
              <p className="text-xs text-slate-500">
                Audited proof of competitive bidding required by European Union, Danida, and FCDO for purchases exceeding donor thresholds
              </p>
            </div>
            {hasPermission('financials:approve') && (
              <button
                onClick={() => setIsProcurementModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New 3-Quote Evaluation</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {procurementOrders.map((po) => (
              <div key={po.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {po.poNumber}
                    </span>
                    <span className="font-bold text-slate-900">{po.title}</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {po.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 text-[11px] text-slate-500">
                  <span>Project: <strong>{po.projectCode}</strong></span>
                  <span>·</span>
                  <span>Method: <strong>{po.method}</strong></span>
                  <span>·</span>
                  <span>Winning Vendor: <strong>{po.vendorName}</strong></span>
                  <span>·</span>
                  <span>Final Amount: <strong className="font-mono text-slate-900">{formatUSD(po.finalCostUSD)}</strong></span>
                </div>

                {/* Comparative Quotes Evaluation Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <div className="px-3 py-1.5 bg-slate-100 text-[11px] font-semibold text-slate-700">
                    Comparative Bid Evaluation Matrix (3 Competitive Bids Audited):
                  </div>
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-[11px] text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-1.5 px-3">Bidding Supplier</th>
                        <th className="py-1.5 px-3 text-right">Quoted Price (USD)</th>
                        <th className="py-1.5 px-3 text-right">Delivery Lead Time</th>
                        <th className="py-1.5 px-3 text-center">Compliance</th>
                        <th className="py-1.5 px-3 text-center">Outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {po.quotations.map((q, idx) => (
                        <tr key={idx} className={q.selected ? 'bg-emerald-50/40 font-semibold' : ''}>
                          <td className="py-1.5 px-3 text-slate-800">{q.supplierName}</td>
                          <td className="py-1.5 px-3 text-right font-mono">{formatUSD(q.quotedAmountUSD)}</td>
                          <td className="py-1.5 px-3 text-right">{q.deliveryDays} days</td>
                          <td className="py-1.5 px-3 text-center">
                            {q.complianceChecked ? (
                              <span className="text-emerald-700 font-semibold text-[10px]">Verified Pass</span>
                            ) : (
                              <span className="text-rose-700 font-semibold text-[10px]">Failed</span>
                            )}
                          </td>
                          <td className="py-1.5 px-3 text-center">
                            {q.selected ? (
                              <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded font-bold">
                                Selected Winner
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Rejected</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-[11px] text-slate-600 italic">
                  <strong>Evaluation Rationale:</strong> {po.evaluationSummary}
                </p>

                <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                  Approved Signatories: {po.approvedBy}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Field Sub-Office Imprest Floats */}
      {activeTab === 'field_imprest' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-700" />
                Sub-Office Field Imprest Floats &amp; Petty Cash Ledgers
              </h3>
              <p className="text-xs text-slate-500">
                Field cash accounts for Burao, Borama, and Ainabo sub-bases providing daily operational liquidity
              </p>
            </div>
            {hasPermission('financials:create_voucher') && (
              <button
                onClick={() => setIsImprestModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Liquidate &amp; Replenish Float</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {imprestAccounts.map((imp) => (
              <div key={imp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900">{imp.subOfficeName}</h4>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    imp.status === 'Healthy Liquidity' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {imp.status}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Custodian Officer:</span>
                    <strong className="text-slate-800">{imp.custodianName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Approved Float Limit:</span>
                    <span className="font-mono font-bold text-slate-900">{formatUSD(imp.floatCeilingUSD)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cash on Hand:</span>
                    <span className="font-mono font-bold text-emerald-800">{formatUSD(imp.currentCashOnHandUSD)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Unreconciled Vouchers:</span>
                    <span className="font-mono font-bold text-amber-800">{formatUSD(imp.unreconciledVouchersUSD)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Last Audit: {formatDate(imp.lastReconciliationDate)}</span>
                  {imp.status === 'Replenishment Requested' && (
                    <span className="font-bold text-amber-800">Replenish Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Digitized Receipt Preview Modal */}
      {selectedReceiptDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Audited Payment Voucher Document</h3>
              </div>
              <button
                onClick={() => setSelectedReceiptDoc(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Voucher Ref:</span>
                <strong className="text-slate-900">{selectedReceiptDoc.voucherNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payee:</span>
                <span className="text-slate-800 font-sans font-medium">{selectedReceiptDoc.payee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <strong className="text-emerald-800">{formatUSD(selectedReceiptDoc.amountUSD)} ({formatSLSH(selectedReceiptDoc.amountUSD)})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Certified By:</span>
                <span className="text-slate-800 font-sans">{selectedReceiptDoc.approvedBy}</span>
              </div>
            </div>

            <div className="p-4 border border-dashed border-slate-300 rounded-lg text-center bg-slate-50">
              <FileCheck className="w-8 h-8 text-emerald-700 mx-auto mb-1.5" />
              <p className="font-semibold text-slate-800">{selectedReceiptDoc.receiptFileName || 'Vendor_Invoice_Receipt.pdf'}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Digitally Scanned &amp; Encrypted for External Audit</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedReceiptDoc(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Financial Management Modals */}
      <CommitmentModal
        isOpen={isCommitmentModalOpen}
        onClose={() => setIsCommitmentModalOpen(false)}
        projects={accessibleProjects}
        onSaveCommitment={(c) => {
          onAddCommitment?.(c);
          setIsCommitmentModalOpen(false);
        }}
      />

      <ProcurementModal
        isOpen={isProcurementModalOpen}
        onClose={() => setIsProcurementModalOpen(false)}
        projects={accessibleProjects}
        onSaveProcurementOrder={(po) => {
          onAddProcurementOrder?.(po);
          setIsProcurementModalOpen(false);
        }}
      />

      <ImprestModal
        isOpen={isImprestModalOpen}
        onClose={() => setIsImprestModalOpen(false)}
        imprestAccounts={imprestAccounts}
        onReplenishImprest={(accId, amt, count) => {
          onReplenishImprest?.(accId, amt, count);
          setIsImprestModalOpen(false);
        }}
      />

      <BVAReportModal
        isOpen={isBVAReportModalOpen}
        onClose={() => setIsBVAReportModalOpen(false)}
        projects={accessibleProjects}
        donors={donors}
        varianceRows={budgetVarianceRows}
      />
    </div>
  );
};
