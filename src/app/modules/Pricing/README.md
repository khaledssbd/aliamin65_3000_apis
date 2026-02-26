# Pricing Module

Base path: `/api/v1/pricing`

## Overview
NYC launch model: flat per-bag price. Admin can update active price.

## REST Endpoints
- GET `/active` – Get current active price.
- POST `/` – [Admin] Create new price config.
- PATCH `/:id/activate` – [Admin] Activate price and deactivate others.

## Data Model
- [pricing.interface.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Pricing/pricing.interface.ts)
- [pricing.model.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Pricing/pricing.model.ts)

