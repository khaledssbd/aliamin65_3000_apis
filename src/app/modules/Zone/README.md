# Zone Module

Base path: `/api/v1/zones`

## Overview
Service areas. Each zone can hold polygon geometry for dispatch grouping.

## REST Endpoints
- GET `/` – List zones.
- POST `/` – [Admin] Create: `{ name, polygon?, active? }`.
- PATCH `/:id` – [Admin] Update a zone.
- PATCH `/:id/toggle` – [Admin] Activate/Deactivate.

## Data Model
- [zone.interface.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Zone/zone.interface.ts)
- [zone.model.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Zone/zone.model.ts)

