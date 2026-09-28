import { BudgetCategory, SomalilandRegion } from './ngo';

export type Currency = 'USD' | 'SLSH' | 'EUR' | 'GBP';

export type ProcurementMethod = 
  | 'Direct Purchase (<$1,000)'
  | '3 Competitive Quotes ($1,000 - $20,000)'
  | 'Formal Open Tender (>$20,000)';

export interface BankAccount {
  id: string;
  bankName: string; // e.g. "Dahabshiil Bank International (Hargeisa Main)"
  accountNumber: string;
  accountType: 'Operating Account' | 'Designated Donor Grant Account' | 'ZAAD Merchant Wallet' | 'Sahal Merchant Wallet';
  currency: Currency;
  currentBalance: number;
  allocatedDonorId?: string;
  allocatedDonorName?: string;
  branch: string;
  signatories: string[];
}

export interface SupplierQuotation {
  supplierName: string;
  quotedAmountUSD: number;
  deliveryDays: number;
  complianceChecked: boolean;
  selected: boolean;
  notes?: string;
}

export interface ProcurementOrder {
  id: string;
  poNumber: string; // e.g. "PO-2026-041"
  projectId: string;
  projectCode: string;
  budgetLineCode: string;
  title: string;
  description: string;
  method: ProcurementMethod;
  estimatedCostUSD: number;
  finalCostUSD: number;
  vendorName: string;
  dateInitiated: string;
  dateApproved?: string;
  status: 'Approved & Committed' | 'Pending 3 Quotes Review' | 'Tender Evaluation' | 'Fulfilled & Invoiced';
  quotations: SupplierQuotation[];
  evaluationSummary: string;
  approvedBy: string;
}

export interface FinancialCommitment {
  id: string;
  commitmentNumber: string; // e.g. "ENC-2026-102"
  projectId: string;
  projectCode: string;
  budgetLineCode: string;
  supplierName: string;
  contractRef: string;
  dateCommitted: string;
  expectedDisbursementDate: string;
  committedAmountUSD: number;
  disbursedAmountUSD: number;
  remainingEncumbranceUSD: number;
  status: 'Active Encumbrance' | 'Partially Disbursed' | 'Fully Disbursed' | 'Liquidated';
  purpose: string;
}

export interface FieldImprestAccount {
  id: string;
  subOfficeName: string; // e.g. "Burao Sub-office (Togdheer)"
  custodianName: string;
  custodianRole: string;
  currency: 'USD' | 'SLSH';
  floatCeilingUSD: number;
  currentCashOnHandUSD: number;
  unreconciledVouchersUSD: number;
  lastReconciliationDate: string;
  status: 'Healthy Liquidity' | 'Replenishment Requested' | 'Float Low';
}

export interface BudgetVarianceAnalysis {
  lineId: string;
  lineCode: string;
  category: BudgetCategory;
  description: string;
  allocatedUSD: number;
  commitmentsUSD: number;
  expendituresUSD: number;
  totalCommittedAndSpentUSD: number;
  availableBalanceUSD: number;
  burnRatePercent: number;
  varianceStatus: 'Normal (<85%)' | 'Approaching Ceiling (85-95%)' | 'Overrun Alert (>100%)' | 'Slow Burn (<40%)';
}
