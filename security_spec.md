# Security Specifications and TDD Payloads for FactoryPulse Firestore

## 1. Data Invariants
- **Authentication**: All read and write operations require a verified authenticated Google account session. No anonymous or unauthenticated operations allowed.
- **Role Isolation**:
  - `Admin`: Can perform CRUD operations on `machines`, `alerts`, `workOrders`, `predictions`, and `sensorReadings`.
  - `Technician`: Can view all collections and update the `status` and `completedAt` on `workOrders` assigned to them or unassigned. Technicians are blocked from creating/deleting assets or changing administrative fields.
- **Data Completeness**: No ghost fields are allowed. Map keys during document creation must strictly match the types and schemas specified in the blueprint.

## 2. The Dirty Dozen (12 Penetration Testing Payloads)

1. **Unauthenticated Read on Machines**: Anonymous client requests `get` on `/machines/mach-abc`. 
   * *Expected Result*: `PERMISSION_DENIED`
2. **Unauthenticated Write on Alerts**: Anonymous client tries to write an critical alert payload to `/alerts/alt-xyz`.
   * *Expected Result*: `PERMISSION_DENIED`
3. **Identity Spoofing - Impersonating Admin on Asset Creation**: A Technician role attempts to create a new machine document in `/machines/mach-new`.
   * *Expected Result*: `PERMISSION_DENIED`
4. **Identity Spoofing - Changing Assignee on Work Order**: Technician `tech2@factorypulse.com` attempts to change `assignedTo` from `tech1@factorypulse.com` of `/workOrders/wo-1` to hijack credit.
   * *Expected Result*: `PERMISSION_DENIED`
5. **State Shortcutting - Done is Terminal**: Altering or writing to a completed `/workOrders/wo-completed` whose status is already `'Done'`.
   * *Expected Result*: `PERMISSION_DENIED`
6. **Malicious Value Type Poisoning**: Inserting string `'NaN'` or `'Infinite'` into `vibration` numerical parameter in `/sensorReadings/reading-1`.
   * *Expected Result*: `PERMISSION_DENIED`
7. **Resource Poisoning (ID character limit attack)**: Creating a machine with a 1,000-character document ID consisting of repeating trailing symbols to cause Denial of Wallet.
   * *Expected Result*: `PERMISSION_DENIED`
8. **Ghost Field Injection**: Adding an unconfigured system state flag `isSuperAdmin: true` into a profile update.
   * *Expected Result*: `PERMISSION_DENIED`
9. **Timestamp Spoofing**: Client sending a manually structured static string `createdAt: "2020-01-01T00:00:00Z"` instead of using the mandatory `request.time` server timestamp token limit.
   * *Expected Result*: `PERMISSION_DENIED`
10. **Admin Bypass Attack**: Directly attempting to edit the machine status or type field by checking as an Admin but passing wrong credentials.
    * *Expected Result*: `PERMISSION_DENIED`
11. **Bypassing Relation Integrity**: Creating a sensor reading with a `machineId` referencing a non-existent machine.
    * *Expected Result*: `PERMISSION_DENIED`
12. **Blanket Query Scraping**: Attempting a query without proper scope or reading unrelated technician workload assignments.
    * *Expected Result*: `PERMISSION_DENIED`
