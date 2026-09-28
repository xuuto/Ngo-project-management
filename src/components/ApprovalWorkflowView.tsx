import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  DollarSign,
  ShieldCheck,
  User,
  Calendar,
  Building,
  Plus,
  Filter,
  Search,
  Check,
  X,
  Sparkles,
  Lock,
  ArrowRight,
  Receipt
} from 'lucide-react';
import {
  ExpenseApprovalItem,
  BudgetModificationRequest,
  ApprovalStatus,
  getStoredExpenseApprovals,
  saveStoredExpenseApprovals,
  getStoredBudgetModifications,
  saveStoredBudgetModifications
} from '../services/approvalService';
import { Project, BudgetLineItem } from '../types/ngo';
import { formatUSD, formatDate } from '../utils/formatters';
import { logAuditEvent } from '../services/auditService';

interface ApprovalWorkflowViewProps {
  projects: Project[];
  currentUser: { name: string; role: string; id: string };
  currencyMode: 'USD' | 'SLSH';
}

export const ApprovalWorkflowView: React.FC<ApprovalWorkflowViewProps> = ({
  projects,
  currentUser,
  currencyMode
}) => {
  const [expenseApprovals, setExpenseApprovals] = useState<ExpenseApprovalItem[]>(() =>
    getStoredExpenseApprovals()
  );
  const [budgetMods, setBudgetMods] = useState<BudgetModificationRequest[]>(() =>
    getStoredBudgetModifications()
  );

  const [activeTab, setActiveTab] = useState<'expenses' | 'budget_mods'>('expenses');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New Budget Modification Request Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [selectedBudgetLineId, setSelectedBudgetLineId] = useState<string>('');
  const [newAllocatedUSD, setNewAllocatedUSD] = useState<number>(0);
  const [justification, setJustification] = useState<string>('');

  // Rejection Reason Modal State
  const [rejectItem, setRejectItem] = useState<{
    id: string;
    type: 'expense' | 'budget_mod';
    title: string;
  } | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState<string>('');

  const isProjectManager = currentUser.role === 'Project Manager' || currentUser.role === 'Super Admin';
  const isFinanceOfficer = currentUser.role === 'Finance Officer' || currentUser.role === 'Super Admin' || currentUser.role === 'Project Manager';

  const currentProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0] || null;
  }, [projects, selectedProjectId]);

  const currentBudgetLines = useMemo(() => {
    return currentProject?.budgetLines || [];
  }, [currentProject]);

  // Handlers for Expense Approval Sign-offs
  const handleSignOffExpense = (item: ExpenseApprovalItem, roleType: 'pm' | 'finance') => {
    const updated = expenseApprovals.map((app) => {
      if (app.id !== item.id) return app;

      const signOffName = `${currentUser.name} (${currentUser.role})`;
      const now = new Date().toISOString().split('T')[0];

      let newPmStatus = app.pmStatus;
      let newPmBy = app.pmSignOffBy;
      let newPmDate = app.pmSignOffDate;

      let newFinStatus = app.financeStatus;
      let newFinBy = app.financeSignOffBy;
      let newFinDate = app.financeSignOffDate;

      if (roleType === 'pm') {
        newPmStatus = 'Approved';
        newPmBy = signOffName;
        newPmDate = now;
      } else if (roleType === 'finance') {
        newFinStatus = 'Approved';
        newFinBy = signOffName;
        newFinDate = now;
      }

      // Determine overall status
      let overall: ApprovalStatus = 'Pending PM';
      if (newPmStatus === 'Approved' && newFinStatus === 'Approved') {
        overall = 'Approved';
      } else if (newPmStatus === 'Approved' && newFinStatus === 'Pending') {
        overall = 'Pending Finance';
      } else if (newPmStatus === 'Pending') {
        overall = 'Pending PM';
      }

      return {
        ...app,
        pmStatus: newPmStatus,
        pmSignOffBy: newPmBy,
        pmSignOffDate: newPmDate,
        financeStatus: newFinStatus,
        financeSignOffBy: newFinBy,
        financeSignOffDate: newFinDate,
        overallStatus: overall
      };
    });

    setExpenseApprovals(updated);
    saveStoredExpenseApprovals(updated);

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'VERIFY',
      category: 'Financial',
      entityId: item.id,
      entityName: item.vendor,
      details: `Signed off expense voucher (${roleType.toUpperCase()} sign-off) for ${formatUSD(item.amountUSD)}.`
    });
  };

  // Handlers for Budget Mod Sign-offs
  const handleSignOffBudgetMod = (item: BudgetModificationRequest, roleType: 'pm' | 'finance') => {
    const updated = budgetMods.map((bm) => {
      if (bm.id !== item.id) return bm;

      const signOffName = `${currentUser.name} (${currentUser.role})`;
      const now = new Date().toISOString().split('T')[0];

      let newPmStatus = bm.pmStatus;
      let newPmBy = bm.pmSignOffBy;
      let newPmDate = bm.pmSignOffDate;

      let newFinStatus = bm.financeStatus;
      let newFinBy = bm.financeSignOffBy;
      let newFinDate = bm.financeSignOffDate;

      if (roleType === 'pm') {
        newPmStatus = 'Approved';
        newPmBy = signOffName;
        newPmDate = now;
      } else if (roleType === 'finance') {
        newFinStatus = 'Approved';
        newFinBy = signOffName;
        newFinDate = now;
      }

      let overall: ApprovalStatus = 'Pending PM';
      if (newPmStatus === 'Approved' && newFinStatus === 'Approved') {
        overall = 'Approved';
      } else if (newPmStatus === 'Approved' && newFinStatus === 'Pending') {
        overall = 'Pending Finance';
      } else if (newPmStatus === 'Pending') {
        overall = 'Pending PM';
      }

      return {
        ...bm,
        pmStatus: newPmStatus,
        pmSignOffBy: newPmBy,
        pmSignOffDate: newPmDate,
        financeStatus: newFinStatus,
        financeSignOffBy: newFinBy,
        financeSignOffDate: newFinDate,
        overallStatus: overall
      };
    });

    setBudgetMods(updated);
    saveStoredBudgetModifications(updated);

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'VERIFY',
      category: 'Financial',
      entityId: item.id,
      entityName: item.budgetLineCode,
      details: `Signed off budget modification (${roleType.toUpperCase()} sign-off) for line ${item.budgetLineCode}.`
    });
  };

  const handleCreateBudgetMod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;

    const line = currentBudgetLines.find((l) => l.id === selectedBudgetLineId);
    if (!line) return;

    const newReq: BudgetModificationRequest = {
      id: `BM-REQ-${Math.floor(100 + Math.random() * 900)}`,
      projectId: currentProject.id,
      projectCode: currentProject.code,
      projectTitle: currentProject.title,
      budgetLineId: line.id,
      budgetLineCode: line.code,
      budgetLineDescription: line.description,
      requestedBy: `${currentUser.name} (${currentUser.role})`,
      requestedDate: new Date().toISOString().split('T')[0],
      previousAllocatedUSD: line.totalAllocatedUSD,
      newAllocatedUSD,
      justification,
      pmStatus: 'Pending',
      financeStatus: 'Pending',
      overallStatus: 'Pending PM'
    };

    const updated = [newReq, ...budgetMods];
    setBudgetMods(updated);
    saveStoredBudgetModifications(updated);

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'CREATE',
      category: 'Financial',
      entityId: newReq.id,
      entityName: line.code,
      details: `Requested budget reallocation for ${line.code} from ${formatUSD(line.totalAllocatedUSD)} to ${formatUSD(newAllocatedUSD)}.`
    });

    setIsModalOpen(false);
    setJustification('');
  };

  const handleRejectSubmission = () => {
    if (!rejectItem || !rejectionReasonText.trim()) return;

    if (rejectItem.type === 'expense') {
      const updated = expenseApprovals.map((app) => {
        if (app.id !== rejectItem.id) return app;
        return {
          ...app,
          pmStatus: 'Rejected' as 'Pending' | 'Approved' | 'Rejected',
          financeStatus: 'Rejected' as 'Pending' | 'Approved' | 'Rejected',
          overallStatus: 'Rejected' as ApprovalStatus,
          rejectionReason: rejectionReasonText.trim()
        };
      });
      setExpenseApprovals(updated);
      saveStoredExpenseApprovals(updated);
    } else {
      const updated = budgetMods.map((bm) => {
        if (bm.id !== rejectItem.id) return bm;
        return {
          ...bm,
          pmStatus: 'Rejected' as 'Pending' | 'Approved' | 'Rejected',
          financeStatus: 'Rejected' as 'Pending' | 'Approved' | 'Rejected',
          overallStatus: 'Rejected' as ApprovalStatus,
          rejectionReason: rejectionReasonText.trim()
        };
      });
      setBudgetMods(updated);
      saveStoredBudgetModifications(updated);
    }

    setRejectItem(null);
    setRejectionReasonText('');
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Pending Finance':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Pending PM':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenseApprovals.filter((item) => {
      if (statusFilter !== 'all' && item.overallStatus !== statusFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesVendor = item.vendor.toLowerCase().includes(q);
        const matchesProj = item.projectTitle.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesVendor && !matchesProj && !matchesDesc) return false;
      }
      return true;
    });
  }, [expenseApprovals, statusFilter, searchQuery]);

  const filteredBudgetMods = useMemo(() => {
    return budgetMods.filter((item) => {
      if (statusFilter !== 'all' && item.overallStatus !== statusFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesCode = item.budgetLineCode.toLowerCase().includes(q);
        const matchesProj = item.projectTitle.toLowerCase().includes(q);
        const matchesJust = item.justification.toLowerCase().includes(q);
        if (!matchesCode && !matchesProj && !matchesJust) return false;
      }
      return true;
    });
  }, [budgetMods, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="w-4 h-4" />
              <span>Institutional Financial Controls &amp; Dual-Sign-Off Workflow</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Multi-Step Expense &amp; Budget Modification Approvals
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Strict governance workflow requiring digital sign-offs from both the Project Manager and Finance Lead before vouchers or budget reallocations achieve official 'Approved' status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Request Budget Modification</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'expenses'
                ? 'border-emerald-700 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Expense Vouchers Approvals ({expenseApprovals.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('budget_mods')}
            className={`py-2.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'budget_mods'
                ? 'border-emerald-700 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Budget Modification Requests ({budgetMods.length})</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[240px] max-w-sm flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by vendor, project, justification..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Approval Statuses</option>
              <option value="Pending PM">Pending PM</option>
              <option value="Pending Finance">Pending Finance</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Current Persona: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.role})
        </div>
      </div>

      {/* TAB 1: EXPENSE APPROVALS */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {filteredExpenses.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No expense vouchers match your filter criteria.</p>
            </div>
          ) : (
            filteredExpenses.map((item) => {
              const statusBadge = getStatusBadge(item.overallStatus);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 font-mono font-bold text-xs text-emerald-800 rounded">
                          {item.projectCode}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${statusBadge}`}>
                          {item.overallStatus}
                        </span>
                        <span className="text-xs font-mono text-slate-400">ID: {item.id}</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-1">{item.vendor}</h3>
                      <p className="text-xs text-slate-600">{item.description}</p>
                    </div>

                    <div className="text-left md:text-right shrink-0">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Voucher Amount</p>
                      <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">{formatUSD(item.amountUSD)}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Category: {item.category}</p>
                    </div>
                  </div>

                  {/* Multi-Step Sign-Off Status Track */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                    {/* PM Sign-Off Box */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Step 1: Project Manager Sign-Off
                        </span>
                        {item.pmStatus === 'Approved' ? (
                          <div className="mt-1">
                            <p className="font-bold text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Signed off by {item.pmSignOffBy}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">Date: {item.pmSignOffDate}</p>
                          </div>
                        ) : (
                          <p className="font-semibold text-amber-700 flex items-center gap-1 mt-1">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>Pending Project Manager Review</span>
                          </p>
                        )}
                      </div>

                      {item.pmStatus !== 'Approved' && item.overallStatus !== 'Rejected' && (
                        <button
                          onClick={() => handleSignOffExpense(item, 'pm')}
                          disabled={!isProjectManager}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                          title={!isProjectManager ? 'Requires Project Manager role' : 'Sign off as Project Manager'}
                        >
                          Sign Off (PM)
                        </button>
                      )}
                    </div>

                    {/* Finance Officer Sign-Off Box */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Step 2: Finance Officer Sign-Off
                        </span>
                        {item.financeStatus === 'Approved' ? (
                          <div className="mt-1">
                            <p className="font-bold text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Signed off by {item.financeSignOffBy}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">Date: {item.financeSignOffDate}</p>
                          </div>
                        ) : (
                          <p className="font-semibold text-amber-700 flex items-center gap-1 mt-1">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>{item.pmStatus === 'Approved' ? 'Pending Finance Officer Review' : 'Waiting for PM Sign-Off First'}</span>
                          </p>
                        )}
                      </div>

                      {item.financeStatus !== 'Approved' && item.overallStatus !== 'Rejected' && (
                        <button
                          onClick={() => handleSignOffExpense(item, 'finance')}
                          disabled={!isFinanceOfficer || item.pmStatus !== 'Approved'}
                          className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                          title={!isFinanceOfficer ? 'Requires Finance Officer role' : item.pmStatus !== 'Approved' ? 'PM sign-off required first' : 'Sign off as Finance Officer'}
                        >
                          Sign Off (Finance)
                        </button>
                      )}
                    </div>
                  </div>

                  {item.overallStatus !== 'Approved' && item.overallStatus !== 'Rejected' && (isProjectManager || isFinanceOfficer) && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setRejectItem({ id: item.id, type: 'expense', title: item.vendor })}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Reject Voucher
                      </button>
                    </div>
                  )}

                  {item.rejectionReason && (
                    <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-900 space-y-0.5">
                      <strong className="font-bold">Rejection Notice:</strong> {item.rejectionReason}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: BUDGET MODIFICATIONS */}
      {activeTab === 'budget_mods' && (
        <div className="space-y-4">
          {filteredBudgetMods.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-2">
              <DollarSign className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No budget modification requests match your criteria.</p>
            </div>
          ) : (
            filteredBudgetMods.map((item) => {
              const statusBadge = getStatusBadge(item.overallStatus);
              const delta = item.newAllocatedUSD - item.previousAllocatedUSD;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 font-mono font-bold text-xs text-emerald-800 rounded">
                          {item.projectCode}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${statusBadge}`}>
                          {item.overallStatus}
                        </span>
                        <span className="text-xs font-mono text-slate-400">Line: {item.budgetLineCode}</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-1">{item.budgetLineDescription}</h3>
                      <p className="text-xs text-slate-600">
                        <strong className="text-slate-800">Justification:</strong> {item.justification}
                      </p>
                    </div>

                    <div className="text-left md:text-right shrink-0 font-mono">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Allocation Reallocation</p>
                      <p className="text-sm font-bold text-slate-600 mt-0.5">
                        Previous: {formatUSD(item.previousAllocatedUSD)}
                      </p>
                      <p className="text-base font-bold text-emerald-800">
                        New: {formatUSD(item.newAllocatedUSD)} ({delta >= 0 ? `+${formatUSD(delta)}` : formatUSD(delta)})
                      </p>
                    </div>
                  </div>

                  {/* Multi-Step Sign-Off Status Track */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                    {/* PM Sign-Off Box */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Step 1: Project Manager Sign-Off
                        </span>
                        {item.pmStatus === 'Approved' ? (
                          <div className="mt-1">
                            <p className="font-bold text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Signed off by {item.pmSignOffBy}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">Date: {item.pmSignOffDate}</p>
                          </div>
                        ) : (
                          <p className="font-semibold text-amber-700 flex items-center gap-1 mt-1">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>Pending Project Manager Review</span>
                          </p>
                        )}
                      </div>

                      {item.pmStatus !== 'Approved' && item.overallStatus !== 'Rejected' && (
                        <button
                          onClick={() => handleSignOffBudgetMod(item, 'pm')}
                          disabled={!isProjectManager}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                        >
                          Sign Off (PM)
                        </button>
                      )}
                    </div>

                    {/* Finance Officer Sign-Off Box */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Step 2: Finance Officer Sign-Off
                        </span>
                        {item.financeStatus === 'Approved' ? (
                          <div className="mt-1">
                            <p className="font-bold text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Signed off by {item.financeSignOffBy}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">Date: {item.financeSignOffDate}</p>
                          </div>
                        ) : (
                          <p className="font-semibold text-amber-700 flex items-center gap-1 mt-1">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>{item.pmStatus === 'Approved' ? 'Pending Finance Officer Review' : 'Waiting for PM Sign-Off First'}</span>
                          </p>
                        )}
                      </div>

                      {item.financeStatus !== 'Approved' && item.overallStatus !== 'Rejected' && (
                        <button
                          onClick={() => handleSignOffBudgetMod(item, 'finance')}
                          disabled={!isFinanceOfficer || item.pmStatus !== 'Approved'}
                          className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                        >
                          Sign Off (Finance)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* REQUEST BUDGET MODIFICATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Request Budget Modification &amp; Reallocation
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBudgetMod} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Select Budget Line Item</label>
                <select
                  value={selectedBudgetLineId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedBudgetLineId(id);
                    const line = currentBudgetLines.find((l) => l.id === id);
                    if (line) setNewAllocatedUSD(line.totalAllocatedUSD);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Choose budget line --</option>
                  {currentBudgetLines.map((line) => (
                    <option key={line.id} value={line.id}>
                      {line.code} ({line.category}) — Current: {formatUSD(line.totalAllocatedUSD)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">New Proposed Allocation (USD)</label>
                <input
                  type="number"
                  required
                  value={newAllocatedUSD}
                  onChange={(e) => setNewAllocatedUSD(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Management Justification &amp; Donor Impact *</label>
                <textarea
                  required
                  rows={3}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Provide detailed justification for the budget reallocation..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Submit for Dual Sign-Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-rose-700 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Reject Submission: {rejectItem.title}
              </h3>
              <button
                onClick={() => setRejectItem(null)}
                className="p-1 text-slate-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-600">
                Please provide the mandatory rejection reason or compliance correction notes for this submission.
              </p>
              <textarea
                required
                rows={3}
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                placeholder="Enter rejection notes..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500 font-medium"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setRejectItem(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmission}
                  className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-semibold rounded-lg shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
