import React, { useState } from 'react';
import { X, Quote, MapPin } from 'lucide-react';
import { FieldEvidence, SomalilandRegion } from '../../types/ngo';
import { useAuth } from '../../context/AuthContext';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSaveEvidence: (projectId: string, evidence: Omit<FieldEvidence, 'id'>) => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onSaveEvidence
}) => {
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Sheikh Outskirts, Qoordheere Corridor');
  const [district, setDistrict] = useState('Sheikh');
  const [region, setRegion] = useState<SomalilandRegion>('Togdheer');
  const [gpsCoordinates, setGpsCoordinates] = useState('9.9324° N, 45.1912° E');
  const [summary, setSummary] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [speakerRole, setSpeakerRole] = useState('Women Pastoralist Representative');
  const [quoteText, setQuoteText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary) return;

    onSaveEvidence(projectId, {
      projectId,
      date: new Date().toISOString().slice(0, 10),
      title,
      location,
      district,
      region,
      gpsCoordinates,
      monitoredBy: `${currentUser.name} (${currentUser.jobTitle})`,
      summary,
      beneficiaryQuote: quoteText
        ? {
            text: quoteText,
            speakerName: speakerName || 'Community Representative',
            role: speakerRole,
            village: location
          }
        : undefined,
      verifiedStatus: 'Audited & Verified'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Quote className="w-5 h-5 text-emerald-800" />
            <h2 className="text-sm font-bold text-slate-900">Log M&amp;E Field Evidence &amp; Testimonial</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Field Mission / Inspection Title:</label>
            <input
              type="text"
              required
              placeholder="e.g. Qoordheere Communal Pasture Reseeding Harvest Inspection"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">GPS Coordinates:</label>
              <input
                type="text"
                required
                placeholder="e.g. 9.9324° N, 45.1912° E"
                value={gpsCoordinates}
                onChange={(e) => setGpsCoordinates(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Village / Landmark:</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">M&amp;E Verification Summary:</label>
            <textarea
              rows={3}
              required
              placeholder="Detail quantitative observations, vegetative density, pump functionality, or community feedback..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          {/* Testimonial Quote */}
          <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-2">
            <span className="font-semibold text-emerald-950 block">Beneficiary Testimonial Voice:</span>
            <textarea
              rows={2}
              placeholder="Direct quote translated from Somali: 'Our milking goats survived the dry season thanks to...'"
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Speaker Name (e.g. Amina Jama)"
                value={speakerName}
                onChange={(e) => setSpeakerName(e.target.value)}
                className="p-1.5 border border-slate-300 rounded bg-white text-xs"
              />
              <input
                type="text"
                placeholder="Speaker Role (e.g. Committee Treasurer)"
                value={speakerRole}
                onChange={(e) => setSpeakerRole(e.target.value)}
                className="p-1.5 border border-slate-300 rounded bg-white text-xs"
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
              Log Evidence Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
