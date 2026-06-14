/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useAppState } from '../context/StateContext';
import { i18nData } from '../i18n';
import { 
  BarChart, Bar, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldAlert, 
  Briefcase, 
  ListOrdered, 
  FileCheck,
  Zap
} from 'lucide-react';

export function ReportsView() {
  const { 
    language, 
    machines, 
    predictions, 
    workOrders, 
    sensorReadings 
  } = useAppState();

  const t = i18nData[language];

  // 1. Machine Risk Distribution Aggregates (Pie chart)
  const riskDistributionData = useMemo(() => {
    const counts = { Healthy: 0, Warning: 0, Critical: 0, Offline: 0 };
    machines.forEach(m => {
      if (m.status in counts) {
        counts[m.status as keyof typeof counts]++;
      } else {
        counts.Healthy++;
      }
    });

    return [
      { name: t.Healthy, value: counts.Healthy, color: '#10b981' }, // emerald
      { name: t.Warning, value: counts.Warning, color: '#eab308' }, // amber
      { name: t.Critical, value: counts.Critical, color: '#f43f5e' }, // rose-500
      { name: t.Offline, value: counts.Offline, color: '#94a3b8' } // slate
    ].filter(item => item.value > 0);
  }, [machines, language]);

  // 2. Technicians Workload (Bar chart)
  const workloadData = useMemo(() => {
    const techCount: Record<string, number> = {};
    workOrders.forEach(w => {
      if (w.status !== 'Done' && w.status !== 'Cancelled') {
        const key = w.assignedTo.split('@')[0]; // simple name
        techCount[key] = (techCount[key] || 0) + 1;
      }
    });

    return Object.entries(techCount).map(([name, count]) => ({
      name: name.toUpperCase(),
      tasks: count
    }));
  }, [workOrders]);

  // 3. Leaderboard of Top Vulnerable/Risky Machinery
  const mostVulnerableMachines = useMemo(() => {
    return predictions
      .map(p => {
        const mach = machines.find(m => m.id === p.machineId);
        return {
          id: p.machineId,
          name: mach ? mach.name : 'Unknown',
          serial: mach ? mach.serialNumber : '',
          healthScore: p.healthScore,
          failureProbability: p.failureProbability,
          riskLevel: p.riskLevel,
          proposedAction: p.recommendedAction
        };
      })
      .sort((a, b) => b.failureProbability - a.failureProbability) // Sort from highest failure probability
      .slice(0, 5); // top 5
  }, [predictions, machines]);

  // 4. Completed vs Open tasks bar
  const tasksRatioData = useMemo(() => {
    const done = workOrders.filter(w => w.status === 'Done').length;
    const open = workOrders.filter(w => w.status === 'Open' || w.status === 'In Progress').length;
    return [
      { name: language === 'fa' ? 'تکمیل شده' : 'Completed', count: done, fill: '#10b981' },
      { name: language === 'fa' ? 'در جریان / باز' : 'Open / In Progress', count: open, fill: '#3b82f6' }
    ];
  }, [workOrders, language]);

  return (
    <div className="space-y-6 font-sans">
      {/* View Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t.reportsTitle}
        </h2>
        <p className="text-slate-500 text-sm">
          {language === 'fa' 
            ? "گزارش‌های جامع آماری، تحلیل بار کاری مهندسین و تخمین طول عمر مفید قطعات کارگاه"
            : "Executive summary telemetry charts, maintenance metrics, and critical assets backlog analysis"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Risk Distribution Pie Chart */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="border-b pb-3 mb-3 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900 text-sm">{language === 'fa' ? 'توزیع ریسک کل ناوگان تفکیکی' : 'Total Fleet Risk Distribution'}</h3>
          </div>
          
          <div className="h-60 flex flex-col sm:flex-row items-center justify-around gap-4">
            <div className="h-full w-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val} Assets`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend indicators list */}
            <div className="space-y-2.5 text-xs text-slate-600">
              {riskDistributionData.map((item, index) => (
                <div key={index} className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                  <span className="font-medium">{item.name}:</span>
                  <strong className="font-mono text-slate-900">{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHART 2: Technicians Active Workloads */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="border-b pb-3 mb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-sm">{language === 'fa' ? 'توزیع وظایف پرسنل نگهداری' : 'Active Technicians Backlog'}</h3>
          </div>

          <div className="h-56">
            {workloadData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No active assignments outstanding.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                  <YAxis stroke="#94a3b8" fontSize={9} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                    {workloadData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f59e0b' : '#fb923c'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: LEADERBOARD OF CRITICAL MACHINES */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="border-b pb-3 mb-4 flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{language === 'fa' ? '۵ جزو دارای بحران آسیب بالا' : 'Top 5 Most Vulnerable Machines Leaderboard'}</h3>
              <span className="text-[10px] text-slate-400 block font-mono">Sorted dynamically by failureProbability descending</span>
            </div>
          </div>

          <div className="space-y-4">
            {mostVulnerableMachines.map((m, index) => (
              <div 
                key={m.id}
                className="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-mono text-[11px] font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{m.name}</h4>
                    <span className="font-mono text-[9px] text-slate-400 block">{m.serial}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-normal">Health</span>
                    <strong className={m.healthScore < 50 ? 'text-red-500 font-bold' : 'text-slate-700'}>{m.healthScore}%</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-normal">Risk Prob.</span>
                    <strong className="text-red-500 font-bold">{m.failureProbability}%</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: TASK COMPLETIONS RATIO */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="border-b pb-3 mb-3 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-900 text-sm">{language === 'fa' ? 'دستورکارهای باز در برابر تکمیل شده' : 'Completions Ratio'}</h3>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksRatioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {tasksRatioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
