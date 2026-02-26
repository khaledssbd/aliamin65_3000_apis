# Card Module

Base path: `/api/v1/cards`

## Overview
Saved payment methods for a customer using Stripe.

## REST Endpoints
- GET `/` – List customer cards.
- POST `/attach` – Attach a payment method. Body: `{ paymentMethodId }`.
- PATCH `/:id/default` – Set default card.
- DELETE `/:id` – Detach card.

## Data Model
- [card.interface.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Card/card.interface.ts)
- [card.model.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Card/card.model.ts)

