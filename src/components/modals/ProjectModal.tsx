import React, { useState } from 'react';
import { X, Plus, Layers, Building } from 'lucide-react';
import { Project, SectorPillar, SomalilandRegion } from '../../types/ngo';
import { Donor } from '../../types/ngo';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  donors: Donor[];
  onSaveProject: (project: Project) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  donors,
  onSaveProject
}) => {
  const [title, setTitle] = useState('');
  const [shortTitle, setShortTitle] = useState('');
  const [code, setCode] = useState(`PENHA-SOM-${new Date().getFullYear()}-0${Math.floor(5 + Math.random() * 5)}`);
  const [donorId, setDonorId] = useState(donors[0]?.id || 'donor-eu');
  const [grantAgreementCode, setGrantAgreementCode] = useState(`GRANT-HOA-${Math.floor(1000 + Math.random() * 9000)}`);
  const [pillar, setPillar] = useState<SectorPillar>('Rangeland & Water Management');
  const [totalGrantUSD, setTotalGrantUSD] = useState(1200000);
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [regions, setRegions] = useState<SomalilandRegion[]>(['Maroodi Jeex', 'Togdheer']);
  const [districts, setDistricts] = useState('Gabiley, Sheikh, Burao');
  const [impactGoal, setImpactGoal] = useState('');
  const [managerName, setManagerName] = useState('Eng. Ismail Jama Farah');
  const [managerEmail, setManagerEmail] = useState('i.jama@penha-hargeisa.org');

  if (!isOpen) return null;

  const selectedDonor = donors.find((d) => d.id === donorId) || donors[0];

  const handleToggleRegion = (r: SomalilandRegion) => {
    if (regions.includes(r)) {
      setRegions(regions.filter((x) => x !== r));
    } else {
      setRegions([...regions, r]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !shortTitle || !impactGoal || totalGrantUSD <= 0) {
      alert('Please fill out all required fields.');
      return;
    }

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      code,
      title,
      shortTitle,
      donorId: selectedDonor.id,
      donorName: selectedDonor.shortName,
      grantAgreementCode,
      pillar,
      status: 'Active',
      startDate,
      endDate,
      reportingFrequency: 'Quarterly',
      nextDonorReportDate: '2026-11-30',
      targetRegions: regions.length > 0 ? regions : ['Maroodi Jeex'],
      targetDistricts: districts.split(',').map((d) => d.trim()),
      leadProjectManager: {
        name: managerName,
        role: 'Senior Project Lead',
        email: managerEmail,
        phone: '+252 63 441 2981'
      },
      fieldCoordinator: {
        name: 'Fadumo Abdi Warsame',
        baseOffice: 'Field Office',
        phone: '+252 63 429 8831'
      },
      budgetSummary: {
        totalGrantUSD,
        disbursedUSD: Math.round(totalGrantUSD * 0.65),
        expendituresUSD: Math.round(totalGrantUSD * 0.45),
        commitmentsUSD: Math.round(totalGrantUSD * 0.1),
        remainingBalanceUSD: Math.round(totalGrantUSD * 0.45),
        burnRatePercent: 45.0
      },
      logframe: {
        impactGoal,
        outcomes: [
          {
            id: `oc-${Date.now()}`,
            code: 'OC-1',
            title: 'Pastoralist community resilience and sustainable natural resource management operationalized.',
            outputs: [
              {
                id: `out-${Date.now()}`,
                code: 'OUT-1.1',
                title: 'Target pastoralist communities actively engaged in drought adaptation activities.',
                targetCompletionDate: endDate,
                indicators: [
                  {
                    id: `ind-${Date.now()}`,
                    code: 'IND-1.1.1',
                    outputId: `out-${Date.now()}`,
                    description: 'Number of pastoral households directly benefiting from project interventions',
                    unit: 'Households',
                    baseline: 0,
                    target: 2500,
                    currentActual: 1100,
                    meansOfVerification: 'Field registration ledgers & Ministry verification deeds',
                    frequency: 'Quarterly',
                    dataCollectionMethod: 'Household surveys & GPS mapping',
                    status: 'On Track'
                  }
                ],
                activities: [
                  {
                    id: `act-${Date.now()}`,
                    outputId: `out-${Date.now()}`,
                    code: 'ACT-1.1.1',
                    title: 'Mobilize community pastoral committees and conduct participatory planning',
                    description: 'Engage traditional elders and women pastoralists across target villages.',
                    assignedTo: managerName,
                    assignedRole: 'Lead Coordinator',
                    location: districts,
                    region: regions[0] || 'Maroodi Jeex',
                    district: districts.split(',')[0]?.trim() || 'Gabiley',
                    startDate,
                    endDate,
                    status: 'In Progress',
                    budgetAllocatedUSD: Math.round(totalGrantUSD * 0.15),
                    budgetSpentUSD: Math.round(totalGrantUSD * 0.08),
                    progressPercent: 50
                  }
                ]
              }
            ]
          }
        ]
      },
      budgetLines: [
        {
          id: `bl-${Date.now()}-1`,
          code: 'BL-101',
          category: 'Personnel & Field Staff',
          description: 'Project Coordinator, Field Agronomist & M&E Officer salaries',
          unit: 'Staff-months',
          quantity: 24,
          unitCostUSD: 1800,
          totalAllocatedUSD: Math.round(totalGrantUSD * 0.2),
          spentUSD: Math.round(totalGrantUSD * 0.1)
        },
        {
          id: `bl-${Date.now()}-2`,
          code: 'BL-103',
          category: 'Direct Program Inputs & Works',
          description: 'Direct field supplies, community infrastructure & solar equipment',
          unit: 'Lot',
          quantity: 1,
          unitCostUSD: Math.round(totalGrantUSD * 0.6),
          totalAllocatedUSD: Math.round(totalGrantUSD * 0.6),
          spentUSD: Math.round(totalGrantUSD * 0.28)
        },
        {
          id: `bl-${Date.now()}-3`,
          code: 'BL-106',
          category: 'Indirect & Secretariat Overheads',
          description: 'Institutional management & operational support (7%)',
          unit: 'Months',
          quantity: 24,
          unitCostUSD: Math.round((totalGrantUSD * 0.07) / 24),
          totalAllocatedUSD: Math.round(totalGrantUSD * 0.07),
          spentUSD: Math.round(totalGrantUSD * 0.035)
        }
      ],
      beneficiaries: {
        targetDirect: 15000,
        actualDirect: 6800,
        targetIndirect: 45000,
        actualIndirect: 19500,
        targetHouseholds: 2500,
        actualHouseholds: 1100,
        disaggregation: {
          pastoralistWomen: 3750,
          pastoralistMen: 3050,
          youthUnder25: 2200,
          elderlyHerders: 750,
          personsWithDisabilities: 280,
          idpReturneeHouseholds: 310
        }
      },
      fieldEvidences: [],
      risks: [
        {
          id: `rk-${Date.now()}`,
          description: 'Drought severity impacting pasture availability',
          riskLevel: 'Medium',
          category: 'Environmental / Drought',
          mitigationPlan: 'Contour soil moisture bunding and emergency fodder reserves.',
          status: 'Active Monitoring'
        }
      ],
      milestones: [
        {
          id: `ms-${Date.now()}-1`,
          projectId: `proj-${Date.now()}`,
          title: 'Project Inception & Baseline Survey',
          description: 'Socio-economic baseline survey and community consultation meetings.',
          dueDate: startDate,
          completionDate: startDate,
          status: 'Achieved',
          category: 'M&E Review',
          assignedLead: managerName,
          isCriticalCheckpoint: true,
          verificationCriteria: 'Signed baseline survey report and community meeting minutes'
        },
        {
          id: `ms-${Date.now()}-2`,
          projectId: `proj-${Date.now()}`,
          title: 'Mid-Term Review & Field Verification Audit',
          description: 'Mid-term progress review and field indicator verification.',
          dueDate: '2026-06-30',
          status: 'In Progress',
          category: 'Key Delivery',
          assignedLead: managerName,
          isCriticalCheckpoint: true,
          verificationCriteria: 'Mid-term technical audit report and indicator verification logs'
        }
      ]
    };

    onSaveProject(newProject);
    onClose();
  };

  const allRegions: SomalilandRegion[] = [
    'Maroodi Jeex',
    'Togdheer',
    'Sahil',
    'Awdal',
    'Sanaag',
    'Sool'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Create New Project Proposal</h2>
              <p className="text-[11px] text-slate-500">Configure logframe baseline, budget, and donor covenants</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Title & Short Title */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Full Project Title:</label>
            <input
              type="text"
              required
              placeholder="e.g. Somaliland Dryland Pastoral Resilience and Water Security Project"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Short Display Title:</label>
              <input
                type="text"
                required
                placeholder="e.g. Dryland Water Security"
                value={shortTitle}
                onChange={(e) => setShortTitle(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Project Internal Code:</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Donor & Pillar */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Financing Donor:</label>
              <select
                value={donorId}
                onChange={(e) => setDonorId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden"
              >
                {donors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.shortName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Thematic Sector / Pillar:</label>
              <select
                value={pillar}
                onChange={(e) => setPillar(e.target.value as SectorPillar)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden"
              >
                <option value="Rangeland & Water Management">Rangeland &amp; Water Management</option>
                <option value="Pastoralist Women Livelihoods">Pastoralist Women Livelihoods</option>
                <option value="Livestock Health & Fodder Security">Livestock Health &amp; Fodder</option>
                <option value="Climate Resilience & Drought Early Action">Climate Resilience &amp; Drought</option>
                <option value="Natural Dryland Resins & Value Chains">Natural Dryland Resins</option>
              </select>
            </div>
          </div>

          {/* Budget & Agreement Code */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Total Grant Envelope (USD $):</label>
              <input
                type="number"
                min="10000"
                step="5000"
                required
                value={totalGrantUSD}
                onChange={(e) => setTotalGrantUSD(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Grant Agreement Ref Code:</label>
              <input
                type="text"
                required
                value={grantAgreementCode}
                onChange={(e) => setGrantAgreementCode(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Regions Selection */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Target Somaliland Regions:</label>
            <div className="flex flex-wrap gap-2">
              {allRegions.map((reg) => (
                <button
                  type="button"
                  key={reg}
                  onClick={() => handleToggleRegion(reg)}
                  className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                    regions.includes(reg)
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          {/* Districts */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Districts &amp; Target Corridors:</label>
            <input
              type="text"
              placeholder="e.g. Gabiley, Arabsiyo, Sheikh, Oodweyne"
              value={districts}
              onChange={(e) => setDistricts(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden"
            />
          </div>

          {/* Impact Goal */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Long-Term Impact / Objective Goal:</label>
            <textarea
              rows={2}
              required
              placeholder="Describe long-term sustainable change for pastoral communities..."
              value={impactGoal}
              onChange={(e) => setImpactGoal(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden"
            />
          </div>

          {/* Lead Manager */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Lead Project Manager:</label>
              <input
                type="text"
                required
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Manager Official Email:</label>
              <input
                type="email"
                required
                value={managerEmail}
                onChange={(e) => setManagerEmail(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Save Project Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
