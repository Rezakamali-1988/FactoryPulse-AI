/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAppState } from '../context/StateContext';
import { i18nData } from '../i18n';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert, 
  Trash2,
  ListFilter
} from 'lucide-react';

export function AlertCenterView() {
  const { 
    language, 
    alerts, 
    resolveAlert 
  } = useAppState();

  const t = i18nData[language];

  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Resolved'>('Active');

  // Severity count aggregates
  const counts = useMemo(() => {
    return {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'Active').length,
      resolved: alerts.filter(a => a.status === 'Resolved').length,
      critical: alerts.filter(a => a.severity === 'Critical' && a.status === 'Active').length,
      high: alerts.filter(a => a.severity === 'High' && a.status === 'Active').length,
      warning: alerts.filter(a => a.severity === 'Warning' && a.status === 'Active').length,
    };
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    if (activeFilter === 'Active') {
      return alerts.filter(a => a.status === 'Active');
    }
    if (activeFilter === 'Resolved') {
      return alerts.filter(a => a.status === 'Resolved');
    }
    return alerts;
  }, [alerts, activeFilter]);

  return (
    <div className="space-y-6 font-sans">
      {/* Banner Title */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t.alerts}
        </h2>
        <p className="text-slate-500 text-sm">
          {language === 'fa' 
            ? "سامانه یکپارچه پایش خطا، اعلان صدمات فیزیکی و تایید رفع عيب توسط مهندسین"
            : "Review real-time mechanical exceptions, threshold violations, and engineering diagnostics"}
        </p>
      </div>

      {/* KPI Severity counters banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border p-3.5 rounded-xl text-center shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold block tracking-wider uppercase">{language === 'fa' ? 'اعلان‌های فعال' : 'ACTIVE'}</span>
          <strong className="text-xl font-extrabold text-slate-800 font-mono mt-0.5 block">{counts.active}</strong>
        </div>
        <div className="bg-red-50 border border-red-100 p-3.5 rounded-xl text-center shadow-xs">
          <span className="text-[10px] text-red-400 font-bold block tracking-wider uppercase">{language === 'fa' ? 'بحرانی' : 'CRITICAL'}</span>
          <strong className="text-xl font-extrabold text-red-500 font-mono mt-0.5 block">{counts.critical}</strong>
        </div>
        <div className="bg-orange-50/60 border border-orange-100 p-3.5 rounded-xl text-center shadow-xs">
          <span className="text-[10px] text-orange-400 font-bold block tracking-wider uppercase">{language === 'fa' ? 'بالا' : 'HIGH'}</span>
          <strong className="text-xl font-extrabold text-orange-500 font-mono mt-0.5 block">{counts.high}</strong>
        </div>
        <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-xl text-center shadow-xs">
          <span className="text-[10px] text-amber-500 font-bold block tracking-wider uppercase">{language === 'fa' ? 'متوسط' : 'WARNING'}</span>
          <strong className="text-xl font-extrabold text-amber-600 font-mono mt-0.5 block">{counts.warning}</strong>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-center shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 font-bold block tracking-wider uppercase">{language === 'fa' ? 'رفع شده' : 'RESOLVED'}</span>
          <strong className="text-xl font-extrabold text-slate-500 font-mono mt-0.5 block">{counts.resolved}</strong>
        </div>
      </div>

      {/* FILTERS TABS */}
      <div className="flex border-b text-xs pb-px items-center justify-between gap-4">
        <div className="flex gap-4">
          <button
            id="tab-alert-active"
            onClick={() => setActiveFilter('Active')}
            className={`pb-2.5 font-bold border-b-2 tracking-tight transition-all cursor-pointer ${
              activeFilter === 'Active' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {language === 'fa' ? 'اعلان‌های فعال با خطا' : 'Active Alerts'}
          </button>
          <button
            id="tab-alert-resolved"
            onClick={() => setActiveFilter('Resolved')}
            className={`pb-2.5 font-bold border-b-2 tracking-tight transition-all cursor-pointer ${
              activeFilter === 'Resolved' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {language === 'fa' ? 'فهرست رفع شده‌ها' : 'Resolved Archive'}
          </button>
          <button
            id="tab-alert-all"
            onClick={() => setActiveFilter('All')}
            className={`pb-2.5 font-bold border-b-2 tracking-tight transition-all cursor-pointer ${
              activeFilter === 'All' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {language === 'fa' ? 'همه اعلان‌ها' : 'Historical Journal'}
          </button>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <ListFilter className="w-3.5 h-3.5 shrink-0" />
          <span>Filters applied</span>
        </div>
      </div>

      {/* ALERTS MAIN FEED LIST */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 text-center text-slate-400 shadow-sm flex flex-col items-center justify-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mb-2" />
            <p className="font-bold text-slate-600 mb-1">{language === 'fa' ? 'سیستم پایدار است' : 'No warnings outstanding.'}</p>
            <span className="text-xs text-slate-400">
              {language === 'fa' ? 'همه کانال‌های سنسورها زیر آستانه ایمن هستند' : 'All equipment is registering nominal indicators.'}
            </span>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all relative overflow-hidden ${
                alert.status === 'Resolved' ? 'opacity-70' : ''
              }`}
            >
              {/* Alert Status left pillar border */}
              <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                alert.status === 'Resolved' 
                  ? 'bg-slate-300' 
                  : alert.severity === 'Critical' 
                    ? 'bg-red-500' 
                    : alert.severity === 'High' 
                      ? 'bg-orange-500' 
                      : 'bg-amber-500'
              }`}></div>

              <div className="flex items-start gap-3.5 max-w-2xl pl-2">
                {/* Dynamic Icon */}
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  alert.status === 'Resolved'
                    ? 'bg-slate-100 text-slate-450'
                    : alert.severity === 'Critical'
                      ? 'bg-red-100 text-red-600 animate-pulse'
                      : alert.severity === 'High'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-amber-100 text-amber-600'
                }`}>
                  {alert.status === 'Resolved' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : alert.severity === 'Critical' ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-[14px] leading-tight">{alert.title}</h4>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold leading-none ${
                      alert.status === 'Resolved'
                        ? 'bg-slate-100 text-slate-400'
                        : alert.severity === 'Critical'
                          ? 'bg-red-50 text-red-500'
                          : alert.severity === 'High'
                            ? 'bg-orange-50 text-orange-600'
                            : 'bg-amber-50 text-amber-700'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-normal font-sans">
                    {alert.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1 font-sans">
                    <span>
                      <strong>{t.sourceMachine}:</strong> {alert.machineName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action: Resolve (Only visible if item is Active) */}
              {alert.status === 'Active' && (
                <button
                  id={`resolve-alert-btn-${alert.id}`}
                  onClick={() => resolveAlert(alert.id)}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 text-xs rounded-xl self-start sm:self-auto shrink-0 transition-colors cursor-pointer"
                >
                  {t.resolve}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
