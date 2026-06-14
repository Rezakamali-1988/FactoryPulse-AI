/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppState } from '../context/StateContext';
import { i18nData } from '../i18n';
import { 
  Gauge, 
  Layers, 
  Cpu, 
  Bell, 
  Wrench, 
  BarChart2, 
  Settings, 
  ShieldCheck, 
  Flame, 
  HardHat, 
  Globe, 
  LogOut,
  Palette,
  Atom
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { 
    language, 
    setLanguage, 
    userRole, 
    setUserRole, 
    currentUser, 
    logout,
    alerts 
  } = useAppState();

  const t = i18nData[language];

  // Map active alerts count
  const activeAlertsCount = alerts.filter(a => a.status === 'Active').length;

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: Gauge },
    { id: 'assets', label: t.assets, icon: Layers },
    { id: 'sensors', label: t.sensors, icon: Cpu },
    { id: 'alerts', label: t.alerts, icon: Bell, badge: activeAlertsCount },
    { id: 'workorders', label: t.workOrders, icon: Wrench },
    { id: 'reports', label: t.reportsTitle, icon: BarChart2 },
    { id: 'analyzer', label: t.visualAnalyzer, icon: Flame },
    { id: 'generator', label: t.assetGenerator, icon: Atom },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0 select-none h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center font-bold">
          <Flame className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-sans font-bold text-lg tracking-tight text-white leading-none">
            {t.appName}
          </h1>
          <span className="font-mono text-[9px] text-blue-400 uppercase tracking-widest leading-none block mt-1">
            V2.5 Telemetry Engine
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const IconComp = item.icon;
          const isSelected = activeTab === item.id;
          return (
            <button
              id={`nav-tab-${item.id}`}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-sans transition-all duration-150 ${
                isSelected
                  ? 'bg-blue-600/10 text-blue-400 font-medium'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComp className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              
              {/* Conditional Badges */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono leading-none font-bold ${
                  isSelected ? 'bg-blue-600/20 text-blue-400' : 'bg-red-500 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Control Switchers: Language & Demo Role selectors */}
      <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/40 space-y-3">
        {/* Language Selection Quick Switch */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.language}:</span>
          </div>
          <div className="flex bg-slate-800 p-0.5 rounded-md">
            <button 
              id="lang-en-btn"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-tight transition-all leading-none ${
                language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button 
              id="lang-fa-btn"
              onClick={() => setLanguage('fa')}
              className={`px-2 py-1 rounded text-[10px] uppercase font-bold transition-all leading-none ${
                language === 'fa' ? 'bg-blue-600 text-white' : 'text-slate-400'
              }`}
            >
              فارسی
            </button>
          </div>
        </div>

        {/* Dynamic Demo Role Switch (Admin vs Tech) */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="text-[10px] text-slate-500 font-sans">{t.activeRole}:</span>
          <button
            id="role-toggle-btn"
            onClick={() => setUserRole(userRole === 'Admin' ? 'Technician' : 'Admin')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-950 transition-all ${
              userRole === 'Admin' ? 'bg-blue-400 hover:bg-blue-300' : 'bg-green-400 hover:bg-green-300'
            }`}
          >
            {userRole === 'Admin' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ADM</span>
              </>
            ) : (
              <>
                <HardHat className="w-3.5 h-3.5" />
                <span>TECH</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* User Card Drawer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0 font-sans">
        {currentUser ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <img 
              referrerPolicy="no-referrer"
              src={currentUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.displayName || 'FP'}`} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 shrink-0"
            />
            <div className="overflow-hidden leading-tight">
              <h4 className="text-sm font-semibold text-white truncate pr-1">
                {currentUser.displayName || "Operator"}
              </h4>
              <span className="text-[11px] text-slate-500 font-mono tracking-tight block truncate pr-1 mt-0.5">
                {currentUser.email || "local@factorypulse.com"}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-slate-500 text-xs">Awaiting Sign-in</div>
        )}

        <button 
          id="logout-btn"
          onClick={logout}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
          title={t.logout}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
