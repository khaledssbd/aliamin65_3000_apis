# Rating Module

Base path: `/api/v1/ratings`

## Overview
Customer rates driver after delivery with optional feedback.

## REST Endpoints
- POST `/` – Create rating. Body: `{ orderId, rating, feedback? }`.
- GET `/driver/:driverId` – Public summary for driver.
- GET `/me` – Customer’s ratings.

## Data Model
- [rating.interface.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Rating/rating.interface.ts)
- [rating.model.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Rating/rating.model.ts)

