import { Project, SomalilandRegion } from './ngo';

export type UserRole = 'Super Admin' | 'Project Manager' | 'Team Member' | 'Donor' | 'Finance Officer';

export type Permission =
  // Projects
  | 'projects:view_all'
  | 'projects:view_assigned'
  | 'projects:create'
  | 'projects:edit'
  | 'projects:delete'
  // Tasks / Activities
  | 'tasks:view_all'
  | 'tasks:view_assigned'
  | 'tasks:create'
  | 'tasks:edit'
  | 'tasks:delete'
  | 'tasks:update_status'
  // Financials & Budgets
  | 'financials:view_all'
  | 'financials:view_assigned'
  | 'financials:view_summary_only'
  | 'financials:create_voucher'
  | 'financials:edit_budget'
  | 'financials:approve'
  // Donor Reports & Impact
  | 'reports:view_all'
  | 'reports:view_assigned'
  | 'reports:view_funded'
  | 'reports:generate'
  | 'reports:approve'
  | 'reports:export'
  // M&E & Field Evidence
  | 'evidence:view'
  | 'evidence:submit'
  | 'evidence:verify'
  // Administrative
  | 'users:manage'
  | 'audit:export';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  jobTitle: string;
  organization: string;
  baseOffice: string;
  assignedProjectIds: string[]; // ['*'] for Super Admin, specific ids for others
  donorId?: string; // Set for Donor role
  avatarInitials: string;
}

export interface RoleDefinition {
  role: UserRole;
  title: string;
  summary: string;
  permissions: Permission[];
  canEditProjects: boolean;
  canDeleteProjects: boolean;
  canManageFinances: boolean;
  canGenerateReports: boolean;
  canSubmitFieldData: boolean;
  dataAccessScope: 'Global (All Projects & Donors)' | 'Assigned Projects Only' | 'Field Level (Tasks & M&E)' | 'Funded Grants Only (Read-Only)';
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  'Super Admin': {
    role: 'Super Admin',
    title: 'Executive & Country Leadership',
    summary: 'Full administrative authority across all projects, donors, master financial ledgers, staff assignments, and audit trails.',
    permissions: [
      'projects:view_all',
      'projects:create',
      'projects:edit',
      'projects:delete',
      'tasks:view_all',
      'tasks:create',
      'tasks:edit',
      'tasks:delete',
      'tasks:update_status',
      'financials:view_all',
      'financials:create_voucher',
      'financials:edit_budget',
      'financials:approve',
      'reports:view_all',
      'reports:generate',
      'reports:approve',
      'reports:export',
      'evidence:view',
      'evidence:submit',
      'evidence:verify',
      'users:manage',
      'audit:export'
    ],
    canEditProjects: true,
    canDeleteProjects: true,
    canManageFinances: true,
    canGenerateReports: true,
    canSubmitFieldData: true,
    dataAccessScope: 'Global (All Projects & Donors)'
  },
  'Project Manager': {
    role: 'Project Manager',
    title: 'Project Lead / Coordinator',
    summary: 'Manages operational planning, logframe indicators, task assignments, expense requests, and donor report generation for assigned projects.',
    permissions: [
      'projects:view_assigned',
      'projects:edit',
      'tasks:view_assigned',
      'tasks:create',
      'tasks:edit',
      'tasks:delete',
      'tasks:update_status',
      'financials:view_assigned',
      'financials:create_voucher',
      'reports:view_assigned',
      'reports:generate',
      'reports:export',
      'evidence:view',
      'evidence:submit',
      'evidence:verify'
    ],
    canEditProjects: true,
    canDeleteProjects: false,
    canManageFinances: true,
    canGenerateReports: true,
    canSubmitFieldData: true,
    dataAccessScope: 'Assigned Projects Only'
  },
  'Team Member': {
    role: 'Team Member',
    title: 'Field Officer & Agronomist',
    summary: 'Executes community activities, updates task progress %, logs beneficiary reach, and uploads verified field monitoring evidence.',
    permissions: [
      'projects:view_assigned',
      'tasks:view_assigned',
      'tasks:update_status',
      'evidence:view',
      'evidence:submit'
    ],
    canEditProjects: false,
    canDeleteProjects: false,
    canManageFinances: false,
    canGenerateReports: false,
    canSubmitFieldData: true,
    dataAccessScope: 'Field Level (Tasks & M&E)'
  },
  'Donor': {
    role: 'Donor',
    title: 'Institutional Donor Representative',
    summary: 'Transparent read-only oversight into funded grant progress, verified M&E impact indicators, fund burn rates, and formal donor reports.',
    permissions: [
      'projects:view_assigned',
      'tasks:view_assigned',
      'financials:view_summary_only',
      'reports:view_funded',
      'reports:export',
      'evidence:view',
      'audit:export'
    ],
    canEditProjects: false,
    canDeleteProjects: false,
    canManageFinances: false,
    canGenerateReports: false,
    canSubmitFieldData: false,
    dataAccessScope: 'Funded Grants Only (Read-Only)'
  },
  'Finance Officer': {
    role: 'Finance Officer',
    title: 'Senior Finance & Compliance Officer',
    summary: 'Reviews operational expenditures, audits project vouchers against grant agreements, controls multi-currency bank ledgers, and performs final sign-offs on program expenses.',
    permissions: [
      'projects:view_all',
      'tasks:view_all',
      'financials:view_all',
      'financials:create_voucher',
      'financials:approve',
      'reports:view_all',
      'evidence:view',
      'audit:export'
    ],
    canEditProjects: false,
    canDeleteProjects: false,
    canManageFinances: true,
    canGenerateReports: false,
    canSubmitFieldData: false,
    dataAccessScope: 'Global (All Projects & Donors)'
  }
};

export const MOCK_USERS: User[] = [
  {
    id: 'user-01',
    name: 'Dr. Mohamoud Hersi',
    email: 'm.hersi@penha-hargeisa.org',
    role: 'Super Admin',
    jobTitle: 'Country Director & Horn Representative',
    organization: 'PENHA Somaliland Country Office',
    baseOffice: 'Hargeisa Head Office',
    assignedProjectIds: ['*'],
    avatarInitials: 'MH'
  },
  {
    id: 'user-02',
    name: 'Eng. Ismail Jama Farah',
    email: 'i.jama@penha-hargeisa.org',
    role: 'Project Manager',
    jobTitle: 'Senior Pastoral Livelihoods Specialist',
    organization: 'PENHA Somaliland Country Office',
    baseOffice: 'Hargeisa / Field Togdheer',
    assignedProjectIds: ['proj-01'], // European Union project
    avatarInitials: 'IJ'
  },
  {
    id: 'user-03',
    name: 'Sahra Hassan Dirie',
    email: 's.dirie@penha-hargeisa.org',
    role: 'Project Manager',
    jobTitle: 'Gender & Rural Enterprise Lead',
    organization: 'PENHA Somaliland Country Office',
    baseOffice: 'Hargeisa Head Office',
    assignedProjectIds: ['proj-02'], // Danida project
    avatarInitials: 'SH'
  },
  {
    id: 'user-04',
    name: 'Fadumo Abdi Warsame',
    email: 'f.warsame@penha-hargeisa.org',
    role: 'Team Member',
    jobTitle: 'Rangelands & Community Field Agronomist',
    organization: 'PENHA Somaliland Country Office',
    baseOffice: 'Burao Sub-office (Togdheer)',
    assignedProjectIds: ['proj-01'],
    avatarInitials: 'FA'
  },
  {
    id: 'user-05',
    name: 'Elena Rossi',
    email: 'elena.rossi@eeas.europa.eu',
    role: 'Donor',
    jobTitle: 'Head of Cooperation & Grant Compliance',
    organization: 'European Union Emergency Trust Fund',
    baseOffice: 'EU Delegation Horn of Africa Desk',
    assignedProjectIds: ['proj-01'],
    donorId: 'donor-eu',
    avatarInitials: 'ER'
  },
  {
    id: 'user-06',
    name: 'Lars Møller',
    email: 'larmol@um.dk',
    role: 'Donor',
    jobTitle: 'Senior Programme Officer',
    organization: 'Danida / Danish Ministry of Foreign Affairs',
    baseOffice: 'Danida Nordic Development Office',
    assignedProjectIds: ['proj-02'],
    donorId: 'donor-danida',
    avatarInitials: 'LM'
  },
  {
    id: 'user-07',
    name: 'Mustafa Omar Aden',
    email: 'm.aden@penha-hargeisa.org',
    role: 'Finance Officer',
    jobTitle: 'Senior Financial Comptroller & Compliance Manager',
    organization: 'PENHA Somaliland Country Office',
    baseOffice: 'Hargeisa Head Office',
    assignedProjectIds: ['*'],
    avatarInitials: 'MO'
  }
];
