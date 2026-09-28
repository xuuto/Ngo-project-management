import React, { useState } from 'react';
import { X, Scale, FileText, CheckCircle2, AlertTriangle, Building, DollarSign } from 'lucide-react';
import { Project } from '../../../types/ngo';
import { ProcurementOrder, ProcurementMethod, SupplierQuotation } from '../../../types/finance';
import { formatUSD } from '../../../utils/formatters';

interface ProcurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  preselectedProjectId?: string;
  onSaveProcurementOrder: (order: Omit<ProcurementOrder, 'id'>) => void;
}

export const ProcurementModal: React.FC<ProcurementModalProps> = ({
  isOpen,
  onClose,
  projects,
  preselectedProjectId,
  onSaveProcurementOrder
}) => {
  const [projectId, setProjectId] = useState<string>(preselectedProjectId || projects[0]?.id || '');
  const [selectedBudgetLineCode, setSelectedBudgetLineCode] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [method, setMethod] = useState<ProcurementMethod>('3 Competitive Quotes ($1,000 - $20,000)');
  const [estimatedCostUSD, setEstimatedCostUSD] = useState<string>('8500');

  // 3 Supplier Quotes
  const [vendor1, setVendor1] = useState<string>('Sahil Technical Supplies');
  const [price1, setPrice1] = useState<string>('8450');
  const [delivery1, setDelivery1] = useState<number>(7);

  const [vendor2, setVendor2] = useState<string>('Hargeisa Solar & Engineering Ltd');
  const [price2, setPrice2] = useState<string>('9200');
  const [delivery2, setDelivery2] = useState<number>(14);

  const [vendor3, setVendor3] = useState<string>('Golis Energy Solutions');
  const [price3, setPrice3] = useState<string>('8800');
  const [delivery3, setDelivery3] = useState<number>(10);

  const [selectedVendorIndex, setSelectedVendorIndex] = useState<number>(0);
  const [evaluationSummary, setEvaluationSummary] = useState<string>(
    'Lowest technically qualified bidder with verified tax clearance and past performance certificate.'
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentProject = projects.find((p) => p.id === projectId) || projects[0];
  const budgetLines = currentProject?.budgetLines || [];
  const activeLine = budgetLines.find((bl) => bl.code === selectedBudgetLineCode) || budgetLines[0];

  const parsedEstCost = parseFloat(estimatedCostUSD) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a procurement order title / description.');
      return;
    }
    if (parsedEstCost <= 0) {
      setError('Estimated cost must be greater than zero.');
      return;
    }

    const quotes: SupplierQuotation[] = [
      {
        supplierName: vendor1 || 'Supplier A',
        quotedAmountUSD: parseFloat(price1) || parsedEstCost,
        deliveryDays: delivery1,
        complianceChecked: true,
        selected: selectedVendorIndex === 0,
        notes: 'Tax compliance & registration verified'
      },
      {
        supplierName: vendor2 || 'Supplier B',
        quotedAmountUSD: parseFloat(price2) || parsedEstCost,
        deliveryDays: delivery2,
        complianceChecked: true,
        selected: selectedVendorIndex === 1,
        notes: 'Registration verified, higher price point'
      },
      {
        supplierName: vendor3 || 'Supplier C',
        quotedAmountUSD: parseFloat(price3) || parsedEstCost,
        deliveryDays: delivery3,
        complianceChecked: true,
        selected: selectedVendorIndex === 2,
        notes: 'Valid commercial license'
      }
    ];

    const selectedQuote = quotes[selectedVendorIndex] || quotes[0];
    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    onSaveProcurementOrder({
      poNumber,
      projectId: currentProject.id,
      projectCode: currentProject.code,
      budgetLineCode: activeLine ? activeLine.code : 'BL-103',
      title: title.trim(),
      description: description.trim() || title.trim(),
      method,
      estimatedCostUSD: parsedEstCost,
      finalCostUSD: selectedQuote.quotedAmountUSD,
      vendorName: selectedQuote.supplierName,
      dateInitiated: new Date().toISOString().slice(0, 10),
      dateApproved: new Date().toISOString().slice(0, 10),
      status: 'Approved & Committed',
      quotations: quotes,
      evaluationSummary: evaluationSummary.trim(),
      approvedBy: 'Procurement Committee & Head of Finance'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">NGO Procurement Order &amp; 3-Quote Evaluation</h2>
              <p className="text-xs text-slate-400">Enforce donor procurement thresholds and competitive supplier vetting</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Project & Budget Line Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Charged <span className="text-rose-500">*</span>
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
                Budget Line Code <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedBudgetLineCode || (budgetLines[0]?.code ?? '')}
                onChange={(e) => setSelectedBudgetLineCode(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              >
                {budgetLines.map((bl) => (
                  <option key={bl.id} value={bl.code}>
                    {bl.code}: {bl.category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title & Procurement Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Requisition Title / Items <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Supply of 50 Metric Tons Livestock Fodder Pellets"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Procurement Method Threshold <span className="text-rose-500">*</span>
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as ProcurementMethod)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              >
                <option value="Direct Purchase (<$1,000)">Direct Purchase (&lt;$1,000)</option>
                <option value="3 Competitive Quotes ($1,000 - $20,000)">3 Competitive Quotes ($1,000 - $20,000)</option>
                <option value="Formal Open Tender (>$20,000)">Formal Open Tender (&gt;$20,000)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estimated Budget (USD) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={estimatedCostUSD}
              onChange={(e) => setEstimatedCostUSD(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            />
          </div>

          {/* 3 Quotations Table / Comparison */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-700" />
                3 Competitive Supplier Quotations Comparison
              </h3>
              <span className="text-[11px] text-slate-500">Select awarded quotation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Quote 1 */}
              <div
                onClick={() => setSelectedVendorIndex(0)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedVendorIndex === 0
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-700">Bidder #1</span>
                  {selectedVendorIndex === 0 && (
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-sm">AWARDED</span>
                  )}
                </div>
                <input
                  type="text"
                  value={vendor1}
                  onChange={(e) => setVendor1(e.target.value)}
                  className="w-full text-xs p-1.5 border border-slate-200 rounded-md mb-2 bg-white"
                  placeholder="Supplier 1 Name"
                />
                <div className="text-xs space-y-1">
                  <label className="text-[10px] text-slate-500">Price (USD):</label>
                  <input
                    type="number"
                    value={price1}
                    onChange={(e) => setPrice1(e.target.value)}
                    className="w-full text-xs p-1 border border-slate-200 rounded-md font-semibold bg-white"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Delivery: {delivery1} days</span>
                    <span className="text-emerald-700 font-semibold">Compliant ✓</span>
                  </div>
                </div>
              </div>

              {/* Quote 2 */}
              <div
                onClick={() => setSelectedVendorIndex(1)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedVendorIndex === 1
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-700">Bidder #2</span>
                  {selectedVendorIndex === 1 && (
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-sm">AWARDED</span>
                  )}
                </div>
                <input
                  type="text"
                  value={vendor2}
                  onChange={(e) => setVendor2(e.target.value)}
                  className="w-full text-xs p-1.5 border border-slate-200 rounded-md mb-2 bg-white"
                  placeholder="Supplier 2 Name"
                />
                <div className="text-xs space-y-1">
                  <label className="text-[10px] text-slate-500">Price (USD):</label>
                  <input
                    type="number"
                    value={price2}
                    onChange={(e) => setPrice2(e.target.value)}
                    className="w-full text-xs p-1 border border-slate-200 rounded-md font-semibold bg-white"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Delivery: {delivery2} days</span>
                    <span className="text-emerald-700 font-semibold">Compliant ✓</span>
                  </div>
                </div>
              </div>

              {/* Quote 3 */}
              <div
                onClick={() => setSelectedVendorIndex(2)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedVendorIndex === 2
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-700">Bidder #3</span>
                  {selectedVendorIndex === 2 && (
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-sm">AWARDED</span>
                  )}
                </div>
                <input
                  type="text"
                  value={vendor3}
                  onChange={(e) => setVendor3(e.target.value)}
                  className="w-full text-xs p-1.5 border border-slate-200 rounded-md mb-2 bg-white"
                  placeholder="Supplier 3 Name"
                />
                <div className="text-xs space-y-1">
                  <label className="text-[10px] text-slate-500">Price (USD):</label>
                  <input
                    type="number"
                    value={price3}
                    onChange={(e) => setPrice3(e.target.value)}
                    className="w-full text-xs p-1 border border-slate-200 rounded-md font-semibold bg-white"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Delivery: {delivery3} days</span>
                    <span className="text-emerald-700 font-semibold">Compliant ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Evaluation Justification */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Procurement Committee Evaluation Minutes &amp; Justification
            </label>
            <textarea
              rows={2}
              value={evaluationSummary}
              onChange={(e) => setEvaluationSummary(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            />
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
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve &amp; Issue Purchase Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
