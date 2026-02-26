# Background Check Module

Base path: `/api/v1/background-checks`

## Overview
Provider-backed checks: Criminal, MVR, Identity. Providers: Checkr, KarmaCheck, Sterling, Veriff.

## REST Endpoints
- POST `/start` – [Admin] Start check for driver: `{ driverId, provider }`.
- GET `/driver/:driverId` – Get latest status for driver.
- GET `/:id` – Get a background check detail.
- POST `/webhook/:provider` – Provider webhooks.

## Data Model
- [backgroundCheck.interface.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/BackgroundCheck/backgroundCheck.interface.ts)
- [backgroundCheck.model.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/BackgroundCheck/backgroundCheck.model.ts)

