import React from 'react';
import { X, ShieldCheck, Check, Minus, UserCheck } from 'lucide-react';
import { ROLE_DEFINITIONS, UserRole } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';

interface PermissionsMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionsMatrixModal: React.FC<PermissionsMatrixModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, switchUserById, allUsers } = useAuth();

  if (!isOpen) return null;

  const roles: UserRole[] = ['Super Admin', 'Project Manager', 'Team Member', 'Donor', 'Finance Officer'];

  const permissionRows = [
    {
      category: 'Project Portfolio',
      permissions: [
        { label: 'View All Organization Projects', key: 'projects:view_all' },
        { label: 'View Only Assigned / Funded Projects', key: 'projects:view_assigned' },
        { label: 'Create New Project Proposals', key: 'projects:create' },
        { label: 'Edit Project Logframe & Details', key: 'projects:edit' },
        { label: 'Delete / Archive Projects', key: 'projects:delete' }
      ]
    },
    {
      category: 'Activities & Task Management',
      permissions: [
        { label: 'View Operational Tasks', key: 'tasks:view_assigned' },
        { label: 'Create & Assign Activities', key: 'tasks:create' },
        { label: 'Edit Task Timeline & Details', key: 'tasks:edit' },
        { label: 'Update Progress % & Status (Field)', key: 'tasks:update_status' },
        { label: 'Delete Tasks', key: 'tasks:delete' }
      ]
    },
    {
      category: 'Financial Tracking & Budgets',
      permissions: [
        { label: 'View Master Financial Ledgers', key: 'financials:view_all' },
        { label: 'View Assigned Project Budgets', key: 'financials:view_assigned' },
        { label: 'View Fund Utilization Summary Only', key: 'financials:view_summary_only' },
        { label: 'Create Expense Vouchers & Receipts', key: 'financials:create_voucher' },
        { label: 'Edit Project Budget Line Allocations', key: 'financials:edit_budget' },
        { label: 'Approve Financial Disbursements', key: 'financials:approve' }
      ]
    },
    {
      category: 'Donor Reporting & Impact M&E',
      permissions: [
        { label: 'View All Donor Reports', key: 'reports:view_all' },
        { label: 'View Funded Grant Reports', key: 'reports:view_funded' },
        { label: 'Generate Formal Donor Reports', key: 'reports:generate' },
        { label: 'Formal Report Approval & Signoff', key: 'reports:approve' },
        { label: 'Export Reports & Audit Dossiers', key: 'reports:export' },
        { label: 'Submit Field Verification Evidence', key: 'evidence:submit' },
        { label: 'Audit & Verify Field Evidence', key: 'evidence:verify' }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                PENHA Access Control &amp; RBAC Permissions Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Granular security policies governing Projects, Tasks, Financial Ledgers, and Donor Transparency
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Persona Banner */}
        <div className="px-6 py-3 bg-emerald-50/70 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-emerald-950">Active Persona:</span>
            <span className="font-semibold text-emerald-900">{currentUser.name}</span>
            <span className="text-emerald-700">({currentUser.role})</span>
            <span className="text-slate-400">·</span>
            <span className="text-emerald-800">{currentUser.jobTitle}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">Switch Test Persona:</span>
            <select
              value={currentUser.id}
              onChange={(e) => switchUserById(e.target.value)}
              className="bg-white border border-emerald-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.role} ({u.organization.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Roles Scope Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {roles.map((r) => {
              const def = ROLE_DEFINITIONS[r];
              const isCurrent = currentUser.role === r;
              return (
                <div
                  key={r}
                  className={`p-3 rounded-lg border text-xs ${
                    isCurrent
                      ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900">{r}</span>
                    {isCurrent && (
                      <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">{def.summary}</p>
                  <div className="pt-2 border-t border-slate-100 text-[10px]">
                    <span className="text-slate-400">Scope: </span>
                    <span className="font-medium text-slate-700">{def.dataAccessScope}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Permissions Matrix Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold text-slate-700 w-2/5">Permission Capability</th>
                  {roles.map((r) => (
                    <th
                      key={r}
                      className={`py-2.5 px-3 font-semibold text-center ${
                        currentUser.role === r ? 'text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                      }`}
                    >
                      {r}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionRows.map((cat, catIdx) => (
                  <React.Fragment key={cat.category}>
                    <tr className="bg-slate-100/70 font-semibold text-slate-800">
                      <td colSpan={6} className="py-2 px-4 uppercase tracking-wider text-[10px] text-slate-600">
                        {cat.category}
                      </td>
                    </tr>
                    {cat.permissions.map((perm) => (
                      <tr key={perm.key} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-4 text-slate-700 font-medium">{perm.label}</td>
                        {roles.map((r) => {
                          const hasPerm = ROLE_DEFINITIONS[r].permissions.includes(perm.key as any);
                          const isCurrent = currentUser.role === r;
                          return (
                            <td
                              key={r}
                              className={`py-2 px-3 text-center ${isCurrent ? 'bg-emerald-50/30' : ''}`}
                            >
                              {hasPerm ? (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800">
                                  <Check className="w-3.5 h-3.5" />
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-slate-300">
                                  <Minus className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Role data boundaries are strictly enforced at the data query and component action layers.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium transition-colors"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
