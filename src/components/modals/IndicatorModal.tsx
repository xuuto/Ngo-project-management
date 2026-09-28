import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { Indicator } from '../../types/ngo';

interface IndicatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  outputId: string;
  onSaveIndicator: (outputId: string, indicator: Omit<Indicator, 'id'>) => void;
}

export const IndicatorModal: React.FC<IndicatorModalProps> = ({
  isOpen,
  onClose,
  outputId,
  onSaveIndicator
}) => {
  const [code, setCode] = useState(`IND-${Math.floor(1 + Math.random() * 3)}.${Math.floor(1 + Math.random() * 3)}.${Math.floor(1 + Math.random() * 5)}`);
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('Hectares');
  const [baseline, setBaseline] = useState(0);
  const [target, setTarget] = useState(1500);
  const [currentActual, setCurrentActual] = useState(0);
  const [meansOfVerification, setMeansOfVerification] = useState('Satellite NDVI telemetry & Somaliland MoAD joint inspection');
  const [dataCollectionMethod, setDataCollectionMethod] = useState('GPS ground polygon walk & drone orthomosaic imagery');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || target <= 0) return;

    onSaveIndicator(outputId, {
      code,
      outputId,
      description,
      unit,
      baseline,
      target,
      currentActual,
      meansOfVerification,
      frequency: 'Quarterly',
      dataCollectionMethod,
      status: currentActual >= target ? 'Achieved' : currentActual > 0 ? 'On Track' : 'On Track'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-800" />
            <h2 className="text-sm font-bold text-slate-900">Add Objectively Verifiable Indicator (OVI)</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Indicator Code:</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Measurement Unit:</label>
              <input
                type="text"
                required
                placeholder="e.g. Hectares, Water Points, Liters/Day"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Indicator Statement:</label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Hectares of communal rangeland actively reseeded with perennial Cenchrus grass"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Baseline Value:</label>
              <input
                type="number"
                min="0"
                value={baseline}
                onChange={(e) => setBaseline(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Life of Project Target:</label>
              <input
                type="number"
                min="1"
                required
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono font-bold bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Current Actual:</label>
              <input
                type="number"
                min="0"
                value={currentActual}
                onChange={(e) => setCurrentActual(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono text-emerald-800 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Means of Verification (Audit Trail):</label>
            <textarea
              rows={2}
              required
              value={meansOfVerification}
              onChange={(e) => setMeansOfVerification(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
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
              Save Indicator
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
