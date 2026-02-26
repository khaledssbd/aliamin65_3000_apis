# Chat Module

Base path: `/api/v1/chat`

## Overview
Customer ↔ Driver chat per order with realtime sockets and read receipts.

## REST Endpoints
- GET `/order/:orderId` – Fetch message history.
- GET `/threads` – List active chat threads.

## Socket Namespace
`/chat`

## Socket Events
- Client → Server
  - `chat:join` `{ orderId }` – Join room.
  - `chat:message` `{ orderId, contentType, content }`
  - `chat:typing` `{ orderId, isTyping }`
  - `chat:read` `{ messageIds[] }`
- Server → Client
  - `chat:message` `{ message }`
  - `chat:delivered` `{ messageId }`
  - `chat:read` `{ messageIds[] }`

## Data Model
- [chat.interface.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Chat/chat.interface.ts)
- [chat.model.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Chat/chat.model.ts)

