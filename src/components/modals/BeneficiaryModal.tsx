import React, { useState } from 'react';
import { X, UserPlus, Phone, MapPin, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Beneficiary, VulnerabilityCategory, PrimaryLivelihood, MobileMoneyProvider } from '../../types/beneficiary';
import { Project, SomalilandRegion } from '../../types/ngo';

interface BeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSaveBeneficiary: (beneficiary: Omit<Beneficiary, 'id' | 'totalAssistanceReceivedUSD' | 'totalDisbursementsCount'>) => void;
}

export const BeneficiaryModal: React.FC<BeneficiaryModalProps> = ({
  isOpen,
  onClose,
  projects,
  onSaveBeneficiary
}) => {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Female' | 'Male'>('Female');
  const [age, setAge] = useState<number>(36);
  const [householdSize, setHouseholdSize] = useState<number>(6);
  const [vulnerabilityCategory, setVulnerabilityCategory] = useState<VulnerabilityCategory>(
    'Pastoralist Women Headed Household'
  );
  const [primaryLivelihood, setPrimaryLivelihood] = useState<PrimaryLivelihood>(
    'Camel Dairy Production'
  );
  const [region, setRegion] = useState<SomalilandRegion>('Togdheer');
  const [district, setDistrict] = useState('Sheikh');
  const [village, setVillage] = useState('Qoordheere');
  const [gpsCoordinates, setGpsCoordinates] = useState('9.9324° N, 45.1912° E');
  const [provider, setProvider] = useState<MobileMoneyProvider>('Telesom ZAAD');
  const [phoneNumber, setPhoneNumber] = useState('+252 63 ');
  const [accountName, setAccountName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [projectRole, setProjectRole] = useState<'VSLA Member' | 'Cash-for-Work Laborer' | 'Dairy Supplier' | 'Farmer Field School' | 'Emergency Fodder Recipient'>('VSLA Member');
  const [verificationStatus, setVerificationStatus] = useState<'Village Elder Certified' | 'Biometric Verified'>('Village Elder Certified');
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const targetProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber) {
      alert('Please fill out all required fields.');
      return;
    }

    const regNum = `BEN-SOM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    onSaveBeneficiary({
      registrationNumber: regNum,
      fullName,
      gender,
      age,
      householdSize,
      vulnerabilityCategory,
      primaryLivelihood,
      region,
      district,
      village,
      gpsCoordinates,
      mobileMoney: {
        provider,
        phoneNumber,
        accountName: accountName || fullName,
        accountStatus: 'Verified'
      },
      enrolledProjects: [
        {
          projectId: targetProject.id,
          projectCode: targetProject.code,
          projectTitle: targetProject.shortTitle,
          enrollmentDate: new Date().toISOString().slice(0, 10),
          role: projectRole
        }
      ],
      verificationStatus,
      nationalIdNumber: nationalIdNumber || `SL-ID-${region.slice(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
      registrationDate: new Date().toISOString().slice(0, 10),
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Register Pastoralist Beneficiary</h2>
              <p className="text-[11px] text-slate-500">Community household enumeration &amp; mobile money registration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Full Name & Gender */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Full Somali Name:</label>
              <input
                type="text"
                required
                placeholder="e.g. Amina Jama Dualeh"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (!accountName) setAccountName(e.target.value);
                }}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Gender:</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Female' | 'Male')}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-50 font-medium"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          </div>

          {/* Age & Household Size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Age:</label>
              <input
                type="number"
                min="18"
                max="95"
                required
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Household Members (Dependent Size):</label>
              <input
                type="number"
                min="1"
                max="25"
                required
                value={householdSize}
                onChange={(e) => setHouseholdSize(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          {/* Vulnerability & Primary Livelihood */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Vulnerability Category:</label>
              <select
                value={vulnerabilityCategory}
                onChange={(e) => setVulnerabilityCategory(e.target.value as VulnerabilityCategory)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-50"
              >
                <option value="Pastoralist Women Headed Household">Pastoralist Women Headed Household</option>
                <option value="Agro-pastoralist Smallholder">Agro-pastoralist Smallholder</option>
                <option value="Elderly Herder">Elderly Herder</option>
                <option value="Marginalized Youth">Marginalized Youth</option>
                <option value="Displaced / Returnee Pastoralist">Displaced / Returnee Pastoralist</option>
                <option value="Person with Disability">Person with Disability</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Primary Pastoral Livelihood:</label>
              <select
                value={primaryLivelihood}
                onChange={(e) => setPrimaryLivelihood(e.target.value as PrimaryLivelihood)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-50"
              >
                <option value="Camel & Goat Pastoralism">Camel &amp; Goat Pastoralism</option>
                <option value="Camel Dairy Production">Camel Dairy Production</option>
                <option value="Dryland Rainfed Sorghum">Dryland Rainfed Sorghum</option>
                <option value="Frankincense Resin Harvester">Frankincense Resin Harvester</option>
                <option value="Rangeland Restoration Worker">Rangeland Restoration Worker</option>
              </select>
            </div>
          </div>

          {/* Location: Region, District, Village */}
          <div className="grid grid-cols-3 gap-2">
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
              <label className="block text-slate-700 font-semibold mb-1">District:</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Village / Grazing Area:</label>
              <input
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Mobile Money Details (ZAAD / Sahal) */}
          <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-2.5">
            <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-800" />
              Mobile Money Account (Direct Cash Transfers):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Provider:</label>
                <select
                  value={provider}
                  onChange={(e) => {
                    const p = e.target.value as MobileMoneyProvider;
                    setProvider(p);
                    if (p === 'Telesom ZAAD') setPhoneNumber('+252 63 ');
                    else if (p === 'Somtel Sahal') setPhoneNumber('+252 65 ');
                  }}
                  className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white font-medium"
                >
                  <option value="Telesom ZAAD">Telesom ZAAD (+252 63)</option>
                  <option value="Somtel Sahal">Somtel Sahal (+252 65)</option>
                  <option value="Direct Cash / Bank">Direct Cash / Bank</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Mobile Phone Number:</label>
                <input
                  type="text"
                  required
                  placeholder="+252 63 448 1928"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded text-xs font-mono bg-white font-semibold"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Registered Account Holder Name:</label>
              <input
                type="text"
                placeholder="Matches SIM registration name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white"
              />
            </div>
          </div>

          {/* Enrolled Project & Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Enrolling Project:</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-50"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.shortTitle}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Community Activity Role:</label>
              <select
                value={projectRole}
                onChange={(e) => setProjectRole(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-50 font-medium"
              >
                <option value="VSLA Member">VSLA Member (Savings &amp; Credit)</option>
                <option value="Cash-for-Work Laborer">Cash-for-Work Laborer (Soil Bunds)</option>
                <option value="Dairy Supplier">Dairy Supplier (Milk Chilling)</option>
                <option value="Farmer Field School">Farmer Field School (Crops)</option>
                <option value="Emergency Fodder Recipient">Emergency Fodder Recipient</option>
              </select>
            </div>
          </div>

          {/* Verification & National ID */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Verification Method:</label>
              <select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-50"
              >
                <option value="Village Elder Certified">Village Elder Certified (Xeer)</option>
                <option value="Biometric Verified">Biometric Verified</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">National ID / Elder Card #:</label>
              <input
                type="text"
                placeholder="e.g. SL-ID-TOG-88192"
                value={nationalIdNumber}
                onChange={(e) => setNationalIdNumber(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
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
              Register Beneficiary
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
