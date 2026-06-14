/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAppState } from '../context/StateContext';
import { i18nData } from '../i18n';
import { WorkOrder, WorkOrderPriority, WorkOrderStatus } from '../types';
import { 
  Plus, 
  Wrench, 
  Clipboard, 
  UserPlus, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldAlert,
  Calendar,
  Lock,
  ChevronRight,
  Filter
} from 'lucide-react';

export function WorkOrdersView() {
  const { 
    language, 
    workOrders, 
    machines, 
    addWorkOrder, 
    updateWorkOrderStatus, 
    assignWorkOrder, 
    userRole,
    currentUser 
  } = useAppState();

  const t = i18nData[language];
  const isAdmin = userRole === 'Admin';

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Open' | 'In Progress' | 'Done'>('All');

  // New Work order Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formMachineId, setFormMachineId] = useState(machines[0]?.id || "mach-01");
  const [formAssignedTo, setFormAssignedTo] = useState('tech1@factorypulse.com');
  const [formPriority, setFormPriority] = useState<WorkOrderPriority>('Medium');
  const [formDueDate, setFormDueDate] = useState('');

  // Sample Tech Team list for assignments
  const techniciansList = [
    { email: 'tech1@factorypulse.com', name: 'Ahmad Mechanical Lead' },
    { email: 'tech2@factorypulse.com', name: 'Reza Vibration Analyst' },
    { email: 'systems@factorypulse.com', name: 'Alireza Controls Supervisor' }
  ];

  // Filtering implementation
  const filteredWOs = useMemo(() => {
    let list = workOrders;

    // Filter by tab status
    if (activeFilter !== 'All') {
      list = list.filter(w => w.status === activeFilter);
    }

    // Role filtration check:
    // If the active user role is 'Technician', they only see the tickets they are assigned to,
    // plus Urgent/Critical tickets to enable collaborative maintenance!
    if (!isAdmin && currentUser) {
      // Find matches on assigned email
      const userEmail = currentUser.email || 'tech1@factorypulse.com';
      list = list.filter(w => w.assignedTo === userEmail || w.priority === 'Urgent');
    }

    return list;
  }, [workOrders, activeFilter, isAdmin, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim() || !formMachineId) return;

    const mach = machines.find(m => m.id === formMachineId);
    const mName = mach ? mach.name : 'Unknown';

    addWorkOrder({
      title: formTitle,
      description: formDesc,
      machineId: formMachineId,
      machineName: mName,
      assignedTo: formAssignedTo,
      priority: formPriority,
      status: 'Open',
      dueDate: formDueDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    });

    // Reset Form
    setFormTitle('');
    setFormDesc('');
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t.workOrders}
          </h2>
          <p className="text-slate-500 text-sm">
            {language === 'fa' 
              ? "ارجاع دستور کار مکتوب، انتصاب تکنسین مسئول فیزیکی و تایید تعمیر کالبدی سنسورها"
              : "Dispatch, assign, and track maintenance task cards and emergency repairs"}
          </p>
        </div>

        {isAdmin ? (
          <button
            id="create-wo-modal-btn"
            onClick={() => {
              setFormDueDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
              setIsFormOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addWorkOrder}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0">
            <span>🛡️ Active assignments mode selected</span>
          </div>
        )}
      </div>

      {/* FILTER TABS */}
      <div className="flex border-b text-xs pb-px items-center justify-between gap-4">
        <div className="flex gap-4">
          {(['All', 'Open', 'In Progress', 'Done'] as const).map((status) => (
            <button
              id={`tab-wo-filter-${status}`}
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`pb-2.5 font-bold border-b-2 tracking-tight transition-all cursor-pointer ${
                activeFilter === status ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {status === 'All' ? (language === 'fa' ? 'همه دستورکارها' : 'All Tasks') : t[status as keyof typeof t] || status}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5 text-slate-300" />
          <span>Showing {filteredWOs.length} entries</span>
        </div>
      </div>

      {/* WORK ORDERS FEED CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredWOs.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 text-center text-slate-400 shadow-sm col-span-2 flex flex-col items-center justify-center">
            <Clipboard className="w-12 h-12 text-slate-300 mb-2" />
            <p className="font-bold text-slate-600 mb-1">{language === 'fa' ? 'دستور کاری وجود ندارد' : 'No tasks scheduled.'}</p>
            <span className="text-xs text-slate-400">{language === 'fa' ? 'کالاهای عملیاتی در وضعیت ایده‌آل هستند' : 'All assets are in excellent structural integrity.'}</span>
          </div>
        ) : (
          filteredWOs.map((wo) => (
            <div
              key={wo.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm transition-all relative overflow-hidden flex flex-col justify-between ${
                wo.status === 'Done' ? 'opacity-70 border-slate-200 bg-slate-50/40' : 'hover:shadow-md'
              }`}
            >
              {/* Border tag depending on priority */}
              <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                wo.priority === 'Urgent' 
                  ? 'bg-red-500 animate-pulse' 
                  : wo.priority === 'High' 
                    ? 'bg-orange-500' 
                    : wo.priority === 'Medium' 
                      ? 'bg-blue-400' 
                      : 'bg-slate-300'
              }`}></div>

              <div className="space-y-3.5 pl-2">
                {/* Upper row */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                      ID: {wo.id}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{wo.title}</h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold leading-none uppercase ${
                      wo.priority === 'Urgent' 
                        ? 'bg-red-50 text-red-500 border border-red-100' 
                        : wo.priority === 'High' 
                          ? 'bg-orange-50 text-orange-600' 
                          : 'bg-slate-150 text-slate-500'
                    }`}>
                      {wo.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                      wo.status === 'Done' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : wo.status === 'In Progress' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-blue-50 text-blue-600'
                    }`}>
                      {t[wo.status as keyof typeof t] || wo.status}
                    </span>
                  </div>
                </div>

                {/* Description and metadata */}
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {wo.description}
                </p>

                {/* Machine and Date info */}
                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center justify-between text-[11px] font-sans">
                    <span className="truncate">
                      <strong>Asset:</strong> {wo.machineName}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-300" />
                      Due: {new Date(wo.dueDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-[11px] font-sans">
                    <strong>Assigned Tech:</strong>{' '}
                    <span className="text-slate-700 font-medium font-mono">{wo.assignedTo}</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar depending on role */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {/* Admin Assignment options */}
                {isAdmin ? (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-400 text-[10px]">{language === 'fa' ? 'انتساب به:' : 'Reassign:'}</span>
                    <select
                      id={`reassign-select-${wo.id}`}
                      value={wo.assignedTo}
                      onChange={(e) => assignWorkOrder(wo.id, e.target.value)}
                      className="text-[10px] border rounded bg-slate-50 px-1.5 py-1 text-slate-600 outline-none"
                    >
                      {techniciansList.map(tech => (
                        <option key={tech.email} value={tech.email}>{tech.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div></div>
                )}

                {/* Transition status buttons (Technicians / Admins can update status) */}
                <div className="flex gap-1.5">
                  {wo.status === 'Open' && (
                    <button
                      id={`status-progress-btn-${wo.id}`}
                      onClick={() => updateWorkOrderStatus(wo.id, 'In Progress')}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      {t.InProgress}
                    </button>
                  )}

                  {(wo.status === 'Open' || wo.status === 'In Progress') && (
                    <button
                      id={`status-done-btn-${wo.id}`}
                      onClick={() => updateWorkOrderStatus(wo.id, 'Done')}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 text-[10px] rounded-lg cursor-pointer"
                    >
                      {t.Done}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD NEW WORK ORDER OVERLAY FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl border border-slate-200 animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                {t.addWorkOrder}
              </h3>
              <button 
                id="close-wo-modal"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-sans text-slate-700">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">{language === 'fa' ? 'عنوان کار مکتوب' : 'Work Order Title'}*</label>
                <input
                  id="form-wo-title"
                  required
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Inspect Compressor cooling manifolds"
                  className="w-full border rounded-xl px-3 py-2 bg-slate-50 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">{language === 'fa' ? 'شرح فرآیند صدمه' : 'Description of anomaly / action'}*</label>
                <textarea
                  id="form-wo-desc"
                  required
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Describe leaks, alignment steps, or safety clearances needed..."
                  className="w-full border rounded-xl px-3 py-2 bg-slate-50 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Machinery Target */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">{t.machine}</label>
                  <select
                    id="form-wo-mach"
                    value={formMachineId}
                    onChange={(e) => setFormMachineId(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 bg-slate-50 outline-none"
                  >
                    {machines.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Priority</label>
                  <select
                    id="form-wo-priority"
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as WorkOrderPriority)}
                    className="w-full border rounded-xl px-3 py-2 bg-slate-50 outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Assignment Team member */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Assign Technician</label>
                  <select
                    id="form-wo-assign"
                    value={formAssignedTo}
                    onChange={(e) => setFormAssignedTo(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 bg-slate-50 outline-none"
                  >
                    {techniciansList.map(tech => (
                      <option key={tech.email} value={tech.email}>{tech.name}</option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Due Date</label>
                  <input
                    id="form-wo-due"
                    required
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 bg-slate-50 outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  id="cancel-wo-modal"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-500 hover:bg-slate-50 transition"
                >
                  {t.cancel}
                </button>
                <button
                  id="submit-wo-btn"
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow"
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
