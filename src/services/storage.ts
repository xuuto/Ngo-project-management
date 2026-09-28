import { Project, Donor, ExpenseRecord, FundInflow, DonorReport, Activity, Indicator, FieldEvidence, BudgetLineItem } from '../types/ngo';
import { Beneficiary, DisbursementRecord } from '../types/beneficiary';
import { BankAccount, FinancialCommitment, ProcurementOrder, FieldImprestAccount } from '../types/finance';
import { INITIAL_PROJECTS, INITIAL_DONORS, INITIAL_EXPENSES, INITIAL_FUND_INFLOWS } from '../data/mockData';
import { INITIAL_BENEFICIARIES, INITIAL_DISBURSEMENTS } from '../data/mockBeneficiaries';
import { INITIAL_BANK_ACCOUNTS, INITIAL_COMMITMENTS, INITIAL_PROCUREMENT_ORDERS, INITIAL_IMPREST_ACCOUNTS } from '../data/mockFinance';

const STORAGE_KEYS = {
  PROJECTS: 'penha_ngo_projects_v2',
  DONORS: 'penha_ngo_donors_v2',
  EXPENSES: 'penha_ngo_expenses_v2',
  INFLOWS: 'penha_ngo_inflows_v2',
  REPORTS: 'penha_ngo_reports_v2',
  BENEFICIARIES: 'penha_ngo_beneficiaries_v2',
  DISBURSEMENTS: 'penha_ngo_disbursements_v2',
  BANK_ACCOUNTS: 'penha_ngo_bank_accounts_v2',
  COMMITMENTS: 'penha_ngo_commitments_v2',
  PROCUREMENT: 'penha_ngo_procurement_v2',
  IMPREST: 'penha_ngo_imprest_v2',
  CURRENCY: 'penha_ngo_preferred_currency'
};

export const getStoredProjects = (): Project[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading projects from storage:', e);
    return INITIAL_PROJECTS;
  }
};

export const saveStoredProjects = (projects: Project[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Error saving projects to storage:', e);
  }
};

export const getStoredDonors = (): Donor[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DONORS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DONORS, JSON.stringify(INITIAL_DONORS));
      return INITIAL_DONORS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading donors:', e);
    return INITIAL_DONORS;
  }
};

export const saveStoredDonors = (donors: Donor[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DONORS, JSON.stringify(donors));
  } catch (e) {
    console.error('Error saving donors:', e);
  }
};

export const getStoredExpenses = (): ExpenseRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading expenses:', e);
    return INITIAL_EXPENSES;
  }
};

export const saveStoredExpenses = (expenses: ExpenseRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses:', e);
  }
};

export const getStoredFundInflows = (): FundInflow[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INFLOWS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INFLOWS, JSON.stringify(INITIAL_FUND_INFLOWS));
      return INITIAL_FUND_INFLOWS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading fund inflows:', e);
    return INITIAL_FUND_INFLOWS;
  }
};

export const saveStoredFundInflows = (inflows: FundInflow[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.INFLOWS, JSON.stringify(inflows));
  } catch (e) {
    console.error('Error saving fund inflows:', e);
  }
};

export const getStoredReports = (): DonorReport[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!raw) {
      // Seed with initial donor report
      const initialReport: DonorReport = {
        id: 'rep-01',
        reportNumber: 'REP-PENHA-EU-2026-Q2',
        projectId: 'proj-01',
        projectCode: 'PENHA-SOM-2025-EU01',
        projectTitle: 'Horn of Africa Pastoralist Resilience & Rangeland Regeneration Project (HARP)',
        donorId: 'donor-eu',
        donorName: 'European Union (EU)',
        grantAgreementCode: 'EUTF05-HOA-SOM-7721',
        reportingPeriod: 'Q2 2026 (Apr - Jun 2026)',
        submissionDate: '2026-07-15',
        preparedBy: 'Eng. Ismail Jama Farah (Project Lead)',
        approvedBy: 'Dr. Mohamoud Hersi (Country Director)',
        templateType: 'EU Progress Report',
        executiveSummary: 'During this reporting period, the HARP project achieved significant rangeland regeneration milestones across 2,750 hectares in Togdheer and Maroodi Jeex. 18 solarized water points are now fully operational, cutting livestock trekking distances by 65%. 22 Community Rangeland Management Committees are actively enforcing rotational pasture grazing.',
        keyAchievements: [
          '2,750 hectares of degraded rangeland successfully fenced and reseeded with Cenchrus ciliaris',
          '18 pastoral water points retrofitted with solar submersible pumping arrays and telemetry',
          '19,850 direct pastoralists reached, of which 55% are pastoralist women and girls',
          '22 Community Rangeland Management Committees operationalized with 132 women in leadership roles'
        ],
        challengesAndMitigations: [
          'Unseasonal dry spell delayed seed germination in northern Sheikh corridor — mitigated by deploying community water bowsers for moisture retention.',
          'Cross-border livestock movements during dry season — addressed through customary Xeer peace assemblies with neighboring clan elders.'
        ],
        financialOverview: {
          totalBudgetUSD: 1850000,
          expenditureThisPeriodUSD: 245000,
          cumulativeExpenditureUSD: 1340500,
          remainingBalanceUSD: 424500,
          burnRatePercent: 72.46,
          currency: 'USD',
          slshEquivalent: 11394250000
        },
        indicatorSummary: {
          totalIndicators: 3,
          achievedCount: 1,
          onTrackCount: 2,
          delayedCount: 0,
          overallTargetReachPercent: 86.8
        },
        beneficiariesReached: {
          direct: 19850,
          womenPercent: 55.0,
          households: 3310
        }
      };
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([initialReport]));
      return [initialReport];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading reports:', e);
    return [];
  }
};

export const saveStoredReports = (reports: DonorReport[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  } catch (e) {
    console.error('Error saving reports:', e);
  }
};

export const getStoredBeneficiaries = (): Beneficiary[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BENEFICIARIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BENEFICIARIES, JSON.stringify(INITIAL_BENEFICIARIES));
      return INITIAL_BENEFICIARIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading beneficiaries:', e);
    return INITIAL_BENEFICIARIES;
  }
};

export const saveStoredBeneficiaries = (beneficiaries: Beneficiary[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BENEFICIARIES, JSON.stringify(beneficiaries));
  } catch (e) {
    console.error('Error saving beneficiaries:', e);
  }
};

export const getStoredDisbursements = (): DisbursementRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DISBURSEMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DISBURSEMENTS, JSON.stringify(INITIAL_DISBURSEMENTS));
      return INITIAL_DISBURSEMENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading disbursements:', e);
    return INITIAL_DISBURSEMENTS;
  }
};

export const saveStoredDisbursements = (disbursements: DisbursementRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DISBURSEMENTS, JSON.stringify(disbursements));
  } catch (e) {
    console.error('Error saving disbursements:', e);
  }
};

export const getStoredBankAccounts = (): BankAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(INITIAL_BANK_ACCOUNTS));
      return INITIAL_BANK_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading bank accounts:', e);
    return INITIAL_BANK_ACCOUNTS;
  }
};

export const saveStoredBankAccounts = (accounts: BankAccount[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Error saving bank accounts:', e);
  }
};

export const getStoredCommitments = (): FinancialCommitment[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMITMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COMMITMENTS, JSON.stringify(INITIAL_COMMITMENTS));
      return INITIAL_COMMITMENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading commitments:', e);
    return INITIAL_COMMITMENTS;
  }
};

export const saveStoredCommitments = (commitments: FinancialCommitment[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.COMMITMENTS, JSON.stringify(commitments));
  } catch (e) {
    console.error('Error saving commitments:', e);
  }
};

export const getStoredProcurementOrders = (): ProcurementOrder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROCUREMENT);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROCUREMENT, JSON.stringify(INITIAL_PROCUREMENT_ORDERS));
      return INITIAL_PROCUREMENT_ORDERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading procurement orders:', e);
    return INITIAL_PROCUREMENT_ORDERS;
  }
};

export const saveStoredProcurementOrders = (orders: ProcurementOrder[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROCUREMENT, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving procurement orders:', e);
  }
};

export const getStoredImprestAccounts = (): FieldImprestAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IMPREST);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.IMPREST, JSON.stringify(INITIAL_IMPREST_ACCOUNTS));
      return INITIAL_IMPREST_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading imprest accounts:', e);
    return INITIAL_IMPREST_ACCOUNTS;
  }
};

export const saveStoredImprestAccounts = (accounts: FieldImprestAccount[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.IMPREST, JSON.stringify(accounts));
  } catch (e) {
    console.error('Error saving imprest accounts:', e);
  }
};

export const resetAllToDefaults = (): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
    localStorage.setItem(STORAGE_KEYS.DONORS, JSON.stringify(INITIAL_DONORS));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    localStorage.setItem(STORAGE_KEYS.INFLOWS, JSON.stringify(INITIAL_FUND_INFLOWS));
    localStorage.setItem(STORAGE_KEYS.BENEFICIARIES, JSON.stringify(INITIAL_BENEFICIARIES));
    localStorage.setItem(STORAGE_KEYS.DISBURSEMENTS, JSON.stringify(INITIAL_DISBURSEMENTS));
    localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(INITIAL_BANK_ACCOUNTS));
    localStorage.setItem(STORAGE_KEYS.COMMITMENTS, JSON.stringify(INITIAL_COMMITMENTS));
    localStorage.setItem(STORAGE_KEYS.PROCUREMENT, JSON.stringify(INITIAL_PROCUREMENT_ORDERS));
    localStorage.setItem(STORAGE_KEYS.IMPREST, JSON.stringify(INITIAL_IMPREST_ACCOUNTS));
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
  } catch (e) {
    console.error('Error resetting to defaults:', e);
  }
};
