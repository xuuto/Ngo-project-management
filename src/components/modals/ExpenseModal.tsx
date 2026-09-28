import React, { useState } from 'react';
import { X, Receipt, Upload, Paperclip, Check } from 'lucide-react';
import { Project, ExpenseRecord, BudgetCategory } from '../../types/ngo';
import { useAuth } from '../../context/AuthContext';
import { SOMALILAND_SHILLING_RATE } from '../../data/mockData';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  preselectedProjectId?: string;
  onSaveExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  projects,
  preselectedProjectId,
  onSaveExpense
}) => {
  const { currentUser, filterAccessibleProjects } = useAuth();
  const accessibleProjects = filterAccessibleProjects(projects);

  const [projectId, setProjectId] = useState<string>(
    preselectedProjectId || accessibleProjects[0]?.id || ''
  );

  const selectedProject = accessibleProjects.find((p) => p.id === projectId) || accessibleProjects[0];

  const [budgetLineCode, setBudgetLineCode] = useState<string>(
    selectedProject?.budgetLines[0]?.code || 'BL-101'
  );
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [payee, setPayee] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [amountUSD, setAmountUSD] = useState<number>(0);
  const [receiptReference, setReceiptReference] = useState<string>('');
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [receiptFileSize, setReceiptFileSize] = useState<string>('');
  const [status, setStatus] = useState<'Approved & Paid' | 'Pending Review'>('Approved & Paid');

  if (!isOpen) return null;

  const currentBudgetLine = selectedProject?.budgetLines.find((bl) => bl.code === budgetLineCode);

  const handleSimulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFileName(file.name);
      const sizeKB = Math.round(file.size / 1024);
      setReceiptFileSize(`${sizeKB} KB`);
      if (!receiptReference) {
        setReceiptReference(`REC-${file.name.slice(0, 8).toUpperCase()}`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payee || amountUSD <= 0) {
      alert('Please provide a valid payee and expenditure amount.');
      return;
    }

    const voucherNumber = `PV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    onSaveExpense({
      voucherNumber,
      projectId: selectedProject.id,
      projectCode: selectedProject.code,
      budgetLineCode,
      budgetLineDescription: currentBudgetLine?.description || 'Project Expenditure',
      category: currentBudgetLine?.category || 'Direct Program Inputs & Works',
      date,
      payee,
      description,
      amountUSD,
      amountSLSH: amountUSD * SOMALILAND_SHILLING_RATE,
      currencyPaid: 'USD',
      approvedBy: currentUser.name,
      receiptReference: receiptReference || `REC-${Math.floor(10000 + Math.random() * 90000)}`,
      receiptFileName: receiptFileName || 'Voucher_Receipt_Attachment.pdf',
      receiptFileSize: receiptFileSize || '650 KB',
      donorCode: selectedProject.grantAgreementCode.split('-')[0] || 'GRANT',
      status
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Record Field Expense Voucher</h2>
              <p className="text-[11px] text-slate-500">Record actual disbursement against project budget lines</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Project Selector */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Target Project:</label>
            <select
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                const proj = accessibleProjects.find((p) => p.id === e.target.value);
                if (proj && proj.budgetLines.length > 0) {
                  setBudgetLineCode(proj.budgetLines[0].code);
                }
              }}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:ring-1 focus:ring-emerald-700 focus:outline-hidden"
            >
              {accessibleProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.shortTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Budget Line Selector */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Charge to Budget Line Item:</label>
            <select
              value={budgetLineCode}
              onChange={(e) => setBudgetLineCode(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:ring-1 focus:ring-emerald-700 focus:outline-hidden"
            >
              {selectedProject?.budgetLines.map((bl) => (
                <option key={bl.id} value={bl.code}>
                  [{bl.code}] {bl.category} — {bl.description.slice(0, 50)}...
                </option>
              ))}
            </select>
            {currentBudgetLine && (
              <p className="text-[11px] text-slate-500 mt-1">
                Allocated: ${currentBudgetLine.totalAllocatedUSD.toLocaleString()} · Remaining Variance: ${(currentBudgetLine.totalAllocatedUSD - currentBudgetLine.spentUSD).toLocaleString()}
              </p>
            )}
          </div>

          {/* Payee and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payee / Supplier / Vendor:</label>
              <input
                type="text"
                required
                placeholder="e.g. Horn Solar Solutions Ltd"
                value={payee}
                onChange={(e) => setPayee(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Voucher Date:</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Description / Purpose of Expense:</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Payment for solar submersible pump installation and water trough piping in Sheikh..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:outline-hidden"
            />
          </div>

          {/* Amount and SLSH Equivalent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Amount (USD $):</label>
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="e.g. 4500"
                value={amountUSD || ''}
                onChange={(e) => setAmountUSD(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:outline-hidden bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Somaliland Shilling (SLSH):</label>
              <div className="p-2 border border-slate-200 rounded-lg bg-slate-100 font-mono text-slate-700 text-xs font-bold">
                {(amountUSD * SOMALILAND_SHILLING_RATE).toLocaleString()} SLSH
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Rate: 1 USD = 8,500 SLSH</span>
            </div>
          </div>

          {/* Receipt / Invoice Upload Section */}
          <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-emerald-800" />
                Upload Receipt / Supporting Document:
              </span>
              <span className="text-[10px] text-emerald-800 font-medium">Audit Mandatory</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Receipt / Invoice Ref # (e.g. INV-9042)"
                value={receiptReference}
                onChange={(e) => setReceiptReference(e.target.value)}
                className="p-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-hidden"
              />
              <label className="flex items-center justify-center gap-1 px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-50 rounded text-xs text-emerald-800 font-semibold cursor-pointer transition-colors">
                <Upload className="w-3 h-3" />
                <span>{receiptFileName ? 'Change File' : 'Choose Receipt File'}</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc"
                  onChange={handleSimulateFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {receiptFileName ? (
              <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded border border-emerald-300 text-slate-700">
                <span className="font-medium truncate max-w-xs">{receiptFileName}</span>
                <span className="text-emerald-700 font-mono font-semibold">{receiptFileSize}</span>
              </div>
            ) : (
              <p className="text-[10px] text-slate-500">
                PDF, JPG or PNG receipts required for external EU/Danida/FCDO donor expenditure verification.
              </p>
            )}
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Signoff: <strong>{currentUser.name}</strong>
            </span>
            <div className="flex items-center gap-2">
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
                Save &amp; Authorize Voucher
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
