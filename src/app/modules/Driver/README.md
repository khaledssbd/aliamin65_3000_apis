# Driver Module

Base path: `/api/v1/drivers`

## Overview

Onboarding, verification, profile, availability, job intake, route workflow, capacity and reputation.

## REST Endpoints

- POST `/onboarding` – Create or update driver profile for current user (partial updates supported).
- POST `/insurance` – Update insurance: `{ provider?, policyNumber?, expiration?, documentImageUrl? }`.
- POST `/vehicle` – Update vehicle: `{ make?, model?, year?, plate? }`.
- GET `/me` – Get my driver profile.
- PATCH `/availability` – Toggle availability. Body: `{ isAvailable: boolean }`.
- GET `/jobs/available` – List available jobs.
- POST `/jobs/:orderId/accept` – Accept a job (first-come lock).

## Driver Account Creation (Single API)

Driver role user creation + required onboarding images are handled by User module:

- POST `/api/v1/user/driver/signup` (multipart/form-data)
  - Fields:
    - `license` (file)
    - `selfie` (file)
    - `insuranceDocument` (file)
  - Body:
    - `name`, `phone`, `email`, `password`
    - `insuranceProvider?`, `insurancePolicyNumber?`, `insuranceExpiration?`
    - `vehicleMake?`, `vehicleModel?`, `vehicleYear?`, `vehiclePlate?`
  - Saves uploaded image URLs into `Driver` collection.

## Socket Events

- `driver:job:new` `{ orderId }` – New job offer in zone.
- `driver:availability:updated` `{ isAvailable }`.
- `driver:eta:update` `{ orderId, eta }` – Optional ETA pings.
- `order:hidden` `{ orderId }` – Hide order from other drivers when a driver accepts.

## Data Model

- [driver.interface.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Driver/driver.interface.ts)
- [driver.model.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Driver/driver.model.ts)
