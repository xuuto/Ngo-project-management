import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  Layers,
  Users,
  Calendar,
  CheckCircle2,
  FileText,
  Activity
} from 'lucide-react';
import { Project, RiskItem, RiskSeverity, RiskCategory, RiskStatus } from '../../types/ngo';

interface AddRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  defaultProjectId?: string;
  onSaveRisk: (risk: RiskItem, projectId: string) => void;
  initialRisk?: RiskItem | null;
}

export const AddRiskModal: React.FC<AddRiskModalProps> = ({
  isOpen,
  onClose,
  projects,
  defaultProjectId,
  onSaveRisk,
  initialRisk
}) => {
  const [projectId, setProjectId] = useState<string>(
    initialRisk?.projectId || defaultProjectId || (projects[0]?.id ?? '')
  );
  const [description, setDescription] = useState<string>(initialRisk?.description || '');
  const [riskLevel, setRiskLevel] = useState<RiskSeverity>(initialRisk?.riskLevel || 'Medium');
  const [category, setCategory] = useState<RiskCategory>(initialRisk?.category || 'Access & Security');
  const [mitigationPlan, setMitigationPlan] = useState<string>(initialRisk?.mitigationPlan || '');
  const [status, setStatus] = useState<RiskStatus>(initialRisk?.status || 'Active Monitoring');
  const [likelihood, setLikelihood] = useState<'Rare' | 'Unlikely' | 'Possible' | 'Likely' | 'Almost Certain'>(
    initialRisk?.likelihood || 'Possible'
  );
  const [impact, setImpact] = useState<'Insignificant' | 'Minor' | 'Moderate' | 'Major' | 'Critical'>(
    initialRisk?.impact || 'Moderate'
  );
  const [humanitarianImpactArea, setHumanitarianImpactArea] = useState<
    'Food & Fodder Delivery' | 'Water Supply Pumping' | 'Cash Transfers (Zaad/Sahal)' | 'Staff & Asset Security' | 'Cross-Border Access' | 'Medical / Cold-Chain Storage'
  >(initialRisk?.humanitarianImpactArea || 'Food & Fodder Delivery');
  const [assignedFocalPoint, setAssignedFocalPoint] = useState<string>(initialRisk?.assignedFocalPoint || '');
  const [earlyWarningTriggers, setEarlyWarningTriggers] = useState<string>(initialRisk?.earlyWarningTriggers || '');
  const [targetReviewDate, setTargetReviewDate] = useState<string>(
    initialRisk?.lastReviewDate || new Date().toISOString().split('T')[0]
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !mitigationPlan.trim() || !projectId) return;

    const selectedProj = projects.find((p) => p.id === projectId);

    const newRisk: RiskItem = {
      id: initialRisk?.id || `rk-${Date.now()}`,
      projectId,
      projectCode: selectedProj?.code,
      projectTitle: selectedProj?.shortTitle || selectedProj?.title,
      description: description.trim(),
      riskLevel,
      category,
      mitigationPlan: mitigationPlan.trim(),
      status,
      likelihood,
      impact,
      humanitarianImpactArea,
      assignedFocalPoint: assignedFocalPoint.trim() || (selectedProj?.leadProjectManager.name ?? 'Field Coordinator'),
      dateIdentified: initialRisk?.dateIdentified || new Date().toISOString().split('T')[0],
      lastReviewDate: targetReviewDate,
      earlyWarningTriggers: earlyWarningTriggers.trim() || undefined
    };

    onSaveRisk(newRisk, projectId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-800">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialRisk ? 'Edit Project Risk & Mitigation' : 'Log New Project Risk & Mitigation'}
              </h3>
              <p className="text-xs text-slate-500">
                Identify operational threats, evaluate severity, and formulate humanitarian continuity plans
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Project Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Target Project <span className="text-rose-600">*</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden font-medium"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.shortTitle} ({p.donorName})
                </option>
              ))}
            </select>
          </div>

          {/* Risk Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Risk Description &amp; Threat Statement <span className="text-rose-600">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={2}
              placeholder="e.g. Drought-induced inter-clan pasture disputes in Sheikh corridor blocking fodder distribution trucks..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            />
          </div>

          {/* Category & Severity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Risk Category <span className="text-rose-600">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RiskCategory)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              >
                <option value="Access & Security">Access &amp; Security</option>
                <option value="Environmental / Drought">Environmental / Drought</option>
                <option value="Market & Price Fluctuations">Market &amp; Price Fluctuations</option>
                <option value="Institutional & Governance">Institutional &amp; Governance</option>
                <option value="Operational & Logistics">Operational &amp; Logistics</option>
                <option value="Financial & Compliance">Financial &amp; Compliance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Risk Severity Level <span className="text-rose-600">*</span>
              </label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as RiskSeverity)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden font-bold"
              >
                <option value="Low">Low — Manageable via Routine Ops</option>
                <option value="Medium">Medium — Elevated Monitoring Required</option>
                <option value="High">High — Immediate Mitigation &amp; Leadership Oversight</option>
                <option value="Severe">Severe — Threatens Intervention Delivery Cease</option>
              </select>
            </div>
          </div>

          {/* Likelihood & Impact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Likelihood</label>
              <select
                value={likelihood}
                onChange={(e) => setLikelihood(e.target.value as any)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
              >
                <option value="Rare">Rare (1)</option>
                <option value="Unlikely">Unlikely (2)</option>
                <option value="Possible">Possible (3)</option>
                <option value="Likely">Likely (4)</option>
                <option value="Almost Certain">Almost Certain (5)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Impact Level</label>
              <select
                value={impact}
                onChange={(e) => setImpact(e.target.value as any)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
              >
                <option value="Insignificant">Insignificant</option>
                <option value="Minor">Minor</option>
                <option value="Moderate">Moderate</option>
                <option value="Major">Major</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Humanitarian Area</label>
              <select
                value={humanitarianImpactArea}
                onChange={(e) => setHumanitarianImpactArea(e.target.value as any)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
              >
                <option value="Food & Fodder Delivery">Food &amp; Fodder Delivery</option>
                <option value="Water Supply Pumping">Water Supply Pumping</option>
                <option value="Cash Transfers (Zaad/Sahal)">Cash Transfers (Zaad/Sahal)</option>
                <option value="Staff & Asset Security">Staff &amp; Asset Security</option>
                <option value="Cross-Border Access">Cross-Border Access</option>
                <option value="Medical / Cold-Chain Storage">Medical / Cold-Chain Storage</option>
              </select>
            </div>
          </div>

          {/* Mitigation Strategy */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Mitigation Strategy &amp; Humanitarian Continuity Plan <span className="text-rose-600">*</span>
            </label>
            <textarea
              value={mitigationPlan}
              onChange={(e) => setMitigationPlan(e.target.value)}
              required
              rows={3}
              placeholder="e.g. Conclude formal customary Xeer agreement with regional Sultan elders; reroute delivery trucks via southern bypass..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            />
          </div>

          {/* Early Warning Triggers */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Early Warning Indicators &amp; Triggers (Optional)
            </label>
            <input
              type="text"
              value={earlyWarningTriggers}
              onChange={(e) => setEarlyWarningTriggers(e.target.value)}
              placeholder="e.g. Fuel price increase >20%; dry spell exceeding 25 days; local elder security report"
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            />
          </div>

          {/* Assigned Focal Point & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Focal Person</label>
              <input
                type="text"
                value={assignedFocalPoint}
                onChange={(e) => setAssignedFocalPoint(e.target.value)}
                placeholder="e.g. Field Security Officer"
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Monitoring Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RiskStatus)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800 font-semibold"
              >
                <option value="Active Monitoring">Active Monitoring</option>
                <option value="Mitigated">Mitigated / Resolved</option>
                <option value="Escalated">Escalated to Director</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Review Date</label>
              <input
                type="date"
                value={targetReviewDate}
                onChange={(e) => setTargetReviewDate(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialRisk ? 'Save Changes' : 'Log Risk & Strategy'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
