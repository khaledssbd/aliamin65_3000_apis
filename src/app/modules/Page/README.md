# Page Module

Base path: `/api/v1/pages`

## Overview
Static content pages: About Us, Privacy Policy, Terms & Conditions. Configurable via CMS-like endpoints.

## REST Endpoints
- GET `/slug/:slug` – Fetch a published page by slug.
- GET `/` – List pages (admin view can include unpublished).
- POST `/` – [Admin] Create page `{ title, slug, content, published? }`.
- PATCH `/:id` – [Admin] Update page.
- PATCH `/:id/toggle` – [Admin] Toggle publish.

## Data Model
- [page.interface.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Page/page.interface.ts)
- [page.model.ts](file:///d:/ST-Tasks/aliamin65/aliamin65_apis/src/app/modules/Page/page.model.ts)

