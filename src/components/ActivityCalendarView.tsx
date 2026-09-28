import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Milestone as MilestoneIcon,
  Layers,
  DollarSign,
  Check,
  List,
  Grid,
  Info,
  Building,
  Flag,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import {
  Project,
  Activity,
  ActivityStatus,
  Milestone,
  SomalilandRegion
} from '../types/ngo';
import { formatDate, formatUSD, formatPercent } from '../utils/formatters';

interface ExtendedActivity extends Activity {
  outcomeTitle?: string;
  outcomeCode?: string;
  outputTitle?: string;
  outputCode?: string;
}

interface ActivityCalendarViewProps {
  project: Project;
  onUpdateActivityStatus: (
    projectId: string,
    activityId: string,
    status: ActivityStatus,
    progressPercent: number
  ) => void;
  hasEditPermission: boolean;
}

export const ActivityCalendarView: React.FC<ActivityCalendarViewProps> = ({
  project,
  onUpdateActivityStatus,
  hasEditPermission
}) => {
  // Baseline reference date: Sept 2026 or fallback to project start
  const referenceDate = useMemo(() => {
    const projStart = new Date(project.startDate);
    // If project active in 2026, default to Sept 2026
    if (!isNaN(projStart.getTime())) {
      return new Date(2026, 8, 1); // Sept 2026
    }
    return new Date();
  }, [project.startDate]);

  const [currentYear, setCurrentYear] = useState<number>(referenceDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(referenceDate.getMonth()); // 0-indexed

  // View state: 'grid' (Monthly Grid) or 'agenda' (Month List)
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [showMilestones, setShowMilestones] = useState<boolean>(true);

  // Selected Activity for Detail Modal
  const [selectedActivity, setSelectedActivity] = useState<ExtendedActivity | null>(null);

  // Day detail modal if clicked on a day cell with many activities
  const [selectedDayISO, setSelectedDayISO] = useState<string | null>(null);

  // Flatten activities from logframe
  const allActivities = useMemo(() => {
    const list: ExtendedActivity[] = [];
    if (!project.logframe || !project.logframe.outcomes) return list;

    project.logframe.outcomes.forEach((outcome) => {
      outcome.outputs.forEach((output) => {
        output.activities.forEach((act) => {
          list.push({
            ...act,
            outcomeTitle: outcome.title,
            outcomeCode: outcome.code,
            outputTitle: output.title,
            outputCode: output.code
          });
        });
      });
    });
    return list;
  }, [project.logframe]);

  const milestonesList = useMemo(() => project.milestones || [], [project.milestones]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return allActivities.filter((act) => {
      // Search
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesCode = act.code.toLowerCase().includes(q);
        const matchesTitle = act.title.toLowerCase().includes(q);
        const matchesAssignee = act.assignedTo.toLowerCase().includes(q);
        const matchesLoc = act.location.toLowerCase().includes(q);
        if (!matchesCode && !matchesTitle && !matchesAssignee && !matchesLoc) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'all' && act.status !== statusFilter) {
        return false;
      }

      // Region
      if (regionFilter !== 'all' && act.region !== regionFilter) {
        return false;
      }

      return true;
    });
  }, [allActivities, searchQuery, statusFilter, regionFilter]);

  // Helpers for calendar calculation
  const toISODateStr = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Generate grid days for the month
  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
    const daysInMonth = lastDayOfMonth.getDate();

    const cells: {
      date: Date;
      isoString: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      dayNumber: number;
    }[] = [];

    const todayStr = '2026-09-27';

    // Previous month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const pDate = new Date(currentYear, currentMonth - 1, prevMonthLastDay - i);
      const iso = toISODateStr(pDate);
      cells.push({
        date: pDate,
        isoString: iso,
        isCurrentMonth: false,
        isToday: iso === todayStr,
        dayNumber: pDate.getDate()
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const cDate = new Date(currentYear, currentMonth, d);
      const iso = toISODateStr(cDate);
      cells.push({
        date: cDate,
        isoString: iso,
        isCurrentMonth: true,
        isToday: iso === todayStr,
        dayNumber: d
      });
    }

    // Next month padding to fill grid to multiple of 7
    const totalSoFar = cells.length;
    const remaining = 7 - (totalSoFar % 7);
    if (remaining < 7) {
      for (let n = 1; n <= remaining; n++) {
        const nDate = new Date(currentYear, currentMonth + 1, n);
        const iso = toISODateStr(nDate);
        cells.push({
          date: nDate,
          isoString: iso,
          isCurrentMonth: false,
          isToday: iso === todayStr,
          dayNumber: n
        });
      }
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Map activities & milestones per date
  const dateMap = useMemo(() => {
    const map = new Map<
      string,
      {
        activeActivities: ExtendedActivity[];
        startingActivities: ExtendedActivity[];
        endingActivities: ExtendedActivity[];
        milestonesDue: Milestone[];
      }
    >();

    calendarGrid.forEach((cell) => {
      const iso = cell.isoString;

      const activeActs = filteredActivities.filter((act) => {
        return iso >= act.startDate && iso <= act.endDate;
      });

      const startingActs = filteredActivities.filter((act) => act.startDate === iso);
      const endingActs = filteredActivities.filter((act) => act.endDate === iso);

      const msDue = showMilestones
        ? milestonesList.filter((ms) => ms.dueDate === iso)
        : [];

      map.set(iso, {
        activeActivities: activeActs,
        startingActivities: startingActs,
        endingActivities: endingActs,
        milestonesDue: msDue
      });
    });

    return map;
  }, [calendarGrid, filteredActivities, milestonesList, showMilestones]);

  // Statistics for the displayed month
  const monthStats = useMemo(() => {
    const monthStartISO = toISODateStr(new Date(currentYear, currentMonth, 1));
    const monthEndISO = toISODateStr(new Date(currentYear, currentMonth + 1, 0));

    const monthActivities = filteredActivities.filter((act) => {
      // Overlaps with current month
      return act.startDate <= monthEndISO && act.endDate >= monthStartISO;
    });

    const completed = monthActivities.filter((a) => a.status === 'Completed').length;
    const inProgress = monthActivities.filter((a) => a.status === 'In Progress').length;
    const fieldVerified = monthActivities.filter((a) => a.status === 'Field Verified').length;
    const delayed = monthActivities.filter((a) => a.status === 'Delayed').length;
    const notStarted = monthActivities.filter((a) => a.status === 'Not Started').length;

    const startingThisMonth = monthActivities.filter(
      (a) => a.startDate >= monthStartISO && a.startDate <= monthEndISO
    ).length;

    const endingThisMonth = monthActivities.filter(
      (a) => a.endDate >= monthStartISO && a.endDate <= monthEndISO
    ).length;

    const monthMilestones = showMilestones
      ? milestonesList.filter(
          (m) => m.dueDate >= monthStartISO && m.dueDate <= monthEndISO
        )
      : [];

    return {
      total: monthActivities.length,
      completed,
      inProgress,
      fieldVerified,
      delayed,
      notStarted,
      startingThisMonth,
      endingThisMonth,
      monthMilestones,
      activities: monthActivities
    };
  }, [currentYear, currentMonth, filteredActivities, milestonesList, showMilestones]);

  // Navigation functions
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(referenceDate.getFullYear());
    setCurrentMonth(referenceDate.getMonth());
  };

  const getStatusBadgeClass = (status: ActivityStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Field Verified':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'In Progress':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Delayed':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Not Started':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header Banner & Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <CalendarIcon className="w-4 h-4" />
              <span>Project Activity Schedule &amp; Calendar</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Workplan Calendar Grid — {monthNames[currentMonth]} {currentYear}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Monthly overview of planned field activities, duration spans, and milestone target checkpoints.
            </p>
          </div>

          {/* Month Navigation & View Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white hover:text-slate-900 text-slate-600 rounded-md transition-all cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1 hover:bg-white text-xs font-bold text-slate-700 rounded-md transition-all cursor-pointer"
              >
                Current (Sept 2026)
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white hover:text-slate-900 text-slate-600 rounded-md transition-all cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Fast Month / Year Jump Selects */}
            <div className="flex items-center gap-1.5">
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {monthNames.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
              >
                {[2024, 2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid / Agenda View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 ml-auto lg:ml-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === 'agenda'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Agenda</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search */}
            <div className="relative min-w-[200px] max-w-xs flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search activities, staff..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Field Verified">Field Verified</option>
                <option value="Completed">Completed</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>

            {/* Region Filter */}
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Regions</option>
              <option value="Maroodi Jeex">Maroodi Jeex</option>
              <option value="Togdheer">Togdheer</option>
              <option value="Sahil">Sahil</option>
              <option value="Awdal">Awdal</option>
              <option value="Sanaag">Sanaag</option>
              <option value="Sool">Sool</option>
            </select>

            {/* Show Milestones Checkbox */}
            <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer select-none px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                checked={showMilestones}
                onChange={(e) => setShowMilestones(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <MilestoneIcon className="w-3.5 h-3.5 text-purple-600" />
              <span>Show Milestones</span>
            </label>
          </div>

          {/* Quick Legend */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold">
            <span className="text-slate-400 uppercase tracking-wider font-mono">Legend:</span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Completed
            </span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              In Progress
            </span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              Delayed
            </span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              Verified
            </span>
            {showMilestones && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                <Flag className="w-2.5 h-2.5 text-purple-700" />
                Milestone
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Summary Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Active Activities
          </p>
          <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
            {monthStats.total}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            In {monthNames[currentMonth]}
          </p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
            Completed
          </p>
          <p className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
            {monthStats.completed}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {monthStats.total > 0
              ? `${Math.round((monthStats.completed / monthStats.total) * 100)}% of month`
              : '0%'}
          </p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
            In Progress
          </p>
          <p className="text-lg font-bold font-mono text-amber-700 mt-0.5">
            {monthStats.inProgress}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Ongoing execution</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
            Delayed
          </p>
          <p className="text-lg font-bold font-mono text-rose-700 mt-0.5">
            {monthStats.delayed}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Requires attention</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
            Starts / Ends
          </p>
          <p className="text-sm font-bold font-mono text-slate-800 mt-1">
            <span className="text-emerald-700">+{monthStats.startingThisMonth}</span> /{' '}
            <span className="text-slate-600">-{monthStats.endingThisMonth}</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Start / End transitions</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
            Milestone Gates
          </p>
          <p className="text-lg font-bold font-mono text-purple-700 mt-0.5">
            {monthStats.monthMilestones.length}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Due this month</p>
        </div>
      </div>

      {/* MAIN CONTENT AREA: Grid View or Agenda View */}
      {viewMode === 'grid' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Calendar Header Row */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="py-2.5 text-center text-xs font-bold text-slate-600 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200">
            {calendarGrid.map((cell) => {
              const dateData = dateMap.get(cell.isoString) || {
                activeActivities: [],
                startingActivities: [],
                endingActivities: [],
                milestonesDue: []
              };

              const activeCount = dateData.activeActivities.length;
              const msCount = dateData.milestonesDue.length;

              return (
                <div
                  key={cell.isoString}
                  className={`min-h-[120px] sm:min-h-[140px] p-1.5 sm:p-2 transition-colors flex flex-col justify-between ${
                    cell.isCurrentMonth
                      ? cell.isToday
                        ? 'bg-amber-50/60 ring-2 ring-amber-400 ring-inset'
                        : 'bg-white'
                      : 'bg-slate-50/70 text-slate-400'
                  }`}
                >
                  {/* Cell Header: Day number & count indicators */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        cell.isToday
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    <div className="flex items-center gap-1">
                      {msCount > 0 && (
                        <span
                          className="px-1 py-0.2 rounded-full text-[9px] font-bold bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-0.5"
                          title={`${msCount} milestone checkpoint due on ${cell.isoString}`}
                        >
                          <Flag className="w-2.5 h-2.5 text-purple-700" />
                          <span>{msCount}</span>
                        </span>
                      )}

                      {activeCount > 0 && (
                        <span
                          className={`text-[9px] font-mono font-semibold px-1 py-0.2 rounded ${
                            cell.isCurrentMonth
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {activeCount} {activeCount === 1 ? 'act' : 'acts'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cell Content Body: Milestones & Activity Chips */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {/* Milestones first */}
                    {dateData.milestonesDue.map((ms) => (
                      <div
                        key={ms.id}
                        className="px-1.5 py-1 rounded bg-purple-50 border border-purple-300 text-purple-950 text-[10px] font-bold truncate flex items-center gap-1 shadow-2xs"
                        title={`Milestone: ${ms.title} (${ms.status})`}
                      >
                        <Flag className="w-3 h-3 text-purple-700 shrink-0 fill-purple-200" />
                        <span className="truncate">{ms.title}</span>
                      </div>
                    ))}

                    {/* Activity Chips (up to 3) */}
                    {dateData.activeActivities.slice(0, 3).map((act) => {
                      const isStart = act.startDate === cell.isoString;
                      const isEnd = act.endDate === cell.isoString;
                      const badgeClass = getStatusBadgeClass(act.status);

                      return (
                        <button
                          key={act.id}
                          onClick={() => setSelectedActivity(act)}
                          className={`w-full text-left p-1 rounded border text-[10px] font-semibold transition-all hover:scale-101 hover:shadow-xs cursor-pointer ${badgeClass} block truncate`}
                          title={`${act.code}: ${act.title} (${act.status})\nLocation: ${act.location}\nAssigned: ${act.assignedTo}\nDates: ${act.startDate} to ${act.endDate}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono font-bold shrink-0">{act.code}</span>
                            {isStart && (
                              <span className="px-1 py-0.2 text-[8px] uppercase tracking-wider font-extrabold bg-emerald-700 text-white rounded shrink-0">
                                Start
                              </span>
                            )}
                            {isEnd && (
                              <span className="px-1 py-0.2 text-[8px] uppercase tracking-wider font-extrabold bg-slate-800 text-white rounded shrink-0">
                                End
                              </span>
                            )}
                          </div>
                          <p className="truncate text-[9.5px] leading-tight text-slate-900 mt-0.5">
                            {act.title}
                          </p>
                        </button>
                      );
                    })}

                    {/* Overflow Button */}
                    {activeCount > 3 && (
                      <button
                        onClick={() => setSelectedDayISO(cell.isoString)}
                        className="w-full text-center py-0.5 px-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9.5px] font-bold transition-colors cursor-pointer"
                      >
                        + {activeCount - 3} more activities
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda / Month List View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden divide-y divide-slate-100">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Agenda View — {monthNames[currentMonth]} {currentYear} ({monthStats.total}{' '}
              Activities)
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Filtered List of Planned Works
            </span>
          </div>

          {monthStats.activities.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold">No activities scheduled for this month</p>
              <p className="text-xs text-slate-400">
                Try switching months or clearing your search/filter parameters.
              </p>
            </div>
          ) : (
            monthStats.activities.map((act) => {
              const badgeClass = getStatusBadgeClass(act.status);

              return (
                <div
                  key={act.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {act.code}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}`}
                      >
                        {act.status}
                      </span>
                      <span className="text-xs font-bold text-slate-600 font-mono">
                        {act.progressPercent}% Complete
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{act.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-slate-700">
                          {formatDate(act.startDate)} — {formatDate(act.endDate)}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {act.assignedTo} ({act.assignedRole})
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {act.location}, {act.region} ({act.district})
                        </span>
                      </span>
                      <span className="flex items-center gap-1 font-mono text-slate-700">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Allocated: {formatUSD(act.budgetAllocatedUSD)} | Spent:{' '}
                          {formatUSD(act.budgetSpentUSD)}
                        </span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedActivity(act)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold self-start md:self-center transition-colors shadow-2xs shrink-0 cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ACTIVITY DETAIL MODAL */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono text-xs font-extrabold">
                    {selectedActivity.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadgeClass(
                      selectedActivity.status
                    )}`}
                  >
                    {selectedActivity.status}
                  </span>
                </div>
                <h3 className="text-base font-bold mt-2 leading-snug">
                  {selectedActivity.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Context Logframe Path */}
              {(selectedActivity.outcomeTitle || selectedActivity.outputTitle) && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Logframe Context
                  </p>
                  {selectedActivity.outcomeTitle && (
                    <p className="text-slate-700 font-medium">
                      <strong className="text-slate-900 font-mono">
                        {selectedActivity.outcomeCode}:
                      </strong>{' '}
                      {selectedActivity.outcomeTitle}
                    </p>
                  )}
                  {selectedActivity.outputTitle && (
                    <p className="text-slate-600">
                      <strong className="text-slate-800 font-mono">
                        {selectedActivity.outputCode}:
                      </strong>{' '}
                      {selectedActivity.outputTitle}
                    </p>
                  )}
                </div>
              )}

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">Activity Completion Progress</span>
                  <span className="font-mono text-emerald-700">
                    {selectedActivity.progressPercent}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${selectedActivity.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Description &amp; Deliverables
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedActivity.description}
                </p>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Execution Window
                  </span>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5 font-mono">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {formatDate(selectedActivity.startDate)} —{' '}
                      {formatDate(selectedActivity.endDate)}
                    </span>
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Assigned Lead / Officer
                  </span>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {selectedActivity.assignedTo} ({selectedActivity.assignedRole})
                    </span>
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Field Location &amp; Region
                  </span>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {selectedActivity.location}, {selectedActivity.region} (
                      {selectedActivity.district})
                    </span>
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Budget Allocation &amp; Spend
                  </span>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5 font-mono">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {formatUSD(selectedActivity.budgetAllocatedUSD)} allocated (
                      {formatUSD(selectedActivity.budgetSpentUSD)} spent)
                    </span>
                  </p>
                </div>
              </div>

              {/* Status Update Quick Controls (If permitted) */}
              {hasEditPermission && (
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Update Activity Status
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    {(
                      [
                        'Not Started',
                        'In Progress',
                        'Field Verified',
                        'Completed',
                        'Delayed'
                      ] as ActivityStatus[]
                    ).map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          const newProgress =
                            st === 'Completed'
                              ? 100
                              : st === 'Not Started'
                              ? 0
                              : selectedActivity.progressPercent;
                          onUpdateActivityStatus(
                            project.id,
                            selectedActivity.id,
                            st,
                            newProgress
                          );
                          setSelectedActivity((prev) =>
                            prev
                              ? { ...prev, status: st, progressPercent: newProgress }
                              : null
                          );
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedActivity.status === st
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DAY OVERFLOW MODAL */}
      {selectedDayISO && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">
                  Activities on {formatDate(selectedDayISO)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayISO(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {(dateMap.get(selectedDayISO)?.activeActivities || []).map((act) => {
                const badgeClass = getStatusBadgeClass(act.status);

                return (
                  <div
                    key={act.id}
                    onClick={() => {
                      setSelectedDayISO(null);
                      setSelectedActivity(act);
                    }}
                    className="p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-emerald-800">
                        {act.code}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold border ${badgeClass}`}
                      >
                        {act.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      {act.title}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>{act.assignedTo}</span>
                      <span>·</span>
                      <span>{act.location}</span>
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setSelectedDayISO(null)}
                className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
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
