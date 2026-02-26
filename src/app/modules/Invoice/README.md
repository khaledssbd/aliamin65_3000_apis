# Invoice Module

Base path: `/api/v1/invoices`

## Overview
Invoice generation and retrieval after successful payment.

## REST Endpoints
- GET `/order/:orderId` – Get invoice by order.
- GET `/:invoiceNumber` – Get invoice by number.
- POST `/generate/:orderId` – [Admin] Generate or regenerate invoice.

## Data Model
- [invoice.interface.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Invoice/invoice.interface.ts)
- [invoice.model.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Invoice/invoice.model.ts)

