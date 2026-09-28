import React, { useState } from 'react';
import { Shield, ChevronDown, UserCircle, RefreshCw, KeyRound, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PermissionsMatrixModal } from './modals/PermissionsMatrixModal';

interface HeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
  currencyMode: 'USD' | 'SLSH';
  setCurrencyMode: (mode: 'USD' | 'SLSH') => void;
  onResetData: () => void;
  onOpenNewProjectModal?: () => void;
  onOpenExpenseModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  currencyMode,
  setCurrencyMode,
  onResetData,
  onOpenNewProjectModal,
  onOpenExpenseModal
}) => {
  const { currentUser, switchUserById, allUsers, hasPermission } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Project Manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Team Member':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Donor':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        {/* Top 3-Zone Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Zone 1: Single text element wordmark */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveView('dashboard')}
                className="text-left group flex items-center gap-2.5 focus:outline-hidden"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  P
                </div>
                <div>
                  <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors">
                    PENHA
                  </span>
                  <span className="text-xs text-slate-500 ml-1.5 font-normal hidden sm:inline">
                    Pastoral &amp; Environmental Network · Hargeisa Office
                  </span>
                </div>
              </button>
            </div>

            {/* Zone 2: Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-xs font-medium">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeView === 'dashboard'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveView('projects')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeView === 'projects'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Projects &amp; Logframes
              </button>
              <button
                onClick={() => setActiveView('financials')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeView === 'financials'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Financial Tracking
              </button>
              <button
                onClick={() => setActiveView('donors')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeView === 'donors'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Donors &amp; Grants
              </button>
              <button
                onClick={() => setActiveView('reports')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeView === 'reports'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Donor Reports &amp; M&amp;E
              </button>
              <button
                onClick={() => setActiveView('beneficiaries')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeView === 'beneficiaries'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Beneficiaries &amp; Cash
              </button>
            </nav>

            {/* Zone 3: Actions & Active Persona Selector */}
            <div className="flex items-center gap-2">
              {/* Currency Toggle */}
              <button
                onClick={() => setCurrencyMode(currencyMode === 'USD' ? 'SLSH' : 'USD')}
                title="Toggle currency display (USD / Somaliland Shilling)"
                className="hidden lg:flex items-center gap-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors"
              >
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                <span>{currencyMode === 'USD' ? 'USD ($)' : 'SLSH (Sh.)'}</span>
              </button>

              {/* Permissions Matrix Button */}
              <button
                onClick={() => setShowMatrixModal(true)}
                title="View RBAC permissions for all 4 roles"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden xl:inline">Permissions</span> Matrix
              </button>

              {/* Persona / Role Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center">
                    {currentUser.avatarInitials}
                  </div>
                  <div className="hidden lg:block text-left max-w-[130px] xl:max-w-[170px] truncate">
                    <p className="text-xs font-semibold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Active NGO Session
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{currentUser.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getRoleBadgeColor(currentUser.role)}`}>
                          {currentUser.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{currentUser.jobTitle}</p>
                      <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">{currentUser.baseOffice}</p>
                    </div>

                    <div className="py-1">
                      <p className="px-4 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Switch Persona Role
                      </p>
                      {allUsers.map((u) => {
                        const isCurrent = u.id === currentUser.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              switchUserById(u.id);
                              setShowUserMenu(false);
                            }}
                            className={`w-full px-4 py-2 text-left flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                              isCurrent ? 'bg-emerald-50/60 font-semibold' : ''
                            }`}
                          >
                            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                              {u.avatarInitials}
                            </div>
                            <div className="overflow-hidden flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-900 truncate">{u.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${getRoleBadgeColor(u.role)}`}>
                                  {u.role}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 truncate">{u.jobTitle}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="px-4 pt-2 pb-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <button
                        onClick={() => {
                          setShowMatrixModal(true);
                          setShowUserMenu(false);
                        }}
                        className="text-emerald-700 hover:text-emerald-900 font-medium"
                      >
                        View Permission Matrix
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Reset application to authentic PENHA Hargeisa sample datasets?')) {
                            onResetData();
                            setShowUserMenu(false);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset Data</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Context Notice Bar for Scoped Roles */}
        {currentUser.role !== 'Super Admin' && (
          <div className="bg-slate-900 text-slate-100 text-xs px-4 py-1.5 flex items-center justify-between">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>
                  <strong className="font-semibold">{currentUser.role} Scope:</strong>{' '}
                  {currentUser.role === 'Donor' &&
                    `Showing only ${currentUser.organization} funded programs and donor verification reports (Read-Only).`}
                  {currentUser.role === 'Project Manager' &&
                    `Operational management for assigned project (${currentUser.assignedProjectIds.join(', ')}).`}
                  {currentUser.role === 'Team Member' &&
                    `Field officer task execution and verification mode. Financial configuration is locked.`}
                </span>
              </div>
              <button
                onClick={() => switchUserById('user-01')}
                className="text-[11px] underline text-slate-300 hover:text-white ml-3 shrink-0"
              >
                Switch to Super Admin
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Permissions Matrix Modal */}
      <PermissionsMatrixModal isOpen={showMatrixModal} onClose={() => setShowMatrixModal(false)} />
    </>
  );
};
