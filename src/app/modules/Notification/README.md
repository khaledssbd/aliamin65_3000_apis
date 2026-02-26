# Notification Module

Base path: `/api/v1/notifications`

## Overview
System/user notifications for order status, reminders, payments, and chat.

## REST Endpoints
- GET `/` – List notifications for current user.
- PATCH `/:id/read` – Mark as read.
- PATCH `/read-all` – Mark all as read.
- DELETE `/:id` – Remove a notification.

## Socket Events
- Server → Client:
  - `notification:new` `{ type, title, body, data }`
  - `job:offer` `{ orderId, pickupLatLng, distanceMi, bags, earning }`
  - `job:withdrawn` `{ orderId }`
  - `route:assigned` `{ dispatchId }`
- Client → Server:
  - `notification:read` `{ id }`

## Data Model
- [notification.interface.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Notification/notification.interface.ts)
- [notification.model.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Notification/notification.model.ts)
