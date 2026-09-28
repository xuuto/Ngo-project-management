import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { BudgetCategory, BudgetLineItem } from '../../types/ngo';

interface BudgetLineModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSaveBudgetLine: (projectId: string, line: Omit<BudgetLineItem, 'id' | 'spentUSD'>) => void;
}

export const BudgetLineModal: React.FC<BudgetLineModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onSaveBudgetLine
}) => {
  const [code, setCode] = useState(`BL-${Math.floor(100 + Math.random() * 800)}`);
  const [category, setCategory] = useState<BudgetCategory>('Direct Program Inputs & Works');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('Lot');
  const [quantity, setQuantity] = useState(1);
  const [unitCostUSD, setUnitCostUSD] = useState(25000);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const totalAllocatedUSD = quantity * unitCostUSD;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || totalAllocatedUSD <= 0) return;

    onSaveBudgetLine(projectId, {
      code,
      category,
      description,
      unit,
      quantity,
      unitCostUSD,
      totalAllocatedUSD,
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-800" />
            <h2 className="text-sm font-bold text-slate-900">Add Detailed Budget Line Item</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Line Code:</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Cost Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BudgetCategory)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-50 font-medium"
              >
                <option value="Personnel & Field Staff">Personnel &amp; Field Staff</option>
                <option value="Operational Logistics & Transport">Operational Logistics &amp; Transport</option>
                <option value="Direct Program Inputs & Works">Direct Program Inputs &amp; Works</option>
                <option value="Community Training & Workshops">Community Training &amp; Workshops</option>
                <option value="Monitoring, Evaluation & Audits">Monitoring, Evaluation &amp; Audits</option>
                <option value="Indirect & Secretariat Overheads">Indirect &amp; Secretariat Overheads</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Item Description &amp; Specification:</label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Solar submersible Grundfos pumps with 4.8kW PV panels for Ainabo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Unit Type:</label>
              <input
                type="text"
                required
                placeholder="Months, Lot, Units"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Quantity:</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Unit Cost (USD):</label>
              <input
                type="number"
                min="1"
                required
                value={unitCostUSD}
                onChange={(e) => setUnitCostUSD(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono bg-white font-bold"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
            <span className="font-semibold text-emerald-950">Total Budget Line Allocation:</span>
            <span className="font-mono font-bold text-emerald-900 text-sm">
              ${totalAllocatedUSD.toLocaleString()} USD
            </span>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Notes / Budget Justification:</label>
            <input
              type="text"
              placeholder="e.g. Allocated under EU Annex III line item 3.1"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900"
            >
              Save Budget Line
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
