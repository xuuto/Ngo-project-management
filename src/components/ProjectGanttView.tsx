import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from 'recharts';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  User,
  MapPin,
  Milestone as MilestoneIcon,
  Layers,
  BarChart2,
  ArrowRight
} from 'lucide-react';
import { Project, Activity, Milestone, ActivityStatus } from '../types/ngo';
import { formatDate } from '../utils/formatters';

interface ProjectGanttViewProps {
  project: Project;
  onUpdateActivityStatus?: (projectId: string, activityId: string, status: ActivityStatus, progressPercent: number) => void;
}

export const ProjectGanttView: React.FC<ProjectGanttViewProps> = ({
  project,
  onUpdateActivityStatus
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [outputFilter, setOutputFilter] = useState<string>('all');
  const [viewScale, setViewScale] = useState<'days' | 'weeks'>('days');

  const projectStart = new Date(project.startDate || '2026-01-01');

  // Flatten activities
  const allActivities = useMemo(() => {
    const list: Array<{
      id: string;
      code: string;
      title: string;
      outputCode: string;
      outputTitle: string;
      startDate: string;
      endDate: string;
      status: string;
      progress: number;
      assignedTo: string;
      location: string;
      startDay: number;
      durationDays: number;
    }> = [];

    if (!project.logframe || !project.logframe.outcomes) return list;

    project.logframe.outcomes.forEach((outcome) => {
      outcome.outputs.forEach((out) => {
        (out.activities || []).forEach((act: Activity) => {
          const actStart = new Date(act.startDate || project.startDate || '2026-01-01');
          const actEnd = new Date(act.endDate || project.endDate || '2026-12-31');

          const startDay = Math.max(0, Math.floor((actStart.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)));
          const durationDays = Math.max(1, Math.ceil((actEnd.getTime() - actStart.getTime()) / (1000 * 60 * 60 * 24)));

          list.push({
            id: act.id,
            code: act.code,
            title: act.title,
            outputCode: out.code,
            outputTitle: out.title,
            startDate: act.startDate || project.startDate,
            endDate: act.endDate || project.endDate,
            status: act.status || 'Not Started',
            progress: act.progressPercent || 0,
            assignedTo: act.assignedTo || 'Field Team',
            location: act.location || project.targetRegions?.[0] || 'Somaliland',
            startDay,
            durationDays
          });
        });
      });
    });

    return list;
  }, [project, projectStart]);

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return allActivities.filter((act) => {
      if (statusFilter !== 'all' && act.status !== statusFilter) return false;
      if (outputFilter !== 'all' && act.outputCode !== outputFilter) return false;
      return true;
    });
  }, [allActivities, statusFilter, outputFilter]);

  // Prepare Recharts data format: offset (empty bar) + duration (colored bar)
  const chartData = useMemo(() => {
    return filteredActivities.map((act) => ({
      id: act.id,
      name: `${act.code}: ${act.title.length > 28 ? act.title.slice(0, 28) + '...' : act.title}`,
      fullTitle: act.title,
      code: act.code,
      outputCode: act.outputCode,
      offset: act.startDay,
      duration: act.durationDays,
      progress: act.progress,
      status: act.status,
      assignedTo: act.assignedTo,
      location: act.location,
      startDate: act.startDate,
      endDate: act.endDate
    })).reverse(); // Reverse so top activity appears at top of vertical chart
  }, [filteredActivities]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return '#059669'; // emerald-600
      case 'In Progress':
        return '#2563eb'; // blue-600
      case 'Field Verified':
        return '#7c3aed'; // violet-600
      case 'Delayed':
        return '#e11d48'; // rose-600
      default:
        return '#64748b'; // slate-500
    }
  };

  const outputsList = useMemo(() => {
    const list: Array<{ code: string; title: string }> = [];
    if (!project.logframe || !project.logframe.outcomes) return list;
    project.logframe.outcomes.forEach((outcome) => {
      outcome.outputs.forEach((o) => {
        list.push({ code: o.code, title: o.title });
      });
    });
    return list;
  }, [project]);

  return (
    <div className="space-y-6">
      {/* Gantt Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <BarChart2 className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold">Interactive Project Gantt Timeline &amp; Schedule</h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Visualizing activity execution spans relative to project duration ({project.startDate} to {project.endDate}), powered by Recharts timeline analysis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1 text-xs">
            <button
              onClick={() => setViewScale('days')}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                viewScale === 'days' ? 'bg-emerald-700 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Day Offset
            </button>
            <button
              onClick={() => setViewScale('weeks')}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                viewScale === 'weeks' ? 'bg-emerald-700 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Timeline Scale
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Activity Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Statuses ({allActivities.length})</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Field Verified">Field Verified</option>
              <option value="Delayed">Delayed</option>
              <option value="Not Started">Not Started</option>
            </select>
          </div>

          {/* Output Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Logframe Output:</span>
            <select
              value={outputFilter}
              onChange={(e) => setOutputFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Outputs ({outputsList.length})</option>
              {outputsList.map((o) => (
                <option key={o.code} value={o.code}>{o.code}: {o.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> In Progress
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-rose-600 inline-block" /> Delayed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-slate-500 inline-block" /> Not Started
          </span>
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Activity Execution Gantt Schedule</h4>
            <p className="text-xs text-slate-500">Showing {filteredActivities.length} activities scheduled across project lifecycle.</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            Project Window: {project.startDate} → {project.endDate}
          </span>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900">No Activities Match Filter</p>
            <p className="text-xs text-slate-500 mt-1">Try selecting a different status or output filter.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div style={{ minWidth: '700px', height: `${Math.max(350, filteredActivities.length * 40 + 80)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 160, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    unit=" days"
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#334155"
                    tick={{ fontSize: 11, fontWeight: 600 }}
                    width={150}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700 max-w-xs">
                            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                              <span className="font-mono font-bold text-emerald-400">{data.code}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono" style={{ backgroundColor: getStatusColor(data.status), color: '#ffffff' }}>
                                {data.status} ({data.progress}%)
                              </span>
                            </div>
                            <p className="font-bold text-slate-100">{data.fullTitle}</p>
                            <div className="text-slate-300 space-y-0.5 pt-1">
                              <p><strong>Timeline:</strong> {data.startDate} to {data.endDate} ({data.duration} days)</p>
                              <p><strong>Assigned Lead:</strong> {data.assignedTo}</p>
                              <p><strong>Location:</strong> {data.location}</p>
                              <p><strong>Output:</strong> {data.outputCode}</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Invisible offset bar to push duration bar to startDay */}
                  <Bar dataKey="offset" stackId="gantt" fill="transparent" isAnimationActive={false} />
                  {/* Duration bar */}
                  <Bar dataKey="duration" stackId="gantt" radius={[4, 4, 4, 4]} isAnimationActive={true}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Milestone Deliverable Gates Summary */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <MilestoneIcon className="w-4 h-4 text-emerald-700" />
          <span>Project Milestone Gates &amp; Target Deadlines</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(project.milestones || []).map((ms) => {
            const isAchieved = ms.status === 'Achieved';
            const isCritical = ms.isCriticalCheckpoint;
            return (
              <div
                key={ms.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  isAchieved
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : isCritical
                    ? 'bg-rose-50/30 border-rose-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-bold font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {ms.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        isAchieved
                          ? 'bg-emerald-700 text-white'
                          : ms.status === 'Delayed' || ms.status === 'Critical'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {ms.status}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 mt-1 leading-snug">
                    {ms.title}
                  </h5>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due: <strong className="font-mono text-slate-800">{formatDate(ms.dueDate)}</strong></span>
                  </span>
                  {isCritical && (
                    <span className="text-[10px] font-extrabold text-rose-700 uppercase bg-rose-100 px-1.5 py-0.2 rounded">
                      Critical Gate
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
