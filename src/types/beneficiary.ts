import { SomalilandRegion } from './ngo';

export type VulnerabilityCategory =
  | 'Pastoralist Women Headed Household'
  | 'Agro-pastoralist Smallholder'
  | 'Elderly Herder'
  | 'Marginalized Youth'
  | 'Displaced / Returnee Pastoralist'
  | 'Person with Disability';

export type PrimaryLivelihood =
  | 'Camel & Goat Pastoralism'
  | 'Camel Dairy Production'
  | 'Dryland Rainfed Sorghum'
  | 'Frankincense Resin Harvester'
  | 'Rangeland Restoration Worker';

export type MobileMoneyProvider = 'Telesom ZAAD' | 'Somtel Sahal' | 'Direct Cash / Bank';

export type AssistanceType =
  | 'Cash-for-Work Stipend'
  | 'Emergency Fodder Voucher'
  | 'VSLA Micro-Loan Advance'
  | 'Camel Milk Daily Intake Payment'
  | 'Certified Seed Subsidy';

export interface BeneficiaryEnrollment {
  projectId: string;
  projectCode: string;
  projectTitle: string;
  enrollmentDate: string;
  role: 'VSLA Member' | 'Cash-for-Work Laborer' | 'Dairy Supplier' | 'Farmer Field School' | 'Emergency Fodder Recipient';
}

export interface Beneficiary {
  id: string;
  registrationNumber: string; // e.g. BEN-SOM-2026-0812
  fullName: string;
  gender: 'Female' | 'Male';
  age: number;
  householdSize: number;
  vulnerabilityCategory: VulnerabilityCategory;
  primaryLivelihood: PrimaryLivelihood;
  region: SomalilandRegion;
  district: string;
  village: string;
  gpsCoordinates?: string;
  mobileMoney: {
    provider: MobileMoneyProvider;
    phoneNumber: string; // e.g. +252 63 441 2981
    accountName: string;
    accountStatus: 'Verified' | 'Pending Verification';
  };
  enrolledProjects: BeneficiaryEnrollment[];
  totalAssistanceReceivedUSD: number;
  totalDisbursementsCount: number;
  verificationStatus: 'Village Elder Certified' | 'Biometric Verified' | 'Flagged For Audit';
  nationalIdNumber?: string;
  registrationDate: string;
  notes?: string;
}

export interface DisbursementRecord {
  id: string;
  transactionRef: string; // e.g. ZAAD-TX-994102 or SAHAL-TX-33819
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryPhone: string;
  projectId: string;
  projectCode: string;
  activityCode: string;
  date: string;
  assistanceType: AssistanceType;
  amountUSD: number;
  amountSLSH: number;
  provider: MobileMoneyProvider;
  status: 'Completed & Confirmed' | 'Pending Network Settlement' | 'Failed / Phone Unreachable';
  approvedBy: string;
  voucherBatchNo: string;
  purposeNote: string;
}
