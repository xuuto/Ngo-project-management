import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Plus,
  FileText,
  Download,
  Receipt,
  ArrowDownLeft,
  CheckCircle,
  AlertCircle,
  Paperclip,
  ExternalLink,
  Shield,
  Eye,
  Filter,
  Building
} from 'lucide-react';
import { Project, ExpenseRecord, FundInflow, BudgetCategory, BudgetLineItem } from '../types/ngo';
import { useAuth } from '../context/AuthContext';
import { formatUSD, formatSLSH, formatPercent, formatDate, exportToCSV } from '../utils/formatters';

interface FinancialsViewProps {
  projects: Project[];
  expenses: ExpenseRecord[];
  fundInflows: FundInflow[];
  currencyMode: 'USD' | 'SLSH';
  onAddExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;
  onAddFundInflow: (inflow: Omit<FundInflow, 'id'>) => void;
  onOpenExpenseModal: () => void;
  onOpenInflowModal: () => void;
  onOpenBudgetLineModal: (projectId: string) => void;
}

export const FinancialsView: React.FC<FinancialsViewProps> = ({
  projects,
  expenses,
  fundInflows,
  currencyMode,
  onAddExpense,
  onAddFundInflow,
  onOpenExpenseModal,
  onOpenInflowModal,
  onOpenBudgetLineModal
}) => {
  const { currentUser, filterAccessibleProjects, filterAccessibleExpenses, filterAccessibleFundInflows, hasPermission } = useAuth();

  const accessibleProjects = useMemo(() => filterAccessibleProjects(projects), [projects, currentUser]);
  const accessibleExpenses = useMemo(() => filterAccessibleExpenses(expenses, projects), [expenses, projects, currentUser]);
  const accessibleFundInflows = useMemo(() => filterAccessibleFundInflows(fundInflows, projects), [fundInflows, projects, currentUser]);

  const [activeTab, setActiveTab] = useState<'budget_vs_actuals' | 'expenses_ledger' | 'fund_inflows'>('budget_vs_actuals');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedReceiptPreview, setSelectedReceiptPreview] = useState<ExpenseRecord | null>(null);

  // Active Project for Budget breakdown
  const currentProjectForBudget = useMemo(() => {
    if (selectedProjectId === 'all') return accessibleProjects[0] || null;
    return accessibleProjects.find((p) => p.id === selectedProjectId) || accessibleProjects[0] || null;
  }, [selectedProjectId, accessibleProjects]);

  // Aggregate Category Totals for all accessible projects or selected project
  const categoryAnalysis = useMemo(() => {
    const categories: BudgetCategory[] = [
      'Personnel & Field Staff',
      'Operational Logistics & Transport',
      'Direct Program Inputs & Works',
      'Community Training & Workshops',
      'Monitoring, Evaluation & Audits',
      'Indirect & Secretariat Overheads'
    ];

    const targetProjects = selectedProjectId === 'all'
      ? accessibleProjects
      : accessibleProjects.filter((p) => p.id === selectedProjectId);

    return categories.map((cat) => {
      let allocated = 0;
      let spent = 0;

      targetProjects.forEach((p) => {
        p.budgetLines
          .filter((bl) => bl.category === cat)
          .forEach((bl) => {
            allocated += bl.totalAllocatedUSD;
            spent += bl.spentUSD;
          });
      });

      const remaining = allocated - spent;
      const burnRate = allocated > 0 ? (spent / allocated) * 100 : 0;
      const isOverBudget = spent > allocated;

      return {
        category: cat,
        allocated,
        spent,
        remaining,
        burnRate,
        isOverBudget
      };
    });
  }, [accessibleProjects, selectedProjectId]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return accessibleExpenses.filter((e) => {
      if (selectedProjectId !== 'all' && e.projectId !== selectedProjectId) return false;
      if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
      return true;
    });
  }, [accessibleExpenses, selectedProjectId, selectedCategory]);

  // Financial Totals for Header Cards
  const summaryTotals = useMemo(() => {
    let totalCommitted = 0;
    let totalInflowReceived = 0;
    let totalExpended = 0;

    accessibleProjects.forEach((p) => {
      totalCommitted += p.budgetSummary.totalGrantUSD;
      totalExpended += p.budgetSummary.expendituresUSD;
    });

    accessibleFundInflows.forEach((inf) => {
      if (inf.status === 'Received') {
        totalInflowReceived += inf.amountUSD;
      }
    });

    const cashBalance = totalInflowReceived - totalExpended;
    const globalBurnRate = totalCommitted > 0 ? (totalExpended / totalCommitted) * 100 : 0;

    return {
      totalCommitted,
      totalInflowReceived,
      totalExpended,
      cashBalance,
      globalBurnRate
    };
  }, [accessibleProjects, accessibleFundInflows]);

  const formatMoney = (usd: number) => {
    return currencyMode === 'USD' ? formatUSD(usd) : formatSLSH(usd);
  };

  const handleExportBudgetReport = () => {
    if (!currentProjectForBudget) return;
    const headers = ['Line Code', 'Category', 'Description', 'Unit', 'Qty', 'Unit Cost USD', 'Allocated USD', 'Spent USD', 'Variance USD', 'Burn %'];
    const rows = currentProjectForBudget.budgetLines.map((bl) => [
      bl.code,
      bl.category,
      bl.description,
      bl.unit,
      bl.quantity,
      bl.unitCostUSD,
      bl.totalAllocatedUSD,
      bl.spentUSD,
      bl.totalAllocatedUSD - bl.spentUSD,
      bl.totalAllocatedUSD > 0 ? ((bl.spentUSD / bl.totalAllocatedUSD) * 100).toFixed(1) + '%' : '0%'
    ]);

    exportToCSV(`Financial_Budget_Report_${currentProjectForBudget.code}`, headers, rows);
  };

  const handleExportExpensesCSV = () => {
    const headers = ['Voucher No', 'Date', 'Project Code', 'Category', 'Budget Line', 'Payee', 'Description', 'Amount USD', 'Approved By', 'Receipt Ref', 'Status'];
    const rows = filteredExpenses.map((e) => [
      e.voucherNumber,
      e.date,
      e.projectCode,
      e.category,
      e.budgetLineCode,
      e.payee,
      e.description,
      e.amountUSD,
      e.approvedBy,
      e.receiptReference,
      e.status
    ]);

    exportToCSV(`PENHA_Expense_Ledger_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              PENHA Financial Management
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Multilateral Grants &amp; Field Accounting</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Budgeting, Fund Inflows &amp; Expense Ledgers
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Track category budgets, record verified field receipts, manage donor disbursements, and monitor burn rates.
          </p>
        </div>

        {/* Action Buttons based on RBAC */}
        <div className="flex flex-wrap items-center gap-2">
          {hasPermission('financials:create_voucher') && (
            <button
              onClick={onOpenExpenseModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Expense Voucher</span>
            </button>
          )}

          {hasPermission('financials:approve') && (
            <button
              onClick={onOpenInflowModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Record Donor Fund Inflow</span>
            </button>
          )}

          <button
            onClick={activeTab === 'budget_vs_actuals' ? handleExportBudgetReport : handleExportExpensesCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Approved Project Grants</p>
          <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {formatMoney(summaryTotals.totalCommitted)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Total approved donor contracts</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Donor Funds Received (Inflows)</p>
          <p className="text-xl font-bold font-mono tabular-nums text-emerald-800 mt-1">
            {formatMoney(summaryTotals.totalInflowReceived)}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Bank verified disbursements</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Total Program Expenditures</p>
          <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {formatMoney(summaryTotals.totalExpended)}
          </p>
          <p className="text-[11px] text-blue-700 font-medium mt-1">
            {formatPercent(summaryTotals.globalBurnRate)} Global Grant Burn Rate
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Current Field Cash Balance</p>
          <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {formatMoney(summaryTotals.cashBalance)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Available operational liquidity</p>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl">
        <button
          onClick={() => setActiveTab('budget_vs_actuals')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'budget_vs_actuals'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>1. Budget vs. Actuals &amp; Categories</span>
        </button>
        <button
          onClick={() => setActiveTab('expenses_ledger')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'expenses_ledger'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>2. Recorded Expense Vouchers &amp; Receipts ({accessibleExpenses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('fund_inflows')}
          className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'fund_inflows'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>3. Donor Fund Inflows &amp; Tranches ({accessibleFundInflows.length})</span>
        </button>
      </div>

      {/* TAB 1: Budget vs Actuals & Cost Categories */}
      {activeTab === 'budget_vs_actuals' && (
        <div className="space-y-6">
          {/* Project Selector for Budget */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-700">Select Project Portfolio:</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
              >
                <option value="all">All Accessible Projects (Consolidated)</option>
                {accessibleProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.shortTitle}
                  </option>
                ))}
              </select>
            </div>

            {selectedProjectId !== 'all' && currentProjectForBudget && hasPermission('financials:edit_budget') && (
              <button
                onClick={() => onOpenBudgetLineModal(currentProjectForBudget.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Budget Line Item</span>
              </button>
            )}
          </div>

          {/* Cost Categories Summary (Personnel, Travel, Supplies, Workshops, M&E, Overheads) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Expenditure Breakdown by Standard NGO Cost Category
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Monitoring budget utilization, remaining variances, and potential cost overruns by category
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAnalysis.map((cat) => (
                <div key={cat.category} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-slate-900">{cat.category}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                        cat.isOverBudget
                          ? 'bg-rose-100 text-rose-800'
                          : cat.burnRate > 80
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {formatPercent(cat.burnRate)}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        cat.isOverBudget ? 'bg-rose-600' : cat.burnRate > 80 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, cat.burnRate)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-500">Allocated:</span>
                      <p className="font-mono font-semibold text-slate-800">{formatMoney(cat.allocated)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Expended:</span>
                      <p className="font-mono font-semibold text-emerald-800">{formatMoney(cat.spent)}</p>
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200 flex justify-between text-[10px] text-slate-500">
                    <span>Variance / Balance:</span>
                    <span className="font-mono font-semibold text-slate-700">{formatMoney(cat.remaining)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Budget Line Items Table */}
          {currentProjectForBudget && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Detailed Budget Lines: {currentProjectForBudget.shortTitle}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Grant: {currentProjectForBudget.grantAgreementCode} · Donor: {currentProjectForBudget.donorName}
                  </p>
                </div>
                <button
                  onClick={handleExportBudgetReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export Budget Report</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50">
                      <th className="py-2.5 px-3">Line Code</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Cost Description</th>
                      <th className="py-2.5 px-3 text-right">Unit Qty</th>
                      <th className="py-2.5 px-3 text-right">Allocated</th>
                      <th className="py-2.5 px-3 text-right">Spent to Date</th>
                      <th className="py-2.5 px-3 text-right">Variance</th>
                      <th className="py-2.5 px-3 w-28 text-center">Utilization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {currentProjectForBudget.budgetLines.map((bl) => {
                      const variance = bl.totalAllocatedUSD - bl.spentUSD;
                      const burn = bl.totalAllocatedUSD > 0 ? (bl.spentUSD / bl.totalAllocatedUSD) * 100 : 0;
                      return (
                        <tr key={bl.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{bl.code}</td>
                          <td className="py-2.5 px-3 text-slate-600">{bl.category}</td>
                          <td className="py-2.5 px-3 text-slate-900 font-medium max-w-xs">{bl.description}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                            {bl.quantity} {bl.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900 font-semibold">
                            {formatMoney(bl.totalAllocatedUSD)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-800 font-semibold">
                            {formatMoney(bl.spentUSD)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                            {formatMoney(variance)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                                burn > 90
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {formatPercent(burn)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Recorded Expense Vouchers & Receipts */}
      {activeTab === 'expenses_ledger' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Payment Vouchers &amp; Field Receipt Records
              </h3>
              <p className="text-xs text-slate-500">
                Audited payment vouchers, supporting invoices, and receipts recorded against project budget codes
              </p>
            </div>

            {hasPermission('financials:create_voucher') && (
              <button
                onClick={onOpenExpenseModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record New Expense</span>
              </button>
            )}
          </div>

          {/* Table */}
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
                  <th className="py-2.5 px-3 text-center">Receipt &amp; Doc</th>
                  <th className="py-2.5 px-3 text-center">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{exp.voucherNumber}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{formatDate(exp.date)}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-800">{exp.projectCode}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{exp.budgetLineCode}</div>
                    </td>
                    <td className="py-2.5 px-3 max-w-sm">
                      <div className="font-semibold text-slate-900">{exp.payee}</div>
                      <div className="text-[11px] text-slate-600 line-clamp-1">{exp.description}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {formatUSD(exp.amountUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500 text-[11px]">
                      {formatSLSH(exp.amountUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {exp.receiptFileName ? (
                        <button
                          onClick={() => setSelectedReceiptPreview(exp)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors text-[10px] font-medium"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span>{exp.receiptReference}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">{exp.receiptReference}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
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

      {/* TAB 3: Donor Fund Inflows & Tranches */}
      {activeTab === 'fund_inflows' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Donor Grant Disbursements &amp; Fund Inflow Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Grant tranches transferred from institutional donors and allocated to specific project bank accounts
              </p>
            </div>

            {hasPermission('financials:approve') && (
              <button
                onClick={onOpenInflowModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record New Inflow</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Tranche Title</th>
                  <th className="py-2.5 px-3">Donor Partner</th>
                  <th className="py-2.5 px-3">Allocated Project</th>
                  <th className="py-2.5 px-3">Disbursement Date</th>
                  <th className="py-2.5 px-3 text-right">Amount (USD)</th>
                  <th className="py-2.5 px-3">Bank Reference</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accessibleFundInflows.map((inf) => (
                  <tr key={inf.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{inf.title}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{inf.donorName}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-emerald-800 font-semibold">{inf.projectCode}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{formatDate(inf.disbursementDate)}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                      {formatMoney(inf.amountUSD)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{inf.bankReference}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                        {inf.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {selectedReceiptPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Verified Supporting Document</h3>
              </div>
              <button
                onClick={() => setSelectedReceiptPreview(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Voucher Ref:</span>
                  <strong className="font-mono text-slate-800">{selectedReceiptPreview.voucherNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payee:</span>
                  <span className="font-medium text-slate-800">{selectedReceiptPreview.payee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <strong className="font-mono text-emerald-800">{formatUSD(selectedReceiptPreview.amountUSD)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Approved By:</span>
                  <span className="text-slate-700">{selectedReceiptPreview.approvedBy}</span>
                </div>
              </div>

              <div className="p-4 border border-dashed border-slate-300 rounded-lg text-center bg-slate-50">
                <FileText className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
                <p className="font-medium text-slate-800 text-xs">{selectedReceiptPreview.receiptFileName}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Size: {selectedReceiptPreview.receiptFileSize || '850 KB'} · Attached &amp; Digitally Verified for Audit
                </p>
                <div className="mt-3">
                  <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 font-semibold text-[10px] rounded-full">
                    Audited Supporting Document Attached
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedReceiptPreview(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
