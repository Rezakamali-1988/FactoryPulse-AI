/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAppState } from '../context/StateContext';
import { i18nData } from '../i18n';
import { SensorReading, Machine } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Cpu, 
  Flame, 
  Wind, 
  Activity, 
  Thermometer, 
  Gauge, 
  Shuffle, 
  ArrowUpRight, 
  AlertOctagon,
  TrendingDown
} from 'lucide-react';

export function SensorsView() {
  const { 
    language, 
    machines, 
    sensorReadings, 
    addSensorReading, 
    predictions 
  } = useAppState();

  const t = i18nData[language];

  // Active machine selections
  const [selectedMachineId, setSelectedMachineId] = useState<string>(machines[0]?.id || "mach-01");

  // Simulation parameters (State)
  const [simTemp, setSimTemp] = useState<number>(45);
  const [simVib, setSimVib] = useState<number>(1.2);
  const [simPress, setSimPress] = useState<number>(3.0);
  const [simSpeed, setSimSpeed] = useState<number>(1500);
  const [simTorque, setSimTorque] = useState<number>(85);
  const [simToolWear, setSimToolWear] = useState<number>(15);
  const [simHumidity, setSimHumidity] = useState<number>(50);
  const [simPower, setSimPower] = useState<number>(8.5);

  const [notification, setNotification] = useState<string | null>(null);

  // Load latest reading state to sliders on selection change
  const currentMachine = useMemo(() => {
    return machines.find(m => m.id === selectedMachineId);
  }, [machines, selectedMachineId]);

  const latestReading = useMemo(() => {
    return sensorReadings.find(r => r.machineId === selectedMachineId);
  }, [sensorReadings, selectedMachineId]);

  // Handle Preset templates
  const applyPreset = (preset: 'normal' | 'overheat' | 'alignment' | 'cutter_fracture') => {
    if (preset === 'normal') {
      setSimTemp(42);
      setSimVib(1.1);
      setSimPress(2.8);
      setSimSpeed(1450);
      setSimTorque(90);
      setSimToolWear(15);
      setSimHumidity(55);
      setSimPower(12.0);
    } else if (preset === 'overheat') {
      setSimTemp(88); // Exceeds thermal threshold 75°C
      setSimVib(2.1);
      setSimPress(3.4);
      setSimSpeed(1650);
      setSimTorque(110);
      setSimHumidity(32);
      setSimPower(24.5);
    } else if (preset === 'alignment') {
      setSimTemp(52);
      setSimVib(5.4); // Exceeds vibration limit 3.0 mm/s
      setSimPress(3.0);
      setSimSpeed(1550);
      setSimTorque(145);
      setSimHumidity(48);
      setSimPower(32.0);
    } else if (preset === 'cutter_fracture') {
      setSimTemp(68);
      setSimVib(4.2);
      setSimPress(4.8);
      setSimSpeed(1800);
      setSimTorque(195); // High torque combined with...
      setSimToolWear(89); // Extreme tool wear 75%
      setSimHumidity(45);
      setSimPower(48.5); // Overload draw
    }
  };

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSensorReading({
      machineId: selectedMachineId,
      temperature: parseFloat(simTemp.toFixed(1)),
      vibration: parseFloat(simVib.toFixed(2)),
      pressure: parseFloat(simPress.toFixed(1)),
      rotationalSpeed: Math.round(simSpeed),
      torque: Math.round(simTorque),
      toolWear: parseFloat(simToolWear.toFixed(1)),
      humidity: parseFloat(simHumidity.toFixed(1)),
      powerConsumption: parseFloat(simPower.toFixed(1))
    });

    setNotification(t.simSuccess);
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Get historical data for chart preview
  const chartData = useMemo(() => {
    return sensorReadings
      .filter(r => r.machineId === selectedMachineId)
      .slice(0, 15) // take 15 points
      .reverse()
      .map(r => {
        const d = new Date(r.timestamp);
        return {
          time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temperature: r.temperature,
          vibration: r.vibration,
          pressure: r.pressure,
          power: r.powerConsumption
        };
      });
  }, [sensorReadings, selectedMachineId]);

  return (
    <div className="space-y-6 font-sans">
      {/* Upper Information Banner */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t.sensors}
        </h2>
        <p className="text-slate-500 text-sm">
          {language === 'fa' 
            ? "نظارت لحظه‌ای بر سیگنال‌های سنسور موتور، پمپ و شبیه‌ساز وقوع خرابی کالبدی"
            : "Review real-time machine telemetry streams or mock component failure signals locally"}
        </p>
      </div>

      {notification && (
        <div id="sim-alert-banner" className="bg-emerald-500 text-slate-950 p-4 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg animate-bounce">
          <AlertOctagon className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: TELEMETRY STREAM PRESSETS AND CUSTOM SLIDERS */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm lg:col-span-1">
          <div className="border-b pb-4 mb-4 flex items-center gap-2">
            <Cpu className="text-blue-600 w-5 h-5 shrink-0" />
            <h3 className="font-bold text-slate-900 text-sm">{t.simulationPanel}</h3>
          </div>

          <form onSubmit={handleSimulateSubmit} className="space-y-5 text-slate-700">
            {/* Asset Select */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block tracking-wide uppercase">{t.machine}</label>
              <select
                id="sim-machine-selector"
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className="w-full text-xs border rounded-xl px-3 py-2 bg-slate-50 outline-none text-slate-750"
              >
                {machines.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Quick Test Presets */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 block tracking-wide uppercase">{language === 'fa' ? 'امضاهای پیش‌فرض خرابی' : 'Trigger Fail Presets'}</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="preset-normal-btn"
                  type="button"
                  onClick={() => applyPreset('normal')}
                  className="px-2 py-1.5 rounded-lg border hover:bg-slate-50 bg-white text-[10px] font-bold text-slate-600 transition"
                >
                  🟢 Normal Mode
                </button>
                <button
                  id="preset-overheat-btn"
                  type="button"
                  onClick={() => applyPreset('overheat')}
                  className="px-2 py-1.5 rounded-lg border hover:bg-orange-50 bg-white text-[10px] font-bold text-orange-600 transition"
                >
                  🔥 Overheat Spindle
                </button>
                <button
                  id="preset-align-btn"
                  type="button"
                  onClick={() => applyPreset('alignment')}
                  className="px-2 py-1.5 rounded-lg border hover:bg-purple-50 bg-white text-[10px] font-bold text-purple-600 transition"
                >
                  🌀 Severe Vibration
                </button>
                <button
                  id="preset-cutter-btn"
                  type="button"
                  onClick={() => applyPreset('cutter_fracture')}
                  className="px-2 py-1.5 rounded-lg border hover:bg-red-50 bg-white text-[10px] font-bold text-red-500 transition"
                >
                  ⚡ Tool Wear & Load
                </button>
              </div>
            </div>

            {/* Configurable Parameter Sliders */}
            <div className="space-y-3 pt-3 border-t text-xs">
              {/* Temperature */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Temperature</span>
                  <span className="font-bold text-orange-500">{simTemp.toFixed(1)}°C</span>
                </div>
                <input
                  id="slider-temp"
                  type="range" min="15" max="110" step="0.5"
                  value={simTemp}
                  onChange={(e) => setSimTemp(parseFloat(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>

              {/* Vibration */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Vibration</span>
                  <span className="font-bold text-purple-600">{simVib.toFixed(2)} mm/s</span>
                </div>
                <input
                  id="slider-vib"
                  type="range" min="0" max="8" step="0.05"
                  value={simVib}
                  onChange={(e) => setSimVib(parseFloat(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              {/* Pressure */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Pressure</span>
                  <span className="font-bold text-indigo-500">{simPress.toFixed(1)} bar</span>
                </div>
                <input
                  id="slider-press"
                  type="range" min="0" max="10" step="0.1"
                  value={simPress}
                  onChange={(e) => setSimPress(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              {/* Tool Wear */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Tool Wear Index</span>
                  <span className="font-bold text-red-500">{simToolWear.toFixed(0)}%</span>
                </div>
                <input
                  id="slider-wear"
                  type="range" min="0" max="100" step="1"
                  value={simToolWear}
                  onChange={(e) => setSimToolWear(parseFloat(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>

              {/* Power Consumption */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Power Consumption</span>
                  <span className="font-bold text-emerald-500">{simPower.toFixed(1)} kW</span>
                </div>
                <input
                  id="slider-power"
                  type="range" min="0" max="60" step="0.5"
                  value={simPower}
                  onChange={(e) => setSimPower(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            <button
              id="simulate-reading-btn"
              type="submit"
              className="w-full bg-slate-900 border hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Shuffle className="w-4 h-4 text-blue-400" />
              <span>{t.simulateReading}</span>
            </button>
          </form>
        </div>

        {/* MID & RIGHT COLUMN: REAL-TIME TREND CHARTS & STAT SNAPSHOTS */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="border-b pb-4 mb-4">
            <h3 className="font-bold text-slate-900 text-sm">
              {currentMachine ? currentMachine.name : 'Unknown'} - {language === 'fa' ? 'کانال‌های سیگنال دوقلو' : 'Dual-Channel Live Waveforms'}
            </h3>
            <span className="text-[10px] text-slate-400 block font-mono">15 Historical telemetry snapshots logged</span>
          </div>

          <div className="space-y-6">
            {/* Chart 1: Temperature & Vibration */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 font-mono tracking-wider block uppercase uppercase">VIBRATION SIGNAL (mm/s) & TEMPERATURE (°C)</span>
              <div className="h-40 bg-slate-50/50 p-3 rounded-xl border border-dashed">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip />
                    <Line type="monotone" dataKey="vibration" name="vibration (mm/s)" stroke="#a855f7" strokeWidth={2.5} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="temperature" name="temp (°C)" stroke="#f97316" strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Pressure & Power */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 font-mono tracking-wider block uppercase uppercase">PRESSURE SIGNAL (bar) & ELECTRICAL POWER LOAD (kW)</span>
              <div className="h-40 bg-slate-50/50 p-3 rounded-xl border border-dashed">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip />
                    <Line type="monotone" dataKey="pressure" name="pressure (bar)" stroke="#06b6d4" strokeWidth={2} />
                    <Line type="monotone" dataKey="power" name="power (kW)" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
