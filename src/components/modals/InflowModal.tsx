import React, { useState } from 'react';
import { X, ArrowDownLeft, Building, DollarSign } from 'lucide-react';
import { Donor, Project, FundInflow } from '../../types/ngo';
import { SOMALILAND_SHILLING_RATE } from '../../data/mockData';

interface InflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  donors: Donor[];
  projects: Project[];
  onSaveInflow: (inflow: Omit<FundInflow, 'id'>) => void;
}

export const InflowModal: React.FC<InflowModalProps> = ({
  isOpen,
  onClose,
  donors,
  projects,
  onSaveInflow
}) => {
  const [donorId, setDonorId] = useState<string>(donors[0]?.id || '');
  const [projectId, setProjectId] = useState<string>(projects[0]?.id || '');
  const [trancheNumber, setTrancheNumber] = useState<number>(1);
  const [title, setTitle] = useState<string>('');
  const [amountUSD, setAmountUSD] = useState<number>(250000);
  const [disbursementDate, setDisbursementDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [bankReference, setBankReference] = useState<string>('');
  const [status, setStatus] = useState<'Received' | 'Scheduled' | 'Delayed'>('Received');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const selectedDonor = donors.find((d) => d.id === donorId) || donors[0];
  const selectedProject = projects.find((p) => p.id === projectId) || projects[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amountUSD <= 0) {
      alert('Please fill in a valid title and inflow amount.');
      return;
    }

    onSaveInflow({
      grantCode: selectedProject.grantAgreementCode,
      donorId: selectedDonor.id,
      donorName: selectedDonor.shortName,
      projectId: selectedProject.id,
      projectCode: selectedProject.code,
      projectTitle: selectedProject.title,
      trancheNumber,
      title,
      amountUSD,
      amountSLSH: amountUSD * SOMALILAND_SHILLING_RATE,
      disbursementDate,
      bankReference: bankReference || `DAHABSHIIL-TR-${Math.floor(10000 + Math.random() * 90000)}`,
      status,
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Record Donor Fund Inflow</h2>
              <p className="text-[11px] text-slate-500">Log incoming grant tranches and allocate to projects</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Donor Selection */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Donor Partner Organization:</label>
            <select
              value={donorId}
              onChange={(e) => setDonorId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:ring-1 focus:ring-emerald-700 focus:outline-hidden"
            >
              {donors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.shortName})
                </option>
              ))}
            </select>
          </div>

          {/* Project Allocation */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Allocate to Project Account:</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:ring-1 focus:ring-emerald-700 focus:outline-hidden"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.shortTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Title and Tranche Number */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Tranche / Inflow Title:</label>
              <input
                type="text"
                required
                placeholder="e.g. EU Grant Mid-Term Tranche 2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tranche #:</label>
              <input
                type="number"
                min="1"
                max="10"
                value={trancheNumber}
                onChange={(e) => setTrancheNumber(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Amount USD and SLSH */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Disbursed Amount (USD $):</label>
              <input
                type="number"
                min="1000"
                step="any"
                required
                value={amountUSD || ''}
                onChange={(e) => setAmountUSD(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:outline-hidden bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">SLSH Conversion Equivalent:</label>
              <div className="p-2 border border-slate-200 rounded-lg bg-slate-100 font-mono text-slate-700 text-xs font-bold truncate">
                {(amountUSD * SOMALILAND_SHILLING_RATE).toLocaleString()} SLSH
              </div>
            </div>
          </div>

          {/* Date, Bank Ref, Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Disbursement Date:</label>
              <input
                type="date"
                required
                value={disbursementDate}
                onChange={(e) => setDisbursementDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Bank Reference #:</label>
              <input
                type="text"
                placeholder="e.g. DAHABSHIIL-TR-EU-98210"
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Conditions / Milestone Verification Notes:</label>
            <textarea
              rows={2}
              placeholder="e.g. Disbursed upon submission and approval of the interim narrative and financial report..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:outline-hidden"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
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
              Record Inflow &amp; Allocate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
