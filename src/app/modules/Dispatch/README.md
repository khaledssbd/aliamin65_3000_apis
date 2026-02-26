# Dispatch Module

Base path: `/api/v1/dispatch`

## Overview

Batched routes within fixed zones. Admin creates manual batches in MVP and assigns to drivers. Tracks status per batch.

## REST Endpoints

- POST `/` – [Admin] Create batch. Body: `{ driverId, orders[], zoneId?, timeWindowStart?, timeWindowEnd? }`
- PATCH `/:id/assign` – [Admin] Reassign to another driver: `{ driverId }`
- PATCH `/:id/sequence` – [Admin] Update stop sequence: `{ sequence: orderIds[] }`
- PATCH `/:id/status` – Update batch status: `ASSIGNED|IN_PROGRESS|COMPLETED|CANCELED`
- GET `/driver/me` – Driver's active & upcoming batches.
- GET `/:id` – Batch details with orders.
- GET `/jobs/available` – Derived from unassigned orders in zone/time window (feed for driver “Available Jobs”).

## Socket Events

- Server → Driver
  - `route:assigned` `{ dispatchId, orders, sequence }`
  - `route:updated` `{ dispatchId }`
- Driver → Server
  - `route:started` `{ dispatchId }`
  - `route:completed` `{ dispatchId }`

## Data Model

- [dispatch.interface.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Dispatch/dispatch.interface.ts)
- [dispatch.model.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Dispatch/dispatch.model.ts)
