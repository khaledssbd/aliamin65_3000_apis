# Admin Module

Base path: `/api/v1/admin`

## Overview
Administrative controls for users, drivers, orders, routes, pricing, revenue, and safety.

## Key Endpoints
- Users & Drivers
  - PATCH `/drivers/:id/status` – Approve/Reject/Suspend.
  - PATCH `/drivers/:id/tier` – Set tier & capacity.
  - GET `/drivers/pending` – Pending approvals.
- Orders & Routes
  - GET `/orders` – All orders with filters.
  - PATCH `/orders/:id/assign-driver` – Manual assignment.
  - POST `/dispatch` – Create route batch.
- Pricing
  - POST `/pricing` – Create per-bag price.
  - PATCH `/pricing/:id/activate` – Activate a price.
- Payments & Revenue
  - GET `/revenue` – Platform earnings summary.
  - POST `/payout/:orderId` – Mark driver payout.
- Safety & Disputes
  - POST `/background-checks/start` – Start provider check.
  - PATCH `/disputes/:id/status` – Update dispute.
- Notifications & Logs
  - POST `/notifications` – Broadcast system alert.
  - GET `/admin-logs` – Audit trail.

## Notes
- All routes require `ADMIN` or `SUPER_ADMIN` role.

