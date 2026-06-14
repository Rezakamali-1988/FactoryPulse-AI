/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAppState } from '../context/StateContext';
import { i18nData } from '../i18n';
import { Machine, MachineType, CriticalityLevel, MachineStatus } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  MapPin, 
  Calendar, 
  Activity, 
  ShieldAlert,
  Server,
  Lock,
  X,
  FileText
} from 'lucide-react';

export function AssetsView() {
  const { 
    language, 
    machines, 
    addMachine, 
    updateMachine, 
    deleteMachine, 
    userRole,
    predictions
  } = useAppState();

  const t = i18nData[language];
  const isAdmin = userRole === 'Admin';

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<MachineType>('Pump');
  const [formLocation, setFormLocation] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formCriticality, setFormCriticality] = useState<CriticalityLevel>('Medium');
  const [formStatus, setFormStatus] = useState<MachineStatus>('Healthy');
  const [formInstallDate, setFormInstallDate] = useState('');
  const [formServiceDate, setFormServiceDate] = useState('');

  // Search filter implementation
  const filteredMachines = useMemo(() => {
    return machines.filter(m => {
      const matchSearch = 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchType = selectedType === 'All' || m.type === selectedType;
      const matchStatus = selectedStatus === 'All' || m.status === selectedStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [machines, searchTerm, selectedType, selectedStatus]);

  const openAddModal = () => {
    setEditingMachine(null);
    setFormName('');
    setFormType('Pump');
    setFormLocation('');
    setFormSerial(`SN-GEN-${Math.floor(10000 + Math.random() * 90000)}`);
    setFormCriticality('Medium');
    setFormStatus('Healthy');
    setFormInstallDate(new Date().toISOString().split('T')[0]);
    setFormServiceDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (m: Machine) => {
    setEditingMachine(m);
    setFormName(m.name);
    setFormType(m.type);
    setFormLocation(m.location);
    setFormSerial(m.serialNumber);
    setFormCriticality(m.criticalityLevel);
    setFormStatus(m.status);
    setFormInstallDate(m.installationDate);
    setFormServiceDate(m.lastMaintenanceDate);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formLocation.trim() || !formSerial.trim()) return;

    const payload = {
      name: formName.trim(),
      type: formType,
      location: formLocation.trim(),
      serialNumber: formSerial.trim(),
      criticalityLevel: formCriticality,
      status: formStatus,
      installationDate: formInstallDate || new Date().toISOString().split('T')[0],
      lastMaintenanceDate: formServiceDate || new Date().toISOString().split('T')[0]
    };

    if (editingMachine) {
      updateMachine(editingMachine.id, payload);
    } else {
      addMachine(payload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      deleteMachine(id);
    }
  };

  const machineTypes: MachineType[] = ['Pump', 'Motor', 'Compressor', 'Conveyor', 'CNC Machine', 'Generator'];

  return (
    <div className="space-y-6 font-sans">
      {/* View Header with Add Machine controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t.assets}
          </h2>
          <p className="text-slate-500 text-sm">
            {language === 'fa' 
              ? "فهرست و پیکربندی اساسی تجهیزات، سطح حساسیت تولیدی و آخرین سرویس‌ها"
              : "Register, modify and track operational lifecycle properties for all industrial assets"}
          </p>
        </div>

        {isAdmin ? (
          <button
            id="add-asset-modal-btn"
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addAsset}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-slate-100 border text-slate-500 px-3 py-2 rounded-xl text-xs font-semibold shrink-0">
            <Lock className="w-3.5 h-3.5" />
            <span>{t.admin} {language === 'fa' ? 'امکان ورود دارد' : 'Only'}</span>
          </div>
        )}
      </div>

      {/* SEARCH AND FILTERS TOOLBAR */}
      <div className="bg-white p-4 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="asset-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 border rounded-xl bg-slate-50/50 text-xs focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
          />
        </div>

        {/* Dropdowns Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter by Type */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-400 font-medium whitespace-nowrap">{t.type}:</label>
            <select
              id="filter-asset-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs border rounded-lg bg-slate-50 px-2.5 py-1.5 font-medium text-slate-700 outline-none"
            >
              <option value="All">{language === 'fa' ? 'همه انواع' : 'All Types'}</option>
              {machineTypes.map(type => (
                <option key={type} value={type}>{t[type as keyof typeof t] || type}</option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-400 font-medium whitespace-nowrap">{t.status}:</label>
            <select
              id="filter-asset-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs border rounded-lg bg-slate-50 px-2.5 py-1.5 font-medium text-slate-700 outline-none"
            >
              <option value="All">{language === 'fa' ? 'همه وضعیت‌ها' : 'All Status'}</option>
              <option value="Healthy">{t.Healthy}</option>
              <option value="Warning">{t.Warning}</option>
              <option value="Critical">{t.Critical}</option>
              <option value="Offline">{t.Offline}</option>
            </select>
          </div>
        </div>
      </div>

      {/* ASSETS CARDS GRID */}
      {filteredMachines.length === 0 ? (
        <div className="bg-white border text-center p-12 rounded-2xl text-slate-400 shadow-sm flex flex-col items-center justify-center">
          <Server className="w-12 h-12 text-slate-300 mb-2" />
          <p className="font-semibold text-slate-600 mb-1">{t.noAssets}</p>
          <span className="text-xs text-slate-400">{language === 'fa' ? 'لطفاً ملاک‌های فیلتر را تغییر دهید' : 'Clear filters or search criteria.'}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMachines.map((m) => {
            const pred = predictions.find(p => p.machineId === m.id) || {
              healthScore: 100,
              failureProbability: 5,
              riskLevel: 'Low'
            };

            return (
              <div 
                key={m.id}
                className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Visual Accent based on telemetry status */}
                <div className={`absolute top-0 left-0 w-full h-1 ${
                  m.status === 'Healthy' 
                    ? 'bg-emerald-500' 
                    : m.status === 'Warning' 
                      ? 'bg-amber-500' 
                      : m.status === 'Critical' 
                        ? 'bg-red-500 animate-pulse' 
                        : 'bg-slate-300'
                }`}></div>

                {/* Card Title Header */}
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-[14px]">{m.name}</h3>
                      <span className="font-mono text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase block mt-1 tracking-wider w-max">
                        {m.serialNumber}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.status === 'Healthy' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : m.status === 'Warning' 
                          ? 'bg-amber-50 text-amber-700' 
                          : m.status === 'Critical' 
                            ? 'bg-red-50 text-red-600' 
                            : 'bg-slate-100 text-slate-400'
                    }`}>
                      {t[m.status as keyof typeof t] || m.status}
                    </span>
                  </div>

                  {/* Core Meta */}
                  <div className="pt-3 space-y-2 text-xs text-slate-600 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate"><strong>{t.location}:</strong> {m.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span><strong>{t.type}:</strong> {t[m.type as keyof typeof t] || m.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span><strong>{t.lastMaintenanceDate}:</strong> {m.lastMaintenanceDate}</span>
                    </div>
                  </div>
                </div>

                {/* Score Indicators Column */}
                <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/55 p-3 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">{t.healthScore}</span>
                    <strong className={`font-mono font-bold text-sm ${
                      pred.healthScore < 40 
                        ? 'text-red-500' 
                        : pred.healthScore < 75 
                          ? 'text-amber-500' 
                          : 'text-emerald-500'
                    }`}>
                      {pred.healthScore}%
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">{t.criticalityLevel}</span>
                    <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] leading-none ${
                      m.criticalityLevel === 'High' 
                        ? 'bg-slate-900 text-amber-400' 
                        : m.criticalityLevel === 'Medium' 
                          ? 'bg-slate-100 text-slate-700' 
                          : 'bg-slate-100 text-slate-400'
                    }`}>
                      {m.criticalityLevel}
                    </span>
                  </div>
                </div>

                {/* Card Controls Drawer (Admins Only) */}
                {isAdmin && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      id={`edit-mach-btn-${m.id}`}
                      onClick={() => openEditModal(m)}
                      className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-bold px-2 py-1 hover:bg-slate-100 rounded transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{language === 'fa' ? 'ویرایش' : 'Edit'}</span>
                    </button>
                    <button
                      id={`delete-mach-btn-${m.id}`}
                      onClick={() => handleDelete(m.id)}
                      className="flex items-center gap-1.5 text-red-500 hover:text-red-600 font-bold px-2 py-1 hover:bg-red-50 rounded transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'fa' ? 'حذف' : 'Delete'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MACHINE OVERLAY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingMachine ? t.editAsset : t.addAsset}
              </h3>
              <button 
                id="close-modal-btn"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="text-xs text-slate-400 font-bold block">{t.name}*</label>
                  <input
                    id="form-machine-name"
                    required
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Centrifugal Fan Node E"
                    className="w-full border rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                {/* Type */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold block">{t.type}</label>
                  <select
                    id="form-machine-type"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as MachineType)}
                    className="w-full border rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none text-slate-800"
                  >
                    {machineTypes.map(tOption => (
                       <option key={tOption} value={tOption}>{t[tOption as keyof typeof t] || tOption}</option>
                    ))}
                  </select>
                </div>

                {/* Serial Number */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold block">{t.serialNumber}*</label>
                  <input
                    id="form-machine-serial"
                    required
                    type="text"
                    value={formSerial}
                    onChange={(e) => setFormSerial(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none text-slate-850"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold block">{t.location}*</label>
                  <input
                    id="form-machine-location"
                    required
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Assembly Room Gate 3"
                    className="w-full border rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none text-slate-800"
                  />
                </div>

                {/* Criticality Level */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold block">{t.criticalityLevel}</label>
                  <select
                    id="form-machine-criticality"
                    value={formCriticality}
                    onChange={(e) => setFormCriticality(e.target.value as CriticalityLevel)}
                    className="w-full border rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none text-slate-800"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Installation Date */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold block">{t.installationDate}</label>
                  <input
                    id="form-machine-install-date"
                    type="date"
                    value={formInstallDate}
                    onChange={(e) => setFormInstallDate(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none text-slate-850"
                  />
                </div>

                {/* Last Maintenance Date */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-bold block">{t.lastMaintenanceDate}</label>
                  <input
                    id="form-machine-service-date"
                    type="date"
                    value={formServiceDate}
                    onChange={(e) => setFormServiceDate(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none text-slate-850"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  id="cancel-form-btn"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold border rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  id="submit-form-btn"
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
