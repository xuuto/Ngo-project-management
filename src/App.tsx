import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './features/layout';
import { DashboardView } from './features/dashboard';
import {
  ProjectsView,
  ProjectDetailView,
  ProjectModal,
  ActivityModal,
  IndicatorModal,
  BudgetLineModal,
  EvidenceModal
} from './features/projects';
import {
  FinanceSection,
  FinancialsView,
  ExpenseModal,
  InflowModal
} from './features/finance';
import { DonorsView } from './features/donors';
import {
  DonorReportsView,
  PrintableDonorReport,
  ReportGeneratorModal
} from './features/reporting';
import {
  BeneficiariesView,
  BeneficiaryModal,
  DisbursementModal
} from './features/beneficiaries';

import {
  Project,
  Donor,
  ExpenseRecord,
  FundInflow,
  DonorReport,
  ActivityStatus,
  IndicatorStatus,
  Activity,
  Indicator,
  FieldEvidence,
  BudgetLineItem
} from './types/ngo';
import { Beneficiary, DisbursementRecord } from './types/beneficiary';
import { BankAccount, FinancialCommitment, ProcurementOrder, FieldImprestAccount } from './types/finance';

import {
  getStoredProjects,
  saveStoredProjects,
  getStoredDonors,
  saveStoredDonors,
  getStoredExpenses,
  saveStoredExpenses,
  getStoredFundInflows,
  saveStoredFundInflows,
  getStoredReports,
  saveStoredReports,
  getStoredBeneficiaries,
  saveStoredBeneficiaries,
  getStoredDisbursements,
  saveStoredDisbursements,
  getStoredBankAccounts,
  saveStoredBankAccounts,
  getStoredCommitments,
  saveStoredCommitments,
  getStoredProcurementOrders,
  saveStoredProcurementOrders,
  getStoredImprestAccounts,
  saveStoredImprestAccounts,
  resetAllToDefaults
} from './services/storage';

const MainApp: React.FC = () => {
  const { currentUser, canAccessProject } = useAuth();

  // Primary Data State
  const [projects, setProjects] = useState<Project[]>(() => getStoredProjects());
  const [donors, setDonors] = useState<Donor[]>(() => getStoredDonors());
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => getStoredExpenses());
  const [fundInflows, setFundInflows] = useState<FundInflow[]>(() => getStoredFundInflows());
  const [reports, setReports] = useState<DonorReport[]>(() => getStoredReports());
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(() => getStoredBeneficiaries());
  const [disbursements, setDisbursements] = useState<DisbursementRecord[]>(() => getStoredDisbursements());
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => getStoredBankAccounts());
  const [commitments, setCommitments] = useState<FinancialCommitment[]>(() => getStoredCommitments());
  const [procurementOrders, setProcurementOrders] = useState<ProcurementOrder[]>(() => getStoredProcurementOrders());
  const [imprestAccounts, setImprestAccounts] = useState<FieldImprestAccount[]>(() => getStoredImprestAccounts());

  // Navigation & View State
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currencyMode, setCurrencyMode] = useState<'USD' | 'SLSH'>('USD');
  const [activePrintableReport, setActivePrintableReport] = useState<DonorReport | null>(null);

  // Modals
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseProjectId, setExpenseProjectId] = useState<string | undefined>(undefined);
  const [isInflowModalOpen, setIsInflowModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportProjectId, setReportProjectId] = useState<string | undefined>(undefined);
  const [reportDonorId, setReportDonorId] = useState<string | undefined>(undefined);
  const [isBeneficiaryModalOpen, setIsBeneficiaryModalOpen] = useState(false);
  const [isDisbursementModalOpen, setIsDisbursementModalOpen] = useState(false);
  const [disbursementBeneficiaryId, setDisbursementBeneficiaryId] = useState<string | undefined>(undefined);

  // Sub-entity Modals
  const [activityModalData, setActivityModalData] = useState<{ projectId: string; outputId: string } | null>(null);
  const [indicatorModalData, setIndicatorModalData] = useState<{ projectId: string; outputId: string } | null>(null);
  const [evidenceProjectId, setEvidenceProjectId] = useState<string | null>(null);
  const [budgetLineProjectId, setBudgetLineProjectId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    saveStoredProjects(projects);
  }, [projects]);

  useEffect(() => {
    saveStoredDonors(donors);
  }, [donors]);

  useEffect(() => {
    saveStoredExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveStoredFundInflows(fundInflows);
  }, [fundInflows]);

  useEffect(() => {
    saveStoredReports(reports);
  }, [reports]);

  useEffect(() => {
    saveStoredBeneficiaries(beneficiaries);
  }, [beneficiaries]);

  useEffect(() => {
    saveStoredDisbursements(disbursements);
  }, [disbursements]);

  useEffect(() => {
    saveStoredBankAccounts(bankAccounts);
  }, [bankAccounts]);

  useEffect(() => {
    saveStoredCommitments(commitments);
  }, [commitments]);

  useEffect(() => {
    saveStoredProcurementOrders(procurementOrders);
  }, [procurementOrders]);

  useEffect(() => {
    saveStoredImprestAccounts(imprestAccounts);
  }, [imprestAccounts]);

  // Selected Project Object
  const currentProject = projects.find((p) => p.id === selectedProjectId) || null;

  // Handlers
  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setActiveView('project_detail');
  };

  const handleResetData = () => {
    resetAllToDefaults();
    setProjects(getStoredProjects());
    setDonors(getStoredDonors());
    setExpenses(getStoredExpenses());
    setFundInflows(getStoredFundInflows());
    setReports(getStoredReports());
    setBeneficiaries(getStoredBeneficiaries());
    setDisbursements(getStoredDisbursements());
    setBankAccounts(getStoredBankAccounts());
    setCommitments(getStoredCommitments());
    setProcurementOrders(getStoredProcurementOrders());
    setImprestAccounts(getStoredImprestAccounts());
    setSelectedProjectId(null);
    setActiveView('dashboard');
  };

  const handleAddBeneficiary = (
    beneficiaryData: Omit<Beneficiary, 'id' | 'totalAssistanceReceivedUSD' | 'totalDisbursementsCount'>
  ) => {
    const newBen: Beneficiary = {
      id: `ben-${Date.now()}`,
      totalAssistanceReceivedUSD: 0,
      totalDisbursementsCount: 0,
      ...beneficiaryData
    };

    setBeneficiaries([newBen, ...beneficiaries]);

    // Update target project actual direct beneficiaries count
    if (newBen.enrolledProjects.length > 0) {
      const pId = newBen.enrolledProjects[0].projectId;
      setProjects((prev) =>
        prev.map((proj) => {
          if (proj.id !== pId) return proj;
          const isFemale = newBen.gender === 'Female';
          return {
            ...proj,
            beneficiaries: {
              ...proj.beneficiaries,
              actualDirect: proj.beneficiaries.actualDirect + 1,
              actualHouseholds: proj.beneficiaries.actualHouseholds + 1,
              disaggregation: {
                ...proj.beneficiaries.disaggregation,
                pastoralistWomen: isFemale
                  ? proj.beneficiaries.disaggregation.pastoralistWomen + 1
                  : proj.beneficiaries.disaggregation.pastoralistWomen,
                pastoralistMen: !isFemale
                  ? proj.beneficiaries.disaggregation.pastoralistMen + 1
                  : proj.beneficiaries.disaggregation.pastoralistMen
              }
            }
          };
        })
      );
    }
  };

  const handleAddDisbursement = (disbData: Omit<DisbursementRecord, 'id'>) => {
    const newDisb: DisbursementRecord = {
      id: `disb-${Date.now()}`,
      ...disbData
    };

    setDisbursements([newDisb, ...disbursements]);

    // Update beneficiary record
    setBeneficiaries((prev) =>
      prev.map((b) => {
        if (b.id !== newDisb.beneficiaryId) return b;
        return {
          ...b,
          totalAssistanceReceivedUSD: b.totalAssistanceReceivedUSD + newDisb.amountUSD,
          totalDisbursementsCount: b.totalDisbursementsCount + 1
        };
      })
    );

    // Also record as project expenditure voucher
    const matchingProject = projects.find((p) => p.id === newDisb.projectId);
    const targetBudgetLine = matchingProject?.budgetLines[0];

    const newExpense: ExpenseRecord = {
      id: `exp-disb-${Date.now()}`,
      voucherNumber: `PV-${newDisb.transactionRef}`,
      projectId: newDisb.projectId,
      projectCode: newDisb.projectCode,
      budgetLineCode: targetBudgetLine?.code || 'BL-103',
      budgetLineDescription: `Direct Mobile Cash Aid: ${newDisb.assistanceType} to ${newDisb.beneficiaryName}`,
      category: 'Direct Program Inputs & Works',
      date: newDisb.date,
      payee: `${newDisb.beneficiaryName} (${newDisb.beneficiaryPhone})`,
      description: newDisb.purposeNote,
      amountUSD: newDisb.amountUSD,
      amountSLSH: newDisb.amountSLSH,
      currencyPaid: 'USD',
      approvedBy: newDisb.approvedBy,
      receiptReference: newDisb.transactionRef,
      receiptFileName: `Mobile_Money_Receipt_${newDisb.transactionRef}.pdf`,
      receiptFileSize: '180 KB',
      donorCode: matchingProject?.grantAgreementCode.split('-')[0] || 'GRANT',
      status: 'Approved & Paid'
    };

    handleAddExpense(newExpense);
  };

  const handleAddProject = (newProject: Project) => {
    const updated = [newProject, ...projects];
    setProjects(updated);
    setSelectedProjectId(newProject.id);
    setActiveView('project_detail');
  };

  const handleAddExpense = (expenseData: Omit<ExpenseRecord, 'id'>) => {
    const newExpense: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      ...expenseData
    };

    setExpenses([newExpense, ...expenses]);

    // Update Project and Budget Line financials in real-time
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== newExpense.projectId) return proj;

        const updatedBudgetLines = proj.budgetLines.map((bl) => {
          if (bl.code === newExpense.budgetLineCode) {
            return {
              ...bl,
              spentUSD: bl.spentUSD + newExpense.amountUSD
            };
          }
          return bl;
        });

        const newSpent = proj.budgetSummary.expendituresUSD + newExpense.amountUSD;
        const newBalance = proj.budgetSummary.totalGrantUSD - newSpent;
        const newBurn = (newSpent / proj.budgetSummary.totalGrantUSD) * 100;

        return {
          ...proj,
          budgetLines: updatedBudgetLines,
          budgetSummary: {
            ...proj.budgetSummary,
            expendituresUSD: newSpent,
            remainingBalanceUSD: newBalance,
            burnRatePercent: Number(newBurn.toFixed(2))
          }
        };
      })
    );
  };

  const handleAddFundInflow = (inflowData: Omit<FundInflow, 'id'>) => {
    const newInflow: FundInflow = {
      id: `inf-${Date.now()}`,
      ...inflowData
    };

    setFundInflows([newInflow, ...fundInflows]);

    // Update project disbursed figure
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== newInflow.projectId) return proj;
        return {
          ...proj,
          budgetSummary: {
            ...proj.budgetSummary,
            disbursedUSD: proj.budgetSummary.disbursedUSD + newInflow.amountUSD
          }
        };
      })
    );
  };

  const handleAddCommitment = (commitmentData: Omit<FinancialCommitment, 'id'>) => {
    const newCommitment: FinancialCommitment = {
      id: `comm-${Date.now()}`,
      ...commitmentData
    };
    setCommitments((prev) => [newCommitment, ...prev]);
  };

  const handleAddProcurementOrder = (poData: Omit<ProcurementOrder, 'id'>) => {
    const newPO: ProcurementOrder = {
      id: `po-${Date.now()}`,
      ...poData
    };
    setProcurementOrders((prev) => [newPO, ...prev]);

    // Also automatically create an active encumbrance commitment for this PO
    const newCommitment: FinancialCommitment = {
      id: `comm-po-${Date.now()}`,
      commitmentNumber: `ENC-${newPO.poNumber}`,
      projectId: newPO.projectId,
      projectCode: newPO.projectCode,
      budgetLineCode: newPO.budgetLineCode,
      supplierName: newPO.vendorName,
      contractRef: newPO.poNumber,
      dateCommitted: newPO.dateInitiated,
      expectedDisbursementDate: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10),
      committedAmountUSD: newPO.finalCostUSD,
      disbursedAmountUSD: 0,
      remainingEncumbranceUSD: newPO.finalCostUSD,
      status: 'Active Encumbrance',
      purpose: newPO.title
    };
    setCommitments((prev) => [newCommitment, ...prev]);
  };

  const handleReplenishImprest = (accountId: string, amountUSD: number, vouchersCount: number) => {
    setImprestAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== accountId) return acc;
        return {
          ...acc,
          currentCashOnHandUSD: acc.floatCeilingUSD,
          unreconciledVouchersUSD: 0,
          status: 'Healthy Liquidity',
          lastReconciliationDate: new Date().toISOString().slice(0, 10)
        };
      })
    );
  };

  const handleUpdateActivityStatus = (
    projId: string,
    actId: string,
    status: ActivityStatus,
    progressPercent: number
  ) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projId) return proj;

        const updatedOutcomes = proj.logframe.outcomes.map((oc) => ({
          ...oc,
          outputs: oc.outputs.map((out) => ({
            ...out,
            activities: out.activities.map((act) => {
              if (act.id === actId) {
                return {
                  ...act,
                  status,
                  progressPercent
                };
              }
              return act;
            })
          }))
        }));

        return {
          ...proj,
          logframe: {
            ...proj.logframe,
            outcomes: updatedOutcomes
          }
        };
      })
    );
  };

  const handleUpdateIndicatorActual = (
    projId: string,
    indicatorId: string,
    actual: number,
    status: IndicatorStatus
  ) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projId) return proj;

        const updatedOutcomes = proj.logframe.outcomes.map((oc) => ({
          ...oc,
          outputs: oc.outputs.map((out) => ({
            ...out,
            indicators: out.indicators.map((ind) => {
              if (ind.id === indicatorId) {
                return {
                  ...ind,
                  currentActual: actual,
                  status
                };
              }
              return ind;
            })
          }))
        }));

        return {
          ...proj,
          logframe: {
            ...proj.logframe,
            outcomes: updatedOutcomes
          }
        };
      })
    );
  };

  const handleAddActivity = (outputId: string, actData: Omit<Activity, 'id'>) => {
    if (!activityModalData) return;
    const newAct: Activity = {
      id: `act-${Date.now()}`,
      ...actData
    };

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== activityModalData.projectId) return proj;

        const updatedOutcomes = proj.logframe.outcomes.map((oc) => ({
          ...oc,
          outputs: oc.outputs.map((out) => {
            if (out.id === outputId) {
              return {
                ...out,
                activities: [...out.activities, newAct]
              };
            }
            return out;
          })
        }));

        return {
          ...proj,
          logframe: {
            ...proj.logframe,
            outcomes: updatedOutcomes
          }
        };
      })
    );
  };

  const handleAddIndicator = (outputId: string, indData: Omit<Indicator, 'id'>) => {
    if (!indicatorModalData) return;
    const newInd: Indicator = {
      id: `ind-${Date.now()}`,
      ...indData
    };

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== indicatorModalData.projectId) return proj;

        const updatedOutcomes = proj.logframe.outcomes.map((oc) => ({
          ...oc,
          outputs: oc.outputs.map((out) => {
            if (out.id === outputId) {
              return {
                ...out,
                indicators: [...out.indicators, newInd]
              };
            }
            return out;
          })
        }));

        return {
          ...proj,
          logframe: {
            ...proj.logframe,
            outcomes: updatedOutcomes
          }
        };
      })
    );
  };

  const handleAddEvidence = (projId: string, evidenceData: Omit<FieldEvidence, 'id'>) => {
    const newEvidence: FieldEvidence = {
      id: `ev-${Date.now()}`,
      ...evidenceData
    };

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projId) return proj;
        return {
          ...proj,
          fieldEvidences: [newEvidence, ...proj.fieldEvidences]
        };
      })
    );
  };

  const handleAddBudgetLine = (projId: string, lineData: Omit<BudgetLineItem, 'id' | 'spentUSD'>) => {
    const newLine: BudgetLineItem = {
      id: `bl-${Date.now()}`,
      spentUSD: 0,
      ...lineData
    };

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projId) return proj;
        const updatedLines = [...proj.budgetLines, newLine];
        const newTotal = updatedLines.reduce((acc, l) => acc + l.totalAllocatedUSD, 0);

        return {
          ...proj,
          budgetLines: updatedLines,
          budgetSummary: {
            ...proj.budgetSummary,
            totalGrantUSD: newTotal,
            remainingBalanceUSD: newTotal - proj.budgetSummary.expendituresUSD,
            burnRatePercent: Number(((proj.budgetSummary.expendituresUSD / newTotal) * 100).toFixed(2))
          }
        };
      })
    );
  };

  const handleSaveReport = (newReport: DonorReport) => {
    setReports([newReport, ...reports]);
    setActivePrintableReport(newReport);
  };

  // If viewing printable formal donor dossier
  if (activePrintableReport) {
    const proj = projects.find((p) => p.id === activePrintableReport.projectId);
    return (
      <PrintableDonorReport
        report={activePrintableReport}
        project={proj}
        onClose={() => setActivePrintableReport(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <Header
        activeView={activeView}
        setActiveView={(v) => {
          setActiveView(v);
          if (v !== 'project_detail') setSelectedProjectId(null);
        }}
        currencyMode={currencyMode}
        setCurrencyMode={setCurrencyMode}
        onResetData={handleResetData}
        onOpenNewProjectModal={() => setIsProjectModalOpen(true)}
        onOpenExpenseModal={() => {
          setExpenseProjectId(undefined);
          setIsExpenseModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'dashboard' && (
          <DashboardView
            projects={projects}
            donors={donors}
            expenses={expenses}
            fundInflows={fundInflows}
            reports={reports}
            currencyMode={currencyMode}
            onSelectProject={handleSelectProject}
            onOpenReportModal={(pId) => {
              setReportProjectId(pId);
              setIsReportModalOpen(true);
            }}
            onViewReport={(rep) => setActivePrintableReport(rep)}
            setActiveView={setActiveView}
          />
        )}

        {activeView === 'projects' && (
          <ProjectsView
            projects={projects}
            currencyMode={currencyMode}
            onSelectProject={handleSelectProject}
            onOpenNewProjectModal={() => setIsProjectModalOpen(true)}
          />
        )}

        {activeView === 'project_detail' && currentProject && (
          <ProjectDetailView
            project={currentProject}
            currencyMode={currencyMode}
            onBack={() => {
              setSelectedProjectId(null);
              setActiveView('projects');
            }}
            onUpdateActivityStatus={handleUpdateActivityStatus}
            onUpdateIndicatorActual={handleUpdateIndicatorActual}
            onOpenActivityModal={(pId, outId) => setActivityModalData({ projectId: pId, outputId: outId })}
            onOpenIndicatorModal={(pId, outId) => setIndicatorModalData({ projectId: pId, outputId: outId })}
            onOpenExpenseModal={(pId) => {
              setExpenseProjectId(pId);
              setIsExpenseModalOpen(true);
            }}
            onOpenEvidenceModal={(pId) => setEvidenceProjectId(pId)}
            onOpenReportModal={(pId) => {
              setReportProjectId(pId);
              setIsReportModalOpen(true);
            }}
            onViewReportByProject={(pId) => {
              const rep = reports.find((r) => r.projectId === pId);
              if (rep) setActivePrintableReport(rep);
              else {
                setReportProjectId(pId);
                setIsReportModalOpen(true);
              }
            }}
          />
        )}

        {activeView === 'financials' && (
          <FinanceSection
            projects={projects}
            donors={donors}
            expenses={expenses}
            fundInflows={fundInflows}
            bankAccounts={bankAccounts}
            commitments={commitments}
            procurementOrders={procurementOrders}
            imprestAccounts={imprestAccounts}
            currencyMode={currencyMode}
            onOpenExpenseModal={() => {
              setExpenseProjectId(undefined);
              setIsExpenseModalOpen(true);
            }}
            onOpenInflowModal={() => setIsInflowModalOpen(true)}
            onAddCommitment={handleAddCommitment}
            onAddProcurementOrder={handleAddProcurementOrder}
            onReplenishImprest={handleReplenishImprest}
          />
        )}

        {activeView === 'donors' && (
          <DonorsView
            donors={donors}
            projects={projects}
            currencyMode={currencyMode}
            onSelectProject={handleSelectProject}
            onOpenReportModal={(pId, dId) => {
              setReportProjectId(pId);
              setReportDonorId(dId);
              setIsReportModalOpen(true);
            }}
          />
        )}

        {activeView === 'reports' && (
          <DonorReportsView
            reports={reports}
            projects={projects}
            donors={donors}
            currencyMode={currencyMode}
            onViewReport={(rep) => setActivePrintableReport(rep)}
            onOpenReportModal={() => {
              setReportProjectId(undefined);
              setIsReportModalOpen(true);
            }}
          />
        )}

        {activeView === 'beneficiaries' && (
          <BeneficiariesView
            beneficiaries={beneficiaries}
            disbursements={disbursements}
            projects={projects}
            currencyMode={currencyMode}
            onOpenBeneficiaryModal={() => setIsBeneficiaryModalOpen(true)}
            onOpenDisbursementModal={(bId) => {
              setDisbursementBeneficiaryId(bId);
              setIsDisbursementModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">PENHA Horn of Africa</span>
            <span>·</span>
            <span>Hargeisa Country Desk &amp; Field Sub-offices (Togdheer, Sahil, Awdal, Sool, Sanaag)</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-400">
              Session User: <strong className="text-slate-700">{currentUser.name}</strong> ({currentUser.role})
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        donors={donors}
        onSaveProject={handleAddProject}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseProjectId(undefined);
        }}
        projects={projects}
        preselectedProjectId={expenseProjectId}
        onSaveExpense={handleAddExpense}
      />

      <InflowModal
        isOpen={isInflowModalOpen}
        onClose={() => setIsInflowModalOpen(false)}
        donors={donors}
        projects={projects}
        onSaveInflow={handleAddFundInflow}
      />

      <ReportGeneratorModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportProjectId(undefined);
          setReportDonorId(undefined);
        }}
        projects={projects}
        donors={donors}
        preselectedProjectId={reportProjectId}
        preselectedDonorId={reportDonorId}
        onSaveReport={handleSaveReport}
      />

      {activityModalData && (
        <ActivityModal
          isOpen={true}
          onClose={() => setActivityModalData(null)}
          outputId={activityModalData.outputId}
          onSaveActivity={handleAddActivity}
        />
      )}

      {indicatorModalData && (
        <IndicatorModal
          isOpen={true}
          onClose={() => setIndicatorModalData(null)}
          outputId={indicatorModalData.outputId}
          onSaveIndicator={handleAddIndicator}
        />
      )}

      {evidenceProjectId && (
        <EvidenceModal
          isOpen={true}
          onClose={() => setEvidenceProjectId(null)}
          projectId={evidenceProjectId}
          onSaveEvidence={handleAddEvidence}
        />
      )}

      {budgetLineProjectId && (
        <BudgetLineModal
          isOpen={true}
          onClose={() => setBudgetLineProjectId(null)}
          projectId={budgetLineProjectId}
          onSaveBudgetLine={handleAddBudgetLine}
        />
      )}

      <BeneficiaryModal
        isOpen={isBeneficiaryModalOpen}
        onClose={() => setIsBeneficiaryModalOpen(false)}
        projects={projects}
        onSaveBeneficiary={handleAddBeneficiary}
      />

      <DisbursementModal
        isOpen={isDisbursementModalOpen}
        onClose={() => {
          setIsDisbursementModalOpen(false);
          setDisbursementBeneficiaryId(undefined);
        }}
        beneficiaries={beneficiaries}
        projects={projects}
        preselectedBeneficiaryId={disbursementBeneficiaryId}
        onSaveDisbursement={handleAddDisbursement}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
