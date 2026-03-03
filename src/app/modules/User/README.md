# User Module

Base path: `/api/v1/user`

## Overview

Account lifecycle: signup with OTP, signin, profile, password management, deactivation and admin listing.

## REST Endpoints

- POST `/signup` – Create user with email + password.
- POST `/driver/signup` – Create DRIVER user + upload onboarding images (multipart/form-data).
- POST `/send-signup-otp-again` – Resend OTP.
- POST `/verify-signup-otp` – Verify OTP.
- POST `/signin` – Login and receive tokens.
- PUT `/update-profile-photo` – Auth. Multipart: `user` file.
- PATCH `/change-password` – Auth. Body: `{ oldPassword, newPassword }`.
- POST `/forgot-password` – Start reset flow.
- POST `/send-forgot-password-otp-again` – Resend reset OTP.
- POST `/verify-forgot-password-otp` – Verify reset OTP.
- POST `/reset-password` – Set new password.
- GET `/profile` – Auth. Current profile.
- PATCH `/deactive-account` – Auth. Deactivate account.
- DELETE `/delete-account` – Auth. Hard delete account.
- GET `/access-token` – Refresh access token.
- PATCH `/update-user-data` – Auth. Update `{ name, phone }`.
- GET `/admin-get-all` – Admin only, list users.

## Notes

- Roles: CUSTOMER, DRIVER, ADMIN, SUPER_ADMIN.
- Profile photo stored via Cloud service; server expects `user` key for upload.

## Driver Signup Payload

- Multipart fields
  - `license` (file)
  - `selfie` (file)
  - `insuranceDocument` (file)
- Body
  - `name`, `phone`, `email`, `password`
  - `insuranceProvider?`, `insurancePolicyNumber?`, `insuranceExpiration?`
  - `vehicleMake?`, `vehicleModel?`, `vehicleYear?`, `vehiclePlate?`
