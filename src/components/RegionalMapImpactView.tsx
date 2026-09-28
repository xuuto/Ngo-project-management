import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Building,
  Users,
  DollarSign,
  Layers,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Sparkles,
  Droplets,
  Trees,
  Compass,
  ArrowRight,
  TrendingUp,
  Info,
  ExternalLink,
  Target,
  FileSpreadsheet
} from 'lucide-react';
import { Project, SomalilandRegion } from '../types/ngo';
import { formatUSD, formatNumber, formatPercent } from '../utils/formatters';

interface RegionalMapImpactViewProps {
  projects: Project[];
  currencyMode: 'USD' | 'SLSH';
  onSelectProject: (projectId: string) => void;
}

interface RegionSummary {
  region: SomalilandRegion;
  capital: string;
  droughtRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  projectsCount: number;
  totalGrantUSD: number;
  totalSpentUSD: number;
  beneficiariesCount: number;
  waterPointsCount: number;
  rangelandHectares: number;
  projects: Project[];
}

interface RegionPathData {
  id: SomalilandRegion;
  d: string;
  centroid: { x: number; y: number };
}

// Seamless vector coordinates representing the 6 regions of Somaliland
const REGION_PATHS: RegionPathData[] = [
  {
    id: 'Awdal',
    d: 'M 50,140 L 110,120 L 120,180 L 100,240 L 40,220 L 30,170 Z',
    centroid: { x: 70, y: 180 }
  },
  {
    id: 'Sahil',
    d: 'M 110,120 L 190,100 L 290,110 L 280,160 L 210,165 L 120,150 Z',
    centroid: { x: 200, y: 130 }
  },
  {
    id: 'Maroodi Jeex',
    d: 'M 110,120 L 120,150 L 210,165 L 210,250 L 100,240 L 120,180 Z',
    centroid: { x: 155, y: 205 }
  },
  {
    id: 'Togdheer',
    d: 'M 210,165 L 280,160 L 350,170 L 340,265 L 210,250 Z',
    centroid: { x: 275, y: 215 }
  },
  {
    id: 'Sanaag',
    d: 'M 290,110 L 390,90 L 510,110 L 490,185 L 350,170 L 280,160 Z',
    centroid: { x: 390, y: 135 }
  },
  {
    id: 'Sool',
    d: 'M 350,170 L 490,185 L 480,275 L 340,265 Z',
    centroid: { x: 415, y: 225 }
  }
];

export const RegionalMapImpactView: React.FC<RegionalMapImpactViewProps> = ({
  projects,
  currencyMode,
  onSelectProject
}) => {
  const [selectedRegion, setSelectedRegion] = useState<SomalilandRegion | 'All'>('All');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');
  const [hoveredRegion, setHoveredRegion] = useState<SomalilandRegion | null>(null);

  const regionsData: Record<SomalilandRegion, { capital: string; droughtRisk: 'Low' | 'Moderate' | 'High' | 'Severe'; contingencyPlan: string }> = {
    'Maroodi Jeex': {
      capital: 'Hargeisa',
      droughtRisk: 'Moderate',
      contingencyPlan: 'Pre-positioning animal fodder near urban markets; expanding Hargeisa water supply reserves; training local water user committees on water conservation.'
    },
    'Togdheer': {
      capital: 'Burao',
      droughtRisk: 'Severe',
      contingencyPlan: 'Activating emergency cash transfers; deploying water trucking fleets to rural Berkads; scaling up community veterinary treatment hubs to protect critical milking herds.'
    },
    'Sahil': {
      capital: 'Berbera',
      droughtRisk: 'High',
      contingencyPlan: 'Restoring coastal dry-season wells; strengthening livestock quarantine facility coordination; providing cooling storage solutions for artisanal fisheries.'
    },
    'Awdal': {
      capital: 'Borama',
      droughtRisk: 'Low',
      contingencyPlan: 'Maintaining community seed banks; reinforcing agro-pastoral extension services; monitoring border migrations for early signal of neighboring distress.'
    },
    'Sanaag': {
      capital: 'Erigavo',
      droughtRisk: 'Severe',
      contingencyPlan: 'Deploying solar pumps to deep boreholes; managing rangeland enclosures to prevent overgrazing; reinforcing supplementary therapeutic feeding sites.'
    },
    'Sool': {
      capital: 'Las Anod',
      droughtRisk: 'Severe',
      contingencyPlan: 'Rapid rehabilitation of strategic water yards (ballys); conducting mobile human-veterinary health clinics; managing cross-border pasture dispute agreements.'
    }
  };

  const regionalSummaries = useMemo(() => {
    const map = new Map<SomalilandRegion, RegionSummary>();

    // Initialize all regions
    Object.keys(regionsData).forEach((regKey) => {
      const reg = regKey as SomalilandRegion;
      map.set(reg, {
        region: reg,
        capital: regionsData[reg].capital,
        droughtRiskLevel: regionsData[reg].droughtRisk,
        projectsCount: 0,
        totalGrantUSD: 0,
        totalSpentUSD: 0,
        beneficiariesCount: 0,
        waterPointsCount: 0,
        rangelandHectares: 0,
        projects: []
      });
    });

    projects.forEach((p) => {
      p.targetRegions.forEach((reg) => {
        if (map.has(reg)) {
          const cur = map.get(reg)!;
          cur.projectsCount += 1;
          cur.totalGrantUSD += p.budgetSummary.totalGrantUSD / p.targetRegions.length;
          cur.totalSpentUSD += p.budgetSummary.expendituresUSD / p.targetRegions.length;
          cur.beneficiariesCount += Math.round(p.beneficiaries.actualDirect / p.targetRegions.length);
          cur.projects.push(p);

          // Extract indicators
          p.logframe.outcomes.forEach((oc) => {
            oc.outputs.forEach((out) => {
              out.indicators.forEach((ind) => {
                if (ind.unit === 'Hectares') {
                  cur.rangelandHectares += Math.round(ind.currentActual / p.targetRegions.length);
                }
                if (ind.unit === 'Water Points' || ind.unit === 'Boreholes' || ind.unit === 'Berkads') {
                  cur.waterPointsCount += Math.round(ind.currentActual / p.targetRegions.length);
                }
              });
            });
          });
        }
      });
    });

    return Array.from(map.values());
  }, [projects]);

  const filteredRegions = useMemo(() => {
    return regionalSummaries.filter((r) => {
      if (selectedRegion !== 'All' && r.region !== selectedRegion) return false;
      if (selectedRiskFilter !== 'all' && r.droughtRiskLevel !== selectedRiskFilter) return false;
      return true;
    });
  }, [regionalSummaries, selectedRegion, selectedRiskFilter]);

  const getRiskColors = (risk: string) => {
    switch (risk) {
      case 'Severe':
        return {
          fill: '#fecdd3', // rose-200
          stroke: '#f43f5e', // rose-500
          hover: '#fda4af', // rose-300
          text: 'text-rose-800',
          badge: 'bg-rose-100 text-rose-800 border-rose-300'
        };
      case 'High':
        return {
          fill: '#ffedd5', // orange-100
          stroke: '#ea580c', // orange-600
          hover: '#fed7aa', // orange-200
          text: 'text-orange-800',
          badge: 'bg-orange-100 text-orange-800 border-orange-300'
        };
      case 'Moderate':
        return {
          fill: '#fef3c7', // amber-100
          stroke: '#d97706', // amber-600
          hover: '#fde68a', // amber-200
          text: 'text-amber-800',
          badge: 'bg-amber-100 text-amber-800 border-amber-300'
        };
      case 'Low':
      default:
        return {
          fill: '#d1fae5', // emerald-100
          stroke: '#059669', // emerald-600
          hover: '#a7f3d0', // emerald-200
          text: 'text-emerald-800',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300'
        };
    }
  };

  const formatMoney = (usd: number) => {
    if (currencyMode === 'SLSH') {
      // 1 USD = 8500 SLSH (Standard Somaliland Shilling rate)
      const slshValue = usd * 8500;
      return `Sh. ${formatNumber(Math.round(slshValue))}`;
    }
    return formatUSD(usd);
  };

  // Get active activities in a selected region
  const regionalActivities = useMemo(() => {
    if (selectedRegion === 'All') return [];
    const list: { projectCode: string; projectTitle: string; title: string; budget: number; status: string; progress: number }[] = [];
    projects.forEach((p) => {
      p.logframe.outcomes.forEach((oc) => {
        oc.outputs.forEach((out) => {
          out.activities.forEach((act) => {
            if (act.region === selectedRegion) {
              list.push({
                projectCode: p.code,
                projectTitle: p.title,
                title: act.title,
                budget: act.budgetAllocatedUSD,
                status: act.status,
                progress: act.progressPercent
              });
            }
          });
        });
      });
    });
    return list;
  }, [projects, selectedRegion]);

  // Selected region detail data helper
  const selectedRegionDetail = useMemo(() => {
    if (selectedRegion === 'All') return null;
    return regionalSummaries.find((r) => r.region === selectedRegion) || null;
  }, [regionalSummaries, selectedRegion]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <Compass className="w-4 h-4" />
              <span>Somaliland Regional GIS &amp; Drought Early Action Footprint</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Geospatial District Impact &amp; Hotspot Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Cross-referencing active resilience projects, pastoral water installations, rangeland rehabilitation, and severe drought hazard levels across all 6 regions of Somaliland.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="All">All 6 Regions (Somaliland)</option>
              {Object.keys(regionsData).map((r) => (
                <option key={r} value={r}>
                  {r} ({regionsData[r as SomalilandRegion].capital})
                </option>
              ))}
            </select>

            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Drought Hazard Levels</option>
              <option value="Severe">Severe Hazard</option>
              <option value="High">High Hazard</option>
              <option value="Moderate">Moderate Hazard</option>
              <option value="Low">Low Hazard</option>
            </select>

            {selectedRegion !== 'All' && (
              <button
                onClick={() => setSelectedRegion('All')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Clear Focus
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive SVG Map */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-800 animate-spin-slow" />
                <span>Interactive GIS Territory Map</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">viewBox 600x320</span>
            </div>
            <p className="text-xs text-slate-500">
              Hover over territories to view active data overlays. Click to isolate and load target district workspace.
            </p>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative bg-slate-50 rounded-lg border border-slate-200 p-2 overflow-hidden flex items-center justify-center min-h-[300px]">
            <svg
              className="w-full h-auto max-w-[480px]"
              viewBox="0 0 600 320"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* GIS Grid Coordinates */}
              <g stroke="rgba(148, 163, 184, 0.12)" strokeWidth="0.8">
                {/* Latitudes */}
                <line x1="0" y1="60" x2="600" y2="60" strokeDasharray="3,3" />
                <text x="10" y="55" className="font-mono text-[8px] fill-slate-400 font-medium">11°00' N (Gulf of Aden)</text>
                
                <line x1="0" y1="220" x2="600" y2="220" strokeDasharray="3,3" />
                <text x="10" y="215" className="font-mono text-[8px] fill-slate-400 font-medium">9°30' N</text>

                {/* Longitudes */}
                <line x1="110" y1="0" x2="110" y2="320" strokeDasharray="3,3" />
                <text x="115" y="312" className="font-mono text-[8px] fill-slate-400 font-medium">43°30' E</text>

                <line x1="280" y1="0" x2="280" y2="320" strokeDasharray="3,3" />
                <text x="285" y="312" className="font-mono text-[8px] fill-slate-400 font-medium">45°30' E</text>

                <line x1="450" y1="0" x2="450" y2="320" strokeDasharray="3,3" />
                <text x="455" y="312" className="font-mono text-[8px] fill-slate-400 font-medium">47°30' E</text>
              </g>

              {/* Ocean / Gulf of Aden water fill indicator */}
              <path d="M 0,0 L 600,0 L 600,80 L 490,75 L 390,85 L 290,105 L 190,95 L 0,110 Z" fill="rgba(14, 116, 144, 0.03)" />
              <text x="250" y="35" className="font-mono tracking-widest text-[9px] uppercase font-bold fill-cyan-950/20 italic">Gulf of Aden</text>

              {/* Map Region Polygons */}
              <g strokeLinejoin="round" strokeLinecap="round">
                {REGION_PATHS.map((rPath) => {
                  const summary = regionalSummaries.find((s) => s.region === rPath.id);
                  if (!summary) return null;
                  const isFilteredOut = selectedRiskFilter !== 'all' && summary.droughtRiskLevel !== selectedRiskFilter;
                  
                  const colors = getRiskColors(summary.droughtRiskLevel);
                  const isHovered = hoveredRegion === rPath.id;
                  const isSelected = selectedRegion === rPath.id;
                  const isAnySelected = selectedRegion !== 'All';

                  // Styling determinations
                  let fill = colors.fill;
                  let stroke = colors.stroke;
                  let strokeWidth = isSelected ? '3.5' : '1.5';
                  let opacity = '1';

                  if (isHovered) {
                    fill = colors.hover;
                  }

                  // Desaturation effects
                  if (isAnySelected && !isSelected) {
                    opacity = '0.4';
                    strokeWidth = '0.8';
                  }

                  if (isFilteredOut) {
                    opacity = '0.15';
                    strokeWidth = '0.5';
                    fill = '#f1f5f9';
                    stroke = '#cbd5e1';
                  }

                  return (
                    <g key={rPath.id}>
                      <path
                        d={rPath.d}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        opacity={opacity}
                        className="transition-all duration-300 cursor-pointer"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedRegion('All');
                          } else {
                            setSelectedRegion(rPath.id);
                          }
                        }}
                        onMouseEnter={() => setHoveredRegion(rPath.id)}
                        onMouseLeave={() => setHoveredRegion(null)}
                      />
                      {/* Centered Region Label */}
                      <text
                        x={rPath.centroid.x}
                        y={rPath.centroid.y}
                        className="font-sans text-[10px] font-bold text-slate-800 text-center pointer-events-none select-none transition-all duration-200"
                        textAnchor="middle"
                        opacity={isFilteredOut ? '0.15' : isAnySelected && !isSelected ? '0.5' : '1'}
                      >
                        {rPath.id}
                      </text>
                      {/* Centered Small Capital Label */}
                      <text
                        x={rPath.centroid.x}
                        y={rPath.centroid.y + 11}
                        className="font-mono text-[7.5px] text-slate-500 font-medium tracking-tight pointer-events-none select-none transition-all duration-200"
                        textAnchor="middle"
                        opacity={isFilteredOut ? '0.15' : isAnySelected && !isSelected ? '0.4' : '0.85'}
                      >
                        {summary.capital}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* GIS Features: Orientation Compass & Scale Bar */}
              <g transform="translate(540, 250)">
                {/* Orientation Arrow */}
                <circle cx="0" cy="0" r="16" fill="rgba(148, 163, 184, 0.08)" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1" />
                <line x1="0" y1="12" x2="0" y2="-12" stroke="#64748b" strokeWidth="1.5" />
                <polygon points="0,-14 -4,-6 4,-6" fill="#0f172a" />
                <polygon points="0,14 -3,7 3,7" fill="#94a3b8" />
                <text x="0" y="-18" className="font-mono text-[8px] font-bold fill-slate-700" textAnchor="middle">N</text>
              </g>

              <g transform="translate(30, 290)">
                {/* Scale Bar */}
                <line x1="0" y1="0" x2="60" y2="0" stroke="#475569" strokeWidth="2.5" />
                <line x1="0" y1="-3" x2="0" y2="3" stroke="#475569" strokeWidth="1" />
                <line x1="30" y1="-3" x2="30" y2="3" stroke="#475569" strokeWidth="1" />
                <line x1="60" y1="-3" x2="60" y2="3" stroke="#475569" strokeWidth="1" />
                <text x="30" y="-6" className="font-mono text-[7px] font-bold fill-slate-600" textAnchor="middle">100 km</text>
              </g>
            </svg>
          </div>

          {/* Live Inspect Summary / Legend Overlay */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {hoveredRegion ? 'Live GIS Data Overlay' : 'Drought Hazard Classification Legend'}
            </p>

            {hoveredRegion ? (
              (() => {
                const hoverSummary = regionalSummaries.find((s) => s.region === hoveredRegion);
                if (!hoverSummary) return null;
                const colors = getRiskColors(hoverSummary.droughtRiskLevel);
                return (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="col-span-2 flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                        {hoverSummary.region} (Capital: {hoverSummary.capital})
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${colors.badge}`}>
                        {hoverSummary.droughtRiskLevel} Hazard
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium">Assigned Grants</span>
                      <p className="font-bold text-slate-800 font-mono">{hoverSummary.projectsCount} Projects</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium">Water installations</span>
                      <p className="font-bold text-slate-800 font-mono">{hoverSummary.waterPointsCount} Units</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium">Rangeland Restored</span>
                      <p className="font-bold text-slate-800 font-mono">{formatNumber(hoverSummary.rangelandHectares)} Ha</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium">Beneficiary Reach</span>
                      <p className="font-bold text-emerald-800 font-mono">{formatNumber(hoverSummary.beneficiariesCount)} Pax</p>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-semibold text-slate-700">
                <div className="flex items-center gap-1.5 p-1.5 bg-rose-50 border border-rose-200 rounded-md">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-200 border border-rose-500 shrink-0" />
                  <span>Severe (3)</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-orange-50 border border-orange-200 rounded-md">
                  <span className="w-2.5 h-2.5 rounded-sm bg-orange-100 border border-orange-500 shrink-0" />
                  <span>High (1)</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-amber-50 border border-amber-200 rounded-md">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-600 shrink-0" />
                  <span>Moderate (1)</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-emerald-50 border border-emerald-200 rounded-md">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-600 shrink-0" />
                  <span>Low (1)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Macro Stats or Isolated Workspace */}
        <div className="lg:col-span-7 space-y-6">
          {/* Somaliland Macro Footprint Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Regions Cover</p>
              <p className="text-xl font-bold font-mono text-slate-900">6 / 6 Regions</p>
              <p className="text-[10px] text-emerald-800 font-semibold">100% Somaliland Footprint</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Water Points</p>
              <p className="text-xl font-bold font-mono text-emerald-800">
                {regionalSummaries.reduce((acc, r) => acc + r.waterPointsCount, 0)} Units
              </p>
              <p className="text-[10px] text-slate-400">Solar &amp; Berkads</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rangeland Restored</p>
              <p className="text-xl font-bold font-mono text-emerald-800">
                {formatNumber(regionalSummaries.reduce((acc, r) => acc + r.rangelandHectares, 0))} Ha
              </p>
              <p className="text-[10px] text-slate-400">Pasture enclosures</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Beneficiaries</p>
              <p className="text-xl font-bold font-mono text-slate-900">
                {formatNumber(regionalSummaries.reduce((acc, r) => acc + r.beneficiariesCount, 0))} Pax
              </p>
              <p className="text-[10px] text-slate-400">Pastoralist households</p>
            </div>
          </div>

          {/* Conditional View Workspace */}
          {selectedRegion === 'All' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Somaliland Region Performance Index ({filteredRegions.length})
                </h3>
                <span className="text-xs text-slate-500 font-semibold">
                  Filtered by hazard/selection
                </span>
              </div>

              {/* Regions list cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredRegions.map((reg) => {
                  const riskColors = getRiskColors(reg.droughtRiskLevel);
                  const burnRate = reg.totalGrantUSD > 0 ? (reg.totalSpentUSD / reg.totalGrantUSD) * 100 : 0;

                  return (
                    <div
                      key={reg.region}
                      onClick={() => setSelectedRegion(reg.region)}
                      className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-500 hover:shadow-md transition-all p-5 space-y-4 cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 group-hover:bg-emerald-100 transition-colors">
                              <MapPin className="w-4 h-4 text-emerald-700" />
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">{reg.region}</h4>
                              <p className="text-[10px] text-slate-400 font-mono">Capital: {reg.capital}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${riskColors.badge}`}>
                            {reg.droughtRiskLevel}
                          </span>
                        </div>

                        {/* Summary Numbers */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
                          <div>
                            <span className="text-slate-400 font-medium">Beneficiary Reach</span>
                            <p className="font-bold text-slate-800 font-mono">{formatNumber(reg.beneficiariesCount)} Pax</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">Active Footprints</span>
                            <p className="font-bold text-slate-800 font-mono">{reg.projectsCount} Projects</p>
                          </div>
                        </div>
                      </div>

                      {/* Burn Rate Mini progress */}
                      <div className="space-y-1 pt-2 border-t border-slate-100">
                        <div className="flex justify-between text-[10px] font-semibold">
                          <span className="text-slate-500">Budget Spent</span>
                          <span className="font-mono text-emerald-800">{formatPercent(burnRate)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 transition-all"
                            style={{ width: `${Math.min(100, burnRate)}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-slate-400 text-right font-mono">
                          {formatMoney(reg.totalSpentUSD)} / {formatMoney(reg.totalGrantUSD)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Isolated District Workspace */
            (() => {
              const rData = selectedRegionDetail;
              if (!rData) return null;
              const riskColors = getRiskColors(rData.droughtRiskLevel);
              const burnRate = rData.totalGrantUSD > 0 ? (rData.totalSpentUSD / rData.totalGrantUSD) * 100 : 0;

              return (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
                  {/* Workspace Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-900 text-white">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">{rData.region} District Focus</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${riskColors.badge}`}>
                            {rData.droughtRiskLevel} Hazard Status
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Regional HQ: <strong className="text-slate-800">{rData.capital}</strong> · Live NGO field-operations environment
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedRegion('All')}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5 text-slate-500" />
                      <span>Back to All Regions</span>
                    </button>
                  </div>

                  {/* High Fidelity Metrics Panel */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                      <Users className="w-5 h-5 text-emerald-800 mx-auto" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Beneficiary Reach</span>
                      <p className="text-lg font-bold font-mono text-slate-900">{formatNumber(rData.beneficiariesCount)} Pax</p>
                      <p className="text-[10px] text-slate-400">Directly supported pastoralists</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                      <Droplets className="w-5 h-5 text-blue-600 mx-auto" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Water installations</span>
                      <p className="text-lg font-bold font-mono text-slate-900">{rData.waterPointsCount} Systems</p>
                      <p className="text-[10px] text-slate-400">Solar boreholes, wells, &amp; ballys</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                      <Trees className="w-5 h-5 text-emerald-600 mx-auto" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rangeland Restored</span>
                      <p className="text-lg font-bold font-mono text-slate-900">{formatNumber(rData.rangelandHectares)} Ha</p>
                      <p className="text-[10px] text-slate-400">Grazing banks &amp; soil bunds</p>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-800" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Financial Allocation &amp; Burn</h4>
                      </div>
                      <span className="font-mono text-sm font-bold text-emerald-800">{formatPercent(burnRate)}</span>
                    </div>

                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-emerald-800 transition-all duration-300"
                        style={{ width: `${Math.min(100, burnRate)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono text-slate-500">
                      <div>
                        <span className="block text-[9px] uppercase font-semibold text-slate-400">Proportional Grant Value</span>
                        <strong className="text-slate-800 text-sm">{formatMoney(rData.totalGrantUSD)}</strong>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] uppercase font-semibold text-slate-400">Total Proportional Expenditure</span>
                        <strong className="text-emerald-800 text-sm">{formatMoney(rData.totalSpentUSD)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Risk Contingency Callout */}
                  <div className={`p-4 rounded-xl border flex gap-3.5 ${rData.droughtRiskLevel === 'Severe' ? 'bg-rose-50/60 border-rose-200 text-rose-900' : 'bg-amber-50/60 border-amber-200 text-amber-900'}`}>
                    <ShieldAlert className={`w-5 h-5 shrink-0 ${rData.droughtRiskLevel === 'Severe' ? 'text-rose-600 animate-pulse' : 'text-amber-600'}`} />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider">Drought Safeguard &amp; Contingency Activation</h4>
                      <p className="text-xs leading-relaxed opacity-95">
                        {regionsData[rData.region].contingencyPlan}
                      </p>
                    </div>
                  </div>

                  {/* Associated Projects and Specific Activities Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-emerald-800" />
                        <span>Active Projects Footprints ({rData.projectsCount})</span>
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">Click to open full project workspace</span>
                    </div>

                    {rData.projects.length === 0 ? (
                      <p className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-lg text-center border border-slate-200">
                        No direct project footprints are currently targeting this district.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {rData.projects.map((p) => {
                          const pBurnRate = p.budgetSummary.totalGrantUSD > 0 ? (p.budgetSummary.expendituresUSD / p.budgetSummary.totalGrantUSD) * 100 : 0;
                          return (
                            <button
                              key={p.id}
                              onClick={() => onSelectProject(p.id)}
                              className="text-left p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all group flex flex-col justify-between space-y-2 cursor-pointer"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[9px] font-black text-emerald-800">
                                    {p.code}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-semibold">{p.donorName} Grant</span>
                                </div>
                                <h5 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors mt-1 line-clamp-1">
                                  {p.title}
                                </h5>
                                <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                                  {p.logframe.impactGoal}
                                </p>
                              </div>

                              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-100 w-full mt-2">
                                <span className="font-medium text-slate-500">Project Burn Rate:</span>
                                <span className="font-mono font-bold text-slate-700">{formatPercent(pBurnRate)}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Scheduled District Activities */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-800" />
                      <span>District-Specific Field Activities ({regionalActivities.length})</span>
                    </h4>

                    {regionalActivities.length === 0 ? (
                      <p className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-lg text-center border border-slate-200">
                        No localized micro-activities scheduled for {rData.region} in logframes.
                      </p>
                    ) : (
                      <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                        {regionalActivities.map((act, idx) => (
                          <div key={idx} className="p-3 bg-white hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                                  {act.projectCode}
                                </span>
                                <h5 className="font-bold text-slate-900">{act.title}</h5>
                              </div>
                              <p className="text-[10px] text-slate-500">From project: {act.projectTitle}</p>
                            </div>

                            <div className="flex items-center gap-4 text-right shrink-0">
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-slate-400 font-semibold block">Loc. Budget</span>
                                <span className="font-mono font-bold text-slate-800">{formatMoney(act.budget)}</span>
                              </div>
                              <div className="text-right">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  act.status === 'Completed' || act.status === 'Field Verified'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : act.status === 'In Progress'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}>
                                  {act.status}
                                </span>
                                <span className="block text-[9px] font-mono text-slate-400 font-semibold mt-0.5">
                                  Progress: {act.progress}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
};
