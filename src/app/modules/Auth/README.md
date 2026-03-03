# Auth Module

Base path: `/api/v1/auth`

## Overview

Authentication and account management (email/password, OTP verification, password reset, tokens).

## Roles & Access

- Customer, Driver, Admin. Public endpoints noted below.

## REST Endpoints

Authentication endpoints are implemented under the User module (`/api/v1/user`).

## Socket Events

- `auth:session:revoked` → Client should logout.

## Data Model

- [auth.interface.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Auth/auth.interface.ts)
- [auth.model.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Auth/auth.model.ts)

## Notes

- JWT access tokens, rotating refresh tokens stored in `AuthToken`.
