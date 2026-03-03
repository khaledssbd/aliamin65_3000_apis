# Address Module

Base path: `/api/v1/addresses`

## Overview

Manage a single address stored on the authenticated `User` (`User.address` string).

## REST Endpoints

- GET `/` – Get current user's address.
- POST `/` – Set address. Body: `{ address }`
- PATCH `/:id` – Set address. Body: `{ address }` (the `:id` param is ignored in this single-address flow)
- DELETE `/:id` – Clear address (the `:id` param is ignored)
- PATCH `/:id/default` – No-op for single-address flow (kept for backward compatibility)

## Notes

- Location is tracked separately via `User.currentLocation`.

## Data Model

- [address.interface.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Address/address.interface.ts)
