export type ApprovalStatus = 'Pending PM' | 'Pending Finance' | 'Approved' | 'Rejected';

export interface ExpenseApprovalItem {
  id: string;
  expenseId: string;
  projectId: string;
  projectCode: string;
  projectTitle: string;
  vendor: string;
  category: string;
  amountUSD: number;
  date: string;
  description: string;
  submittedBy: string;
  submittedDate: string;
  pmStatus: 'Pending' | 'Approved' | 'Rejected';
  pmSignOffBy?: string;
  pmSignOffDate?: string;
  financeStatus: 'Pending' | 'Approved' | 'Rejected';
  financeSignOffBy?: string;
  financeSignOffDate?: string;
  overallStatus: ApprovalStatus;
  rejectionReason?: string;
}

export interface BudgetModificationRequest {
  id: string;
  projectId: string;
  projectCode: string;
  projectTitle: string;
  budgetLineId: string;
  budgetLineCode: string;
  budgetLineDescription: string;
  requestedBy: string;
  requestedDate: string;
  previousAllocatedUSD: number;
  newAllocatedUSD: number;
  justification: string;
  pmStatus: 'Pending' | 'Approved' | 'Rejected';
  pmSignOffBy?: string;
  pmSignOffDate?: string;
  financeStatus: 'Pending' | 'Approved' | 'Rejected';
  financeSignOffBy?: string;
  financeSignOffDate?: string;
  overallStatus: ApprovalStatus;
  rejectionReason?: string;
}

const EXPENSE_APPROVALS_KEY = 'penha_expense_approvals_v1';
const BUDGET_MODS_KEY = 'penha_budget_modifications_v1';

export const getStoredExpenseApprovals = (): ExpenseApprovalItem[] => {
  try {
    const raw = localStorage.getItem(EXPENSE_APPROVALS_KEY);
    if (!raw) {
      const initial: ExpenseApprovalItem[] = [
        {
          id: 'EXP-APP-101',
          expenseId: 'exp-101',
          projectId: 'proj-1',
          projectCode: 'EU-EUTF',
          projectTitle: 'EU-EUTF Rangeland Rehabilitation',
          vendor: 'Hargeisa Solar & PV Supplies Ltd',
          category: 'Operational Logistics & Transport',
          amountUSD: 18450,
          date: '2026-09-12',
          description: 'Supply of 4 solar submersible pumps and galvanized pipe fittings for Berbera water corridors.',
          submittedBy: 'Ahmed Guleid (Water Engineer)',
          submittedDate: '2026-09-12',
          pmStatus: 'Approved',
          pmSignOffBy: 'Maxamed Muudit (Project Manager)',
          pmSignOffDate: '2026-09-13',
          financeStatus: 'Pending',
          overallStatus: 'Pending Finance'
        },
        {
          id: 'EXP-APP-102',
          expenseId: 'exp-102',
          projectId: 'proj-2',
          projectCode: 'DANIDA',
          projectTitle: 'Danida Pastoralist Women Livelihoods',
          vendor: 'Burao Women Poultry & Feed Cooperative',
          category: 'Community Training & Workshops',
          amountUSD: 9200,
          date: '2026-09-18',
          description: 'Capacity building workshop materials and poultry feed startup kits for 120 pastoral women.',
          submittedBy: 'Fatima Abdi',
          submittedDate: '2026-09-18',
          pmStatus: 'Pending',
          financeStatus: 'Pending',
          overallStatus: 'Pending PM'
        }
      ];
      localStorage.setItem(EXPENSE_APPROVALS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load expense approvals:', err);
    return [];
  }
};

export const saveStoredExpenseApprovals = (items: ExpenseApprovalItem[]) => {
  try {
    localStorage.setItem(EXPENSE_APPROVALS_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save expense approvals:', err);
  }
};

export const getStoredBudgetModifications = (): BudgetModificationRequest[] => {
  try {
    const raw = localStorage.getItem(BUDGET_MODS_KEY);
    if (!raw) {
      const initial: BudgetModificationRequest[] = [
        {
          id: 'BM-REQ-201',
          projectId: 'proj-1',
          projectCode: 'EU-EUTF',
          projectTitle: 'EU-EUTF Rangeland Rehabilitation',
          budgetLineId: 'bl-102',
          budgetLineCode: 'BL-102',
          budgetLineDescription: 'Field 4x4 vehicle rental and fuel across Togdheer & Maroodi Jeex',
          requestedBy: 'Eng. Ismail Jama Farah',
          requestedDate: '2026-09-15',
          previousAllocatedUSD: 90000,
          newAllocatedUSD: 105000,
          justification: 'Severe dry season road degradation required additional 4x4 rental days for remote Gabiley sites.',
          pmStatus: 'Approved',
          pmSignOffBy: 'Maxamed Muudit (Project Manager)',
          pmSignOffDate: '2026-09-16',
          financeStatus: 'Pending',
          overallStatus: 'Pending Finance'
        }
      ];
      localStorage.setItem(BUDGET_MODS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load budget modifications:', err);
    return [];
  }
};

export const saveStoredBudgetModifications = (items: BudgetModificationRequest[]) => {
  try {
    localStorage.setItem(BUDGET_MODS_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save budget modifications:', err);
  }
};
