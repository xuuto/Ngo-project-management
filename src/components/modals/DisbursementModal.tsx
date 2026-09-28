import React, { useState } from 'react';
import { X, Send, Phone, DollarSign, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Beneficiary, DisbursementRecord, AssistanceType } from '../../types/beneficiary';
import { Project } from '../../types/ngo';
import { useAuth } from '../../context/AuthContext';
import { SOMALILAND_SHILLING_RATE } from '../../data/mockData';
import { formatUSD, formatSLSH } from '../../utils/formatters';

interface DisbursementModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiaries: Beneficiary[];
  projects: Project[];
  preselectedBeneficiaryId?: string;
  onSaveDisbursement: (disb: Omit<DisbursementRecord, 'id'>) => void;
}

export const DisbursementModal: React.FC<DisbursementModalProps> = ({
  isOpen,
  onClose,
  beneficiaries,
  projects,
  preselectedBeneficiaryId,
  onSaveDisbursement
}) => {
  const { currentUser } = useAuth();

  const [beneficiaryId, setBeneficiaryId] = useState<string>(
    preselectedBeneficiaryId || beneficiaries[0]?.id || ''
  );

  const selectedBeneficiary = beneficiaries.find((b) => b.id === beneficiaryId) || beneficiaries[0];

  const [assistanceType, setAssistanceType] = useState<AssistanceType>('Cash-for-Work Stipend');
  const [amountUSD, setAmountUSD] = useState<number>(150);
  const [purposeNote, setPurposeNote] = useState<string>(
    '10 days labor contribution to stone check dam gully construction'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [successTxRef, setSuccessTxRef] = useState<string | null>(null);

  if (!isOpen) return null;

  const enrolledProject = selectedBeneficiary?.enrolledProjects[0];
  const matchedProject = projects.find((p) => p.id === enrolledProject?.projectId) || projects[0];

  const handleAssistanceTypeChange = (type: AssistanceType) => {
    setAssistanceType(type);
    if (type === 'Cash-for-Work Stipend') {
      setAmountUSD(150);
      setPurposeNote('10 days labor contribution to communal soil bunding and stone check dams');
    } else if (type === 'Emergency Fodder Voucher') {
      setAmountUSD(120);
      setPurposeNote('Emergency Rhodes grass hay distribution voucher for drought-affected milking herd');
    } else if (type === 'VSLA Micro-Loan Advance') {
      setAmountUSD(200);
      setPurposeNote('VSLA revolving microcredit for women pastoralist petty trade / milk churns');
    } else if (type === 'Camel Milk Daily Intake Payment') {
      setAmountUSD(140);
      setPurposeNote('Fortnightly milk intake payment for hygienic camel milk delivered to chilling hub');
    } else if (type === 'Certified Seed Subsidy') {
      setAmountUSD(90);
      setPurposeNote('Foundation drought-tolerant sorghum and cowpea seed package distribution voucher');
    }
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBeneficiary || amountUSD <= 0) return;

    setIsProcessing(true);

    const prefix = selectedBeneficiary.mobileMoney.provider.includes('ZAAD') ? 'ZAAD' : 'SAHAL';
    const txRef = `${prefix}-TX-${Math.floor(100000 + Math.random() * 900000)}`;

    setTimeout(() => {
      onSaveDisbursement({
        transactionRef: txRef,
        beneficiaryId: selectedBeneficiary.id,
        beneficiaryName: selectedBeneficiary.fullName,
        beneficiaryPhone: selectedBeneficiary.mobileMoney.phoneNumber,
        projectId: matchedProject.id,
        projectCode: matchedProject.code,
        activityCode: 'ACT-1.1.2',
        date: new Date().toISOString().slice(0, 10),
        assistanceType,
        amountUSD,
        amountSLSH: amountUSD * SOMALILAND_SHILLING_RATE,
        provider: selectedBeneficiary.mobileMoney.provider,
        status: 'Completed & Confirmed',
        approvedBy: currentUser.name,
        voucherBatchNo: `BATCH-${prefix}-${new Date().toISOString().slice(0, 7)}-${Math.floor(10 + Math.random() * 90)}`,
        purposeNote
      });

      setIsProcessing(false);
      setSuccessTxRef(txRef);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Disburse Mobile Money Aid</h2>
              <p className="text-[11px] text-slate-500">Instant direct transfer via Telesom ZAAD / Somtel Sahal</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSuccessTxRef(null);
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Confirmation State */}
        {successTxRef ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Mobile Transfer Confirmed!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Disbursed to <strong>{selectedBeneficiary.fullName}</strong> ({selectedBeneficiary.mobileMoney.phoneNumber})
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1 font-mono text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <strong className="text-emerald-800">{successTxRef}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway:</span>
                <span>{selectedBeneficiary.mobileMoney.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Sent:</span>
                <strong className="text-slate-900">{formatUSD(amountUSD)} ({formatSLSH(amountUSD)})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Project Charge:</span>
                <span>{matchedProject.code}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSuccessTxRef(null);
                onClose();
              }}
              className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
            >
              Done &amp; Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleExecuteTransfer} className="p-6 overflow-y-auto space-y-4 text-xs">
            {/* Beneficiary Select */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Select Beneficiary Recipient:</label>
              <select
                value={beneficiaryId}
                onChange={(e) => setBeneficiaryId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
              >
                {beneficiaries.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.fullName} ({b.district} - {b.village}) · {b.mobileMoney.provider}
                  </option>
                ))}
              </select>
            </div>

            {/* Beneficiary Details Card */}
            {selectedBeneficiary && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone &amp; Gateway:</span>
                  <strong className="font-mono text-emerald-800">
                    {selectedBeneficiary.mobileMoney.phoneNumber} ({selectedBeneficiary.mobileMoney.provider})
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vulnerability:</span>
                  <span className="text-slate-700">{selectedBeneficiary.vulnerabilityCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Primary Project:</span>
                  <span className="font-semibold text-slate-800">{matchedProject.shortTitle}</span>
                </div>
              </div>
            )}

            {/* Assistance Type */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Program Assistance Category:</label>
              <select
                value={assistanceType}
                onChange={(e) => handleAssistanceTypeChange(e.target.value as AssistanceType)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium bg-slate-50"
              >
                <option value="Cash-for-Work Stipend">Cash-for-Work Stipend (Soil Bunding / Works)</option>
                <option value="Emergency Fodder Voucher">Emergency Fodder Voucher (Livestock Feed)</option>
                <option value="VSLA Micro-Loan Advance">VSLA Micro-Loan Advance (Women Cooperative)</option>
                <option value="Camel Milk Daily Intake Payment">Camel Milk Daily Intake Payment</option>
                <option value="Certified Seed Subsidy">Certified Seed Subsidy</option>
              </select>
            </div>

            {/* Amount USD and SLSH */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Transfer Amount (USD $):</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  required
                  value={amountUSD}
                  onChange={(e) => setAmountUSD(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">SLSH Equivalent:</label>
                <div className="p-2 border border-slate-200 rounded-lg bg-slate-100 font-mono text-slate-700 text-xs font-bold truncate">
                  {(amountUSD * SOMALILAND_SHILLING_RATE).toLocaleString()} SLSH
                </div>
              </div>
            </div>

            {/* Purpose Note */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Payment Reference / Note:</label>
              <textarea
                rows={2}
                required
                value={purposeNote}
                onChange={(e) => setPurposeNote(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {/* Authorizer Note */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Approving Officer: <strong>{currentUser.name}</strong>
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
                  disabled={isProcessing}
                  className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isProcessing ? 'Processing Transfer...' : 'Authorize & Disburse'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
