export type ProjectStatus = 'Planning' | 'Active' | 'Under Review' | 'Completed' | 'Suspended';
export type IndicatorStatus = 'On Track' | 'Delayed' | 'Achieved' | 'Critical Attention';
export type ActivityStatus = 'Not Started' | 'In Progress' | 'Field Verified' | 'Completed' | 'Delayed';
export type SectorPillar = 
  | 'Rangeland & Water Management'
  | 'Pastoralist Women Livelihoods'
  | 'Livestock Health & Fodder Security'
  | 'Climate Resilience & Drought Early Action'
  | 'Natural Dryland Resins & Value Chains'
  | 'Policy Advocacy & Cross-Border Pastoralism';

export type SomalilandRegion = 
  | 'Maroodi Jeex'
  | 'Togdheer'
  | 'Sahil'
  | 'Awdal'
  | 'Sanaag'
  | 'Sool';

export interface Indicator {
  id: string;
  code: string; // e.g. "IND-1.1"
  outputId: string;
  description: string;
  unit: string;
  baseline: number;
  target: number;
  currentActual: number;
  midtermTarget?: number;
  meansOfVerification: string;
  frequency: 'Monthly' | 'Quarterly' | 'Bi-Annual' | 'Annual';
  dataCollectionMethod: string;
  status: IndicatorStatus;
  disaggregationNote?: string;
}

export interface Activity {
  id: string;
  outputId: string;
  code: string; // e.g. "ACT-1.1.2"
  title: string;
  description: string;
  assignedTo: string;
  assignedRole: string;
  location: string;
  region: SomalilandRegion;
  district: string;
  startDate: string;
  endDate: string;
  status: ActivityStatus;
  budgetAllocatedUSD: number;
  budgetSpentUSD: number;
  progressPercent: number;
}

export interface LogframeOutput {
  id: string;
  code: string; // e.g. "OUT-1.1"
  title: string;
  targetCompletionDate: string;
  indicators: Indicator[];
  activities: Activity[];
}

export interface LogframeOutcome {
  id: string;
  code: string; // e.g. "OC-1"
  title: string;
  outputs: LogframeOutput[];
}

export interface Logframe {
  impactGoal: string;
  outcomes: LogframeOutcome[];
}

export type BudgetCategory = 
  | 'Personnel & Field Staff'
  | 'Operational Logistics & Transport'
  | 'Direct Program Inputs & Works'
  | 'Community Training & Workshops'
  | 'Monitoring, Evaluation & Audits'
  | 'Indirect & Secretariat Overheads';

export interface BudgetLineItem {
  id: string;
  code: string; // e.g. "BL-100"
  category: BudgetCategory;
  description: string;
  unit: string;
  quantity: number;
  unitCostUSD: number;
  totalAllocatedUSD: number;
  spentUSD: number;
  notes?: string;
  managementIntervention?: string;
  interventionDate?: string;
  interventionBy?: string;
}

export interface FundInflow {
  id: string;
  grantCode: string;
  donorId: string;
  donorName: string;
  projectId: string;
  projectCode: string;
  projectTitle: string;
  trancheNumber: number;
  title: string;
  amountUSD: number;
  amountSLSH: number;
  disbursementDate: string;
  bankReference: string;
  status: 'Received' | 'Scheduled' | 'Delayed';
  notes?: string;
}

export interface ExpenseRecord {
  id: string;
  voucherNumber: string;
  projectId: string;
  projectCode: string;
  budgetLineCode: string;
  budgetLineDescription?: string;
  category: BudgetCategory;
  date: string;
  payee: string;
  description: string;
  amountUSD: number;
  amountSLSH: number; // Somaliland Shillings
  currencyPaid: 'USD' | 'SLSH';
  approvedBy: string;
  receiptReference: string;
  receiptFileName?: string;
  receiptDataUrl?: string;
  receiptFileSize?: string;
  donorCode: string;
  status: 'Approved & Paid' | 'Pending Review' | 'Flagged For Audit';
}

export interface BeneficiaryDisaggregation {
  pastoralistWomen: number;
  pastoralistMen: number;
  youthUnder25: number;
  elderlyHerders: number;
  personsWithDisabilities: number;
  idpReturneeHouseholds: number;
}

export interface BeneficiaryMetrics {
  targetDirect: number;
  actualDirect: number;
  targetIndirect: number;
  actualIndirect: number;
  targetHouseholds: number;
  actualHouseholds: number;
  disaggregation: BeneficiaryDisaggregation;
}

export interface FieldEvidence {
  id: string;
  projectId: string;
  date: string;
  title: string;
  location: string;
  district: string;
  region: SomalilandRegion;
  gpsCoordinates: string;
  monitoredBy: string;
  summary: string;
  beneficiaryQuote?: {
    text: string;
    speakerName: string;
    role: string;
    village: string;
  };
  verifiedStatus: 'Audited & Verified' | 'Field Reported' | 'Requires Verification';
}

export type RiskSeverity = 'Low' | 'Medium' | 'High' | 'Severe';
export type RiskCategory = 
  | 'Access & Security'
  | 'Environmental / Drought'
  | 'Market & Price Fluctuations'
  | 'Institutional & Governance'
  | 'Operational & Logistics'
  | 'Financial & Compliance';

export type RiskStatus = 'Active Monitoring' | 'Mitigated' | 'Escalated';

export type MilestoneStatus = 'Pending' | 'In Progress' | 'Achieved' | 'Delayed' | 'Critical';

export type MilestoneCategory =
  | 'Key Delivery'
  | 'M&E Review'
  | 'Procurement & Works'
  | 'Donor Deliverable'
  | 'Field Checkpoint'
  | 'Community Handover';

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  completionDate?: string;
  status: MilestoneStatus;
  category: MilestoneCategory;
  assignedLead?: string;
  isCriticalCheckpoint: boolean;
  verificationCriteria?: string;
  weightPercent?: number;
  notes?: string;
}

export interface RiskItem {
  id: string;
  projectId?: string;
  projectCode?: string;
  projectTitle?: string;
  description: string;
  riskLevel: RiskSeverity;
  category: RiskCategory;
  mitigationPlan: string;
  status: RiskStatus;
  likelihood?: 'Rare' | 'Unlikely' | 'Possible' | 'Likely' | 'Almost Certain';
  impact?: 'Insignificant' | 'Minor' | 'Moderate' | 'Major' | 'Critical';
  humanitarianImpactArea?: 'Food & Fodder Delivery' | 'Water Supply Pumping' | 'Cash Transfers (Zaad/Sahal)' | 'Staff & Asset Security' | 'Cross-Border Access' | 'Medical / Cold-Chain Storage';
  assignedFocalPoint?: string;
  dateIdentified?: string;
  lastReviewDate?: string;
  earlyWarningTriggers?: string;
}

export interface Donor {
  id: string;
  name: string;
  shortName: string; // e.g. "EU", "Danida", "FCDO", "FAO", "SDC"
  code: string;
  country: string;
  contactPerson: string;
  contactEmail: string;
  phone: string;
  currency: 'USD' | 'EUR' | 'GBP';
  activeGrantsCount: number;
  totalCommittedUSD: number;
  totalDisbursedUSD: number;
  totalSpentUSD: number;
  reportingRequirements: string[];
  fiscalYearEnd: string;
}

export interface Project {
  id: string;
  code: string; // e.g. "PENHA-SOM-2025-EU01"
  title: string;
  shortTitle: string;
  donorId: string;
  donorName: string;
  grantAgreementCode: string;
  pillar: SectorPillar;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  reportingFrequency: 'Monthly' | 'Quarterly' | 'Bi-Annual';
  nextDonorReportDate: string;
  targetRegions: SomalilandRegion[];
  targetDistricts: string[];
  leadProjectManager: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
  fieldCoordinator: {
    name: string;
    baseOffice: string;
    phone: string;
  };
  budgetSummary: {
    totalGrantUSD: number;
    disbursedUSD: number;
    expendituresUSD: number;
    commitmentsUSD: number;
    remainingBalanceUSD: number;
    burnRatePercent: number;
  };
  logframe: Logframe;
  budgetLines: BudgetLineItem[];
  beneficiaries: BeneficiaryMetrics;
  fieldEvidences: FieldEvidence[];
  risks: RiskItem[];
  milestones: Milestone[];
}

export interface DonorReport {
  id: string;
  reportNumber: string;
  projectId: string;
  projectCode: string;
  projectTitle: string;
  donorId: string;
  donorName: string;
  grantAgreementCode: string;
  reportingPeriod: string;
  submissionDate: string;
  preparedBy: string;
  approvedBy: string;
  templateType: 'EU Progress Report' | 'Danida Results-Based Report' | 'OCHA 5W Matrix' | 'Comprehensive Impact Audit';
  executiveSummary: string;
  keyAchievements: string[];
  challengesAndMitigations: string[];
  financialOverview: {
    totalBudgetUSD: number;
    expenditureThisPeriodUSD: number;
    cumulativeExpenditureUSD: number;
    remainingBalanceUSD: number;
    burnRatePercent: number;
    currency: string;
    slshEquivalent: number;
  };
  indicatorSummary: {
    totalIndicators: number;
    achievedCount: number;
    onTrackCount: number;
    delayedCount: number;
    overallTargetReachPercent: number;
  };
  beneficiariesReached: {
    direct: number;
    womenPercent: number;
    households: number;
  };
}
