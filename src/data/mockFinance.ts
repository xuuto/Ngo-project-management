import { BankAccount, FinancialCommitment, ProcurementOrder, FieldImprestAccount } from '../types/finance';
import { SOMALILAND_SHILLING_RATE } from './mockData';

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank-01',
    bankName: 'Dahabshiil Bank International',
    accountNumber: 'DBI-SOM-0091823-USD',
    accountType: 'Operating Account',
    currency: 'USD',
    currentBalance: 385000,
    branch: 'Hargeisa Main Branch (Independence Ave)',
    signatories: ['Dr. Mohamoud Hersi (Director)', 'Sahra Hassan Dirie (Finance Admin)']
  },
  {
    id: 'bank-02',
    bankName: 'Dahabshiil Bank International (Designated Grant)',
    accountNumber: 'DBI-EU-EUTF-77210-USD',
    accountType: 'Designated Donor Grant Account',
    currency: 'USD',
    currentBalance: 244500,
    allocatedDonorId: 'donor-eu',
    allocatedDonorName: 'European Union (EU-EUTF)',
    branch: 'Hargeisa Main Branch',
    signatories: ['Dr. Mohamoud Hersi (Director)', 'Eng. Ismail Jama Farah (Project Lead)']
  },
  {
    id: 'bank-03',
    bankName: 'Premier Bank Somaliland',
    accountNumber: 'PB-DAN-10492-USD',
    accountType: 'Designated Donor Grant Account',
    currency: 'USD',
    currentBalance: 104800,
    allocatedDonorId: 'donor-danida',
    allocatedDonorName: 'Danida (Denmark)',
    branch: 'Hargeisa 26 June District Branch',
    signatories: ['Dr. Mohamoud Hersi (Director)', 'Sahra Hassan Dirie (Lead)']
  },
  {
    id: 'bank-04',
    bankName: 'Salama Bank Somaliland',
    accountNumber: 'SAL-FCDO-8812-USD',
    accountType: 'Designated Donor Grant Account',
    currency: 'USD',
    currentBalance: 280000,
    allocatedDonorId: 'donor-fcdo',
    allocatedDonorName: 'FCDO (United Kingdom)',
    branch: 'Hargeisa Downtown Branch',
    signatories: ['Dr. Mohamoud Hersi (Director)', 'Eng. Abdillahi Warsame Muse (Ops Lead)']
  },
  {
    id: 'bank-05',
    bankName: 'Telesom ZAAD Humanitarian Merchant Wallet',
    accountNumber: 'ZAAD-MERCHANT-882190',
    accountType: 'ZAAD Merchant Wallet',
    currency: 'USD',
    currentBalance: 64200,
    branch: 'Telesom HQ Hargeisa / API Float',
    signatories: ['Finance Disbursement Desk']
  }
];

export const INITIAL_COMMITMENTS: FinancialCommitment[] = [
  {
    id: 'enc-01',
    commitmentNumber: 'ENC-2026-081',
    projectId: 'proj-01',
    projectCode: 'PENHA-SOM-2025-EU01',
    budgetLineCode: 'BL-103',
    supplierName: 'Horn Solar Solutions Ltd (Hargeisa)',
    contractRef: 'CONTRACT-HSS-2025-09',
    dateCommitted: '2025-06-15',
    expectedDisbursementDate: '2026-11-30',
    committedAmountUSD: 85000,
    disbursedAmountUSD: 42500,
    remainingEncumbranceUSD: 42500,
    status: 'Partially Disbursed',
    purpose: 'Supply and commissioning of 18 solar submersible pumps for Arabsiyo and Sheikh pastoral water points'
  },
  {
    id: 'enc-02',
    commitmentNumber: 'ENC-2026-082',
    projectId: 'proj-03',
    projectCode: 'PENHA-SOM-2025-FCDO03',
    budgetLineCode: 'BL-301',
    supplierName: 'Wajaale Agricultural Transport Union',
    contractRef: 'CONTRACT-WAT-2026-01',
    dateCommitted: '2026-01-10',
    expectedDisbursementDate: '2026-10-31',
    committedAmountUSD: 28000,
    disbursedAmountUSD: 14200,
    remainingEncumbranceUSD: 13800,
    status: 'Partially Disbursed',
    purpose: 'Haulage freight framework for 800 metric tons emergency fodder bales to Ainabo and Burao reserves'
  },
  {
    id: 'enc-03',
    commitmentNumber: 'ENC-2026-083',
    projectId: 'proj-02',
    projectCode: 'PENHA-SOM-2025-DAN02',
    budgetLineCode: 'BL-202',
    supplierName: 'Burao Metal & Dairy Equipment Syndicate',
    contractRef: 'CONTRACT-BMD-2026-04',
    dateCommitted: '2026-03-20',
    expectedDisbursementDate: '2026-12-15',
    committedAmountUSD: 32000,
    disbursedAmountUSD: 0,
    remainingEncumbranceUSD: 32000,
    status: 'Active Encumbrance',
    purpose: 'Fabrication of 250 food-grade 40L stainless steel camel milk transport churns for women cooperatives'
  },
  {
    id: 'enc-04',
    commitmentNumber: 'ENC-2026-084',
    projectId: 'proj-01',
    projectCode: 'PENHA-SOM-2025-EU01',
    budgetLineCode: 'BL-102',
    supplierName: 'Red Sea Fuel Stations Network',
    contractRef: 'CONTRACT-RSF-2025-11',
    dateCommitted: '2025-01-01',
    expectedDisbursementDate: '2026-06-30',
    committedAmountUSD: 18000,
    disbursedAmountUSD: 4900,
    remainingEncumbranceUSD: 13100,
    status: 'Partially Disbursed',
    purpose: 'Fuel coupon framework for monitoring 4x4 vehicles deployed in Togdheer and Maroodi Jeex'
  }
];

export const INITIAL_PROCUREMENT_ORDERS: ProcurementOrder[] = [
  {
    id: 'po-01',
    poNumber: 'PO-2026-041',
    projectId: 'proj-01',
    projectCode: 'PENHA-SOM-2025-EU01',
    budgetLineCode: 'BL-103',
    title: 'Procurement of Certified Indigenous Grass Seed (Cenchrus ciliaris)',
    description: 'Procurement of 12 metric tons of verified seed batches from regional dryland seed multipliers',
    method: '3 Competitive Quotes ($1,000 - $20,000)',
    estimatedCostUSD: 70000,
    finalCostUSD: 68000,
    vendorName: 'Horn Dryland Seeds Syndicate',
    dateInitiated: '2024-02-15',
    dateApproved: '2024-02-28',
    status: 'Fulfilled & Invoiced',
    quotations: [
      {
        supplierName: 'Horn Dryland Seeds Syndicate (Hargeisa)',
        quotedAmountUSD: 68000,
        deliveryDays: 14,
        complianceChecked: true,
        selected: true,
        notes: 'Lowest responsive bid; certified 92% germination rate by Somaliland MoAD seed lab.'
      },
      {
        supplierName: 'Somaliland Agriseed Enterprise (Burao)',
        quotedAmountUSD: 72500,
        deliveryDays: 20,
        complianceChecked: true,
        selected: false,
        notes: 'Price $4,500 higher than winning bidder.'
      },
      {
        supplierName: 'Burao Farmers Cooperative Union',
        quotedAmountUSD: 69400,
        deliveryDays: 18,
        complianceChecked: true,
        selected: false,
        notes: 'Failed to provide third-party moisture purity certificate.'
      }
    ],
    evaluationSummary: 'Bid evaluation committee selected Horn Dryland Seeds Syndicate based on best value for money, technical laboratory certification, and shortest delivery lead time.',
    approvedBy: 'Eng. Ismail Jama Farah (Project Manager) & Dr. Mohamoud Hersi (Director)'
  },
  {
    id: 'po-02',
    poNumber: 'PO-2026-042',
    projectId: 'proj-02',
    projectCode: 'PENHA-SOM-2025-DAN02',
    budgetLineCode: 'BL-202',
    title: 'Heavy-Duty Solar Cold Chain Units for Sheikh Milk Chilling Hub',
    description: '3 solar DC compressor units (1,000L capacity each) with R404a refrigerant and 8-hour battery storage',
    method: 'Formal Open Tender (>$20,000)',
    estimatedCostUSD: 170000,
    finalCostUSD: 165000,
    vendorName: 'Danab Solar & Electric Systems',
    dateInitiated: '2024-03-10',
    dateApproved: '2024-04-05',
    status: 'Fulfilled & Invoiced',
    quotations: [
      {
        supplierName: 'Danab Solar & Electric Systems',
        quotedAmountUSD: 165000,
        deliveryDays: 30,
        complianceChecked: true,
        selected: true,
        notes: 'Included 2-year warranty and free technician training in Sheikh.'
      },
      {
        supplierName: 'Gulf Energy Hargeisa Ltd',
        quotedAmountUSD: 174000,
        deliveryDays: 45,
        complianceChecked: true,
        selected: false,
        notes: 'Quotation higher than budget threshold.'
      },
      {
        supplierName: 'Sahara Cold Chain Solutions (Djibouti/Hargeisa)',
        quotedAmountUSD: 169500,
        deliveryDays: 35,
        complianceChecked: true,
        selected: false,
        notes: 'Did not include on-site mounting hardware in bill of quantities.'
      }
    ],
    evaluationSummary: 'Tender committee confirmed Danab Solar complied with all technical criteria and offered the most competitive financial proposal.',
    approvedBy: 'Sahra Hassan Dirie (Manager) & Dr. Mohamoud Hersi (Director)'
  },
  {
    id: 'po-03',
    poNumber: 'PO-2026-043',
    projectId: 'proj-03',
    projectCode: 'PENHA-SOM-2025-FCDO03',
    budgetLineCode: 'BL-301',
    title: 'Ainabo Deep Borehole Lorentz Solar Submersible Pump & Hybrid Array',
    description: '18.5kW Lorentz PSk2 solar pump system with motor cables and IP67 inverter',
    method: 'Formal Open Tender (>$20,000)',
    estimatedCostUSD: 72000,
    finalCostUSD: 68500,
    vendorName: 'Horn Solar Solutions Ltd',
    dateInitiated: '2024-04-02',
    dateApproved: '2024-04-20',
    status: 'Approved & Committed',
    quotations: [
      {
        supplierName: 'Horn Solar Solutions Ltd',
        quotedAmountUSD: 68500,
        deliveryDays: 21,
        complianceChecked: true,
        selected: true,
        notes: 'Official Lorentz authorized dealer in Somaliland.'
      },
      {
        supplierName: 'East Africa Water & Power',
        quotedAmountUSD: 71800,
        deliveryDays: 28,
        complianceChecked: true,
        selected: false,
        notes: 'Higher equipment unit pricing.'
      },
      {
        supplierName: 'Dahab Hydro Engineering',
        quotedAmountUSD: 74200,
        deliveryDays: 25,
        complianceChecked: true,
        selected: false,
        notes: 'Alternative generic pump brand offered instead of specified Lorentz.'
      }
    ],
    evaluationSummary: 'Approved based on technical compliance with borehole 180m depth hydraulic specifications and manufacturer warranty.',
    approvedBy: 'Eng. Abdillahi Warsame Muse & Dr. Mohamoud Hersi'
  }
];

export const INITIAL_IMPREST_ACCOUNTS: FieldImprestAccount[] = [
  {
    id: 'imp-01',
    subOfficeName: 'Burao Sub-office (Togdheer)',
    custodianName: 'Fadumo Abdi Warsame',
    custodianRole: 'Field Coordinator',
    currency: 'USD',
    floatCeilingUSD: 3000,
    currentCashOnHandUSD: 1240,
    unreconciledVouchersUSD: 1760,
    lastReconciliationDate: '2026-09-15',
    status: 'Healthy Liquidity'
  },
  {
    id: 'imp-02',
    subOfficeName: 'Borama Sub-office (Awdal)',
    custodianName: 'Mustafe Ismail Nur',
    custodianRole: 'Field Coordinator',
    currency: 'USD',
    floatCeilingUSD: 2000,
    currentCashOnHandUSD: 1580,
    unreconciledVouchersUSD: 420,
    lastReconciliationDate: '2026-09-10',
    status: 'Healthy Liquidity'
  },
  {
    id: 'imp-03',
    subOfficeName: 'Ainabo Eastern Field Base (Sool)',
    custodianName: 'Yusuf Hassan Hirsi',
    custodianRole: 'Emergency Logistics Officer',
    currency: 'USD',
    floatCeilingUSD: 2500,
    currentCashOnHandUSD: 420,
    unreconciledVouchersUSD: 2080,
    lastReconciliationDate: '2026-09-02',
    status: 'Replenishment Requested'
  }
];
