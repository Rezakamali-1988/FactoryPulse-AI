/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MachineType = 'Pump' | 'Motor' | 'Compressor' | 'Conveyor' | 'CNC Machine' | 'Generator';
export type MachineStatus = 'Healthy' | 'Warning' | 'Critical' | 'Offline';
export type CriticalityLevel = 'Low' | 'Medium' | 'High';
export type UserRole = 'Admin' | 'Technician';
export type Language = 'en' | 'fa';
export type AlertSeverity = 'Info' | 'Warning' | 'High' | 'Critical';
export type AlertStatus = 'Active' | 'Acknowledged' | 'Resolved';
export type WorkOrderPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type WorkOrderStatus = 'Open' | 'In Progress' | 'Done' | 'Cancelled';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
}

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  location: string;
  serialNumber: string;
  status: MachineStatus;
  criticalityLevel: CriticalityLevel;
  installationDate: string;
  lastMaintenanceDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SensorReading {
  id?: string;
  machineId: string;
  temperature: number;      // °C
  vibration: number;        // mm/s
  pressure: number;         // bar
  rotationalSpeed: number;   // RPM
  torque: number;           // Nm
  toolWear: number;         // % (0 to 100)
  humidity: number;         // % (0 to 100)
  powerConsumption: number; // kW
  timestamp: string;
}

export interface Prediction {
  id?: string;
  machineId: string;
  healthScore: number;        // 0 to 100
  failureProbability: number; // 0 to 100
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendedAction: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  machineId: string;
  machineName: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  machineId: string;
  machineName: string;
  assignedTo: string; // technician name/email
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  dueDate: string;
  completedAt?: string;
  createdAt: string;
}
