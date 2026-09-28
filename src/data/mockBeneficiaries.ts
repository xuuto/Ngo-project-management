import { Beneficiary, DisbursementRecord } from '../types/beneficiary';
import { SOMALILAND_SHILLING_RATE } from './mockData';

export const INITIAL_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'ben-01',
    registrationNumber: 'BEN-SOM-2025-0101',
    fullName: 'Amina Jama Dualeh',
    gender: 'Female',
    age: 42,
    householdSize: 7,
    vulnerabilityCategory: 'Pastoralist Women Headed Household',
    primaryLivelihood: 'Camel Dairy Production',
    region: 'Togdheer',
    district: 'Sheikh',
    village: 'Qoordheere',
    gpsCoordinates: '9.9324° N, 45.1912° E',
    mobileMoney: {
      provider: 'Telesom ZAAD',
      phoneNumber: '+252 63 448 1928',
      accountName: 'Amina Jama Dualeh',
      accountStatus: 'Verified'
    },
    enrolledProjects: [
      {
        projectId: 'proj-01',
        projectCode: 'PENHA-SOM-2025-EU01',
        projectTitle: 'Horn of Africa Pastoralist Resilience & Rangeland Regeneration Project (HARP)',
        enrollmentDate: '2024-02-10',
        role: 'VSLA Member'
      },
      {
        projectId: 'proj-02',
        projectCode: 'PENHA-SOM-2025-DAN02',
        projectTitle: 'Pastoralist Women Economic Empowerment & Milk Value Chains',
        enrollmentDate: '2024-05-15',
        role: 'Dairy Supplier'
      }
    ],
    totalAssistanceReceivedUSD: 780,
    totalDisbursementsCount: 6,
    verificationStatus: 'Village Elder Certified',
    nationalIdNumber: 'SL-ID-TOG-88192',
    registrationDate: '2024-02-05',
    notes: 'Treasurer of the Qoordheere Women Pastoralist Committee. Supplies 35L fresh camel milk daily to Sheikh chilling hub.'
  },
  {
    id: 'ben-02',
    registrationNumber: 'BEN-SOM-2025-0102',
    fullName: 'Halimo Awale Guudle',
    gender: 'Female',
    age: 38,
    householdSize: 6,
    vulnerabilityCategory: 'Pastoralist Women Headed Household',
    primaryLivelihood: 'Camel Dairy Production',
    region: 'Sahil',
    district: 'Sheikh',
    village: 'Hudiso Rural Area',
    gpsCoordinates: '9.9510° N, 45.1620° E',
    mobileMoney: {
      provider: 'Telesom ZAAD',
      phoneNumber: '+252 63 419 8832',
      accountName: 'Halimo A. Guudle',
      accountStatus: 'Verified'
    },
    enrolledProjects: [
      {
        projectId: 'proj-02',
        projectCode: 'PENHA-SOM-2025-DAN02',
        projectTitle: 'Pastoralist Women Economic Empowerment & Milk Value Chains',
        enrollmentDate: '2024-04-20',
        role: 'VSLA Member'
      }
    ],
    totalAssistanceReceivedUSD: 620,
    totalDisbursementsCount: 5,
    verificationStatus: 'Biometric Verified',
    nationalIdNumber: 'SL-ID-SAH-33019',
    registrationDate: '2024-04-18',
    notes: 'Chairlady of Danwadaag Pastoralist Milk Cooperative. Manages VSLA cashbox savings for 25 women.'
  },
  {
    id: 'ben-03',
    registrationNumber: 'BEN-SOM-2025-0103',
    fullName: 'Mukhtar Farah Obsiiye',
    gender: 'Male',
    age: 23,
    householdSize: 5,
    vulnerabilityCategory: 'Marginalized Youth',
    primaryLivelihood: 'Rangeland Restoration Worker',
    region: 'Togdheer',
    district: 'Oodweyne',
    village: 'Oodweyne Seasonal Basin',
    gpsCoordinates: '9.4091° N, 45.0640° E',
    mobileMoney: {
      provider: 'Telesom ZAAD',
      phoneNumber: '+252 63 477 3910',
      accountName: 'Mukhtar F. Obsiiye',
      accountStatus: 'Verified'
    },
    enrolledProjects: [
      {
        projectId: 'proj-01',
        projectCode: 'PENHA-SOM-2025-EU01',
        projectTitle: 'Pastoralist Resilience & Rangelands (HARP)',
        enrollmentDate: '2025-01-15',
        role: 'Cash-for-Work Laborer'
      }
    ],
    totalAssistanceReceivedUSD: 450,
    totalDisbursementsCount: 3,
    verificationStatus: 'Village Elder Certified',
    nationalIdNumber: 'SL-ID-TOG-55219',
    registrationDate: '2025-01-10',
    notes: 'Team leader for Youth Earthen Bunding Brigade in Oodweyne gully catchment corridor.'
  },
  {
    id: 'ben-04',
    registrationNumber: 'BEN-SOM-2025-0104',
    fullName: 'Guleid Farah Shire',
    gender: 'Male',
    age: 64,
    householdSize: 9,
    vulnerabilityCategory: 'Elderly Herder',
    primaryLivelihood: 'Camel & Goat Pastoralism',
    region: 'Sool',
    district: 'Ainabo',
    village: 'Ainabo Center',
    gpsCoordinates: '8.8167° N, 46.4167° E',
    mobileMoney: {
      provider: 'Somtel Sahal',
      phoneNumber: '+252 65 992 4108',
      accountName: 'Guleid F. Shire',
      accountStatus: 'Verified'
    },
    enrolledProjects: [
      {
        projectId: 'proj-03',
        projectCode: 'PENHA-SOM-2025-FCDO03',
        projectTitle: 'Emergency Drought Early-Action & Solarized Livestock Boreholes',
        enrollmentDate: '2024-05-10',
        role: 'Emergency Fodder Recipient'
      }
    ],
    totalAssistanceReceivedUSD: 540,
    totalDisbursementsCount: 4,
    verificationStatus: 'Village Elder Certified',
    nationalIdNumber: 'SL-ID-SOL-10492',
    registrationDate: '2024-05-02',
    notes: 'Elder and Secretary of Ainabo Water User Association. Received emergency Rhodes grass hay for 40 breeding goats.'
  },
  {
    id: 'ben-05',
    registrationNumber: 'BEN-SOM-2025-0105',
    fullName: 'Dahir Obsiiye Geedi',
    gender: 'Male',
    age: 49,
    householdSize: 8,
    vulnerabilityCategory: 'Agro-pastoralist Smallholder',
    primaryLivelihood: 'Dryland Rainfed Sorghum',
    region: 'Awdal',
    district: 'Dilla',
    village: 'Dilla Outskirts',
    gpsCoordinates: '9.8512° N, 43.4320° E',
    mobileMoney: {
      provider: 'Telesom ZAAD',
      phoneNumber: '+252 63 433 8920',
      accountName: 'Dahir Obsiiye Geedi',
      accountStatus: 'Verified'
    },
    enrolledProjects: [
      {
        projectId: 'proj-04',
        projectCode: 'PENHA-SOM-2025-FAO04',
        projectTitle: 'Sustainable Dryland Soil & Moisture Conservation',
        enrollmentDate: '2024-06-12',
        role: 'Farmer Field School'
      }
    ],
    totalAssistanceReceivedUSD: 360,
    totalDisbursementsCount: 3,
    verificationStatus: 'Biometric Verified',
    nationalIdNumber: 'SL-ID-AWD-74910',
    registrationDate: '2024-06-01',
    notes: 'Lead farmer for Dilla contour ridge demonstration field. Multiplier of drought-hardy El-Gadde sorghum foundation seed.'
  },
  {
    id: 'ben-06',
    registrationNumber: 'BEN-SOM-2025-0106',
    fullName: 'Khadra Warsame Ali',
    gender: 'Female',
    age: 34,
    householdSize: 6,
    vulnerabilityCategory: 'Displaced / Returnee Pastoralist',
    primaryLivelihood: 'Camel & Goat Pastoralism',
    region: 'Maroodi Jeex',
    district: 'Gabiley',
    village: 'Arabsiyo Rural Periphery',
    gpsCoordinates: '9.6841° N, 43.7650° E',
    mobileMoney: {
      provider: 'Telesom ZAAD',
      phoneNumber: '+252 63 481 0293',
      accountName: 'Khadra W. Ali',
      accountStatus: 'Verified'
    },
    enrolledProjects: [
      {
        projectId: 'proj-01',
        projectCode: 'PENHA-SOM-2025-EU01',
        projectTitle: 'Pastoralist Resilience & Rangelands (HARP)',
        enrollmentDate: '2024-09-01',
        role: 'VSLA Member'
      }
    ],
    totalAssistanceReceivedUSD: 410,
    totalDisbursementsCount: 3,
    verificationStatus: 'Village Elder Certified',
    nationalIdNumber: 'SL-ID-MRD-90312',
    registrationDate: '2024-08-25',
    notes: 'Returnee herder household displaced during 2022 drought. Now active in Arabsiyo solarized water basin.'
  },
  {
    id: 'ben-07',
    registrationNumber: 'BEN-SOM-2025-0107',
    fullName: 'Hassan Rooble Egal',
    gender: 'Male',
    age: 71,
    householdSize: 11,
    vulnerabilityCategory: 'Elderly Herder',
    primaryLivelihood: 'Camel & Goat Pastoralism',
    region: 'Maroodi Jeex',
    district: 'Gabiley',
    village: 'Ceel-Baxay',
    gpsCoordinates: '9.6910° N, 43.7420° E',
    mobileMoney: {
      provider: 'Telesom ZAAD',
      phoneNumber: '+252 63 440 8821',
      accountName: 'Hassan Rooble Egal',
      accountStatus: 'Verified'
    },
    enrolledProjects: [
      {
        projectId: 'proj-01',
        projectCode: 'PENHA-SOM-2025-EU01',
        projectTitle: 'Pastoralist Resilience & Rangelands (HARP)',
        enrollmentDate: '2024-04-10',
        role: 'Emergency Fodder Recipient'
      }
    ],
    totalAssistanceReceivedUSD: 520,
    totalDisbursementsCount: 4,
    verificationStatus: 'Village Elder Certified',
    nationalIdNumber: 'SL-ID-MRD-11928',
    registrationDate: '2024-03-30',
    notes: 'Ceel-Baxay elder and custodian of traditional grazing Xeer peace agreements.'
  },
  {
    id: 'ben-08',
    registrationNumber: 'BEN-SOM-2025-0108',
    fullName: 'Shukri Ismail Nuur',
    gender: 'Female',
    age: 29,
    householdSize: 4,
    vulnerabilityCategory: 'Person with Disability',
    primaryLivelihood: 'Camel Dairy Production',
    region: 'Sahil',
    district: 'Berbera',
    village: 'Berbera Periphery Hub',
    gpsCoordinates: '10.4390° N, 45.0140° E',
    mobileMoney: {
      provider: 'Somtel Sahal',
      phoneNumber: '+252 65 918 3920',
      accountName: 'Shukri I. Nuur',
      accountStatus: 'Verified'
    },
    enrolledProjects: [
      {
        projectId: 'proj-02',
        projectCode: 'PENHA-SOM-2025-DAN02',
        projectTitle: 'Pastoralist Women Economic Empowerment & Milk Value Chains',
        enrollmentDate: '2024-07-01',
        role: 'VSLA Member'
      }
    ],
    totalAssistanceReceivedUSD: 480,
    totalDisbursementsCount: 4,
    verificationStatus: 'Biometric Verified',
    nationalIdNumber: 'SL-ID-SAH-55092',
    registrationDate: '2024-06-25',
    notes: 'Micro-retailer of pasteurized camel milk at Berbera highway market.'
  }
];

export const INITIAL_DISBURSEMENTS: DisbursementRecord[] = [
  {
    id: 'disb-01',
    transactionRef: 'ZAAD-TX-994102',
    beneficiaryId: 'ben-01',
    beneficiaryName: 'Amina Jama Dualeh',
    beneficiaryPhone: '+252 63 448 1928',
    projectId: 'proj-02',
    projectCode: 'PENHA-SOM-2025-DAN02',
    activityCode: 'ACT-1.1.1',
    date: '2026-09-15',
    assistanceType: 'Camel Milk Daily Intake Payment',
    amountUSD: 140,
    amountSLSH: 140 * SOMALILAND_SHILLING_RATE,
    provider: 'Telesom ZAAD',
    status: 'Completed & Confirmed',
    approvedBy: 'Sahra Hassan Dirie',
    voucherBatchNo: 'BATCH-ZAAD-2026-09A',
    purposeNote: 'Fortnightly milk intake settlement for 280 liters supplied to Sheikh chilling center'
  },
  {
    id: 'disb-02',
    transactionRef: 'ZAAD-TX-994103',
    beneficiaryId: 'ben-03',
    beneficiaryName: 'Mukhtar Farah Obsiiye',
    beneficiaryPhone: '+252 63 477 3910',
    projectId: 'proj-01',
    projectCode: 'PENHA-SOM-2025-EU01',
    activityCode: 'ACT-1.1.2',
    date: '2026-09-12',
    assistanceType: 'Cash-for-Work Stipend',
    amountUSD: 150,
    amountSLSH: 150 * SOMALILAND_SHILLING_RATE,
    provider: 'Telesom ZAAD',
    status: 'Completed & Confirmed',
    approvedBy: 'Eng. Ismail Jama Farah',
    voucherBatchNo: 'BATCH-CFW-2026-09B',
    purposeNote: '10 days labor contribution to stone check dam gully construction in Oodweyne'
  },
  {
    id: 'disb-03',
    transactionRef: 'SAHAL-TX-338191',
    beneficiaryId: 'ben-04',
    beneficiaryName: 'Guleid Farah Shire',
    beneficiaryPhone: '+252 65 992 4108',
    projectId: 'proj-03',
    projectCode: 'PENHA-SOM-2025-FCDO03',
    activityCode: 'ACT-1.1.2',
    date: '2026-09-08',
    assistanceType: 'Emergency Fodder Voucher',
    amountUSD: 120,
    amountSLSH: 120 * SOMALILAND_SHILLING_RATE,
    provider: 'Somtel Sahal',
    status: 'Completed & Confirmed',
    approvedBy: 'Eng. Abdillahi Warsame Muse',
    voucherBatchNo: 'BATCH-FOD-2026-09C',
    purposeNote: 'Electronic voucher redemption for 6 bales of Rhodes grass hay at Ainabo reserve depot'
  },
  {
    id: 'disb-04',
    transactionRef: 'ZAAD-TX-994104',
    beneficiaryId: 'ben-02',
    beneficiaryName: 'Halimo Awale Guudle',
    beneficiaryPhone: '+252 63 419 8832',
    projectId: 'proj-02',
    projectCode: 'PENHA-SOM-2025-DAN02',
    activityCode: 'ACT-1.1.2',
    date: '2026-09-03',
    assistanceType: 'VSLA Micro-Loan Advance',
    amountUSD: 200,
    amountSLSH: 200 * SOMALILAND_SHILLING_RATE,
    provider: 'Telesom ZAAD',
    status: 'Completed & Confirmed',
    approvedBy: 'Sahra Hassan Dirie',
    voucherBatchNo: 'BATCH-VSLA-2026-09D',
    purposeNote: 'Danwadaag VSLA revolving capital loan for stainless steel dairy churn purchase'
  },
  {
    id: 'disb-05',
    transactionRef: 'ZAAD-TX-994105',
    beneficiaryId: 'ben-05',
    beneficiaryName: 'Dahir Obsiiye Geedi',
    beneficiaryPhone: '+252 63 433 8920',
    projectId: 'proj-04',
    projectCode: 'PENHA-SOM-2025-FAO04',
    activityCode: 'ACT-1.1.1',
    date: '2026-08-28',
    assistanceType: 'Certified Seed Subsidy',
    amountUSD: 90,
    amountSLSH: 90 * SOMALILAND_SHILLING_RATE,
    provider: 'Telesom ZAAD',
    status: 'Completed & Confirmed',
    approvedBy: 'Dr. Marian Abdirahman',
    voucherBatchNo: 'BATCH-SEED-2026-08A',
    purposeNote: 'Voucher transfer for 25kg foundation certified El-Gadde drought-hardy sorghum seed'
  }
];
