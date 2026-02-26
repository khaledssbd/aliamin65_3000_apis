# Dispute Module

Base path: `/api/v1/disputes`

## Overview
Issue tracking for pickup/delivery proof, billing disputes and notes.

## REST Endpoints
- POST `/` – Open dispute. Body: `{ orderId, type?, description, attachments? }`.
- GET `/order/:orderId` – Disputes for an order.
- PATCH `/:id/status` – [Admin] Update status: `OPEN|IN_REVIEW|RESOLVED|REJECTED`.
- PATCH `/:id/notes` – [Admin] Set admin notes.

## Data Model
- [dispute.interface.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Dispute/dispute.interface.ts)
- [dispute.model.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Dispute/dispute.model.ts)

