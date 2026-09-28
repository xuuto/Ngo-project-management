import React, { useState, useMemo } from 'react';
import {
  Users,
  Send,
  Phone,
  Search,
  Filter,
  Download,
  Plus,
  CheckCircle2,
  MapPin,
  HeartHandshake,
  DollarSign,
  ShieldCheck,
  UserCheck,
  CreditCard,
  Building
} from 'lucide-react';
import { Beneficiary, DisbursementRecord, VulnerabilityCategory } from '../types/beneficiary';
import { Project, SomalilandRegion } from '../types/ngo';
import { useAuth } from '../context/AuthContext';
import { formatUSD, formatSLSH, formatPercent, formatDate, formatNumber, exportToCSV } from '../utils/formatters';

interface BeneficiariesViewProps {
  beneficiaries: Beneficiary[];
  disbursements: DisbursementRecord[];
  projects: Project[];
  currencyMode: 'USD' | 'SLSH';
  onOpenBeneficiaryModal: () => void;
  onOpenDisbursementModal: (beneficiaryId?: string) => void;
}

export const BeneficiariesView: React.FC<BeneficiariesViewProps> = ({
  beneficiaries,
  disbursements,
  projects,
  currencyMode,
  onOpenBeneficiaryModal,
  onOpenDisbursementModal
}) => {
  const { currentUser, filterAccessibleProjects, hasPermission } = useAuth();
  const accessibleProjects = useMemo(() => filterAccessibleProjects(projects), [projects, currentUser]);
  const accessibleProjectIds = useMemo(() => new Set(accessibleProjects.map((p) => p.id)), [accessibleProjects]);

  // Filter beneficiaries and disbursements based on RBAC project access
  const scopedBeneficiaries = useMemo(() => {
    if (currentUser.role === 'Super Admin') return beneficiaries;
    return beneficiaries.filter((b) =>
      b.enrolledProjects.some((ep) => accessibleProjectIds.has(ep.projectId))
    );
  }, [beneficiaries, accessibleProjectIds, currentUser]);

  const scopedDisbursements = useMemo(() => {
    if (currentUser.role === 'Super Admin') return disbursements;
    return disbursements.filter((d) => accessibleProjectIds.has(d.projectId));
  }, [disbursements, accessibleProjectIds, currentUser]);

  const [activeTab, setActiveTab] = useState<'directory' | 'disbursements' | 'groups'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedVulnerability, setSelectedVulnerability] = useState<string>('all');
  const [selectedBeneficiaryDetail, setSelectedBeneficiaryDetail] = useState<Beneficiary | null>(null);

  // Filtered Beneficiaries
  const filteredBeneficiaries = useMemo(() => {
    return scopedBeneficiaries.filter((b) => {
      if (selectedRegion !== 'all' && b.region !== selectedRegion) return false;
      if (selectedVulnerability !== 'all' && b.vulnerabilityCategory !== selectedVulnerability) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = b.fullName.toLowerCase().includes(query);
        const matchesPhone = b.mobileMoney.phoneNumber.includes(query);
        const matchesReg = b.registrationNumber.toLowerCase().includes(query);
        const matchesDistrict = b.district.toLowerCase().includes(query) || b.village.toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesReg && !matchesDistrict) {
          return false;
        }
      }
      return true;
    });
  }, [scopedBeneficiaries, selectedRegion, selectedVulnerability, searchQuery]);

  // KPI Calculations
  const kpiStats = useMemo(() => {
    const totalCount = scopedBeneficiaries.length;
    const femaleCount = scopedBeneficiaries.filter((b) => b.gender === 'Female').length;
    const femalePercent = totalCount > 0 ? (femaleCount / totalCount) * 100 : 0;

    let totalDisbursedUSD = 0;
    scopedDisbursements.forEach((d) => {
      if (d.status === 'Completed & Confirmed') {
        totalDisbursedUSD += d.amountUSD;
      }
    });

    const verifiedPhoneCount = scopedBeneficiaries.filter((b) => b.mobileMoney.accountStatus === 'Verified').length;
    const phoneVerifyPercent = totalCount > 0 ? (verifiedPhoneCount / totalCount) * 100 : 0;

    return {
      totalCount,
      femaleCount,
      femalePercent,
      totalDisbursedUSD,
      phoneVerifyPercent
    };
  }, [scopedBeneficiaries, scopedDisbursements]);

  const formatMoney = (usd: number) => {
    return currencyMode === 'USD' ? formatUSD(usd) : formatSLSH(usd);
  };

  const handleExportBeneficiariesCSV = () => {
    const headers = [
      'Registration No',
      'Full Name',
      'Gender',
      'Age',
      'Household Size',
      'Vulnerability Category',
      'Primary Livelihood',
      'Region',
      'District',
      'Village',
      'Mobile Money Provider',
      'Phone Number',
      'Total Assistance USD',
      'Verification Status'
    ];

    const rows = filteredBeneficiaries.map((b) => [
      b.registrationNumber,
      b.fullName,
      b.gender,
      b.age,
      b.householdSize,
      b.vulnerabilityCategory,
      b.primaryLivelihood,
      b.region,
      b.district,
      b.village,
      b.mobileMoney.provider,
      b.mobileMoney.phoneNumber,
      b.totalAssistanceReceivedUSD,
      b.verificationStatus
    ]);

    exportToCSV(`PENHA_Beneficiary_Registry_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleExportDisbursementsCSV = () => {
    const headers = [
      'Transaction Ref',
      'Date',
      'Beneficiary Name',
      'Phone',
      'Assistance Type',
      'Project Code',
      'Amount USD',
      'Amount SLSH',
      'Provider',
      'Status',
      'Approved By'
    ];

    const rows = scopedDisbursements.map((d) => [
      d.transactionRef,
      d.date,
      d.beneficiaryName,
      d.beneficiaryPhone,
      d.assistanceType,
      d.projectCode,
      d.amountUSD,
      d.amountSLSH,
      d.provider,
      d.status,
      d.approvedBy
    ]);

    exportToCSV(`PENHA_Mobile_Disbursements_Ledger_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              PENHA Community Accountability
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Telesom ZAAD &amp; Somtel Sahal Direct Aid</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Pastoralist Beneficiary Registry &amp; Mobile Money Tracker
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Transparent enrollment, village elder verification, and direct digital disbursements for Cash-for-Work, fodder, and women VSLAs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {hasPermission('financials:create_voucher') && (
            <button
              onClick={() => onOpenDisbursementModal()}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Disburse Mobile Money Aid</span>
            </button>
          )}

          {hasPermission('projects:edit') && (
            <button
              onClick={onOpenBeneficiaryModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Beneficiary</span>
            </button>
          )}

          <button
            onClick={activeTab === 'directory' ? handleExportBeneficiariesCSV : handleExportDisbursementsCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Enrolled Pastoralists</p>
          <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {formatNumber(kpiStats.totalCount)} Active Beneficiaries
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Duplication audited &amp; verified</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Pastoralist Women Share</p>
          <p className="text-xl font-bold font-mono tabular-nums text-rose-800 mt-1">
            {formatPercent(kpiStats.femalePercent)}
          </p>
          <p className="text-[11px] text-rose-700 font-medium mt-1">
            {kpiStats.femaleCount} women leaders &amp; producers
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Total Mobile Cash Transferred</p>
          <p className="text-xl font-bold font-mono tabular-nums text-emerald-800 mt-1">
            {formatMoney(kpiStats.totalDisbursedUSD)}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">ZAAD / Sahal direct settlements</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Mobile SIM Verification Rate</p>
          <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {formatPercent(kpiStats.phoneVerifyPercent)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">KYC validated with mobile operators</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl text-xs font-semibold">
        <button
          onClick={() => setActiveTab('directory')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'directory'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. Pastoralist Beneficiary Directory ({filteredBeneficiaries.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('disbursements')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'disbursements'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>2. Mobile Money Disbursements Ledger ({scopedDisbursements.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'groups'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>3. VSLA &amp; Cash-for-Work Workgroups</span>
        </button>
      </div>

      {/* TAB 1: Beneficiary Directory */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, ZAAD/Sahal phone, registration #, village..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              {/* Region Filter */}
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-hidden"
              >
                <option value="all">All Somaliland Regions</option>
                <option value="Togdheer">Togdheer</option>
                <option value="Maroodi Jeex">Maroodi Jeex</option>
                <option value="Sahil">Sahil</option>
                <option value="Awdal">Awdal</option>
                <option value="Sool">Sool</option>
                <option value="Sanaag">Sanaag</option>
              </select>

              {/* Vulnerability Filter */}
              <select
                value={selectedVulnerability}
                onChange={(e) => setSelectedVulnerability(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-hidden"
              >
                <option value="all">All Vulnerability Groups</option>
                <option value="Pastoralist Women Headed Household">Pastoralist Women Headed</option>
                <option value="Agro-pastoralist Smallholder">Agro-pastoralist Smallholder</option>
                <option value="Elderly Herder">Elderly Herder</option>
                <option value="Marginalized Youth">Marginalized Youth</option>
                <option value="Displaced / Returnee Pastoralist">Displaced / Returnee</option>
                <option value="Person with Disability">Person with Disability</option>
              </select>
            </div>

            <span className="text-slate-500 font-medium">
              Showing {filteredBeneficiaries.length} verified individuals
            </span>
          </div>

          {/* Directory Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50">
                    <th className="py-2.5 px-3">Reg. Number</th>
                    <th className="py-2.5 px-3">Beneficiary Name</th>
                    <th className="py-2.5 px-3">Gender &amp; Age</th>
                    <th className="py-2.5 px-3">Location (Region/Village)</th>
                    <th className="py-2.5 px-3">Vulnerability Category</th>
                    <th className="py-2.5 px-3">Mobile Money (ZAAD/Sahal)</th>
                    <th className="py-2.5 px-3 text-right">Aid Received</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredBeneficiaries.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{b.registrationNumber}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{b.fullName}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{b.primaryLivelihood}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {b.gender}, {b.age} yrs <span className="text-slate-400">({b.householdSize} HH)</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-800 font-medium">{b.district} ({b.village})</div>
                        <div className="text-[10px] text-slate-400">{b.region}</div>
                      </td>
                      <td className="py-2.5 px-3 max-w-xs">
                        <span className="text-[11px] text-slate-700 font-medium">{b.vulnerabilityCategory}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <div className="text-emerald-800 font-semibold">{b.mobileMoney.phoneNumber}</div>
                        <div className="text-[10px] text-slate-500">{b.mobileMoney.provider}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        {formatUSD(b.totalAssistanceReceivedUSD)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {b.verificationStatus.split(' ')[0]}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {hasPermission('financials:create_voucher') && (
                            <button
                              onClick={() => onOpenDisbursementModal(b.id)}
                              className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-semibold transition-colors"
                            >
                              Send Cash
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedBeneficiaryDetail(b)}
                            className="px-2 py-1 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-[10px] font-medium transition-colors"
                          >
                            Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Mobile Money Disbursements Ledger */}
      {activeTab === 'disbursements' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Direct Mobile Money Transfer Ledger (Telesom ZAAD / Somtel Sahal)
              </h3>
              <p className="text-xs text-slate-500">
                Audited electronic transfers sent directly to pastoralist mobile accounts for labor, fodder, and milk
              </p>
            </div>

            {hasPermission('financials:create_voucher') && (
              <button
                onClick={() => onOpenDisbursementModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>New Mobile Transfer</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3">Transaction Ref</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Recipient &amp; Phone</th>
                  <th className="py-2.5 px-3">Assistance Category</th>
                  <th className="py-2.5 px-3">Project &amp; Batch</th>
                  <th className="py-2.5 px-3 text-right">Amount (USD)</th>
                  <th className="py-2.5 px-3 text-right">Amount (SLSH)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {scopedDisbursements.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-emerald-800">{d.transactionRef}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{formatDate(d.date)}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{d.beneficiaryName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{d.beneficiaryPhone} ({d.provider})</div>
                    </td>
                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="font-medium text-slate-800">{d.assistanceType}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{d.purposeNote}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      <div className="font-semibold text-slate-700">{d.projectCode}</div>
                      <div className="text-[10px] text-slate-400">{d.voucherBatchNo}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                      {formatUSD(d.amountUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500 text-[11px]">
                      {formatSLSH(d.amountUSD)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: VSLA & Cash-for-Work Workgroups */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Village Savings and Loan Associations (VSLA) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-700" />
                <h3 className="text-sm font-bold text-slate-900">Women Pastoralist VSLAs &amp; Cooperatives</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-rose-50 text-rose-800 rounded">
                48 Active Groups
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Village Savings and Loan Associations (VSLAs) funded through Danida &amp; EU programs enable women herders to aggregate camel milk, purchase stainless steel churns, and provide emergency micro-loans during drought.
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <strong className="text-slate-900 block">Danwadaag Women Pastoralist Cooperative</strong>
                  <span className="text-slate-500 text-[11px]">Sheikh District · 25 Members · Lead: Halimo Awale</span>
                </div>
                <span className="font-mono font-bold text-emerald-800">$4,800 Revolving</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <strong className="text-slate-900 block">Qoordheere Dairy Savings Group</strong>
                  <span className="text-slate-500 text-[11px]">Qoordheere Village · 20 Members · Lead: Amina Jama</span>
                </div>
                <span className="font-mono font-bold text-emerald-800">$3,400 Revolving</span>
              </div>
            </div>
          </div>

          {/* Card 2: Cash-for-Work Labor Teams */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Cash-for-Work Gully &amp; Bunding Brigades</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded">
                450 Youth Workers
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Youth and displaced pastoralists employed in labor-intensive soil moisture conservation, digging 1,800 semi-circular earthen bunds and stone check dams across Oodweyne and Gabiley rangelands.
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <strong className="text-slate-900 block">Oodweyne Seasonal Basin Youth Team</strong>
                  <span className="text-slate-500 text-[11px]">Togdheer · 45 Members · Lead: Mukhtar Farah</span>
                </div>
                <span className="font-mono font-bold text-slate-800">$150 / 10-day cycle</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <div>
                  <strong className="text-slate-900 block">Arabsiyo Water Buffer Soil Crew</strong>
                  <span className="text-slate-500 text-[11px]">Maroodi Jeex · 30 Members · Lead: Khadra Warsame</span>
                </div>
                <span className="font-mono font-bold text-slate-800">$150 / 10-day cycle</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Beneficiary Profile Drawer / Modal */}
      {selectedBeneficiaryDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-emerald-800 font-semibold">{selectedBeneficiaryDetail.registrationNumber}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedBeneficiaryDetail.fullName}</h3>
              </div>
              <button
                onClick={() => setSelectedBeneficiaryDetail(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Gender / Age:</span>
                <span className="font-medium text-slate-800">{selectedBeneficiaryDetail.gender}, {selectedBeneficiaryDetail.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Household Size:</span>
                <span className="font-medium text-slate-800">{selectedBeneficiaryDetail.householdSize} members</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-medium text-slate-800">{selectedBeneficiaryDetail.village}, {selectedBeneficiaryDetail.district} ({selectedBeneficiaryDetail.region})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile Money Gateway:</span>
                <strong className="font-mono text-emerald-800">{selectedBeneficiaryDetail.mobileMoney.phoneNumber} ({selectedBeneficiaryDetail.mobileMoney.provider})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">National ID / Elder Card:</span>
                <span className="font-mono text-slate-800">{selectedBeneficiaryDetail.nationalIdNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verification Status:</span>
                <span className="text-emerald-800 font-semibold">{selectedBeneficiaryDetail.verificationStatus}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-semibold">Total Aid Transferred:</span>
                <strong className="font-mono text-sm text-slate-900">{formatUSD(selectedBeneficiaryDetail.totalAssistanceReceivedUSD)} ({selectedBeneficiaryDetail.totalDisbursementsCount} transactions)</strong>
              </div>
            </div>

            {selectedBeneficiaryDetail.notes && (
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                <strong>Field Notes:</strong> {selectedBeneficiaryDetail.notes}
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              {hasPermission('financials:create_voucher') && (
                <button
                  onClick={() => {
                    const id = selectedBeneficiaryDetail.id;
                    setSelectedBeneficiaryDetail(null);
                    onOpenDisbursementModal(id);
                  }}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800"
                >
                  Send Mobile Aid
                </button>
              )}
              <button
                onClick={() => setSelectedBeneficiaryDetail(null)}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
