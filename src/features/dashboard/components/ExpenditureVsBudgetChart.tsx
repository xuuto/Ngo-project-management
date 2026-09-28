import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
  Filter
} from 'lucide-react';
import { Project } from '../../../types/ngo';
import { formatUSD, formatSLSH, formatPercent } from '../../../utils/formatters';

interface ExpenditureVsBudgetChartProps {
  projects: Project[];
  currencyMode: 'USD' | 'SLSH';
  onSelectProject: (projectId: string) => void;
  setActiveView?: (view: string) => void;
}

type ChartDisplayMode = 'grouped_columns' | 'horizontal_bars';

export const ExpenditureVsBudgetChart: React.FC<ExpenditureVsBudgetChartProps> = ({
  projects,
  currencyMode,
  onSelectProject,
  setActiveView
}) => {
  const [displayMode, setDisplayMode] = useState<ChartDisplayMode>('grouped_columns');
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [selectedDonorFilter, setSelectedDonorFilter] = useState<string>('all');
  const [includeEncumbrances, setIncludeEncumbrances] = useState<boolean>(true);

  // Filter projects by donor if selected
  const filteredProjects = useMemo(() => {
    let list = projects.filter((p) => p.status === 'Active');
    if (selectedDonorFilter !== 'all') {
      list = list.filter((p) => p.donorId === selectedDonorFilter);
    }
    return list;
  }, [projects, selectedDonorFilter]);

  // Unique donors for filter
  const donorsList = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach((p) => {
      if (!map.has(p.donorId)) {
        map.set(p.donorId, p.donorName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [projects]);

  // Overall Max Value for scale
  const maxScaleValue = useMemo(() => {
    let max = 0;
    filteredProjects.forEach((p) => {
      const budget = p.budgetSummary.totalGrantUSD;
      const spent = p.budgetSummary.expendituresUSD;
      const comm = includeEncumbrances ? (p.budgetSummary.commitmentsUSD || 0) : 0;
      max = Math.max(max, budget, spent + comm);
    });
    return max > 0 ? Math.ceil((max * 1.15) / 250000) * 250000 : 1000000;
  }, [filteredProjects, includeEncumbrances]);

  // Y-Axis Ticks (5 intervals)
  const yTicks = useMemo(() => {
    const ticks = [];
    const step = maxScaleValue / 5;
    for (let i = 0; i <= 5; i++) {
      ticks.push(step * i);
    }
    return ticks;
  }, [maxScaleValue]);

  // Format money helper
  const formatMoney = (usd: number) => {
    return currencyMode === 'USD' ? formatUSD(usd) : formatSLSH(usd);
  };

  // Aggregates for chart summary header
  const chartSummary = useMemo<{
    totalBudget: number;
    totalSpent: number;
    totalEncumbered: number;
    remainingBalance: number;
    overallBurn: number;
    highestBurnProject: Project | null;
  }>(() => {
    let totalBudget = 0;
    let totalSpent = 0;
    let totalEncumbered = 0;
    let highestBurnProject: Project | null = null;
    let maxBurn = -1;

    filteredProjects.forEach((p) => {
      totalBudget += p.budgetSummary.totalGrantUSD;
      totalSpent += p.budgetSummary.expendituresUSD;
      totalEncumbered += p.budgetSummary.commitmentsUSD || 0;
      if (p.budgetSummary.burnRatePercent > maxBurn) {
        maxBurn = p.budgetSummary.burnRatePercent;
        highestBurnProject = p;
      }
    });

    const overallBurn = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const remainingBalance = totalBudget - totalSpent;

    return {
      totalBudget,
      totalSpent,
      totalEncumbered,
      remainingBalance,
      overallBurn,
      highestBurnProject
    };
  }, [filteredProjects]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Chart Top Header & Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 text-emerald-800">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Projected Budget vs. Actual Expenditure by Active Project
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {filteredProjects.length} Projects
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparative analysis of approved donor grant allocations versus verified field disbursements &amp; commitments
          </p>
        </div>

        {/* Chart View & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Donor Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={selectedDonorFilter}
              onChange={(e) => setSelectedDonorFilter(e.target.value)}
              className="text-xs text-slate-700 font-medium bg-transparent focus:outline-hidden"
            >
              <option value="all">All Donor Grants</option>
              {donorsList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Include Encumbrances Checkbox */}
          <label className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={includeEncumbrances}
              onChange={(e) => setIncludeEncumbrances(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-emerald-700 focus:ring-emerald-700"
            />
            <span className="font-medium">Show Commitments (POs)</span>
          </label>

          {/* Display Mode Toggle */}
          <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg font-medium">
            <button
              onClick={() => setDisplayMode('grouped_columns')}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                displayMode === 'grouped_columns'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vertical Columns
            </button>
            <button
              onClick={() => setDisplayMode('horizontal_bars')}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                displayMode === 'horizontal_bars'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Horizontal Comparison
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50/40 border-b border-slate-200 text-xs">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Total Projected Budget</span>
          <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
            {formatMoney(chartSummary.totalBudget)}
          </p>
          <span className="text-[10px] text-slate-500">Approved Grant Ceiling</span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Cumulative Actual Spent</span>
          <p className="text-base font-bold font-mono text-emerald-700 mt-0.5">
            {formatMoney(chartSummary.totalSpent)}
          </p>
          <span className="text-[10px] text-emerald-700 font-medium">
            {chartSummary.overallBurn.toFixed(1)}% Portfolio Burn
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Total Available Runway</span>
          <p className="text-base font-bold font-mono text-slate-800 mt-0.5">
            {formatMoney(chartSummary.remainingBalance)}
          </p>
          <span className="text-[10px] text-slate-500">Uncommitted cash reserve</span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Highest Burn Grant</span>
          {chartSummary.highestBurnProject ? (
            <div className="mt-0.5">
              <span className="text-xs font-bold text-slate-900 block truncate">
                {chartSummary.highestBurnProject.shortTitle}
              </span>
              <span className={`text-[10px] font-mono font-bold ${
                chartSummary.highestBurnProject.budgetSummary.burnRatePercent > 90
                  ? 'text-rose-700'
                  : 'text-amber-700'
              }`}>
                {chartSummary.highestBurnProject.budgetSummary.burnRatePercent.toFixed(1)}% Burn Rate
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-500 mt-0.5">None</p>
          )}
        </div>
      </div>

      {/* Legend & Guidance */}
      <div className="px-5 py-2.5 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-slate-800 shrink-0"></span>
            <span className="text-slate-700 font-medium">Projected Budget (Grant Ceiling)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-600 shrink-0"></span>
            <span className="text-slate-700 font-medium">Actual Expended (&lt;85%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-amber-500 shrink-0"></span>
            <span className="text-slate-700 font-medium">Elevated Burn (85% - 90%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-600 shrink-0"></span>
            <span className="text-slate-700 font-bold">High Burn Alert (&gt;90%)</span>
          </div>
          {includeEncumbrances && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-indigo-500 shrink-0"></span>
              <span className="text-slate-700 font-medium">Open Commitments (POs)</span>
            </div>
          )}
        </div>
        <span className="text-[11px] text-slate-400 italic">
          Click any bar to open that project's full logframe
        </span>
      </div>

      {/* CHART CANVAS */}
      <div className="p-4 sm:p-6 bg-white">
        {displayMode === 'grouped_columns' ? (
          /* ========================================================================= */
          /* MODE 1: VERTICAL GROUPED COLUMN CHART (SVG + Interactive Elements)         */
          /* ========================================================================= */
          <div className="relative">
            {/* SVG Chart Frame */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-[620px] h-[340px] relative select-none">
                {/* SVG Graphics Layer */}
                <svg className="w-full h-full" viewBox="0 0 800 320" preserveAspectRatio="none">
                  <defs>
                    {/* Gradients for bars */}
                    <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#334155" />
                    </linearGradient>
                    <linearGradient id="spentNormalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                    <linearGradient id="spentWarningGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d97706" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                    <linearGradient id="spentDangerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#dc2626" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                    <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines & Y-Axis Labels */}
                  {yTicks.map((val, idx) => {
                    const yPos = 270 - (val / maxScaleValue) * 240;
                    return (
                      <g key={idx}>
                        <line
                          x1="70"
                          y1={yPos}
                          x2="780"
                          y2={yPos}
                          stroke="#e2e8f0"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                        <text
                          x="60"
                          y={yPos + 4}
                          textAnchor="end"
                          fontSize="10"
                          fill="#64748b"
                          fontFamily="monospace"
                        >
                          {currencyMode === 'USD'
                            ? `$${(val / 1000).toFixed(0)}k`
                            : `${(val / 1000).toFixed(0)}k`}
                        </text>
                      </g>
                    );
                  })}

                  {/* X Axis Baseline */}
                  <line x1="70" y1="270" x2="780" y2="270" stroke="#cbd5e1" strokeWidth="1.5" />

                  {/* Project Bar Groups */}
                  {filteredProjects.map((p, pIdx) => {
                    const groupWidth = (700) / filteredProjects.length;
                    const groupX = 85 + pIdx * groupWidth;

                    const budgetUSD = p.budgetSummary.totalGrantUSD;
                    const spentUSD = p.budgetSummary.expendituresUSD;
                    const commUSD = p.budgetSummary.commitmentsUSD || 0;
                    const burnRate = p.budgetSummary.burnRatePercent;

                    const budgetHeight = Math.max(4, (budgetUSD / maxScaleValue) * 240);
                    const spentHeight = Math.max(4, (spentUSD / maxScaleValue) * 240);
                    const commHeight = Math.max(2, (commUSD / maxScaleValue) * 240);

                    const barW = Math.min(32, (groupWidth - 30) / (includeEncumbrances ? 3 : 2));
                    const isHovered = hoveredProjectId === p.id;

                    const spentGradId =
                      burnRate > 90
                        ? 'url(#spentDangerGrad)'
                        : burnRate >= 85
                        ? 'url(#spentWarningGrad)'
                        : 'url(#spentNormalGrad)';

                    return (
                      <g
                        key={p.id}
                        className="cursor-pointer transition-opacity duration-150"
                        onMouseEnter={() => setHoveredProjectId(p.id)}
                        onMouseLeave={() => setHoveredProjectId(null)}
                        onClick={() => onSelectProject(p.id)}
                        opacity={hoveredProjectId && !isHovered ? 0.45 : 1}
                      >
                        {/* Hover Background Highlight Column */}
                        {isHovered && (
                          <rect
                            x={groupX - 10}
                            y="15"
                            width={groupWidth - 10}
                            height="255"
                            fill="#f8fafc"
                            rx="8"
                            stroke="#cbd5e1"
                            strokeWidth="1"
                          />
                        )}

                        {/* Bar 1: Projected Budget */}
                        <rect
                          x={groupX}
                          y={270 - budgetHeight}
                          width={barW}
                          height={budgetHeight}
                          fill="url(#budgetGrad)"
                          rx="4"
                          className="transition-all duration-300"
                        />

                        {/* Bar 2: Actual Spent */}
                        <rect
                          x={groupX + barW + 4}
                          y={270 - spentHeight}
                          width={barW}
                          height={spentHeight}
                          fill={spentGradId}
                          rx="4"
                          className="transition-all duration-300"
                        />

                        {/* Bar 3: Encumbrances (if enabled) */}
                        {includeEncumbrances && (
                          <rect
                            x={groupX + (barW + 4) * 2}
                            y={270 - commHeight}
                            width={barW}
                            height={commHeight}
                            fill="url(#commGrad)"
                            rx="4"
                            className="transition-all duration-300"
                          />
                        )}

                        {/* Top Label: Burn Rate Percentage on spent bar */}
                        <text
                          x={groupX + barW + 4 + barW / 2}
                          y={Math.max(16, 270 - spentHeight - 6)}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="bold"
                          fill={burnRate > 90 ? '#dc2626' : '#1e293b'}
                          fontFamily="monospace"
                        >
                          {burnRate.toFixed(0)}%
                        </text>

                        {/* High Burn Alert Icon */}
                        {burnRate > 90 && (
                          <g transform={`translate(${groupX + barW + 4 + barW / 2 - 5}, ${Math.max(2, 270 - spentHeight - 20)})`}>
                            <circle cx="5" cy="5" r="5" fill="#dc2626" />
                            <text x="5" y="8" textAnchor="middle" fontSize="8" fill="#ffffff" fontWeight="bold">!</text>
                          </g>
                        )}

                        {/* X-Axis Project Labels */}
                        <text
                          x={groupX + ((barW + 4) * (includeEncumbrances ? 3 : 2)) / 2 - 2}
                          y="288"
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="bold"
                          fill="#1e293b"
                          fontFamily="monospace"
                        >
                          {p.code.split('-')[3] || p.code}
                        </text>
                        <text
                          x={groupX + ((barW + 4) * (includeEncumbrances ? 3 : 2)) / 2 - 2}
                          y="302"
                          textAnchor="middle"
                          fontSize="9"
                          fill="#64748b"
                        >
                          {p.donorName.split(' ')[0]}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Interactive Tooltip when hovering over a project bar */}
                {hoveredProjectId && (
                  (() => {
                    const p = filteredProjects.find((proj) => proj.id === hoveredProjectId);
                    if (!p) return null;
                    const pIdx = filteredProjects.findIndex((proj) => proj.id === hoveredProjectId);
                    const leftPct = ((pIdx + 0.6) / filteredProjects.length) * 85 + 5;

                    return (
                      <div
                        className="absolute top-2 z-20 pointer-events-none bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs w-64 animate-in fade-in duration-150"
                        style={{
                          left: `${Math.min(75, Math.max(15, leftPct))}%`,
                          transform: 'translateX(-50%)'
                        }}
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
                          <span className="font-mono font-bold text-emerald-400">{p.code}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {p.donorName}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-100 line-clamp-1">{p.shortTitle}</p>
                        
                        <div className="mt-2 space-y-1 font-mono text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-sans">Projected Budget:</span>
                            <span className="font-bold text-white">{formatMoney(p.budgetSummary.totalGrantUSD)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-sans">Actual Expended:</span>
                            <span className="font-bold text-emerald-400">{formatMoney(p.budgetSummary.expendituresUSD)}</span>
                          </div>
                          {includeEncumbrances && (
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-sans">Open POs:</span>
                              <span className="font-bold text-indigo-400">{formatMoney(p.budgetSummary.commitmentsUSD || 0)}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-1 border-t border-slate-800">
                            <span className="text-slate-400 font-sans">Unspent Balance:</span>
                            <span className="font-bold text-slate-200">{formatMoney(p.budgetSummary.remainingBalanceUSD)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-sans">Burn Rate:</span>
                            <span className={`font-bold ${
                              p.budgetSummary.burnRatePercent > 90 ? 'text-rose-400' : 'text-emerald-400'
                            }`}>
                              {p.budgetSummary.burnRatePercent.toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] text-emerald-300 flex items-center justify-between">
                          <span>Click to open workspace</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* MODE 2: HORIZONTAL BAR COMPARISON CARDS                                   */
          /* ========================================================================= */
          <div className="space-y-4">
            {filteredProjects.map((p) => {
              const budgetUSD = p.budgetSummary.totalGrantUSD;
              const spentUSD = p.budgetSummary.expendituresUSD;
              const commUSD = p.budgetSummary.commitmentsUSD || 0;
              const burnRate = p.budgetSummary.burnRatePercent;
              const spentWidthPct = Math.min(100, (spentUSD / budgetUSD) * 100);
              const commWidthPct = Math.min(100 - spentWidthPct, (commUSD / budgetUSD) * 100);

              const isHighBurn = burnRate > 90;

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isHighBurn
                      ? 'border-rose-300 bg-rose-50/20 hover:border-rose-400 shadow-2xs'
                      : 'border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {p.code}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-800">
                        {p.shortTitle}
                      </h4>
                      {isHighBurn && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white">
                          High Burn Alert &gt;90%
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500 font-medium">Donor: <strong>{p.donorName}</strong></span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatMoney(spentUSD)} <span className="text-slate-400 font-normal">/ {formatMoney(budgetUSD)}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-mono text-xs font-bold ${
                        isHighBurn
                          ? 'bg-rose-100 text-rose-800'
                          : burnRate >= 85
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {burnRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Multi-segmented Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden flex shadow-inner">
                    {/* Spent Segment */}
                    <div
                      className={`h-full transition-all duration-500 ${
                        isHighBurn
                          ? 'bg-rose-600'
                          : burnRate >= 85
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${spentWidthPct}%` }}
                      title={`Expended: ${formatMoney(spentUSD)} (${spentWidthPct.toFixed(1)}%)`}
                    />
                    {/* Committed Segment */}
                    {includeEncumbrances && commUSD > 0 && (
                      <div
                        className="h-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${commWidthPct}%` }}
                        title={`Committed: ${formatMoney(commUSD)} (${commWidthPct.toFixed(1)}%)`}
                      />
                    )}
                  </div>

                  {/* Bottom metrics & legend for this bar */}
                  <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-3">
                      <span>Expended: <strong className="text-emerald-700 font-mono">{formatMoney(spentUSD)}</strong></span>
                      {includeEncumbrances && commUSD > 0 && (
                        <span>Encumbered: <strong className="text-indigo-700 font-mono">{formatMoney(commUSD)}</strong></span>
                      )}
                      <span>Uncommitted Balance: <strong className="text-slate-800 font-mono">{formatMoney(p.budgetSummary.remainingBalanceUSD)}</strong></span>
                    </div>

                    <div className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold">
                      <span>Open Workspace</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info & Quick Link */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Real-time budget tracking synchronizes directly with verified Payment Vouchers &amp; Supplier LPOs</span>
        </div>
        {setActiveView && (
          <button
            onClick={() => setActiveView('financials')}
            className="text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1"
          >
            <span>Open 3-Way Fund Control Matrix</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
