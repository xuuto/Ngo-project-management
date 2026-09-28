import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Permission, MOCK_USERS, ROLE_DEFINITIONS, RoleDefinition } from '../types/auth';
import { Project, ExpenseRecord, FundInflow, DonorReport } from '../types/ngo';

interface AuthContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchUserById: (userId: string) => void;
  allUsers: User[];
  currentRoleDefinition: RoleDefinition;
  hasPermission: (permission: Permission) => boolean;
  canAccessProject: (project: Project | { id: string; donorId: string }) => boolean;
  canAccessDonor: (donorId: string) => boolean;
  filterAccessibleProjects: (projects: Project[]) => Project[];
  filterAccessibleExpenses: (expenses: ExpenseRecord[], projects: Project[]) => ExpenseRecord[];
  filterAccessibleFundInflows: (inflows: FundInflow[], projects: Project[]) => FundInflow[];
  filterAccessibleReports: (reports: DonorReport[]) => DonorReport[];
  isRestrictedView: boolean;
  roleNotice: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'penha_ngo_active_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const savedUserId = localStorage.getItem(AUTH_USER_KEY);
      if (savedUserId) {
        const found = MOCK_USERS.find(u => u.id === savedUserId);
        if (found) return found;
      }
    } catch (e) {
      console.warn('Unable to load saved user session:', e);
    }
    return MOCK_USERS[0]; // Default to Super Admin (Dr. Mohamoud Hersi)
  });

  const switchUserById = (userId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      try {
        localStorage.setItem(AUTH_USER_KEY, user.id);
      } catch (e) {
        console.warn('Unable to persist user selection:', e);
      }
    }
  };

  const currentRoleDefinition = ROLE_DEFINITIONS[currentUser.role];

  const hasPermission = (permission: Permission): boolean => {
    return currentRoleDefinition.permissions.includes(permission);
  };

  const canAccessProject = (project: Project | { id: string; donorId: string }): boolean => {
    if (currentUser.role === 'Super Admin') return true;

    if (currentUser.role === 'Donor') {
      // Donor can only access projects financed by their specific donor organization
      return currentUser.donorId === project.donorId;
    }

    if (currentUser.role === 'Project Manager' || currentUser.role === 'Team Member') {
      if (currentUser.assignedProjectIds.includes('*')) return true;
      return currentUser.assignedProjectIds.includes(project.id);
    }

    return false;
  };

  const canAccessDonor = (donorId: string): boolean => {
    if (currentUser.role === 'Super Admin') return true;
    if (currentUser.role === 'Donor') {
      return currentUser.donorId === donorId;
    }
    // Project managers and team members can view donors linked to their assigned projects
    return true;
  };

  const filterAccessibleProjects = (projects: Project[]): Project[] => {
    if (currentUser.role === 'Super Admin') return projects;
    return projects.filter(p => canAccessProject(p));
  };

  const filterAccessibleExpenses = (expenses: ExpenseRecord[], projects: Project[]): ExpenseRecord[] => {
    if (currentUser.role === 'Super Admin') return expenses;
    const accessibleProjectIds = new Set(filterAccessibleProjects(projects).map(p => p.id));
    return expenses.filter(e => accessibleProjectIds.has(e.projectId));
  };

  const filterAccessibleFundInflows = (inflows: FundInflow[], projects: Project[]): FundInflow[] => {
    if (currentUser.role === 'Super Admin') return inflows;
    if (currentUser.role === 'Donor') {
      return inflows.filter(inf => inf.donorId === currentUser.donorId);
    }
    const accessibleProjectIds = new Set(filterAccessibleProjects(projects).map(p => p.id));
    return inflows.filter(inf => accessibleProjectIds.has(inf.projectId));
  };

  const filterAccessibleReports = (reports: DonorReport[]): DonorReport[] => {
    if (currentUser.role === 'Super Admin') return reports;
    if (currentUser.role === 'Donor') {
      return reports.filter(r => r.donorId === currentUser.donorId);
    }
    if (currentUser.role === 'Project Manager') {
      return reports.filter(r => currentUser.assignedProjectIds.includes(r.projectId));
    }
    // Team member view
    return reports.filter(r => currentUser.assignedProjectIds.includes(r.projectId));
  };

  const isRestrictedView = currentUser.role !== 'Super Admin';

  const getRoleNotice = (): string => {
    switch (currentUser.role) {
      case 'Super Admin':
        return 'Full unrestricted access to all projects, donors, financials, and administration.';
      case 'Project Manager':
        return `Project Manager scope active. Managing assigned portfolio (${currentUser.assignedProjectIds.join(', ')}).`;
      case 'Team Member':
        return 'Field Officer / Team Member mode. Viewing assigned operational tasks and field M&E logs. Financial editing is restricted.';
      case 'Donor':
        return `Donor Oversight Portal (${currentUser.organization}). Read-only access to funded grants, M&E impact verification, and donor reports.`;
      case 'Finance Officer':
        return 'Senior Finance & Compliance Officer mode. Authority to audit expense vouchers, manage bank accounts, and approve final disbursements.';
      default:
        return '';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUserById,
        allUsers: MOCK_USERS,
        currentRoleDefinition,
        hasPermission,
        canAccessProject,
        canAccessDonor,
        filterAccessibleProjects,
        filterAccessibleExpenses,
        filterAccessibleFundInflows,
        filterAccessibleReports,
        isRestrictedView,
        roleNotice: getRoleNotice()
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
