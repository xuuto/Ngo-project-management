import React, { useState } from 'react';
import { X, Wallet, RefreshCw, AlertCircle, Building, CheckCircle2 } from 'lucide-react';
import { FieldImprestAccount } from '../../../types/finance';
import { formatUSD, formatSLSH } from '../../../utils/formatters';

interface ImprestModalProps {
  isOpen: boolean;
  onClose: () => void;
  imprestAccounts: FieldImprestAccount[];
  onReplenishImprest: (accountId: string, amountUSD: number, vouchersCount: number) => void;
  onAddImprestAccount?: (account: Omit<FieldImprestAccount, 'id'>) => void;
}

export const ImprestModal: React.FC<ImprestModalProps> = ({
  isOpen,
  onClose,
  imprestAccounts,
  onReplenishImprest,
  onAddImprestAccount
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>(imprestAccounts[0]?.id || '');
  const [replenishmentAmountUSD, setReplenishmentAmountUSD] = useState<string>('1200');
  const [vouchersCount, setVouchersCount] = useState<number>(8);
  const [liquidationSummary, setLiquidationSummary] = useState<string>(
    'Field fuel chits, community mobilization tea/snacks, and local water transport in Togdheer pastoral clusters.'
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAccount = imprestAccounts.find((a) => a.id === selectedAccountId) || imprestAccounts[0];
  const parsedAmount = parseFloat(replenishmentAmountUSD) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAccount) {
      setError('Please select a field imprest account.');
      return;
    }
    if (parsedAmount <= 0) {
      setError('Replenishment amount must be greater than zero.');
      return;
    }

    onReplenishImprest(currentAccount.id, parsedAmount, vouchersCount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Field Office Petty Cash Liquidation &amp; Float Top-Up</h2>
              <p className="text-xs text-slate-400">PENHA Decentralized Sub-Offices (Burao, Berbera, Borama, Sool)</p>
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Field Sub-Office Account <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            >
              {imprestAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.subOfficeName} — Custodian: {acc.custodianName}
                </option>
              ))}
            </select>
          </div>

          {currentAccount && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Float Ceiling</span>
                <span className="font-bold text-slate-800">{formatUSD(currentAccount.floatCeilingUSD)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Cash On Hand</span>
                <span className="font-bold text-emerald-700">{formatUSD(currentAccount.currentCashOnHandUSD)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Unliquidated Vouchers</span>
                <span className="font-bold text-amber-700">{formatUSD(currentAccount.unreconciledVouchersUSD)}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Replenishment Amount (USD) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={replenishmentAmountUSD}
                onChange={(e) => setReplenishmentAmountUSD(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-semibold focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                SLSH: {formatSLSH(parsedAmount)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supporting Vouchers Count <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={vouchersCount}
                onChange={(e) => setVouchersCount(parseInt(e.target.value) || 1)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Expense Summary &amp; Verification Note
            </label>
            <textarea
              rows={2}
              value={liquidationSummary}
              onChange={(e) => setLiquidationSummary(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            />
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-950">Comptroller Audit Check</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Approving this replenishment tops up the sub-office cash float back to ceiling and archives the reconciled physical receipts in Hargeisa audit archives.
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
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Approve &amp; Wire Float Replenishment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
