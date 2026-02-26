# Address Module

Base path: `/api/v1/addresses`

## Overview
Manage multiple pickup/delivery addresses for customers. Supports default address and geo-coordinates.

## REST Endpoints
- GET `/` – List current user's addresses.
- POST `/` – Create address. Body: `{ label?, line1, line2?, city, state?, postalCode?, country?, location?, isDefault? }`
- PATCH `/:id` – Update address.
- DELETE `/:id` – Delete address.
- PATCH `/:id/default` – Make default.

## Notes
- `location` uses GeoJSON Point `[lng, lat]` for nearby driver queries.

## Data Model
- [address.interface.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Address/address.interface.ts)
- [address.model.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Address/address.model.ts)

