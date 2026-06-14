/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppState } from '../context/StateContext';
import { i18nData } from '../i18n';
import { 
  Settings, 
  Globe, 
  Moon, 
  Sun, 
  HelpCircle,
  Database,
  RotateCcw,
  ShieldAlert,
  HardHat,
  ShieldCheck,
  Power
} from 'lucide-react';
import { isFirebaseConfigured } from '../lib/firebase';

export function SettingsView() {
  const { 
    language, 
    setLanguage, 
    theme, 
    setTheme, 
    userRole, 
    setUserRole, 
    resetAllData 
  } = useAppState();

  const t = i18nData[language];

  const handleReset = () => {
    if (window.confirm(language === 'fa' ? 'آیا مایل به بازنشانی اطلاعات نمونه به حالت پیشفرض کارخانه هستید؟' : 'Are you sure you want to restore the simulation database to factory default values?')) {
      resetAllData();
      alert(language === 'fa' ? 'اطلاعات با موفقیت بازنشانی شد.' : 'Database synchronized to clean baseline seed data.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t.settings}
        </h2>
        <p className="text-slate-500 text-sm">
          {language === 'fa' 
            ? "پیکربندی هویت سیستم، جابجایی زبان اصلی و بازنشانی دیتابیس هوشمند کارخانه"
            : "Review application settings, security access controls, and simulation states"}
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* 1. Language Controls */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 text-slate-800">
            <Globe className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-sm">{language === 'fa' ? 'زبان پیش‌فرض سرویس' : 'Language Setup'}</h3>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <strong className="text-slate-800 text-xs block">Default active translation</strong>
              <span className="text-[11px] text-slate-400 block mt-0.5">Toggle between completely localized English or Persian layouts.</span>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl border">
              <button
                id="settings-lang-en"
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                English
              </button>
              <button
                id="settings-lang-fa"
                onClick={() => setLanguage('fa')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  language === 'fa' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-505'
                }`}
              >
                فارسی (FA)
              </button>
            </div>
          </div>
        </div>

        {/* 2. Authentication Role Shortucts */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 text-slate-800">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm">{language === 'fa' ? 'کنترل‌های دسترسی نقش کاربری (شبیه‌ساز)' : 'User Security Role Simulation'}</h3>
          </div>

          <div className="space-y-4 text-xs leading-relaxed">
            <p className="text-slate-500">
              {language === 'fa' 
                ? "کنسول عیب‌یابی FactoryPulse حاوی دو سطح دسترسی مهندسی است تا بتوانید به راحتی فرآیندهای کار مکتوب را تست نمایید:"
                : "This system simulates specific user authorization rules based on dual industrial factory roles:"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Option Admin */}
              <button
                id="settings-role-admin"
                type="button"
                onClick={() => setUserRole('Admin')}
                className={`p-4 border rounded-xl text-left flex items-start gap-3.5 transition cursor-pointer ${
                  userRole === 'Admin' 
                    ? 'border-blue-600 bg-blue-50/10 shadow-xs' 
                    : 'border-slate-200 hover:bg-slate-50 bg-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${userRole === 'Admin' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="overflow-hidden leading-tight">
                  <strong className="text-slate-850 font-bold block text-xs">Admin Role Selected</strong>
                  <span className="text-[10px] text-slate-400 block mt-1">Full access: CRUD machinery fleet registry, manual work order assignment, telemetry edits.</span>
                </div>
              </button>

              {/* Option Tech */}
              <button
                id="settings-role-tech"
                type="button"
                onClick={() => setUserRole('Technician')}
                className={`p-4 border rounded-xl text-left flex items-start gap-3.5 transition cursor-pointer ${
                  userRole === 'Technician' 
                    ? 'border-blue-600 bg-blue-50/10 shadow-xs' 
                    : 'border-slate-200 hover:bg-slate-50 bg-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${userRole === 'Technician' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                  <HardHat className="w-5 h-5" />
                </div>
                <div className="overflow-hidden leading-tight">
                  <strong className="text-slate-850 font-bold block text-xs">Technician Role Selected</strong>
                  <span className="text-[10px] text-slate-400 block mt-1">Operational view: Track assignments, transition work order task statuses (Open to In Progress to Done).</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Database Simulation Maintenance resetting */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 text-slate-800">
            <Database className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-sm">{language === 'fa' ? 'مدیریت و مهندسی داده‌ها' : 'Data Integrity & Factory Reset'}</h3>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <strong className="text-slate-800 block">Synchronize simulation states</strong>
              <span className="text-slate-400 text-[11px] block max-w-sm">Reload 10 default machines, 320 historical readings, generated alert histories and active dispatch queues.</span>
            </div>

            <button
              id="factory-reset-btn"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-3.5 py-2 hover:bg-red-50 text-red-650 border border-red-200 text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
            >
              <RotateCcw className="w-4 h-4 text-red-500" />
              <span>{language === 'fa' ? 'پیش‌فرض کارخانه' : 'Sync baseline seed'}</span>
            </button>
          </div>
        </div>

        {/* 4. Connectivity details */}
        <div className="bg-white border p-5 rounded-2xl flex items-center justify-between text-xs text-slate-600">
          <div>
            <span className="font-bold block text-slate-900">Database Storage Mode</span>
            <span className="text-slate-400 text-[11px] mt-0.5 block">
              {isFirebaseConfigured ? "Connected to Cloud Firestore backend" : "Offline Persistent LocalStorage Cache Mode"}
            </span>
          </div>

          <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 uppercase">
            {isFirebaseConfigured ? "Cloud Mode" : "Local Mode"}
          </div>
        </div>
      </div>
    </div>
  );
}
