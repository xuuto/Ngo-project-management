import { Donor, Project, ExpenseRecord, FundInflow } from '../types/ngo';

export const INITIAL_DONORS: Donor[] = [
  {
    id: 'donor-eu',
    name: 'European Union Emergency Trust Fund for Africa',
    shortName: 'European Union (EU)',
    code: 'EU-EUTF',
    country: 'European Union / Brussels',
    contactPerson: 'Elena Rossi (Head of Cooperation)',
    contactEmail: 'elena.rossi@eeas.europa.eu',
    phone: '+254 20 271 3000',
    currency: 'EUR',
    activeGrantsCount: 1,
    totalCommittedUSD: 1850000,
    totalDisbursedUSD: 1450000,
    totalSpentUSD: 1340500,
    reportingRequirements: [
      'Annex III Quarterly Financial Verification',
      'Logframe OVI Indicator Audit with GIS shapefiles',
      'External Mid-Term Evaluation at Month 18',
      'Anti-Fraud & Visibility Compliance Guidelines'
    ],
    fiscalYearEnd: '31 December'
  },
  {
    id: 'donor-danida',
    name: 'Danish International Development Agency (Danida)',
    shortName: 'Danida (Denmark)',
    code: 'DANIDA-DK',
    country: 'Denmark / Ministry of Foreign Affairs',
    contactPerson: 'Lars Møller (Senior Programme Officer)',
    contactEmail: 'larmol@um.dk',
    phone: '+45 33 92 00 00',
    currency: 'USD',
    activeGrantsCount: 1,
    totalCommittedUSD: 920000,
    totalDisbursedUSD: 850000,
    totalSpentUSD: 745200,
    reportingRequirements: [
      'Bi-annual Results-Based Management (RBM) Matrix',
      'Gender & Women Economic Empowerment Marker Score',
      'Value for Money (VfM) Efficiency Benchmark'
    ],
    fiscalYearEnd: '31 December'
  },
  {
    id: 'donor-fcdo',
    name: 'UK Foreign, Commonwealth & Development Office',
    shortName: 'FCDO (United Kingdom)',
    code: 'FCDO-UK',
    country: 'United Kingdom',
    contactPerson: 'David MacCallum (Humanitarian Advisor)',
    contactEmail: 'david.maccallum@fcdo.gov.uk',
    phone: '+44 20 7023 0000',
    currency: 'GBP',
    activeGrantsCount: 1,
    totalCommittedUSD: 2100000,
    totalDisbursedUSD: 1600000,
    totalSpentUSD: 1420000,
    reportingRequirements: [
      'Monthly Early Action & Drought Trigger Report',
      'Beneficiary Verification Sampling Ledger',
      'Quarterly Key Performance Indicator (KPI) Return'
    ],
    fiscalYearEnd: '31 March'
  },
  {
    id: 'donor-fao',
    name: 'Food and Agriculture Organization (Somalia/Somaliland Desk)',
    shortName: 'FAO Somalia/Somaliland',
    code: 'FAO-UN',
    country: 'United Nations / Rome',
    contactPerson: 'Dr. Mukhtar Aden (Livestock & Rangeland Lead)',
    contactEmail: 'mukhtar.aden@fao.org',
    phone: '+252 63 442 8190',
    currency: 'USD',
    activeGrantsCount: 1,
    totalCommittedUSD: 640000,
    totalDisbursedUSD: 550000,
    totalSpentUSD: 498000,
    reportingRequirements: [
      'Standard UN LOA (Letter of Agreement) Progress Matrix',
      'Bi-monthly Crop and Pasture Yield Monitoring Sheets',
      'Cluster 5W Reporting Submission'
    ],
    fiscalYearEnd: '31 December'
  },
  {
    id: 'donor-sdc',
    name: 'Swiss Agency for Development and Cooperation (SDC)',
    shortName: 'SDC (Switzerland)',
    code: 'SDC-CH',
    country: 'Switzerland / Federal Department of Foreign Affairs',
    contactPerson: 'Marc Steiner (Regional Horn of Africa Lead)',
    contactEmail: 'marc.steiner@eda.admin.ch',
    phone: '+41 58 462 21 11',
    currency: 'USD',
    activeGrantsCount: 1,
    totalCommittedUSD: 750000,
    totalDisbursedUSD: 300000,
    totalSpentUSD: 98500,
    reportingRequirements: [
      'SDC Results-Oriented Semi-Annual Progress Report',
      'Cross-Border Pastoral Mobility Risk & Conflict Matrix',
      'Veterinary Cold-Chain Temperature & Stock Ledger'
    ],
    fiscalYearEnd: '31 December'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-01',
    code: 'PENHA-SOM-2025-EU01',
    title: 'Horn of Africa Pastoralist Resilience & Rangeland Regeneration Project (HARP)',
    shortTitle: 'Pastoralist Resilience & Rangelands (HARP)',
    donorId: 'donor-eu',
    donorName: 'European Union (EU)',
    grantAgreementCode: 'EUTF05-HOA-SOM-7721',
    pillar: 'Rangeland & Water Management',
    status: 'Active',
    startDate: '2024-01-15',
    endDate: '2026-11-30',
    reportingFrequency: 'Quarterly',
    nextDonorReportDate: '2026-10-15',
    targetRegions: ['Maroodi Jeex', 'Togdheer'],
    targetDistricts: ['Gabiley', 'Arabsiyo', 'Sheikh', 'Oodweyne'],
    leadProjectManager: {
      name: 'Eng. Ismail Jama Farah',
      role: 'Senior Pastoralist Livelihoods Specialist',
      email: 'i.jama@penha-hargeisa.org',
      phone: '+252 63 441 2981'
    },
    fieldCoordinator: {
      name: 'Fadumo Abdi Warsame',
      baseOffice: 'Burao Sub-office (Togdheer)',
      phone: '+252 63 429 8831'
    },
    budgetSummary: {
      totalGrantUSD: 1850000,
      disbursedUSD: 1450000,
      expendituresUSD: 1340500,
      commitmentsUSD: 85000,
      remainingBalanceUSD: 424500,
      burnRatePercent: 72.46
    },
    logframe: {
      impactGoal: 'Enhance climate resilience, food security, and natural resource stewardship for 24,000 vulnerable pastoralist households in dryland corridors of Somaliland.',
      outcomes: [
        {
          id: 'oc-1',
          code: 'OC-1',
          title: 'Degraded rangelands restored with community-governed soil moisture conservation and indigenous perennial grass reseeding.',
          outputs: [
            {
              id: 'out-1.1',
              code: 'OUT-1.1',
              title: '3,200 hectares of degraded pastoral rangelands protected and reseeded with Cenchrus ciliaris and Chrysopogon plumulosus.',
              targetCompletionDate: '2026-04-30',
              indicators: [
                {
                  id: 'ind-1.1.1',
                  code: 'IND-1.1.1',
                  outputId: 'out-1.1',
                  description: 'Hectares of communal rangeland under active community-led restoration and soil-bunding',
                  unit: 'Hectares',
                  baseline: 0,
                  target: 3200,
                  currentActual: 2750,
                  midtermTarget: 2000,
                  meansOfVerification: 'Sentinel-2 Satellite Normalized Difference Vegetation Index (NDVI) + Ground GPS polygons certified by Somaliland MoAD',
                  frequency: 'Quarterly',
                  dataCollectionMethod: 'Field polygon surveying and MoAD joint inspection mission',
                  status: 'On Track',
                  disaggregationNote: '1,500 ha in Togdheer (Sheikh/Oodweyne), 1,250 ha in Maroodi Jeex (Gabiley)'
                },
                {
                  id: 'ind-1.1.2',
                  code: 'IND-1.1.2',
                  outputId: 'out-1.1',
                  description: 'Community Rangeland Management Committees (CRMCs) operationalized with 40% women leadership',
                  unit: 'Committees',
                  baseline: 0,
                  target: 24,
                  currentActual: 22,
                  midtermTarget: 16,
                  meansOfVerification: 'CRMC signed bylaws, meeting minutes, and village council ratification certificates',
                  frequency: 'Quarterly',
                  dataCollectionMethod: 'Governance audit checklists and field officer records',
                  status: 'Achieved',
                  disaggregationNote: '132 female committee leaders across 22 operationalized committees'
                }
              ],
              activities: [
                {
                  id: 'act-1.1.1',
                  outputId: 'out-1.1',
                  code: 'ACT-1.1.1',
                  title: 'Procure and distribute certified drought-hardy indigenous pasture seeds (Cenchrus ciliaris)',
                  description: 'Procure 12 metric tons of verified seed batches from regional dryland seed banks in Burao and Hargeisa.',
                  assignedTo: 'Mohamed Nur',
                  assignedRole: 'Field Agronomist',
                  location: 'Gabiley & Sheikh rangeland buffer sites',
                  region: 'Maroodi Jeex',
                  district: 'Gabiley',
                  startDate: '2024-03-01',
                  endDate: '2025-11-30',
                  status: 'Completed',
                  budgetAllocatedUSD: 68000,
                  budgetSpentUSD: 66400,
                  progressPercent: 100
                },
                {
                  id: 'act-1.1.2',
                  outputId: 'out-1.1',
                  code: 'ACT-1.1.2',
                  title: 'Construct semi-circular earthen bunds and stone check-dams in dry gully basins',
                  description: 'Cash-for-work engagement employing 450 pastoral youths and women during dry season to halt soil erosion.',
                  assignedTo: 'Eng. Ismail Jama Farah',
                  assignedRole: 'Lead Engineer',
                  location: 'Oodweyne seasonal drainage corridors',
                  region: 'Togdheer',
                  district: 'Oodweyne',
                  startDate: '2025-01-10',
                  endDate: '2026-03-15',
                  status: 'In Progress',
                  budgetAllocatedUSD: 145000,
                  budgetSpentUSD: 118200,
                  progressPercent: 82
                }
              ]
            },
            {
              id: 'out-1.2',
              code: 'OUT-1.2',
              title: 'Strategic pastoral water points (communal Berkads & shallow wells) retrofitted with silt-traps and solar pumping.',
              targetCompletionDate: '2026-05-15',
              indicators: [
                {
                  id: 'ind-1.2.1',
                  code: 'IND-1.2.1',
                  outputId: 'out-1.2',
                  description: 'Pastoral water points rehabilitated with solar-powered extraction and livestock drinking troughs',
                  unit: 'Water Points',
                  baseline: 0,
                  target: 18,
                  currentActual: 15,
                  midtermTarget: 12,
                  meansOfVerification: 'Water quality certification and Ministry of Water Resources Development handover deeds',
                  frequency: 'Bi-Annual',
                  dataCollectionMethod: 'Engineering site inspection and hydrogeological test reports',
                  status: 'On Track'
                }
              ],
              activities: [
                {
                  id: 'act-1.2.1',
                  outputId: 'out-1.2',
                  code: 'ACT-1.2.1',
                  title: 'Supply and commission 18 solar submersible pumping units with automated telemetry sensors',
                  description: 'Procure PV panels, pumps, and galvanized pipe fittings, trained local caretakers for maintenance.',
                  assignedTo: 'Ahmed Guleid',
                  assignedRole: 'Water Engineer',
                  location: 'Arabsiyo and Sheikh water corridors',
                  region: 'Sahil',
                  district: 'Sheikh',
                  startDate: '2024-06-01',
                  endDate: '2026-02-28',
                  status: 'Field Verified',
                  budgetAllocatedUSD: 220000,
                  budgetSpentUSD: 198500,
                  progressPercent: 90
                }
              ]
            }
          ]
        }
      ]
    },
    budgetLines: [
      {
        id: 'bl-101',
        code: 'BL-101',
        category: 'Personnel & Field Staff',
        description: 'Lead Project Manager, M&E Officer, and 4 Rangeland Field Agronomists (30 months)',
        unit: 'Staff-months',
        quantity: 150,
        unitCostUSD: 1800,
        totalAllocatedUSD: 270000,
        spentUSD: 234000,
        notes: 'Covers Hargeisa head office and Togdheer field staff salaries'
      },
      {
        id: 'bl-102',
        code: 'BL-102',
        category: 'Operational Logistics & Transport',
        description: 'Field 4x4 vehicle rental, fuel, and rough terrain maintenance across Togdheer & Maroodi Jeex',
        unit: 'Months',
        quantity: 30,
        unitCostUSD: 3200,
        totalAllocatedUSD: 96000,
        spentUSD: 84500
      },
      {
        id: 'bl-103',
        code: 'BL-103',
        category: 'Direct Program Inputs & Works',
        description: 'Indigenous grass seeds, gully check dams, earth bunding cash-for-work, solar water retrofits',
        unit: 'Lump Sum',
        quantity: 1,
        unitCostUSD: 1040000,
        totalAllocatedUSD: 1040000,
        spentUSD: 785000,
        notes: 'Largest program direct investment envelope'
      },
      {
        id: 'bl-104',
        code: 'BL-104',
        category: 'Community Training & Workshops',
        description: 'Community Rangeland Management Committee bylaws formulation & pasture rotation clinics',
        unit: 'Workshops',
        quantity: 36,
        unitCostUSD: 4100,
        totalAllocatedUSD: 147600,
        spentUSD: 112000
      },
      {
        id: 'bl-105',
        code: 'BL-105',
        category: 'Monitoring, Evaluation & Audits',
        description: 'Mid-term evaluation, quarterly satellite NDVI telemetry, external financial auditor',
        unit: 'Audit Packages',
        quantity: 5,
        unitCostUSD: 22000,
        totalAllocatedUSD: 110000,
        spentUSD: 65000
      },
      {
        id: 'bl-106',
        code: 'BL-106',
        category: 'Indirect & Secretariat Overheads',
        description: 'PENHA Secretariat institutional compliance, insurance, communications & security support (7%)',
        unit: 'Months',
        quantity: 30,
        unitCostUSD: 6213,
        totalAllocatedUSD: 186400,
        spentUSD: 60000
      }
    ],
    beneficiaries: {
      targetDirect: 24000,
      actualDirect: 19850,
      targetIndirect: 72000,
      actualIndirect: 58400,
      targetHouseholds: 4000,
      actualHouseholds: 3310,
      disaggregation: {
        pastoralistWomen: 10920,
        pastoralistMen: 8930,
        youthUnder25: 6450,
        elderlyHerders: 2180,
        personsWithDisabilities: 720,
        idpReturneeHouseholds: 610
      }
    },
    fieldEvidences: [
      {
        id: 'ev-01',
        projectId: 'proj-01',
        date: '2026-08-14',
        title: 'Community Pasture Enclosure Handover & Verification Mission in Sheikh District',
        location: 'Qoordheere Village, Sheikh District',
        district: 'Sheikh',
        region: 'Togdheer',
        gpsCoordinates: '9.9324° N, 45.1912° E',
        monitoredBy: 'Fadumo Abdi Warsame (Field Coordinator)',
        summary: 'Joint inspection with Somaliland Ministry of Agricultural Development verifying 650 hectares of enclosed rangeland now regenerated with mature Cenchrus ciliaris seed heads.',
        beneficiaryQuote: {
          text: 'Our livestock suffered deeply during the dry season of 2022. With PENHA assisting our elders and women to fence and reseed the Qoordheere rangeland, our milking goats now have abundant dry-season fodder reserves.',
          speakerName: 'Amina Jama Dualeh',
          role: 'Treasurer, Qoordheere Women Pastoralist Committee',
          village: 'Qoordheere, Sheikh'
        },
        verifiedStatus: 'Audited & Verified'
      },
      {
        id: 'ev-02',
        projectId: 'proj-01',
        date: '2026-07-02',
        title: 'Solar Submersible Water Pump Commissioning at Arabsiyo Berkad Complex',
        location: 'Ceel-Baxay, Arabsiyo Rural Area',
        district: 'Gabiley',
        region: 'Maroodi Jeex',
        gpsCoordinates: '9.6841° N, 43.7650° E',
        monitoredBy: 'Ahmed Guleid (Water Engineer)',
        summary: 'Successfully replaced diesel generator with 4.8kW solar photovoltaic array feeding 2 livestock troughs and 1 household water tap stand, reducing diesel fuel costs to zero for 420 pastoral families.',
        beneficiaryQuote: {
          text: 'We used to collect 50,000 SLSH each week just to buy diesel for the water pump. Now the sun pumps clean water from dawn to dusk without paying a single shilling.',
          speakerName: 'Hassan Rooble Egal',
          role: 'Village Elder & Water Committee Chairman',
          village: 'Ceel-Baxay'
        },
        verifiedStatus: 'Audited & Verified'
      }
    ],
    risks: [
      {
        id: 'rk-01',
        description: 'Late or erratic seasonal Gu/Deyr rainfall disrupting seed germination in unbunded pasture plots',
        riskLevel: 'Medium',
        category: 'Environmental / Drought',
        mitigationPlan: 'All grass reseeding is paired with deep contour water-harvesting bunds and moisture retaining micro-basins.',
        status: 'Active Monitoring'
      },
      {
        id: 'rk-02',
        description: 'Cross-boundary pastoral herd incursions into protected communal pasture reserves before seed maturation',
        riskLevel: 'High',
        category: 'Institutional & Governance',
        mitigationPlan: 'Signed customary Xeer agreements between neighboring clans and paid community peace scout surveillance.',
        status: 'Active Monitoring'
      }
    ],
    milestones: [
      {
        id: 'ms-01-1',
        projectId: 'proj-01',
        title: 'Baseline Socio-Ecological & GIS Rangeland Polygon Mapping',
        description: 'Establish baseline satellite NDVI metrics and register ground GPS polygons across 3,200 ha with Somaliland MoAD.',
        dueDate: '2024-04-30',
        completionDate: '2024-04-25',
        status: 'Achieved',
        category: 'M&E Review',
        assignedLead: 'Eng. Ismail Jama Farah',
        isCriticalCheckpoint: true,
        verificationCriteria: 'MoAD signed GIS map polygon archive & baseline survey sign-off',
        notes: 'Completed ahead of schedule with 100% boundary consensus.'
      },
      {
        id: 'ms-01-2',
        projectId: 'proj-01',
        title: 'Procurement & Quality Certification of 12MT Indigenous Pasture Seeds',
        description: 'Bulk procurement and germination testing of Cenchrus ciliaris and Chrysopogon plumulosus seed lots.',
        dueDate: '2024-07-31',
        completionDate: '2024-07-20',
        status: 'Achieved',
        category: 'Procurement & Works',
        assignedLead: 'Mohamed Nur (Agronomist)',
        isCriticalCheckpoint: false,
        verificationCriteria: 'Seed laboratory germination test certificates (>85% viability)',
        notes: 'Quality verified at Burao dryland research station.'
      },
      {
        id: 'ms-01-3',
        projectId: 'proj-01',
        title: 'Formation & Legal Charter Ratification of 24 CRMCs (40% Women)',
        description: 'Community Rangeland Management Committees established with customary bylaws signed by village elders and district commissioners.',
        dueDate: '2025-01-15',
        completionDate: '2025-01-10',
        status: 'Achieved',
        category: 'Community Handover',
        assignedLead: 'Fadumo Abdi Warsame',
        isCriticalCheckpoint: true,
        verificationCriteria: '24 signed committee charters with women quota verification',
        notes: '132 female committee leaders actively seated.'
      },
      {
        id: 'ms-01-4',
        projectId: 'proj-01',
        title: 'Construction of 3,200ha Soil-Bunding & Contour Check-Dams',
        description: 'Cash-for-work completion of semi-circular micro-catchments and gully stone check-dams in Gabiley and Sheikh buffer zones.',
        dueDate: '2025-09-30',
        completionDate: '2025-09-28',
        status: 'Achieved',
        category: 'Key Delivery',
        assignedLead: 'Eng. Ismail Jama Farah',
        isCriticalCheckpoint: true,
        verificationCriteria: 'Drone aerial mosaic verification and engineering completion sign-off',
        notes: '2,750 ha certified by MoAD engineers.'
      },
      {
        id: 'ms-01-5',
        projectId: 'proj-01',
        title: 'Solar Water Retrofitting & Pump Telemetry Commissioning (18 Points)',
        description: 'Install Grundfos solar submersible pumps and smart digital flow telemetry across strategic communal pastoral berkads.',
        dueDate: '2026-05-15',
        status: 'In Progress',
        category: 'Key Delivery',
        assignedLead: 'Eng. Ismail Jama Farah',
        isCriticalCheckpoint: true,
        verificationCriteria: 'Ministry of Water commissioning certificates & water quality test deeds',
        notes: '15 of 18 water points operational; final 3 under installation.'
      },
      {
        id: 'ms-01-6',
        projectId: 'proj-01',
        title: 'Independent Mid-Term Evaluation & EU Third-Party Field Audit',
        description: 'Mandatory EU Annex III verification audit and external pastoralist resilience impact evaluation.',
        dueDate: '2026-10-15',
        status: 'Pending',
        category: 'M&E Review',
        assignedLead: 'Eng. Ismail Jama Farah',
        isCriticalCheckpoint: true,
        verificationCriteria: 'External evaluator published report & EU clearance letter',
        notes: 'Auditor terms of reference drafted and approved by EU delegation.'
      },
      {
        id: 'ms-01-7',
        projectId: 'proj-01',
        title: 'Final Communal Grazing Asset Handover to Village Councils',
        description: 'Formal transition of rehabilitated pasture reserves and solar equipment to community rangeland trusts.',
        dueDate: '2026-11-20',
        status: 'Pending',
        category: 'Community Handover',
        assignedLead: 'Fadumo Abdi Warsame',
        isCriticalCheckpoint: false,
        verificationCriteria: 'Signed district transfer protocols & operational sustainability pacts',
        notes: 'Scheduled alongside end-of-grant closeout forum.'
      }
    ]
  },
  {
    id: 'proj-02',
    code: 'PENHA-SOM-2025-DAN02',
    title: 'Pastoralist Women Economic Empowerment & Milk Value Chain Cooperatives in Sahil & Sanaag',
    shortTitle: 'Pastoral Women Dairy & Resin Cooperatives',
    donorId: 'donor-danida',
    donorName: 'Danida (Denmark)',
    grantAgreementCode: 'DAN-SOM-10492-W',
    pillar: 'Pastoralist Women Livelihoods',
    status: 'Active',
    startDate: '2024-04-01',
    endDate: '2026-10-31',
    reportingFrequency: 'Bi-Annual',
    nextDonorReportDate: '2026-10-31',
    targetRegions: ['Sahil', 'Sanaag'],
    targetDistricts: ['Berbera', 'Sheikh', 'Erigavo', 'Maydh'],
    leadProjectManager: {
      name: 'Sahra Hassan Dirie',
      role: 'Gender & Rural Enterprise Lead',
      email: 's.dirie@penha-hargeisa.org',
      phone: '+252 63 448 9120'
    },
    fieldCoordinator: {
      name: 'Khadra Omer Nuur',
      baseOffice: 'Hargeisa Head Office',
      phone: '+252 63 417 6502'
    },
    budgetSummary: {
      totalGrantUSD: 920000,
      disbursedUSD: 880000,
      expendituresUSD: 846400,
      commitmentsUSD: 42000,
      remainingBalanceUSD: 73600,
      burnRatePercent: 92.0
    },
    logframe: {
      impactGoal: 'Empower 8,400 pastoralist women through cooperative camel milk chilling centers, clean solar milk transport, and sustainable dryland frankincense harvesting.',
      outcomes: [
        {
          id: 'oc-2-1',
          code: 'OC-1',
          title: 'Women pastoralists increase their monthly household income through hygienic camel milk aggregation and reduced spoilage.',
          outputs: [
            {
              id: 'out-2-1',
              code: 'OUT-1.1',
              title: '3 solar-powered communal milk chilling collection hubs established along the Berbera-Sheikh livestock trade corridor.',
              targetCompletionDate: '2025-12-15',
              indicators: [
                {
                  id: 'ind-2.1.1',
                  code: 'IND-1.1.1',
                  outputId: 'out-2-1',
                  description: 'Daily liters of hygienic camel and goat milk processed and sold through solar cooling hubs',
                  unit: 'Liters/Day',
                  baseline: 400,
                  target: 3500,
                  currentActual: 3200,
                  midtermTarget: 2200,
                  meansOfVerification: 'Cooperative digital milk intake logbooks and mobile money (Zaad/Sahal) transaction receipts',
                  frequency: 'Monthly',
                  dataCollectionMethod: 'Digital intake scales and automated SMS reconciliation',
                  status: 'On Track',
                  disaggregationNote: '100% women-owned micro-enterprise suppliers'
                },
                {
                  id: 'ind-2.1.2',
                  code: 'IND-1.1.2',
                  outputId: 'out-2-1',
                  description: 'Village Savings and Loan Associations (VSLAs) formed and actively revolving capital',
                  unit: 'VSLA Groups',
                  baseline: 0,
                  target: 50,
                  currentActual: 48,
                  midtermTarget: 30,
                  meansOfVerification: 'VSLA passbooks and PENHA community banking audit ledgers',
                  frequency: 'Quarterly',
                  dataCollectionMethod: 'Quarterly field audits of cashboxes and passbooks',
                  status: 'Achieved'
                }
              ],
              activities: [
                {
                  id: 'act-2.1.1',
                  outputId: 'out-2-1',
                  code: 'ACT-1.1.1',
                  title: 'Install 3 heavy-duty solar cold storage tanks (1,000L capacity each) at Sheikh and Berbera aggregation points',
                  description: 'Procured stainless steel dairy tanks with R404a solar DC compressor units.',
                  assignedTo: 'Sahra Hassan Dirie',
                  assignedRole: 'Project Manager',
                  location: 'Sheikh and Hudiso milk collection centers',
                  region: 'Sahil',
                  district: 'Sheikh',
                  startDate: '2024-05-10',
                  endDate: '2025-04-30',
                  status: 'Completed',
                  budgetAllocatedUSD: 165000,
                  budgetSpentUSD: 162800,
                  progressPercent: 100
                },
                {
                  id: 'act-2.1.2',
                  outputId: 'out-2-1',
                  code: 'ACT-1.1.2',
                  title: 'Train 1,200 women pastoralist producers in California Mastitis Test (CMT), clean milk handling, and food safety',
                  description: 'Hands-on practical milk hygiene modules delivered in Somali dialect.',
                  assignedTo: 'Dr. Deqa Yasin',
                  assignedRole: 'Dairy Quality Specialist',
                  location: 'Sahil rural milk centers',
                  region: 'Sahil',
                  district: 'Berbera',
                  startDate: '2024-07-01',
                  endDate: '2026-03-31',
                  status: 'In Progress',
                  budgetAllocatedUSD: 85000,
                  budgetSpentUSD: 72400,
                  progressPercent: 85
                }
              ]
            }
          ]
        }
      ]
    },
    budgetLines: [
      {
        id: 'bl-201',
        code: 'BL-201',
        category: 'Personnel & Field Staff',
        description: 'Gender Specialist, Cooperative Mobilizer, and 2 Dairy Quality Officers',
        unit: 'Staff-months',
        quantity: 90,
        unitCostUSD: 1750,
        totalAllocatedUSD: 157500,
        spentUSD: 138000
      },
      {
        id: 'bl-202',
        code: 'BL-202',
        category: 'Direct Program Inputs & Works',
        description: '3 solar milk chilling hubs, stainless steel milk churns, and VSLA seed capital kits',
        unit: 'Package',
        quantity: 1,
        unitCostUSD: 420000,
        totalAllocatedUSD: 420000,
        spentUSD: 362400
      },
      {
        id: 'bl-203',
        code: 'BL-203',
        category: 'Community Training & Workshops',
        description: 'Cooperative financial literacy, food safety, and frankincense value-addition clinics',
        unit: 'Sessions',
        quantity: 28,
        unitCostUSD: 3600,
        totalAllocatedUSD: 100800,
        spentUSD: 84000
      },
      {
        id: 'bl-204',
        code: 'BL-204',
        category: 'Operational Logistics & Transport',
        description: 'Insulated milk transport logistics and field supervision vehicles in Sahil and Sanaag',
        unit: 'Months',
        quantity: 30,
        unitCostUSD: 2800,
        totalAllocatedUSD: 84000,
        spentUSD: 69800
      },
      {
        id: 'bl-205',
        code: 'BL-205',
        category: 'Indirect & Secretariat Overheads',
        description: 'PENHA organizational oversight, audit and institutional monitoring (7%)',
        unit: 'Lump Sum',
        quantity: 1,
        unitCostUSD: 64400,
        totalAllocatedUSD: 64400,
        spentUSD: 48000
      }
    ],
    beneficiaries: {
      targetDirect: 8400,
      actualDirect: 7650,
      targetIndirect: 25000,
      actualIndirect: 22800,
      targetHouseholds: 1400,
      actualHouseholds: 1275,
      disaggregation: {
        pastoralistWomen: 6850,
        pastoralistMen: 800,
        youthUnder25: 2900,
        elderlyHerders: 450,
        personsWithDisabilities: 210,
        idpReturneeHouseholds: 390
      }
    },
    fieldEvidences: [
      {
        id: 'ev-03',
        projectId: 'proj-02',
        date: '2026-08-29',
        title: 'Sheikh Solar Milk Chilling Center First-Year Operations Audit',
        location: 'Sheikh Town Outskirts',
        district: 'Sheikh',
        region: 'Sahil',
        gpsCoordinates: '9.9388° N, 45.1889° E',
        monitoredBy: 'Sahra Hassan Dirie',
        summary: 'Certified zero milk spoilage incidents over the last 90 days of peak summer heat. Daily turnover reached 1,800L of camel milk with direct payment to 320 women suppliers via mobile money.',
        beneficiaryQuote: {
          text: 'Before this chilling hub opened, when the road to Berbera was blocked or heat was intense, our milk turned sour and we dumped it on the sand. Now every drop is chilled, weighed, and paid for on my phone before midday.',
          speakerName: 'Halimo Awale Guudle',
          role: 'Chairlady, Danwadaag Pastoralist Milk Cooperative',
          village: 'Sheikh District'
        },
        verifiedStatus: 'Audited & Verified'
      }
    ],
    risks: [
      {
        id: 'rk-03',
        description: 'Grid power outages or solar inverter damage during sandstorm winds',
        riskLevel: 'Low',
        category: 'Environmental / Drought',
        mitigationPlan: 'Heavy-duty dust sealed IP67 enclosures and backup auxiliary diesel generator on standby.',
        status: 'Mitigated'
      }
    ],
    milestones: [
      {
        id: 'ms-02-1',
        projectId: 'proj-02',
        title: 'Baseline Gender Assessment & Cooperative Membership Registry',
        description: 'Enumerate and verify 320 pastoralist women milk producers and formalize VSLA credit groups in Sahil & Sanaag.',
        dueDate: '2024-06-30',
        completionDate: '2024-06-20',
        status: 'Achieved',
        category: 'Field Checkpoint',
        assignedLead: 'Sahra Hassan Dirie',
        isCriticalCheckpoint: false,
        verificationCriteria: 'Signed member rosters and VSLA passbook baseline audit',
        notes: '320 pastoralist women enrolled across 3 district hubs.'
      },
      {
        id: 'ms-02-2',
        projectId: 'proj-02',
        title: 'Procurement & Installation of 3 Solar Milk Chilling Centers',
        description: 'Complete civil works, solar PV arrays, and refrigerated bulk tank commissioning in Sheikh, Berbera, and Erigavo.',
        dueDate: '2025-03-31',
        completionDate: '2025-03-25',
        status: 'Achieved',
        category: 'Key Delivery',
        assignedLead: 'Khadra Omer Nuur',
        isCriticalCheckpoint: true,
        verificationCriteria: 'Refrigeration temperature data logs (<4°C continuous) & ministry inspection sign-offs',
        notes: 'All 3 chilling hubs operational and chilling >1,800L daily.'
      },
      {
        id: 'ms-02-3',
        projectId: 'proj-02',
        title: 'Food Hygiene Certification & Quality Testing Protocol Setup',
        description: 'Deploy electronic milk lactoscan analyzers, somatic cell counters, and hygiene certifications with Ministry of Livestock.',
        dueDate: '2025-08-31',
        completionDate: '2025-08-20',
        status: 'Achieved',
        category: 'Key Delivery',
        assignedLead: 'Sahra Hassan Dirie',
        isCriticalCheckpoint: true,
        verificationCriteria: 'Ministry quality compliance certificates & zero-spoilage QA logbooks',
        notes: 'Pasteurization readiness standard reached.'
      },
      {
        id: 'ms-02-4',
        projectId: 'proj-02',
        title: 'Sustainable Frankincense Resin Value Chain & Direct Exporter Offtake Agreement',
        description: 'Establish ethical tapping standards in Sanaag highland forests and sign fair-trade export contracts with certified aroma buyers.',
        dueDate: '2026-06-30',
        completionDate: '2026-06-15',
        status: 'Achieved',
        category: 'Donor Deliverable',
        assignedLead: 'Sahra Hassan Dirie',
        isCriticalCheckpoint: true,
        verificationCriteria: 'Executed commercial purchase agreements & fair-trade certification audit',
        notes: 'Direct export contract secured at $18.50/kg premium price.'
      },
      {
        id: 'ms-02-5',
        projectId: 'proj-02',
        title: 'Final Danida Results-Based Management (RBM) Audit & Cooperative Autonomy Handover',
        description: 'Transition cooperative governance, financial accounts, and solar equipment assets to independent women executive boards.',
        dueDate: '2026-10-25',
        status: 'In Progress',
        category: 'Community Handover',
        assignedLead: 'Sahra Hassan Dirie',
        isCriticalCheckpoint: true,
        verificationCriteria: 'External Danida RBM audit report & signed asset transfer deeds',
        notes: 'Cooperative financial audit underway; final governance forum in October.'
      }
    ]
  },
  {
    id: 'proj-03',
    code: 'PENHA-SOM-2025-FCDO03',
    title: 'Emergency Drought Early-Action & Solarized Livestock Boreholes in Eastern Rangelands (Sool/Sanaag)',
    shortTitle: 'Eastern Rangelands Drought & Solar Boreholes',
    donorId: 'donor-fcdo',
    donorName: 'FCDO (United Kingdom)',
    grantAgreementCode: 'FCDO-BHA-SOM-8812',
    pillar: 'Climate Resilience & Drought Early Action',
    status: 'Active',
    startDate: '2024-03-01',
    endDate: '2026-08-31',
    reportingFrequency: 'Monthly',
    nextDonorReportDate: '2026-10-05',
    targetRegions: ['Sool', 'Sanaag', 'Togdheer'],
    targetDistricts: ['Ainabo', 'Taleh', 'Erigavo', 'Burao'],
    leadProjectManager: {
      name: 'Eng. Abdillahi Warsame Muse',
      role: 'Head of Humanitarian Operations & Water Systems',
      email: 'a.warsame@penha-hargeisa.org',
      phone: '+252 63 440 3319'
    },
    fieldCoordinator: {
      name: 'Yusuf Hassan Hirsi',
      baseOffice: 'Burao Sub-office',
      phone: '+252 63 449 0184'
    },
    budgetSummary: {
      totalGrantUSD: 2100000,
      disbursedUSD: 1600000,
      expendituresUSD: 1420000,
      commitmentsUSD: 110000,
      remainingBalanceUSD: 570000,
      burnRatePercent: 67.62
    },
    logframe: {
      impactGoal: 'Mitigate severe drought mortality for 350,000 head of pastoralist livestock and 32,000 pastoral persons across fragile eastern pasture belts through solar boreholes and emergency fodder banks.',
      outcomes: [
        {
          id: 'oc-3-1',
          code: 'OC-1',
          title: 'Critical high-yield strategic boreholes converted to solar power and protected against dry-season pump failure.',
          outputs: [
            {
              id: 'out-3-1',
              code: 'OUT-1.1',
              title: '14 deep strategic boreholes equipped with hybrid solar PV pumping arrays and automated flow sensors.',
              targetCompletionDate: '2025-11-30',
              indicators: [
                {
                  id: 'ind-3.1.1',
                  code: 'IND-1.1.1',
                  outputId: 'out-3-1',
                  description: 'Deep strategic boreholes rehabilitated with solar hybrid systems pumping >15m³/hour',
                  unit: 'Boreholes',
                  baseline: 0,
                  target: 14,
                  currentActual: 11,
                  midtermTarget: 8,
                  meansOfVerification: 'Pumping step-test telemetry logs and Ministry of Water commissioning sign-offs',
                  frequency: 'Monthly',
                  dataCollectionMethod: 'IoT cellular flowmeters and bi-monthly engineering inspection',
                  status: 'On Track'
                },
                {
                  id: 'ind-3.1.2',
                  code: 'IND-1.1.2',
                  outputId: 'out-3-1',
                  description: 'Metric tons of certified nutritious emergency fodder stored in community reserves for critical dry periods',
                  unit: 'Metric Tons',
                  baseline: 0,
                  target: 800,
                  currentActual: 620,
                  midtermTarget: 400,
                  meansOfVerification: 'Warehouse stock intake manifests and community fodder committee distribution logs',
                  frequency: 'Monthly',
                  dataCollectionMethod: 'Physical inventory audit at Ainabo and Burao reserve warehouses',
                  status: 'On Track'
                }
              ],
              activities: [
                {
                  id: 'act-3.1.1',
                  outputId: 'out-3-1',
                  code: 'ACT-1.1.1',
                  title: 'Deep borehole electro-mechanical overhauls and Grundfos solar inverter installations in Ainabo & Taleh',
                  description: 'Install 15kW to 22kW solar generator systems with variable frequency drives.',
                  assignedTo: 'Eng. Abdillahi Warsame Muse',
                  assignedRole: 'Lead Water Engineer',
                  location: 'Ainabo, Wadaamagoo & Taleh water stations',
                  region: 'Sool',
                  district: 'Ainabo',
                  startDate: '2024-04-15',
                  endDate: '2025-12-30',
                  status: 'In Progress',
                  budgetAllocatedUSD: 680000,
                  budgetSpentUSD: 512000,
                  progressPercent: 78
                },
                {
                  id: 'act-3.1.2',
                  outputId: 'out-3-1',
                  code: 'ACT-1.1.2',
                  title: 'Procure and stockpile emergency alfalfa and Rhodes grass hay bales in regional fodder banks',
                  description: 'Strategic contracts with irrigated fodder farmers in Wajaale and Gabiley for dry-season reserve.',
                  assignedTo: 'Yusuf Hassan Hirsi',
                  assignedRole: 'Field Coordinator',
                  location: 'Ainabo & Burao regional fodder reserves',
                  region: 'Togdheer',
                  district: 'Burao',
                  startDate: '2024-08-01',
                  endDate: '2026-06-30',
                  status: 'In Progress',
                  budgetAllocatedUSD: 410000,
                  budgetSpentUSD: 335000,
                  progressPercent: 82
                }
              ]
            }
          ]
        }
      ]
    },
    budgetLines: [
      {
        id: 'bl-301',
        code: 'BL-301',
        category: 'Direct Program Inputs & Works',
        description: 'Solar pumps, borehole casing, pipes, automated sensors, water troughs, and fodder procurement',
        unit: 'Lot',
        quantity: 1,
        unitCostUSD: 1390000,
        totalAllocatedUSD: 1390000,
        spentUSD: 994000
      },
      {
        id: 'bl-302',
        code: 'BL-302',
        category: 'Personnel & Field Staff',
        description: 'Humanitarian Ops Lead, 2 Hydrogeological Technicians, Emergency Logistics Officer',
        unit: 'Staff-months',
        quantity: 120,
        unitCostUSD: 1900,
        totalAllocatedUSD: 228000,
        spentUSD: 172000
      },
      {
        id: 'bl-303',
        code: 'BL-303',
        category: 'Operational Logistics & Transport',
        description: 'Heavy flatbed trucking of solar equipment and hay bales to remote Sool rangelands',
        unit: 'Trips/Months',
        quantity: 1,
        unitCostUSD: 185000,
        totalAllocatedUSD: 185000,
        spentUSD: 138000
      },
      {
        id: 'bl-304',
        code: 'BL-304',
        category: 'Community Training & Workshops',
        description: 'Borehole Water Management Committee tariff setting & pump maintenance technician certification',
        unit: 'Courses',
        quantity: 14,
        unitCostUSD: 3500,
        totalAllocatedUSD: 49000,
        spentUSD: 32000
      },
      {
        id: 'bl-305',
        code: 'BL-305',
        category: 'Monitoring, Evaluation & Audits',
        description: 'Real-time telemetry validation, FCDO third-party monitoring (TPM) verification missions',
        unit: 'Missions',
        quantity: 8,
        unitCostUSD: 12750,
        totalAllocatedUSD: 102000,
        spentUSD: 46000
      },
      {
        id: 'bl-306',
        code: 'BL-306',
        category: 'Indirect & Secretariat Overheads',
        description: 'PENHA Hargeisa & London Secretariat administrative coordination (7%)',
        unit: 'Lump Sum',
        quantity: 1,
        unitCostUSD: 146000,
        totalAllocatedUSD: 146000,
        spentUSD: 38000
      }
    ],
    beneficiaries: {
      targetDirect: 32000,
      actualDirect: 26400,
      targetIndirect: 96000,
      actualIndirect: 78000,
      targetHouseholds: 5300,
      actualHouseholds: 4400,
      disaggregation: {
        pastoralistWomen: 14200,
        pastoralistMen: 12200,
        youthUnder25: 8600,
        elderlyHerders: 3100,
        personsWithDisabilities: 940,
        idpReturneeHouseholds: 1120
      }
    },
    fieldEvidences: [
      {
        id: 'ev-04',
        projectId: 'proj-03',
        date: '2026-09-08',
        title: 'Ainabo Central Deep Borehole Solar Commissioning & Flowrate Benchmark',
        location: 'Ainabo Town Borehole 2',
        district: 'Ainabo',
        region: 'Sool',
        gpsCoordinates: '8.8167° N, 46.4167° E',
        monitoredBy: 'Eng. Abdillahi Warsame Muse',
        summary: 'Commissioned 18.5kW Lorentz solar pumping system at 180m depth. Measured clean water delivery rate of 21,500 liters/hour, serving 14,000 nomadic pastoralists and 60,000 camels and goats during peak heat.',
        beneficiaryQuote: {
          text: 'During the last drought, the diesel generator broke down twice and 4,000 animals died waiting in the dust. With this solar installation, water flows smoothly into the 60-meter troughs every single morning.',
          speakerName: 'Guleid Farah Shire',
          role: 'Ainabo Water User Association Secretary',
          village: 'Ainabo Center'
        },
        verifiedStatus: 'Audited & Verified'
      }
    ],
    risks: [
      {
        id: 'rk-04',
        description: 'Fuel and transport price spikes for heavy logistics along the Burao-Ainabo corridor',
        riskLevel: 'Medium',
        category: 'Market & Price Fluctuations',
        mitigationPlan: 'Bulk framework contracts with pre-negotiated freight rate ceilings for all humanitarian supplies.',
        status: 'Mitigated'
      }
    ],
    milestones: [
      {
        id: 'ms-03-1',
        projectId: 'proj-03',
        title: 'Hydrogeological Step-Testing & Aquifer Yield Mapping in Sool/Sanaag',
        description: 'Comprehensive geophysical scanning and continuous 72-hour pumping step tests across 14 target borehole sites.',
        dueDate: '2024-05-15',
        completionDate: '2024-05-10',
        status: 'Achieved',
        category: 'Field Checkpoint',
        assignedLead: 'Eng. Abdillahi Warsame Muse',
        isCriticalCheckpoint: true,
        verificationCriteria: 'Ministry of Water certified hydrogeological aquifer logs & yield curves',
        notes: 'Aquifer replenishment verified adequate for solar pumping.'
      },
      {
        id: 'ms-03-2',
        projectId: 'proj-03',
        title: 'Emergency Frontloaded Procurement of 14 Grundfos Solar Inverters & DC Pumps',
        description: 'International procurement and customs clearance of submersible pumps, stainless risers, and solar inverters.',
        dueDate: '2024-09-30',
        completionDate: '2024-09-20',
        status: 'Achieved',
        category: 'Procurement & Works',
        assignedLead: 'Yusuf Hassan Hirsi',
        isCriticalCheckpoint: true,
        verificationCriteria: 'Customs release bill of lading & warehouse receiving inspection tally',
        notes: 'Delivered to Burao central logistics depot without transit damage.'
      },
      {
        id: 'ms-03-3',
        projectId: 'proj-03',
        title: 'Commissioning of 11 Strategic Deep Solar Boreholes with IoT Flowmeters',
        description: 'Civil works, solar array mounting, security fencing, and cellular flowmeter telemetry installation.',
        dueDate: '2025-06-30',
        completionDate: '2025-06-18',
        status: 'Achieved',
        category: 'Key Delivery',
        assignedLead: 'Eng. Abdillahi Warsame Muse',
        isCriticalCheckpoint: true,
        verificationCriteria: 'Telemetry live feed online & Ministry of Water commissioning deed',
        notes: '11 stations streaming real-time water extraction data.'
      },
      {
        id: 'ms-03-4',
        projectId: 'proj-03',
        title: 'Emergency Fodder Reserve Stockpiling (620MT delivered)',
        description: 'Procure, transport, and stack 800MT of dryland Rhodes grass hay bales into Ainabo & Taleh community reserves.',
        dueDate: '2025-12-15',
        completionDate: '2025-12-10',
        status: 'Achieved',
        category: 'Key Delivery',
        assignedLead: 'Yusuf Hassan Hirsi',
        isCriticalCheckpoint: false,
        verificationCriteria: 'Warehouse stock intake ledger and moisture quality test reports',
        notes: '620MT secured in warehouse; balance in procurement pipeline.'
      },
      {
        id: 'ms-03-5',
        projectId: 'proj-03',
        title: 'Final 3 High-Yield Solar Borehole Retrofits in Taleh & Remote Buffer Zones',
        description: 'Deploy deep well pumping equipment in high-stress drought zones to ensure non-stop livestock watering.',
        dueDate: '2026-04-15',
        status: 'In Progress',
        category: 'Key Delivery',
        assignedLead: 'Eng. Abdillahi Warsame Muse',
        isCriticalCheckpoint: true,
        verificationCriteria: 'Engineering pumping sign-off and community water committee handover',
        notes: 'Civil construction 80% complete; inverter testing scheduled.'
      },
      {
        id: 'ms-03-6',
        projectId: 'proj-03',
        title: 'FCDO Final Humanitarian Value for Money (VfM) Return & Asset Handover',
        description: 'Full cost-efficiency benchmark submission and transfer of water facilities to regional Water Authorities.',
        dueDate: '2026-08-20',
        status: 'Pending',
        category: 'Donor Deliverable',
        assignedLead: 'Eng. Abdillahi Warsame Muse',
        isCriticalCheckpoint: true,
        verificationCriteria: 'FCDO final grant sign-off and signed regional water transfer pact',
        notes: 'Closeout roadmap approved with local administration.'
      }
    ]
  },
  {
    id: 'proj-04',
    code: 'PENHA-SOM-2025-FAO04',
    title: 'Sustainable Dryland Soil & Moisture Conservation in Agro-Pastoral Corridors',
    shortTitle: 'Agro-Pastoral Dryland Farming & Moisture Conservation',
    donorId: 'donor-fao',
    donorName: 'FAO Somalia/Somaliland',
    grantAgreementCode: 'UN-FAO-SOM-6019',
    pillar: 'Natural Dryland Resins & Value Chains',
    status: 'Active',
    startDate: '2024-05-01',
    endDate: '2026-12-15',
    reportingFrequency: 'Quarterly',
    nextDonorReportDate: '2026-11-15',
    targetRegions: ['Awdal', 'Maroodi Jeex'],
    targetDistricts: ['Borama', 'Dilla', 'Gabiley', 'Wajaale'],
    leadProjectManager: {
      name: 'Dr. Marian Abdirahman',
      role: 'Agro-Pastoral Systems Coordinator',
      email: 'm.abdirahman@penha-hargeisa.org',
      phone: '+252 63 443 7812'
    },
    fieldCoordinator: {
      name: 'Mustafe Ismail Nur',
      baseOffice: 'Borama Sub-office (Awdal)',
      phone: '+252 63 410 4492'
    },
    budgetSummary: {
      totalGrantUSD: 640000,
      disbursedUSD: 550000,
      expendituresUSD: 498000,
      commitmentsUSD: 35000,
      remainingBalanceUSD: 107000,
      burnRatePercent: 77.81
    },
    logframe: {
      impactGoal: 'Improve agro-pastoral food security and soil moisture retention for 6,200 smallholder agro-pastoral households in the breadbasket plains of Awdal and Maroodi Jeex.',
      outcomes: [
        {
          id: 'oc-4-1',
          code: 'OC-1',
          title: 'Agro-pastoralists adopt climate-smart soil ripping, contour tillage, and drought-tolerant seed varieties.',
          outputs: [
            {
              id: 'out-4-1',
              code: 'OUT-1.1',
              title: '1,800 hectares of rainfed farmland contoured with vegetative grass strips and moisture traps.',
              targetCompletionDate: '2026-03-31',
              indicators: [
                {
                  id: 'ind-4.1.1',
                  code: 'IND-1.1.1',
                  outputId: 'out-4-1',
                  description: 'Hectares cultivated using soil moisture conservation and drought-tolerant certified sorghum seeds',
                  unit: 'Hectares',
                  baseline: 200,
                  target: 1800,
                  currentActual: 1540,
                  midtermTarget: 1000,
                  meansOfVerification: 'Farmer Field School harvest assessment surveys and FAO remote sensing crop health verification',
                  frequency: 'Quarterly',
                  dataCollectionMethod: 'Crop cut yield samplings and GPS farm register',
                  status: 'On Track'
                }
              ],
              activities: [
                {
                  id: 'act-4.1.1',
                  outputId: 'out-4-1',
                  code: 'ACT-1.1.1',
                  title: 'Distribute certified drought-tolerant El-Gadde sorghum and cowpea foundation seeds',
                  description: 'Reached 2,400 farmers with seed packages and bio-fertilizer inoculants.',
                  assignedTo: 'Dr. Marian Abdirahman',
                  assignedRole: 'Agro-Pastoral Systems Coordinator',
                  location: 'Dilla, Borama and Gabiley farming zones',
                  region: 'Awdal',
                  district: 'Dilla',
                  startDate: '2024-06-01',
                  endDate: '2025-09-30',
                  status: 'Completed',
                  budgetAllocatedUSD: 110000,
                  budgetSpentUSD: 108500,
                  progressPercent: 100
                }
              ]
            }
          ]
        }
      ]
    },
    budgetLines: [
      {
        id: 'bl-401',
        code: 'BL-401',
        category: 'Direct Program Inputs & Works',
        description: 'Certified foundation seeds, animal-drawn ripping implements, bio-pesticides, nursery tools',
        unit: 'Lot',
        quantity: 1,
        unitCostUSD: 330000,
        totalAllocatedUSD: 330000,
        spentUSD: 278000
      },
      {
        id: 'bl-402',
        code: 'BL-402',
        category: 'Personnel & Field Staff',
        description: 'Agro-Pastoral Coordinator and 3 Extension Officers in Awdal and Maroodi Jeex',
        unit: 'Staff-months',
        quantity: 72,
        unitCostUSD: 1650,
        totalAllocatedUSD: 118800,
        spentUSD: 94000
      },
      {
        id: 'bl-403',
        code: 'BL-403',
        category: 'Community Training & Workshops',
        description: 'Farmer Field Schools (FFS) on dryland contour tillage and post-harvest grain storage',
        unit: 'Sessions',
        quantity: 24,
        unitCostUSD: 3200,
        totalAllocatedUSD: 76800,
        spentUSD: 62000
      },
      {
        id: 'bl-404',
        code: 'BL-404',
        category: 'Operational Logistics & Transport',
        description: 'Agro-extension transport and farmer demonstration site field days',
        unit: 'Months',
        quantity: 24,
        unitCostUSD: 1800,
        totalAllocatedUSD: 43200,
        spentUSD: 38000
      },
      {
        id: 'bl-405',
        code: 'BL-405',
        category: 'Indirect & Secretariat Overheads',
        description: 'Overheads and UN LOA audit management (11%)',
        unit: 'Lump Sum',
        quantity: 1,
        unitCostUSD: 71200,
        totalAllocatedUSD: 71200,
        spentUSD: 26000
      }
    ],
    beneficiaries: {
      targetDirect: 6200,
      actualDirect: 5380,
      targetIndirect: 18000,
      actualIndirect: 15600,
      targetHouseholds: 1030,
      actualHouseholds: 896,
      disaggregation: {
        pastoralistWomen: 2680,
        pastoralistMen: 2700,
        youthUnder25: 1820,
        elderlyHerders: 420,
        personsWithDisabilities: 180,
        idpReturneeHouseholds: 290
      }
    },
    fieldEvidences: [
      {
        id: 'ev-05',
        projectId: 'proj-04',
        date: '2026-08-11',
        title: 'Dilla District Post-Harvest Crop Cutting Evaluation',
        location: 'Dilla Agricultural Belt',
        district: 'Dilla',
        region: 'Awdal',
        gpsCoordinates: '9.8512° N, 43.4320° E',
        monitoredBy: 'Mustafe Ismail Nur',
        summary: 'Measured a 42% average increase in grain yield per hectare in contoured moisture-retention plots compared to conventional un-ripped controls during the low-rainfall Gu season.',
        beneficiaryQuote: {
          text: 'The dry spell came for three weeks when the crops were flowering. My neighbors fields dried up, but because our field had contour ridges holding the water in the soil, our sorghum yielded 18 sacks of grain.',
          speakerName: 'Dahir Obsiiye Geedi',
          role: 'Lead Farmer, Dilla Agro-Pastoral Cooperative',
          village: 'Dilla Outskirts'
        },
        verifiedStatus: 'Audited & Verified'
      }
    ],
    risks: [
      {
        id: 'rk-05',
        description: 'Locust swarms or armyworm outbreaks impacting rainfed dryland cereals',
        riskLevel: 'Medium',
        category: 'Environmental / Drought',
        mitigationPlan: 'Community pest scouts trained with Somaliland Ministry of Agricultural Development mobile reporting app.',
        status: 'Active Monitoring',
        likelihood: 'Possible',
        impact: 'Moderate',
        humanitarianImpactArea: 'Food & Fodder Delivery',
        assignedFocalPoint: 'Mustafe Ismail Nur',
        dateIdentified: '2024-06-15',
        earlyWarningTriggers: 'FAO Desert Locust Early Warning bulletins and regional swarming alerts'
      }
    ],
    milestones: [
      {
        id: 'ms-04-1',
        projectId: 'proj-04',
        title: 'Agro-Ecological Baseline Survey & FFS Formation',
        description: 'Conduct soil moisture profiling and establish 24 Farmer Field Schools in Dilla, Borama, and Gabiley.',
        dueDate: '2024-07-31',
        completionDate: '2024-07-25',
        status: 'Achieved',
        category: 'M&E Review',
        assignedLead: 'Dr. Marian Abdirahman',
        isCriticalCheckpoint: false,
        verificationCriteria: 'FFS registration deeds & baseline yield survey report',
        notes: '24 groups formed with 480 agro-pastoralist participants.'
      },
      {
        id: 'ms-04-2',
        projectId: 'proj-04',
        title: 'Foundation Seed Procurement & Distribution (El-Gadde Sorghum)',
        description: 'Distribute 1,200kg certified drought-tolerant El-Gadde seed batches and animal-drawn rippers to 2,400 farmers.',
        dueDate: '2024-11-30',
        completionDate: '2024-11-15',
        status: 'Achieved',
        category: 'Procurement & Works',
        assignedLead: 'Mustafe Ismail Nur',
        isCriticalCheckpoint: true,
        verificationCriteria: 'Farmer receipt signature sheets & seed certification certificates',
        notes: '100% target distribution completed ahead of planting rains.'
      },
      {
        id: 'ms-04-3',
        projectId: 'proj-04',
        title: 'Contour Tillage & Vegetative Moisture Strips Across 1,500 Hectares',
        description: 'Establish contour swales, vetiver grass hedgerows, and moisture retention micro-ridges on smallholder farms.',
        dueDate: '2025-10-31',
        completionDate: '2025-10-20',
        status: 'Achieved',
        category: 'Key Delivery',
        assignedLead: 'Dr. Marian Abdirahman',
        isCriticalCheckpoint: true,
        verificationCriteria: 'GPS farm register & agronomic extension verification deeds',
        notes: '1,540 ha mapped with GIS ground polygons.'
      },
      {
        id: 'ms-04-4',
        projectId: 'proj-04',
        title: 'Mid-Term Crop Cut Harvest Sampling & Post-Harvest Storage Training',
        description: 'Standard crop-cut sample plots and hermetic grain bag distribution to halt post-harvest weevil infestation.',
        dueDate: '2026-04-30',
        completionDate: '2026-04-20',
        status: 'Achieved',
        category: 'Field Checkpoint',
        assignedLead: 'Mustafe Ismail Nur',
        isCriticalCheckpoint: false,
        verificationCriteria: 'Crop yield statistical audit & training attendance sheets',
        notes: '42% yield gain verified in treated plots.'
      },
      {
        id: 'ms-04-5',
        projectId: 'proj-04',
        title: 'Agro-Pastoral Cooperative Grain Silo Certification & FAO Cluster Submission',
        description: 'Commission communal dry storage silos in Dilla and submit verified 5W matrix and final LoA report to FAO.',
        dueDate: '2026-11-30',
        status: 'In Progress',
        category: 'Donor Deliverable',
        assignedLead: 'Dr. Marian Abdirahman',
        isCriticalCheckpoint: true,
        verificationCriteria: 'FAO LoA technical clearance & silo structural handover certificate',
        notes: 'Final reporting drafted; silo finishing works in progress.'
      }
    ]
  },
  {
    id: 'proj-05',
    code: 'PENHA-SOM-2026-SDC05',
    title: 'Cross-Border Pastoralist Veterinary Surveillance & Camel Health Corridor Project',
    shortTitle: 'Cross-Border Camel Health & Mobility (SDC)',
    donorId: 'donor-sdc',
    donorName: 'SDC (Switzerland)',
    grantAgreementCode: 'SDC-HA-8109-SOM',
    pillar: 'Livestock Health & Fodder Security',
    status: 'Active',
    startDate: '2024-06-01',
    endDate: '2026-12-31',
    reportingFrequency: 'Bi-Annual',
    nextDonorReportDate: '2026-11-30',
    targetRegions: ['Awdal', 'Togdheer', 'Sool'],
    targetDistricts: ['Zeila', 'Lughaya', 'Burao', 'Ainabo'],
    leadProjectManager: {
      name: 'Dr. Guleed Abdi Hassan',
      role: 'Chief Veterinary Epidemiologist',
      email: 'g.hassan@penha-hargeisa.org',
      phone: '+252 63 445 1198'
    },
    fieldCoordinator: {
      name: 'Hamda Jama Duale',
      baseOffice: 'Borama Sub-office',
      phone: '+252 63 418 7720'
    },
    budgetSummary: {
      totalGrantUSD: 750000,
      disbursedUSD: 300000,
      expendituresUSD: 98500,
      commitmentsUSD: 24000,
      remainingBalanceUSD: 651500,
      burnRatePercent: 13.13
    },
    logframe: {
      impactGoal: 'Protect 180,000 pastoral camels and sheep from transboundary epidemic diseases through Community Animal Health Worker (CAHW) networks and cold-chain vaccine hubs across Somaliland border corridors.',
      outcomes: [
        {
          id: 'oc-5-1',
          code: 'OC-1',
          title: 'Transboundary livestock disease surveillance and cold-chain vaccine delivery established in remote grazing corridors.',
          outputs: [
            {
              id: 'out-5-1',
              code: 'OUT-1.1',
              title: '60 Community Animal Health Workers (CAHWs) equipped with solar vaccine cold-boxes and rapid diagnostic test kits.',
              targetCompletionDate: '2026-06-30',
              indicators: [
                {
                  id: 'ind-5.1.1',
                  code: 'IND-1.1.1',
                  outputId: 'out-5-1',
                  description: 'Head of pastoral livestock vaccinated against Camel Pox, CCPP, and PPR along migration routes',
                  unit: 'Animals',
                  baseline: 0,
                  target: 85000,
                  currentActual: 18200,
                  midtermTarget: 40000,
                  meansOfVerification: 'Ministry of Livestock digital vaccination certificates and cold-chain batch logs',
                  frequency: 'Monthly',
                  dataCollectionMethod: 'CAHW smartphone e-voucher recording',
                  status: 'Delayed',
                  disaggregationNote: '12,000 camels, 6,200 small ruminants'
                }
              ],
              activities: [
                {
                  id: 'act-5.1.1',
                  outputId: 'out-5-1',
                  code: 'ACT-1.1.1',
                  title: 'Procure solar DC cold chain freezers and specialized veterinary drug batches from certified international suppliers',
                  description: 'International tender for WHO/WOAH pre-qualified vaccines and Dometic solar vaccine coolers.',
                  assignedTo: 'Dr. Guleed Abdi Hassan',
                  assignedRole: 'Lead Veterinarian',
                  location: 'Zeila, Lughaya and Ainabo veterinary posts',
                  region: 'Awdal',
                  district: 'Zeila',
                  startDate: '2024-07-01',
                  endDate: '2026-04-30',
                  status: 'Delayed',
                  budgetAllocatedUSD: 280000,
                  budgetSpentUSD: 42000,
                  progressPercent: 25
                }
              ]
            }
          ]
        }
      ]
    },
    budgetLines: [
      {
        id: 'bl-501',
        code: 'BL-100',
        category: 'Direct Program Inputs & Works',
        description: 'Procurement of vaccines, solar coolboxes, and rapid test kits',
        unit: 'Kit/Batches',
        quantity: 60,
        unitCostUSD: 4500,
        totalAllocatedUSD: 270000,
        spentUSD: 38000,
        notes: 'Delayed due to port clearance bottleneck at Berbera customs'
      },
      {
        id: 'bl-502',
        code: 'BL-200',
        category: 'Community Training & Workshops',
        description: 'CAHW certification and refresher courses with Ministry of Livestock',
        unit: 'Sessions',
        quantity: 12,
        unitCostUSD: 5000,
        totalAllocatedUSD: 60000,
        spentUSD: 22500
      },
      {
        id: 'bl-503',
        code: 'BL-300',
        category: 'Operational Logistics & Transport',
        description: 'Mobile vet team field 4x4 operations and fuel in coastal border plains',
        unit: 'Months',
        quantity: 18,
        unitCostUSD: 6000,
        totalAllocatedUSD: 108000,
        spentUSD: 24000
      },
      {
        id: 'bl-504',
        code: 'BL-400',
        category: 'Personnel & Field Staff',
        description: 'Veterinary officers and field technicians salary allocation',
        unit: 'Staff-Months',
        quantity: 48,
        unitCostUSD: 2500,
        totalAllocatedUSD: 120000,
        spentUSD: 14000
      }
    ],
    beneficiaries: {
      targetDirect: 12000,
      actualDirect: 2850,
      targetIndirect: 36000,
      actualIndirect: 8400,
      targetHouseholds: 2000,
      actualHouseholds: 475,
      disaggregation: {
        pastoralistWomen: 1280,
        pastoralistMen: 1570,
        youthUnder25: 640,
        elderlyHerders: 390,
        personsWithDisabilities: 85,
        idpReturneeHouseholds: 190
      }
    },
    fieldEvidences: [
      {
        id: 'ev-05',
        projectId: 'proj-05',
        date: '2024-09-10',
        title: 'Mobile Camel Health Screening at Zeila Coastal Grazing Hub',
        location: 'Tokhoshi Salt Plains, Zeila District',
        district: 'Zeila',
        region: 'Awdal',
        gpsCoordinates: '11.3541° N, 43.4722° E',
        monitoredBy: 'Dr. Guleed Abdi Hassan',
        summary: 'Inspected 620 lactating camels for Trypanosomiasis. Administered prophylactic treatments to preventing herd mortality.',
        beneficiaryQuote: {
          text: 'Our camels move across the border where water and pasture are green. Having veterinary scouts near the border wells saved 45 calves from sickness.',
          speakerName: 'Awale Warsame Bullale',
          role: 'Pastoralist Clan Elder',
          village: 'Tokhoshi Wells'
        },
        verifiedStatus: 'Field Reported'
      }
    ],
    risks: [
      {
        id: 'rk-06',
        projectId: 'proj-05',
        projectCode: 'PENHA-SOM-2026-SDC05',
        projectTitle: 'Cross-Border Pastoralist Veterinary Surveillance & Camel Health Corridor Project',
        description: 'International cold-chain vaccine supplier delay and Berbera port customs clearance backlog',
        riskLevel: 'High',
        category: 'Operational & Logistics',
        mitigationPlan: 'Engaged Somaliland Ministry of Livestock fast-track humanitarian import waiver and switched to regional cold-storage depot in Djibouti.',
        status: 'Active Monitoring',
        likelihood: 'Likely',
        impact: 'Critical',
        humanitarianImpactArea: 'Medical / Cold-Chain Storage',
        assignedFocalPoint: 'Hamda Jama Duale',
        dateIdentified: '2024-07-20',
        lastReviewDate: '2026-09-15',
        earlyWarningTriggers: 'Customs dwell time exceeding 14 days; vaccine temperature datalogger threshold breached'
      },
      {
        id: 'rk-07',
        projectId: 'proj-05',
        projectCode: 'PENHA-SOM-2026-SDC05',
        projectTitle: 'Cross-Border Pastoralist Veterinary Surveillance & Camel Health Corridor Project',
        description: 'Cross-border movement restrictions or tension between nomadic clans near Ethiopian border grazing corridors',
        riskLevel: 'Medium',
        category: 'Access & Security',
        mitigationPlan: 'Bi-monthly cross-border peace dialogues and customary Xeer pasture sharing agreements ratified by traditional Sultan elders.',
        status: 'Active Monitoring',
        likelihood: 'Possible',
        impact: 'Major',
        humanitarianImpactArea: 'Cross-Border Access',
        assignedFocalPoint: 'Dr. Guleed Abdi Hassan',
        dateIdentified: '2024-08-05',
        lastReviewDate: '2026-09-20',
        earlyWarningTriggers: 'Clashing reports from community peace scouts or local elders council'
      }
    ],
    milestones: [
      {
        id: 'ms-05-1',
        projectId: 'proj-05',
        title: 'Multi-Clan Cross-Border Grazing Dialogue & Customary Xeer Agreement',
        description: 'Convene 6 border clan councils to establish peaceful grazing corridors and shared veterinary post protocols.',
        dueDate: '2024-08-31',
        completionDate: '2024-08-28',
        status: 'Achieved',
        category: 'Field Checkpoint',
        assignedLead: 'Dr. Guleed Abdi Hassan',
        isCriticalCheckpoint: true,
        verificationCriteria: 'Signed customary Xeer agreement by 12 Sultan elders and local governors',
        notes: 'Peace accords established across Zeila and Awbare corridors.'
      },
      {
        id: 'ms-05-2',
        projectId: 'proj-05',
        title: 'Customs Clearance & Delivery of WHO/WOAH Cold-Chain Solar Coolers',
        description: 'Import clearance and regional dispatch of 60 Dometic portable solar cold boxes and rapid diagnostic test kits.',
        dueDate: '2025-01-31',
        status: 'Delayed',
        category: 'Procurement & Works',
        assignedLead: 'Hamda Jama Duale',
        isCriticalCheckpoint: true,
        verificationCriteria: 'Customs clearance inspection certificate & warehouse inventory receipt',
        notes: 'Delayed by customs tariff re-classification; fast-track waiver requested.'
      },
      {
        id: 'ms-05-3',
        projectId: 'proj-05',
        title: 'Training & Certification of 60 Community Animal Health Workers (CAHWs)',
        description: '14-day intensive field epidemiology, diagnostic rapid testing, and cold-chain handling certification course.',
        dueDate: '2025-06-30',
        completionDate: '2025-06-15',
        status: 'Achieved',
        category: 'Key Delivery',
        assignedLead: 'Dr. Guleed Abdi Hassan',
        isCriticalCheckpoint: true,
        verificationCriteria: 'Ministry of Livestock CAHW graduation certificates & exam scores',
        notes: '60 scouts certified (including 22 female paravets).'
      },
      {
        id: 'ms-05-4',
        projectId: 'proj-05',
        title: 'Mobile Vaccination Campaign Reaching 40,000 Head in Zeila/Lughaya',
        description: 'Deploy 6 mobile veterinary teams for Camel Pox and PPR vaccination across dry-season concentration wells.',
        dueDate: '2026-03-31',
        status: 'Delayed',
        category: 'Key Delivery',
        assignedLead: 'Dr. Guleed Abdi Hassan',
        isCriticalCheckpoint: true,
        verificationCriteria: 'Digital e-voucher logs & Ministry of Livestock vaccination stamp tallies',
        notes: '18,200 animals reached; campaign delayed pending remaining vaccine batches.'
      },
      {
        id: 'ms-05-5',
        projectId: 'proj-05',
        title: 'Veterinary Cold-Chain Hub Handover to Somaliland Ministry of Livestock',
        description: 'Transition border outpost cold-chain storage infrastructure and diagnostic labs to district veterinary directors.',
        dueDate: '2026-12-15',
        status: 'Pending',
        category: 'Community Handover',
        assignedLead: 'Hamda Jama Duale',
        isCriticalCheckpoint: true,
        verificationCriteria: 'Signed inter-ministerial facility transfer deed & bilateral SDC closeout report',
        notes: 'Facility maintenance protocol submitted to Ministry for inclusion in national budget.'
      }
    ]
  }
];

export const INITIAL_FUND_INFLOWS: FundInflow[] = [
  {
    id: 'inf-01',
    grantCode: 'EUTF05-HOA-SOM-7721',
    donorId: 'donor-eu',
    donorName: 'European Union (EU)',
    projectId: 'proj-01',
    projectCode: 'PENHA-SOM-2025-EU01',
    projectTitle: 'Horn of Africa Pastoralist Resilience & Rangeland Regeneration Project (HARP)',
    trancheNumber: 1,
    title: 'EU Grant Advance Tranche 1 (Year 1 Operations & Baseline)',
    amountUSD: 750000,
    amountSLSH: 6375000000,
    disbursementDate: '2024-01-20',
    bankReference: 'DAHABSHIIL-TR-EU-98210',
    status: 'Received',
    notes: 'Initial mobilization advance following grant agreement signing'
  },
  {
    id: 'inf-02',
    grantCode: 'EUTF05-HOA-SOM-7721',
    donorId: 'donor-eu',
    donorName: 'European Union (EU)',
    projectId: 'proj-01',
    projectCode: 'PENHA-SOM-2025-EU01',
    projectTitle: 'Horn of Africa Pastoralist Resilience & Rangeland Regeneration Project (HARP)',
    trancheNumber: 2,
    title: 'EU Grant Mid-Term Tranche 2 (Year 2 Works & Reseeding)',
    amountUSD: 700000,
    amountSLSH: 5950000000,
    disbursementDate: '2025-02-15',
    bankReference: 'DAHABSHIIL-TR-EU-10492',
    status: 'Received',
    notes: 'Released following satisfactory verification of Month 12 interim narrative & financial report'
  },
  {
    id: 'inf-03',
    grantCode: 'DAN-SOM-10492-W',
    donorId: 'donor-danida',
    donorName: 'Danida (Denmark)',
    projectId: 'proj-02',
    projectCode: 'PENHA-SOM-2025-DAN02',
    projectTitle: 'Pastoralist Women Economic Empowerment & Milk Value Chain Cooperatives in Sahil & Sanaag',
    trancheNumber: 1,
    title: 'Danida Capital Grant Tranche 1 (Milk Hub Equipment & VSLA Revolving)',
    amountUSD: 850000,
    amountSLSH: 7225000000,
    disbursementDate: '2024-04-12',
    bankReference: 'SALAMA-BANK-DAN-5502',
    status: 'Received',
    notes: 'Primary funding for solar cold chain hardware and cooperative seed capital'
  },
  {
    id: 'inf-04',
    grantCode: 'FCDO-BHA-SOM-8812',
    donorId: 'donor-fcdo',
    donorName: 'FCDO (United Kingdom)',
    projectId: 'proj-03',
    projectCode: 'PENHA-SOM-2025-FCDO03',
    projectTitle: 'Emergency Drought Early-Action & Solarized Livestock Boreholes in Eastern Rangelands (Sool/Sanaag)',
    trancheNumber: 1,
    title: 'FCDO Drought Crisis Response Tranche 1',
    amountUSD: 1600000,
    amountSLSH: 13600000000,
    disbursementDate: '2024-03-25',
    bankReference: 'BARKLA-HGY-FCDO-3011',
    status: 'Received',
    notes: 'Frontloaded for emergency borehole solarization ahead of dry season'
  },
  {
    id: 'inf-05',
    grantCode: 'UN-FAO-SOM-6019',
    donorId: 'donor-fao',
    donorName: 'FAO Somalia/Somaliland',
    projectId: 'proj-04',
    projectCode: 'PENHA-SOM-2025-FAO04',
    projectTitle: 'Sustainable Dryland Soil & Moisture Conservation in Agro-Pastoral Corridors',
    trancheNumber: 1,
    title: 'FAO LoA Disbursement Tranche 1 & 2',
    amountUSD: 550000,
    amountSLSH: 4675000000,
    disbursementDate: '2024-05-20',
    bankReference: 'UN-DFS-WIRE-8831',
    status: 'Received',
    notes: 'Disbursed according to Letter of Agreement milestone schedule'
  }
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp-01',
    voucherNumber: 'PV-2026-0881',
    projectId: 'proj-01',
    projectCode: 'PENHA-SOM-2025-EU01',
    budgetLineCode: 'BL-103',
    budgetLineDescription: 'Indigenous grass seeds, gully check dams, earth bunding cash-for-work, solar water retrofits',
    category: 'Direct Program Inputs & Works',
    date: '2026-09-18',
    payee: 'Horn Solar Solutions Ltd (Hargeisa)',
    description: 'Milestone 2 payment for solar pumping hardware delivered to Sheikh & Arabsiyo water points',
    amountUSD: 42500,
    amountSLSH: 361250000,
    currencyPaid: 'USD',
    approvedBy: 'Eng. Ismail Jama Farah',
    receiptReference: 'INV-HSS-9042-SOM',
    receiptFileName: 'Invoice_HornSolar_Sheikh_Commissioning.pdf',
    receiptFileSize: '1.4 MB',
    donorCode: 'EU-EUTF',
    status: 'Approved & Paid'
  },
  {
    id: 'exp-02',
    voucherNumber: 'PV-2026-0882',
    projectId: 'proj-03',
    projectCode: 'PENHA-SOM-2025-FCDO03',
    budgetLineCode: 'BL-301',
    budgetLineDescription: 'Solar pumps, borehole casing, pipes, automated sensors, water troughs, and fodder procurement',
    category: 'Direct Program Inputs & Works',
    date: '2026-09-14',
    payee: 'Wajaale Agricultural Transport Union',
    description: 'Freight haulage of 45 metric tons of emergency Rhodes grass hay bales to Ainabo reserve warehouse',
    amountUSD: 14200,
    amountSLSH: 120700000,
    currencyPaid: 'USD',
    approvedBy: 'Eng. Abdillahi Warsame Muse',
    receiptReference: 'WAYBILL-WAT-1102',
    receiptFileName: 'Consignment_Waybill_Wajaale_Ainabo.pdf',
    receiptFileSize: '860 KB',
    donorCode: 'FCDO-UK',
    status: 'Approved & Paid'
  },
  {
    id: 'exp-03',
    voucherNumber: 'PV-2026-0883',
    projectId: 'proj-02',
    projectCode: 'PENHA-SOM-2025-DAN02',
    budgetLineCode: 'BL-203',
    budgetLineDescription: 'Cooperative financial literacy, food safety, and frankincense value-addition clinics',
    category: 'Community Training & Workshops',
    date: '2026-09-09',
    payee: 'Mansoor Hotel & Conference Center Burao',
    description: 'Venue, meals, and translation for 3-day Women Milk Cooperative Financial Literacy workshop (45 participants)',
    amountUSD: 3850,
    amountSLSH: 32725000,
    currencyPaid: 'USD',
    approvedBy: 'Sahra Hassan Dirie',
    receiptReference: 'REC-MANS-0419',
    receiptFileName: 'Receipt_Mansoor_Workshop_Sheikh_Women.pdf',
    receiptFileSize: '520 KB',
    donorCode: 'DANIDA-DK',
    status: 'Approved & Paid'
  },
  {
    id: 'exp-04',
    voucherNumber: 'PV-2026-0884',
    projectId: 'proj-01',
    projectCode: 'PENHA-SOM-2025-EU01',
    budgetLineCode: 'BL-102',
    budgetLineDescription: 'Field 4x4 vehicle rental, fuel, and rough terrain maintenance across Togdheer & Maroodi Jeex',
    category: 'Operational Logistics & Transport',
    date: '2026-09-02',
    payee: 'Red Sea Fuel Stations Network',
    description: 'Diesel fuel vouchers for 3 field 4x4 landcruisers during Togdheer rangeland monitoring mission',
    amountUSD: 2450,
    amountSLSH: 20825000,
    currencyPaid: 'USD',
    approvedBy: 'Fadumo Abdi Warsame',
    receiptReference: 'FUEL-RS-7729',
    receiptFileName: 'RedSea_Fuel_Trip_Log_092026.pdf',
    receiptFileSize: '410 KB',
    donorCode: 'EU-EUTF',
    status: 'Approved & Paid'
  },
  {
    id: 'exp-05',
    voucherNumber: 'PV-2026-0885',
    projectId: 'proj-04',
    projectCode: 'PENHA-SOM-2025-FAO04',
    budgetLineCode: 'BL-401',
    budgetLineDescription: 'Certified foundation seeds, animal-drawn ripping implements, bio-pesticides, nursery tools',
    category: 'Direct Program Inputs & Works',
    date: '2026-08-25',
    payee: 'Awdal Certified Seed Producers Syndicate',
    description: 'Procurement of 1,200kg certified drought-tolerant El-Gadde sorghum foundation seed batches',
    amountUSD: 8400,
    amountSLSH: 71400000,
    currencyPaid: 'USD',
    approvedBy: 'Dr. Marian Abdirahman',
    receiptReference: 'INV-ACSP-5501',
    receiptFileName: 'Awdal_Seed_Syndicate_Certificate_Inv.pdf',
    receiptFileSize: '930 KB',
    donorCode: 'FAO-UN',
    status: 'Approved & Paid'
  }
];

export const SOMALILAND_SHILLING_RATE = 8500; // 1 USD = 8,500 SLSH (current standard benchmark)
