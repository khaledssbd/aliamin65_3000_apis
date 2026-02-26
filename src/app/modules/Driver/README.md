# Driver Module

Base path: `/api/v1/drivers`

## Overview

Onboarding, verification, profile, availability, job intake, route workflow, capacity and reputation.

## REST Endpoints

- POST `/onboarding` – Create or update driver profile for current user.
- POST `/upload/license` – Upload license image.
- POST `/upload/selfie` – Upload selfie.
- POST `/insurance` – Set insurance: `{ provider, policyNumber, expiration, documentImageUrl }`.
- POST `/vehicle` – Set vehicle: `{ make, model, year, plate }`.
- GET `/me` – Get my driver profile.
- PATCH `/:id/status` – [Admin] Update driver status: `PENDING|APPROVED|REJECTED|SUSPENDED`.
- PATCH `/:id/tier` – [Admin] Set reputation tier and capacity.
- PATCH `/availability` – Toggle availability. Body: `{ isAvailable: boolean }`.
- GET `/jobs/available` – List available jobs in my zone/time window.
- POST `/jobs/:orderId/accept` – Accept a job (first-come lock).
- POST `/jobs/:orderId/decline` – Decline a job.
- POST `/jobs/:orderId/cancel` – Cancel an accepted job. Body: `{ reason }`.
- POST `/jobs/:orderId/arrived` – Mark arrived at pickup location.
- POST `/jobs/:orderId/bag-count` – Confirm pickup bag count: `{ bagCount }`.
- POST `/jobs/:orderId/ready-time` – Set estimated ready time: `{ isoTime }`.
- POST `/jobs/:orderId/stage` – Advance stage: `{ stage: 'WASHING'|'DRYING'|'FOLDING'|'DELIVERY' }`.
- POST `/jobs/:orderId/start-delivery` – Begin delivery leg.
- POST `/jobs/:orderId/complete` – Complete delivery.
- GET `/routes/active` – My active route/batch and sequence.
- GET `/stats/today` – Today’s stats (deliveries, active hours).

## Socket Events

- `driver:job:new` `{ orderId }` – New job offer in zone.
- `driver:job:canceled` `{ orderId }`.
- `driver:route:assigned` `{ dispatchId, orders }`.
- `driver:availability:updated` `{ isAvailable }`.
- `driver:job:locked` `{ orderId }` – Broadcast when another driver accepted.
- `driver:eta:update` `{ orderId, eta }` – Optional ETA pings.

## Data Model

- [driver.interface.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Driver/driver.interface.ts)
- [driver.model.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Driver/driver.model.ts)
