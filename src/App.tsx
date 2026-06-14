/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StateProvider, useAppState } from './context/StateContext';
import { i18nData } from './i18n';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AssetsView } from './components/AssetsView';
import { SensorsView } from './components/SensorsView';
import { AlertCenterView } from './components/AlertCenterView';
import { WorkOrdersView } from './components/WorkOrdersView';
import { ReportsView } from './components/ReportsView';
import { VisualAnalyzerView } from './components/VisualAnalyzerView';
import { AssetGeneratorView } from './components/AssetGeneratorView';
import { SettingsView } from './components/SettingsView';
import { 
  Flame, 
  Globe, 
  ShieldCheck, 
  HardHat, 
  Fingerprint, 
  Radio, 
  Key, 
  ArrowRight,
  Database,
  UserCheck
} from 'lucide-react';
import { isFirebaseConfigured } from './lib/firebase';

function MainAppContent() {
  const { 
    language, 
    setLanguage, 
    currentUser, 
    loginWithGoogle, 
    userRole, 
    setUserRole 
  } = useAppState();

  const [activeTab, setActiveTab] = useState('dashboard');
  const t = i18nData[language];

  // 1. RENDER LOGIN SCREEN IF NOT AUTHENTICATED
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Ambient Glowing Industrial Grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-70"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Global Language Toggle floating on top-right */}
        <div className="absolute top-5 right-5 z-20 flex bg-white border border-slate-200 p-0.5 rounded-lg text-[10px] font-bold shadow-sm">
          <button 
            id="login-lang-en-btn"
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded-md tracking-tight leading-none ${language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
          >
            EN
          </button>
          <button 
            id="login-lang-fa-btn"
            onClick={() => setLanguage('fa')}
            className={`px-2 py-1 rounded-md leading-none ${language === 'fa' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
          >
            FA
          </button>
        </div>

        {/* Auth Card Container */}
        <div className="bg-white border border-slate-200 w-full max-w-[430px] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm relative z-10 text-center animate-in fade-in zoom-in duration-300">
          
          {/* Logo Brand Header */}
          <div className="space-y-2 flex flex-col items-center">
            <div className="bg-blue-600 text-white p-2.5 rounded-2xl w-max flex items-center justify-center shadow-md shadow-blue-500/10">
              <Flame className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-900 leading-none tracking-tight">
                {t.appName}
              </h1>
              <span className="font-mono text-[9px] text-blue-600 uppercase tracking-widest block font-bold">
                SCADA TELEMETRY & ANALYTICAL AI
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            {language === 'fa'
              ? "سامانه متمرکز پایش سنسورها، پیش‌بینی کالبدی خرابی، صدور کار برگ‌های تعمیراتی و عیب‌یابی تصاویر مکانیکی"
              : "Enterprise cloud telemetry suite for industrial machinery monitoring, dynamic failure predictions, work orders dispatch, and multi-spectral AI visual scanning."}
          </p>

          {/* Quick Demo Credentials / Selector Panel */}
          <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 text-left text-xs text-slate-700">
            <span className="text-[10px] text-slate-400 tracking-wider uppercase font-bold text-center block w-full border-b border-slate-100 pb-1.5">
              Select Simulated Operations Profile
            </span>
            
            <div className="grid grid-cols-2 gap-2.5">
              <button
                id="login-select-admin-btn"
                type="button"
                onClick={() => setUserRole('Admin')}
                className={`p-2.5 border rounded-xl flex items-center gap-2 text-[11px] font-bold text-slate-750 transition font-sans cursor-pointer ${
                  userRole === 'Admin' ? 'border-blue-600 bg-blue-50/50 text-blue-700' : 'border-slate-250 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 shrink-0 ${userRole === 'Admin' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>Admin Level</span>
              </button>

              <button
                id="login-select-tech-btn"
                type="button"
                onClick={() => setUserRole('Technician')}
                className={`p-2.5 border rounded-xl flex items-center gap-2 text-[11px] font-bold text-slate-750 transition font-sans cursor-pointer ${
                  userRole === 'Technician' ? 'border-blue-600 bg-blue-50/50 text-blue-700' : 'border-slate-250 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <HardHat className={`w-4 h-4 shrink-0 ${userRole === 'Technician' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>Technician</span>
              </button>
            </div>
          </div>

          {/* Login Actions */}
          <div className="space-y-3 pt-1">
            <button
              id="google-signin-btn"
              onClick={loginWithGoogle}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs transition duration-150 shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>
                {isFirebaseConfigured 
                  ? (language === 'fa' ? 'ورود با حساب گوگل گوگل' : 'Sign in with Google Account')
                  : (language === 'fa' ? 'ورود فوری به پنل عملیاتی' : 'Launch Operational Console')}
              </span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 shrink-0" />
            </button>
            
            <span className="text-[10px] text-slate-450 font-mono block">
              SECURE DATA TRANSMISSION PORT 3000 SSL
            </span>
          </div>
        </div>

        {/* Footer info line */}
        <div className="absolute bottom-5 text-slate-400 text-[10px] font-mono select-none tracking-widest text-center space-y-1">
          <p>© 2026 FACTORYPULSE AI GLOBAL SAAS</p>
          <p className="opacity-60">EDGE TELEMETRY CLOUD PLATFORM V2.5</p>
        </div>
      </div>
    );
  }

  // 2. RENDER MAIN CONSOLE WEB STRUCTURE WHEN LOGGED IN
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Dynamic Left Column Column */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Dynamic Main Workspace Container */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 relative">
        {/* Dynamic Page Router */}
        {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
        {activeTab === 'assets' && <AssetsView />}
        {activeTab === 'sensors' && <SensorsView />}
        {activeTab === 'alerts' && <AlertCenterView />}
        {activeTab === 'workorders' && <WorkOrdersView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'analyzer' && <VisualAnalyzerView />}
        {activeTab === 'generator' && <AssetGeneratorView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <StateProvider>
      <MainAppContent />
    </StateProvider>
  );
}
