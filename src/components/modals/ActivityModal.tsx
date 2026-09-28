import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Activity, SomalilandRegion } from '../../types/ngo';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  outputId: string;
  onSaveActivity: (outputId: string, activity: Omit<Activity, 'id'>) => void;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  outputId,
  onSaveActivity
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState(`ACT-${Math.floor(1 + Math.random() * 3)}.${Math.floor(1 + Math.random() * 3)}.${Math.floor(1 + Math.random() * 5)}`);
  const [assignedTo, setAssignedTo] = useState('Mohamed Nur');
  const [assignedRole, setAssignedRole] = useState('Field Agronomist');
  const [location, setLocation] = useState('Sheikh Rangeland Buffer Zone');
  const [region, setRegion] = useState<SomalilandRegion>('Togdheer');
  const [district, setDistrict] = useState('Sheikh');
  const [startDate, setStartDate] = useState('2025-02-01');
  const [endDate, setEndDate] = useState('2025-11-30');
  const [budgetAllocatedUSD, setBudgetAllocatedUSD] = useState(45000);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onSaveActivity(outputId, {
      outputId,
      code,
      title,
      description,
      assignedTo,
      assignedRole,
      location,
      region,
      district,
      startDate,
      endDate,
      status: 'In Progress',
      budgetAllocatedUSD,
      budgetSpentUSD: 0,
      progressPercent: 10
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-800" />
            <h2 className="text-sm font-bold text-slate-900">Add Project Field Activity</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Activity Title:</label>
            <input
              type="text"
              required
              placeholder="e.g. Conduct Community Seed Sowing in Gully Rehabilitation Plot"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Description / Methodology:</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Activity Code:</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Budget Allocated (USD):</label>
              <input
                type="number"
                min="0"
                value={budgetAllocatedUSD}
                onChange={(e) => setBudgetAllocatedUSD(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Assigned Field Officer:</label>
              <input
                type="text"
                required
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Role Title:</label>
              <input
                type="text"
                required
                value={assignedRole}
                onChange={(e) => setAssignedRole(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Region:</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as SomalilandRegion)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-50"
              >
                <option value="Maroodi Jeex">Maroodi Jeex</option>
                <option value="Togdheer">Togdheer</option>
                <option value="Sahil">Sahil</option>
                <option value="Awdal">Awdal</option>
                <option value="Sanaag">Sanaag</option>
                <option value="Sool">Sool</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">District / Village:</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900"
            >
              Save Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
