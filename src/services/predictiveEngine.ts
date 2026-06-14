/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SensorReading, Prediction } from '../types';

export function calculateMachineHealth(reading: SensorReading): Prediction {
  const {
    machineId,
    temperature,
    vibration,
    pressure,
    rotationalSpeed,
    torque,
    toolWear,
    powerConsumption,
    timestamp
  } = reading;

  let healthScore = 100;
  let failureProbability = 5; // Base probability 5%
  let reasoning: string[] = [];

  // 1. Temperature Anomaly (Normal: < 75°C)
  if (temperature > 75) {
    const tempExcess = temperature - 75;
    const penalty = Math.min(tempExcess * 1.5, 40);
    healthScore -= penalty;
    failureProbability += tempExcess * 1.2;
    reasoning.push(`High Temperature detected (${temperature.toFixed(1)}°C)`);
  }

  // 2. Vibration Anomaly (Normal: < 3.0 mm/s)
  if (vibration > 3.0) {
    const vibExcess = vibration - 3.0;
    const penalty = Math.min(vibExcess * 8, 35);
    healthScore -= penalty;
    failureProbability += Math.min(vibExcess * 12, 60);
    reasoning.push(`Abnormal Vibration level (${vibration.toFixed(2)} mm/s)`);
  }

  // 3. Pressure Anomaly (Normal: 1.0 - 6.0 bar)
  if (pressure > 6.0) {
    const presExcess = pressure - 6.0;
    const penalty = Math.min(presExcess * 10, 30);
    healthScore -= penalty;
    failureProbability += presExcess * 5;
    reasoning.push(`Excessive Pressure (${pressure.toFixed(1)} bar)`);
  } else if (pressure < 0.5) {
    healthScore -= 15;
    failureProbability += 10;
    reasoning.push(`Low Pressure anomaly (${pressure.toFixed(1)} bar)`);
  }

  // 4. Tool Wear (Normal: < 75%)
  if (toolWear > 75) {
    const wearExcess = toolWear - 75;
    const penalty = Math.min(wearExcess * 1.5, 30);
    healthScore -= penalty;
    failureProbability += wearExcess * 2.0;
    reasoning.push(`Extreme Tool Wear (${toolWear.toFixed(1)}%)`);
  }

  // 5. Combined High Torque + High Tool Wear
  if (torque > 150 && toolWear > 70) {
    healthScore -= 20;
    failureProbability += 25;
    reasoning.push(`Combined critical load (Torque: ${torque.toFixed(0)} Nm + Tool Wear: ${toolWear.toFixed(0)}%)`);
  }

  // 6. Abnormal Power Consumption
  if (powerConsumption > 45) {
    healthScore -= 15;
    failureProbability += 15;
    reasoning.push(`Power overload detected (${powerConsumption.toFixed(1)} kW)`);
  } else if (powerConsumption < 1 && rotationalSpeed > 200) {
    healthScore -= 10;
    reasoning.push(`Idling power draw anomaly (${powerConsumption.toFixed(2)} kW)`);
  }

  // Clamp values
  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));
  failureProbability = Math.max(0, Math.min(100, Math.round(failureProbability)));

  // Determine Risk Level
  let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  if (failureProbability >= 75 || healthScore <= 40) {
    riskLevel = 'Critical';
  } else if (failureProbability >= 45 || healthScore <= 65) {
    riskLevel = 'High';
  } else if (failureProbability >= 20 || healthScore <= 80) {
    riskLevel = 'Medium';
  }

  // Determine recommended action
  let recommendedAction = 'Continue regular 250-hour inspections and normal operations.';
  if (riskLevel === 'Critical') {
    if (vibration > 4.5) {
      recommendedAction = 'STOP MACHINE IMMEDIATELY. Inspect rotor alignment and replace worn bearing assemblies.';
    } else if (temperature > 90) {
      recommendedAction = 'DANGER: Thermal threshold exceeded. Stop machine, purge cooling loop, and re-torque spindle head.';
    } else if (toolWear > 85 && torque > 140) {
      recommendedAction = 'CRITICAL: Structural fracture risk. Shut down machine and initiate immediate tool/bit replacement.';
    } else {
      recommendedAction = 'CRITICAL: Multi-system failure path. Dispatch technicians for emergency physical inspection.';
    }
  } else if (riskLevel === 'High') {
    if (vibration > 3.0) {
      recommendedAction = 'Schedule vibration dampening checks and tighten structural anchor foundations.';
    } else if (temperature > 78) {
      recommendedAction = 'Overheating warning. Clean radiant fins and verify coolant pressure within 4 hours.';
    } else if (pressure > 5.5) {
      recommendedAction = 'Inspect pressure relief seals and clean intake safety valves on secondary lines.';
    } else {
      recommendedAction = 'High failure probability pattern. Queue preventive service within the next 24-hour cycle.';
    }
  } else if (riskLevel === 'Medium') {
    if (toolWear > 65) {
      recommendedAction = 'Predictive wear advisory. Ensure replacement parts are provisioned in storehouse inventory.';
    } else {
      recommendedAction = 'Advisory alerts active. Monitor thermal trend on secondary sensors during next production shift.';
    }
  }

  return {
    machineId,
    healthScore,
    failureProbability,
    riskLevel,
    recommendedAction,
    updatedAt: timestamp
  };
}
