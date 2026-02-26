# Earnings Module

Base path: `/api/v1/earnings`

## Overview

70/30 split. Tracks earnings per order and payout status.

## REST Endpoints

- GET `/driver/me` – My earnings summary and transactions.
- GET `/driver/me/:orderId` – Earning for a specific order.
- POST `/payout/:orderId` – [Admin] Mark payout as paid.
- GET `/driver/summary/today` – Today’s totals: `{ deliveries, activeHours, gross, driverAmount, platformAmount }`.
- GET `/driver/summary/weekly` – Weekly breakdown.

## Data Model

- [earning.interface.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Earning/earning.interface.ts)
- [earning.model.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Earning/earning.model.ts)
