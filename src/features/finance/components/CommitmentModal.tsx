import React, { useState } from 'react';
import { X, Lock, FileText, DollarSign, Calendar, Building, CheckCircle2 } from 'lucide-react';
import { Project, BudgetCategory } from '../../../types/ngo';
import { FinancialCommitment } from '../../../types/finance';
import { SOMALILAND_SHILLING_RATE } from '../../../data/mockData';
import { formatUSD, formatSLSH } from '../../../utils/formatters';

interface CommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  preselectedProjectId?: string;
  onSaveCommitment: (commitment: Omit<FinancialCommitment, 'id'>) => void;
}

export const CommitmentModal: React.FC<CommitmentModalProps> = ({
  isOpen,
  onClose,
  projects,
  preselectedProjectId,
  onSaveCommitment
}) => {
  const [projectId, setProjectId] = useState<string>(preselectedProjectId || projects[0]?.id || '');
  const [selectedBudgetLineCode, setSelectedBudgetLineCode] = useState<string>('');
  const [supplierName, setSupplierName] = useState<string>('');
  const [contractRef, setContractRef] = useState<string>(`LPO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [committedAmountUSD, setCommittedAmountUSD] = useState<string>('5000');
  const [expectedDisbursementDate, setExpectedDisbursementDate] = useState<string>(
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  );
  const [purpose, setPurpose] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentProject = projects.find((p) => p.id === projectId) || projects[0];
  const budgetLines = currentProject?.budgetLines || [];
  const activeLine = budgetLines.find((bl) => bl.code === selectedBudgetLineCode) || budgetLines[0];

  const parsedAmount = parseFloat(committedAmountUSD) || 0;
  const amountSLSH = parsedAmount * SOMALILAND_SHILLING_RATE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      setError('Please provide the supplier or contractor name.');
      return;
    }
    if (parsedAmount <= 0) {
      setError('Committed amount must be greater than zero.');
      return;
    }
    if (!purpose.trim()) {
      setError('Please provide the commitment purpose / procurement justification.');
      return;
    }

    const commitmentNumber = `ENC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    onSaveCommitment({
      commitmentNumber,
      projectId: currentProject.id,
      projectCode: currentProject.code,
      budgetLineCode: activeLine ? activeLine.code : 'BL-101',
      supplierName: supplierName.trim(),
      contractRef: contractRef.trim(),
      dateCommitted: new Date().toISOString().slice(0, 10),
      expectedDisbursementDate,
      committedAmountUSD: parsedAmount,
      disbursedAmountUSD: 0,
      remainingEncumbranceUSD: parsedAmount,
      status: 'Active Encumbrance',
      purpose: purpose.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create Purchase Encumbrance / Commitment</h2>
              <p className="text-xs text-slate-400">Encumber grant funds prior to contract execution or supplier LPO</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Project & Budget Line Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Project <span className="text-rose-500">*</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  const proj = projects.find((p) => p.id === e.target.value);
                  if (proj && proj.budgetLines.length > 0) {
                    setSelectedBudgetLineCode(proj.budgetLines[0].code);
                  }
                }}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} ({p.donorName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Earmarked Budget Line <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedBudgetLineCode || (budgetLines[0]?.code ?? '')}
                onChange={(e) => setSelectedBudgetLineCode(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              >
                {budgetLines.map((bl) => (
                  <option key={bl.id} value={bl.code}>
                    {bl.code}: {bl.category} ({formatUSD(bl.totalAllocatedUSD - bl.spentUSD)} free)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Supplier & Contract Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supplier / Contractor Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="e.g. Togdheer Drilling Co. Ltd"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contract / LPO Reference <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={contractRef}
                onChange={(e) => setContractRef(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Amount & Expected Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Committed Amount (USD) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-400 font-semibold">$</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={committedAmountUSD}
                  onChange={(e) => setCommittedAmountUSD(e.target.value)}
                  className="w-full text-xs pl-7 pr-3 py-2 border border-slate-200 rounded-lg font-semibold focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                SLSH Equivalent: {formatSLSH(parsedAmount)} (@ 8,500 SLSH)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Liquidation Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={expectedDisbursementDate}
                onChange={(e) => setExpectedDisbursementDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Purpose &amp; Scope of Goods/Services <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Subcontract for hydrogeological survey and casing installation at Oodweyne pastoral site..."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            />
          </div>

          {/* Info callout on 3-Way Matching */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">Strict Fund Reservation</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Saving this commitment encumbers {formatUSD(parsedAmount)} from project {currentProject.code}.
                No other requisition can utilize these funds until the contract is paid or de-committed.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Record Encumbrance</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
