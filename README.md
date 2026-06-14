# FactoryPulse AI

FactoryPulse AI is an industrial predictive maintenance platform designed to help maintenance teams monitor machine health, analyze sensor telemetry, detect anomalies, generate alerts, and manage maintenance work orders.

The project demonstrates a cloud-ready industrial SaaS workflow for factories, workshops, utilities, and production environments where equipment downtime, maintenance planning, and machine reliability are critical.

## Problem Statement

Industrial equipment failures can cause unplanned downtime, production delays, safety risks, and high maintenance costs. FactoryPulse AI provides a digital monitoring layer that helps teams identify risky machines earlier by using sensor readings, rule-based predictive logic, alerting, and maintenance task management.

## Key Features

* Industrial machine dashboard
* Asset and machine management
* Sensor telemetry monitoring
* Predictive machine health scoring
* Failure probability calculation
* Risk classification: Low, Medium, High, Critical
* Alert center for abnormal conditions
* Maintenance work order management
* Industrial reports and operational insights
* English and Persian interface support
* AI-powered visual inspection module
* AI-powered industrial asset render generator
* Local demo mode with generated industrial seed data
* Optional Firebase / Firestore integration

## Tech Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* Express.js
* Firebase
* Firestore
* Google Gemini API
* Recharts
* Lucide React

## Main Modules

### Dashboard

Shows high-level industrial KPIs including total machines, warning machines, critical machines, open work orders, average health score, recent alerts, and risk trends.

### Asset Management

Allows users to manage industrial assets such as pumps, motors, compressors, conveyors, CNC machines, and generators.

### Sensor Monitoring

Displays simulated industrial sensor data such as temperature, vibration, pressure, rotational speed, torque, tool wear, humidity, and power consumption.

### Predictive Engine

Calculates machine health score, failure probability, risk level, and recommended maintenance action based on sensor anomalies.

### Alert Center

Generates operational alerts when machines reach warning, high, or critical risk levels.

### Work Orders

Supports maintenance task creation, assignment, priority tracking, and status updates.

### Reports

Provides operational insight into machine risk distribution, maintenance workload, alert trends, and recommended actions.

### AI Visual Analyzer

Allows users to upload machinery or component images and generate AI-assisted diagnostic reports.

### AI Asset Generator

Generates industrial machine render concepts from text prompts for prototyping and visualization.

## Predictive Maintenance Logic

The current MVP uses a rule-based predictive engine. It evaluates several industrial sensor conditions:

* High temperature
* Abnormal vibration
* Pressure anomalies
* Tool wear
* High torque combined with high tool wear
* Abnormal power consumption

The engine returns:

* Health score from 0 to 100
* Failure probability from 0 to 100
* Risk level
* Recommended maintenance action

This architecture is designed so the rule-based engine can later be replaced or extended with a machine learning model.

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env.local` file for local development:

```bash
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
```

Do not commit `.env.local` to GitHub.

## Run Locally

```bash
npm run dev
```

The application runs on:

```text
http://localhost:3000
```

## Build

```bash
npm run build
```

## Start Production Server

```bash
npm run start
```

## Demo Data

The project includes generated industrial seed data:

* 10 industrial machines
* 300+ sensor readings
* Machine health predictions
* Alerts
* Maintenance work orders

## Cloud Deployment Goal

This project is designed to be deployed as a cloud-hosted industrial SaaS prototype. Cloud hosting is useful for:

* Running the full-stack web dashboard
* Hosting API endpoints
* Connecting Firebase / Firestore
* Processing industrial telemetry data
* Running AI-based visual diagnostics
* Demonstrating a production-like maintenance workflow

## Roadmap

* Add real IoT data ingestion
* Add PostgreSQL support
* Add machine learning model integration
* Add role-based access control
* Add scheduled background prediction jobs
* Add report export
* Add notification integrations
* Add Docker deployment support

## Project Status

MVP prototype ready for portfolio, cloud deployment testing, and further industrial SaaS development.
