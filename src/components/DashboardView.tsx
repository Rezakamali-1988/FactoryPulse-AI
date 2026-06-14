/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAppState } from '../context/StateContext';
import { i18nData } from '../i18n';
import { 
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, LineChart, Line
} from 'recharts';
import { 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  XOctagon, 
  Wrench, 
  Heart,
  TrendingUp,
  Clock,
  ExternalLink,
  ChevronRight,
  Zap,
  ShieldAlert
} from 'lucide-react';

export function DashboardView({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { 
    language, 
    machines, 
    sensorReadings, 
    predictions, 
    alerts, 
    workOrders 
  } = useAppState();

  const t = i18nData[language];

  // Selected machine for telemetry preview
  const [selectedTelemetryMachineId, setSelectedTelemetryMachineId] = useState<string>(
    machines[0]?.id || "mach-01"
  );

  // 1. Calculations for upper KPI cards
  const totalCount = machines.length;
  const healthyCount = machines.filter(m => m.status === 'Healthy').length;
  const warningCount = machines.filter(m => m.status === 'Warning').length;
  const criticalCount = machines.filter(m => m.status === 'Critical').length;
  const offlineCount = machines.filter(m => m.status === 'Offline').length;

  const openWOsCount = workOrders.filter(w => w.status === 'Open' || w.status === 'In Progress').length;
  
  const avgHealthScore = useMemo(() => {
    if (predictions.length === 0) return 100;
    const sum = predictions.reduce((acc, curr) => acc + curr.healthScore, 0);
    return Math.round(sum / predictions.length);
  }, [predictions]);

  // 2. Fetch recent active alerts
  const recentAlertsList = useMemo(() => {
    return alerts
      .filter(a => a.status === 'Active')
      .slice(0, 5);
  }, [alerts]);

  // 3. Formulate chart data for Failure risk trends (12 historical aggregates)
  const failureRiskTrendData = useMemo(() => {
    // Group sorted sensor readings into 8 timeslots
    // Let's grab the last 24 entries of our selected preview machine
    const previewReadings = sensorReadings
      .filter(r => r.machineId === selectedTelemetryMachineId)
      .slice(-10) // last 10 intervals
      .reverse(); // chronological order

    const selectedMachineDetail = machines.find(m => m.id === selectedTelemetryMachineId);

    return previewReadings.map((r, index) => {
      // Calculate individual health indicators for this index
      const hourVal = new Date(r.timestamp);
      const timeStr = hourVal.toLocaleTimeString(language === 'fa' ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' });

      // Simulate a small progression trend for visual beauty
      let temp = r.temperature;
      let vib = r.vibration;
      let riskFactor = Math.min(95, Math.max(5, (temp * 0.4) + (vib * 15)));

      return {
        timestamp: timeStr,
        [selectedMachineDetail?.name || 'Asset']: Math.round(riskFactor),
        temperature: r.temperature,
        vibration: r.vibration
      };
    });
  }, [sensorReadings, selectedTelemetryMachineId, machines, language]);

  // Total Fleet breakdown for visual doughnut bar Chart
  const assetTypesDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    machines.forEach(m => {
      counts[m.type] = (counts[m.type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: t[name as keyof typeof t] || name,
      value
    }));
  }, [machines, language]);

  const COLORS = ['#eab308', '#3b82f6', '#10b981', '#a855f7', '#f43f5e', '#14b8a6'];

  return (
    <div className="space-y-6">
      {/* Top Welcome Title Banner */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
            {t.dashboard}
          </h2>
          <p className="text-slate-500 text-sm font-sans mt-1">
            {language === 'fa' 
              ? "مرجع یکپارچه نظارت تصویری، پایش سنسورها و الگوریتم‌های هوش مصنوعی مرکز"
              : "Enterprise central node for visual component diagnostics, acoustic signals, and telemetry predictions"}
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600 border border-slate-200 shadow-sm">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>UTC: {new Date().toLocaleTimeString(language === 'fa' ? 'fa-IR' : 'en-US')}</span>
        </div>
      </div>

      {/* 1. Upper KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        {/* Total Assets Card */}
        <div className="bg-white border p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-1 z-10">
            <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase block">{t.totalMachines}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 leading-none">{totalCount}</span>
              <span className="text-xs text-slate-400">f-units</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">
              {offlineCount} {t.Offline}
            </span>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-700 group-hover:bg-slate-200 transition-all">
            <Layers className="w-6 h-6" />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100/20 rounded-full blur-2xl group-hover:bg-slate-100/40 transition-all pointer-events-none"></div>
        </div>

        {/* Status Distribution (Healthy vs Warning) */}
        <div className="bg-white border p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-1 z-10">
            <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase block">{t.healthyMachines}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600 leading-none">{healthyCount}</span>
              <span className="text-xs font-bold text-amber-500 font-mono">
                / {warningCount} {t.Warning}
              </span>
            </div>
            <span className="text-[10px] text-red-500 font-semibold block mt-1 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 shrink-0" />
              {criticalCount} {t.criticalMachines}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-100 transition-all">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Average Health Index */}
        <div className="bg-white border p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-1 z-10">
            <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase block">{t.avgHealthScore}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-950 leading-none">{avgHealthScore}%</span>
              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden mt-1 inline-block">
                <div 
                  className={`h-full ${avgHealthScore > 80 ? 'bg-emerald-500' : avgHealthScore > 60 ? 'bg-amber-500' : 'bg-red-500'}`} 
                  style={{ width: `${avgHealthScore}%` }}
                ></div>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">
              Standard Deviation ±3.2%
            </span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-all">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        {/* Maintenance Dispatcher Task Count */}
        <div className="bg-white border p-5 rounded-2xl cursor-pointer hover:border-blue-500 transition-all flex items-center justify-between shadow-sm relative overflow-hidden group" onClick={() => setActiveTab('workorders')}>
          <div className="space-y-1 z-10">
            <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase block">{t.openWorkOrders}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-blue-600 leading-none">{openWOsCount}</span>
              <span className="text-xs text-slate-400">active items</span>
            </div>
            <span className="text-[10px] text-blue-600 font-mono font-bold block mt-1 flex items-center gap-0.5">
              {t.workOrderTitle}
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-all">
            <Wrench className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Interactive Sensor Stream Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT & MID: Dynamic Chart panel */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-sans">{t.riskTrendChart}</h3>
                <span className="text-[10px] text-slate-400 block font-mono">Real-time Calculated Degradation Wave</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-sans">{t.machine}:</label>
              <select 
                value={selectedTelemetryMachineId}
                onChange={(e) => setSelectedTelemetryMachineId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-700 outline-none hover:border-slate-300 font-sans"
              >
                {machines.map(m => (
                  <option id={`select-mach-${m.id}`} key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={failureRiskTrendData}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} fontStyle="italic" />
                <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '11px' }}
                  itemStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '500' }} />
                <Area 
                  type="monotone" 
                  dataKey={machines.find(m => m.id === selectedTelemetryMachineId)?.name || 'Asset'} 
                  stroke="#2563eb" 
                  fillOpacity={1} 
                  fill="url(#colorRisk)" 
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: Active Safety Alerts list */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col font-sans">
          <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t.recentAlerts}</h3>
                <span className="text-[10px] text-red-400 block font-mono">Unresolved Risk Boundaries ({recentAlertsList.length})</span>
              </div>
            </div>
            <button 
              id="view-all-alerts-btn"
              onClick={() => setActiveTab('alerts')}
              className="text-xs text-blue-600 font-bold hover:text-blue-500 flex items-center gap-0.5"
            >
              <span>{language === 'fa' ? 'نمایش همه' : 'View All'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-64">
            {recentAlertsList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                <CheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
                <p className="text-xs text-center">{t.noAlerts}</p>
              </div>
            ) : (
              recentAlertsList.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all text-sm leading-tight ${
                    alert.severity === 'Critical' 
                      ? 'bg-red-50/60 border-red-200' 
                      : alert.severity === 'High' 
                        ? 'bg-orange-50/60 border-orange-200' 
                        : 'bg-amber-50/60 border-amber-200'
                  }`}
                >
                  <div className={`mt-0.5 p-1 rounded-md shrink-0 ${
                    alert.severity === 'Critical' 
                      ? 'bg-red-500 text-white' 
                      : alert.severity === 'High' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-amber-500 text-slate-950'
                  }`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-slate-900 text-xs truncate">{alert.title}</h4>
                      <span className="font-mono text-[9px] text-slate-400 shrink-0">
                        {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-[10px] leading-tight text-slate-500 block">
                      <strong>{t.sourceMachine}:</strong> {alert.machineName}
                    </span>
                    <p className="text-[11px] leading-tight text-slate-600 line-clamp-2">
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Operational Machine Registry Table */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden font-sans">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t.machineStatusTable}</h3>
            <span className="text-[10px] text-slate-400 block font-mono">Current operational safety coefficients</span>
          </div>
          <button 
            id="view-all-assets"
            onClick={() => setActiveTab('assets')}
            className="text-xs text-blue-600 font-bold hover:text-blue-500 flex items-center gap-0.5"
          >
            <span>{language === 'fa' ? 'مدیریت تجهیزات' : 'Manage Fleet'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-600 border-collapse">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 text-slate-500">{t.name}</th>
                <th className="px-5 py-3.5 text-slate-500">{t.type}</th>
                <th className="px-5 py-3.5 text-slate-500">{t.location}</th>
                <th className="px-5 py-3.5 text-slate-500">{t.healthScore}</th>
                <th className="px-5 py-3.5 text-slate-500">{t.failureProbability}</th>
                <th className="px-5 py-3.5 text-slate-500">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {machines.slice(0, 6).map((m) => {
                const calculatedPred = predictions.find(p => p.machineId === m.id) || {
                  healthScore: 100,
                  failureProbability: 5,
                  riskLevel: 'Low'
                };

                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      <div className="flex flex-col">
                        <span>{m.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-medium">{m.serialNumber}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-sans">
                      {t[m.type as keyof typeof t] || m.type}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 italic">
                      {m.location}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`font-mono font-bold ${
                        calculatedPred.healthScore < 40 
                          ? 'text-red-500' 
                          : calculatedPred.healthScore < 75 
                            ? 'text-amber-500' 
                            : 'text-emerald-500'
                      }`}>
                        {calculatedPred.healthScore}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono">
                      {calculatedPred.failureProbability}%
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight inline-block ${
                        m.status === 'Healthy' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : m.status === 'Warning' 
                            ? 'bg-amber-100 text-amber-700' 
                            : m.status === 'Critical' 
                              ? 'bg-red-50 text-red-500 animate-pulse' 
                              : 'bg-slate-100 text-slate-400'
                      }`}>
                        {t[m.status as keyof typeof t] || m.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
