# Auth Module

Base path: `/api/v1/auth`

## Overview
Authentication and account management (email/password, OTP verification, password reset, tokens).

## Roles & Access
- Customer, Driver, Admin. Public endpoints noted below.

## REST Endpoints

- POST `/signup`
  - Body: `{ name, phone, email, password }`
  - Result: `201 { userId, email }`
- POST `/login`
  - Body: `{ email, password }`
  - Result: `200 { accessToken, refreshToken, user }`
- POST `/otp/send`
  - Body: `{ email }`
  - Result: `200`
- POST `/otp/verify`
  - Body: `{ email, otp }`
  - Result: `200 { verified: true }`
- POST `/forgot-password`
  - Body: `{ email }`
  - Result: `200`
- POST `/reset-password`
  - Body: `{ email, otp, newPassword }`
  - Result: `200`
- POST `/refresh`
  - Body: `{ refreshToken }`
  - Result: `200 { accessToken, refreshToken }`
- POST `/logout`
  - Auth: Bearer
  - Body: `-`
  - Result: `200`

## Socket Events
- `auth:session:revoked` → Client should logout.

## Data Model
- [auth.interface.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Auth/auth.interface.ts)
- [auth.model.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Auth/auth.model.ts)

## Notes
- JWT access tokens, rotating refresh tokens stored in `AuthToken`.

