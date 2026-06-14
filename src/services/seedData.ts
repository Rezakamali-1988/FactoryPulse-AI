/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Machine, SensorReading, Alert, WorkOrder, Prediction } from '../types';
import { calculateMachineHealth } from './predictiveEngine';

export function generateSeedData(): {
  machines: Machine[];
  sensorReadings: SensorReading[];
  predictions: Prediction[];
  alerts: Alert[];
  workOrders: WorkOrder[];
} {
  const now = new Date();

  // 10 Machines
  const machines: Machine[] = [
    {
      id: "mach-01",
      name: "Raw Water Supply Pump 01",
      type: "Pump",
      location: "Intake Pump Room - A",
      serialNumber: "SN-PMP-77491",
      status: "Warning",
      criticalityLevel: "High",
      installationDate: "2024-03-12",
      lastMaintenanceDate: "2026-05-01",
      createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: "mach-02",
      name: "Compressor Spindle Motor A",
      type: "Motor",
      location: "Assembly Line B - West",
      serialNumber: "SN-MTR-88301",
      status: "Healthy",
      criticalityLevel: "High",
      installationDate: "2023-11-05",
      lastMaintenanceDate: "2026-06-10",
      createdAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: "mach-03",
      name: "Main Delivery Air Compressor 3",
      type: "Compressor",
      location: "Utility Annex Building",
      serialNumber: "SN-CMP-33290",
      status: "Healthy",
      criticalityLevel: "Medium",
      installationDate: "2025-01-15",
      lastMaintenanceDate: "2026-04-18",
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: "mach-04",
      name: "Primary Ore Feed Conveyor C",
      type: "Conveyor",
      location: "Milling Workshop Hall",
      serialNumber: "SN-CNV-44219",
      status: "Healthy",
      criticalityLevel: "Medium",
      installationDate: "2022-08-20",
      lastMaintenanceDate: "2026-05-30",
      createdAt: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: "mach-05",
      name: "Milling Spindle CNC Machine 07",
      type: "CNC Machine",
      location: "Fabrication Hall D",
      serialNumber: "SN-CNC-90122",
      status: "Critical",
      criticalityLevel: "High",
      installationDate: "2025-06-01",
      lastMaintenanceDate: "2026-02-14",
      createdAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: "mach-06",
      name: "Diesel Emergency Power Gen 2",
      type: "Generator",
      location: "Power Station Yard",
      serialNumber: "SN-GEN-55291",
      status: "Healthy",
      criticalityLevel: "High",
      installationDate: "2021-05-18",
      lastMaintenanceDate: "2026-03-24",
      createdAt: new Date(now.getTime() - 500 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: "mach-07",
      name: "Boiler Water Feed Pump 2",
      type: "Pump",
      location: "Boiler House Complex",
      serialNumber: "SN-PMP-11204",
      status: "Healthy",
      criticalityLevel: "Medium",
      installationDate: "2024-09-02",
      lastMaintenanceDate: "2026-04-10",
      createdAt: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: "mach-08",
      name: "Main Exhaust Ventilation Fan",
      type: "Motor",
      location: "Exhaust Plenum Annex",
      serialNumber: "SN-FAN-88741",
      status: "Offline",
      criticalityLevel: "Low",
      installationDate: "2023-04-15",
      lastMaintenanceDate: "2026-06-11",
      createdAt: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: "mach-09",
      name: "Nitrogen Purge Compressor B",
      type: "Compressor",
      location: "Chemical Plant Base",
      serialNumber: "SN-CMP-99032",
      status: "Warning",
      criticalityLevel: "Medium",
      installationDate: "2024-11-20",
      lastMaintenanceDate: "2026-01-08",
      createdAt: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: "mach-10",
      name: "Component Transfer Conveyor Delta",
      type: "Conveyor",
      location: "Finishing & Coating Area",
      serialNumber: "SN-CNV-10291",
      status: "Healthy",
      criticalityLevel: "Low",
      installationDate: "2025-02-28",
      lastMaintenanceDate: "2026-05-10",
      createdAt: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  const sensorReadings: SensorReading[] = [];
  const predictions: Prediction[] = [];
  const alerts: Alert[] = [];
  const workOrders: WorkOrder[] = [];

  let alertIdCount = 1;

  // Generate 32 historical reading entries for each machine (320 readings total)
  machines.forEach((mach, mIdx) => {
    for (let i = 31; i >= 0; i--) {
      const stepTime = new Date(now.getTime() - i * 4 * 60 * 60 * 1000); // Back in time by 4 hours steps
      const isLatest = i === 0;

      // Base readings
      let temp = 40 + (mIdx * 3) + Math.sin(i * 0.5) * 4;
      let vib = 0.8 + (mIdx * 0.1) + Math.cos(i * 0.5) * 0.3;
      let pres = 3.0 + (mIdx * 0.2) + Math.sin(i * 0.8) * 0.5;
      let toolW = 10 + (mIdx * 5) + (31 - i) * 1.5; // Tool wear builds up over history
      let speed = 1500 + Math.sin(i) * 50;
      let trq = 80 + Math.cos(i) * 10;
      let hum = 45 + Math.sin(i * 0.2) * 5;
      let power = 10 + (mIdx % 3 === 0 ? 15 : 5) + Math.sin(i * 0.3) * 2;

      // Ensure toolWear stays 0-100
      toolW = Math.min(95, Math.max(0, toolW));

      // Specific machine behavior / anomalies matching current states
      if (mach.id === "mach-01") {
        // Warning water pump (slow heating)
        if (i < 15) {
          temp += (15 - i) * 1.8; // Heading towards 82°C
          vib += (15 - i) * 0.12; // Heading towards 3.2
        }
      } else if (mach.id === "mach-05") {
        // Critical CNC Machine (Severe tool wear + extreme vibrations)
        if (i < 20) {
          toolW += (20 - i) * 2.2;
          vib += (20 - i) * 0.22; // Vibrations spiking towards 5.5
          trq += (20 - i) * 3.5;  // Torque builds up
        }
        toolW = Math.min(88, toolW);
      } else if (mach.id === "mach-08") {
        // Offline machine
        if (isLatest) {
          speed = 0;
          power = 0.1;
          vib = 0;
          temp = 22; // Ambient
          pres = 0;
          trq = 0;
        }
      } else if (mach.id === "mach-09") {
        // Warning purge compressor (Excessive pressure in last 10 steps)
        if (i < 10) {
          pres += (10 - i) * 0.35; // Pressure spikes above 6.0
        }
      }

      const reading: SensorReading = {
        machineId: mach.id,
        temperature: parseFloat(temp.toFixed(2)),
        vibration: parseFloat(vib.toFixed(2)),
        pressure: parseFloat(pres.toFixed(2)),
        rotationalSpeed: Math.round(speed),
        torque: Math.round(trq),
        toolWear: parseFloat(toolW.toFixed(1)),
        humidity: parseFloat(hum.toFixed(1)),
        powerConsumption: parseFloat(power.toFixed(1)),
        timestamp: stepTime.toISOString()
      };

      sensorReadings.push(reading);

      // Run prediction calculation
      const pred = calculateMachineHealth(reading);
      
      if (isLatest) {
        predictions.push(pred);
        // Correct machine status to match prediction risk level
        if (pred.riskLevel === 'Critical') mach.status = 'Critical';
        else if (pred.riskLevel === 'High' || pred.riskLevel === 'Medium') mach.status = 'Warning';
        else if (mach.status !== 'Offline') mach.status = 'Healthy';
      }

      // Generate alert history if risk is Medium, High or Critical at latest step
      if (isLatest && (pred.riskLevel !== 'Low')) {
        let severity: 'Info' | 'Warning' | 'High' | 'Critical' = 'Warning';
        if (pred.riskLevel === 'Critical') severity = 'Critical';
        else if (pred.riskLevel === 'High') severity = 'High';

        const alert: Alert = {
          id: `alt-${alertIdCount++}`,
          machineId: mach.id,
          machineName: mach.name,
          title: `${mach.type} Anomaly Detected`,
          message: `${pred.riskLevel} risk triggered. Recommended: ${pred.recommendedAction}`,
          severity,
          status: 'Active',
          createdAt: stepTime.toISOString()
        };
        alerts.push(alert);

        // Automatically trigger urgent Work Order for Critical alert (as requested!)
        if (severity === 'Critical') {
          const wo: WorkOrder = {
            id: `wo-auto-${mach.id}`,
            title: `Emergency Repair: ${mach.name}`,
            description: `Auto-generated by Safety Engine. Real-time diagnostic indicates critical threat. Suggested interventions: ${pred.recommendedAction}`,
            machineId: mach.id,
            machineName: mach.name,
            assignedTo: "tech1@factorypulse.com",
            priority: "Urgent",
            status: "In Progress",
            dueDate: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(),
            createdAt: stepTime.toISOString()
          };
          workOrders.push(wo);
        }
      }
    }
  });

  // Add 4 static mock work orders (some open, some done) to enrich demo
  workOrders.push(
    {
      id: "wo-01",
      title: "Inspect Water Pump Seals",
      description: "Perform physical flow leakage checks on Raw Water Supply Pump 01. Temperature and vibration telemetry indicate warning signs.",
      machineId: "mach-01",
      machineName: generateMachineNameMap(machines, "mach-01"),
      assignedTo: "tech2@factorypulse.com",
      priority: "Medium",
      status: "Open",
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "wo-02",
      title: "Routine Shaft Realignment",
      description: "Completed annual shaft laser aligning on Induction Motor A inside Hall B.",
      machineId: "mach-02",
      machineName: generateMachineNameMap(machines, "mach-02"),
      assignedTo: "tech1@factorypulse.com",
      priority: "Low",
      status: "Done",
      dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(now.getTime() - 1 * 12 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "wo-03",
      title: "Clean Radiator Cooler Fins",
      description: "Intake temperature on purge compressor is climbing. Evacuate fin dust screens manually with structural blowers.",
      machineId: "mach-09",
      machineName: generateMachineNameMap(machines, "mach-09"),
      assignedTo: "tech2@factorypulse.com",
      priority: "High",
      status: "Open",
      dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString()
    }
  );

  return {
    machines,
    sensorReadings,
    predictions,
    alerts,
    workOrders
  };
}

function generateMachineNameMap(list: Machine[], id: string): string {
  const m = list.find(x => x.id === id);
  return m ? m.name : 'Unknown';
}
