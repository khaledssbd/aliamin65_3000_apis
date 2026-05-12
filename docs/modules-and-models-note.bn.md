# Module O Model Details Note

Ei note e project-er prottekta main module/model keno banano hoyeche, ki data rakhe, kon role use kore, ebong order flow-er sathe relation ki ta Banglay explain kora holo.

## Project Structure Short Idea

Project ta Express + Mongoose modular structure follow kore.

Common pattern:

- `*.route.ts`: API endpoint define kore
- `*.controller.ts`: request/response handle kore
- `*.service.ts`: business logic/database operation kore
- `*.model.ts`: MongoDB collection schema define kore
- `*.interface.ts`: TypeScript type define kore
- `*.validation.ts`: request validation define kore

Main route mount hoy `src/app/routes/index.ts` file e.

## User Module

Path: `src/app/modules/User`

User module application er core account system.

`UserModel` fields:

- `name`: user name
- `address`: current simple address string
- `currentLocation`: GeoJSON point, mainly driver live location/nearby matching er jonno
- `phone`: phone number
- `image`: profile image
- `email`: unique email
- `password`: hashed password, normal query te hidden
- `otp`, `otpExpiry`, `isVerifiedByOTP`: signup/forgot password OTP flow
- `role`: `CUSTOMER`, `DRIVER`, `ADMIN`, `SUPER_ADMIN`
- `isActive`: account active kina
- `isDeleted`: soft delete
- `deactivationReason`: account deactivate reason

Keno banano:

- customer, driver, admin shob account ek collection e manage korar jonno
- authentication token er payload bananor jonno
- driver nearby matching er jonno `currentLocation` rakhar jonno
- soft delete and active/deactive account support er jonno

Important behavior:

- password save er age bcrypt hash hoy
- find query te soft deleted user hide hoy
- aggregation e password/otp hide korar hook ache

Order flow relation:

- order er `customer` User id
- order er `driver` o User id
- customer er `address` order e copy hoy
- driver er `currentLocation` nearby job matching and tracking e use hoy

## Address Module

Path: `src/app/modules/Address`

Address module currently alada Address collection use korche na. `address.model.ts` commented out. Current service direct `UserModel.address` update kore.

Current behavior:

- get my address
- create/update address
- delete address by empty string set
- default address basically current user address return kore

Keno banano:

- customer address management er API layer provide korte
- future e multiple address support korte alada `AddressModel` use kora jete pare

Order flow relation:

- customer order create korle `customer.address` order er `address` field e copy hoy

## Pricing Module

Path: `src/app/modules/Pricing`

Pricing module laundry service er price and revenue split define kore.

`PricingModel` fields:

- `pricePerBag`: per bag charge
- `minBags`: minimum bag count
- `driverEarningPercentage`: driver koto percent pabe

Keno banano:

- order total calculate korte
- payment capture er shomoy driver/admin share calculate korte
- admin price update korte

Behavior:

- current service ekta active/latest pricing style use kore
- create/update korle old pricing delete kore ekta pricing rakhe

Order flow relation:

- order create e `pricePerBag` and `total` calculate hoy
- payment capture e driver earning percentage use hoy

## Order Module

Path: `src/app/modules/Order`

Order module customer laundry request er main business object.

`OrderModel` fields:

- `customer`: User ref, required
- `driver`: User ref, assigned driver
- `serviceType`: `WASH_DRY` ba `DRY_CLEAN`
- `pickupLocation`: GeoJSON point `[lng, lat]`
- `expectedRadiusKm`: nearby driver filter radius
- `bags`: bag count
- `pickupType`: `ASAP` ba `SCHEDULED`
- `scheduledPickupAt`: scheduled pickup date
- `specialInstructions`: customer instruction
- `address`: pickup/delivery address string
- `status`: order lifecycle status
- `pricePerBag`: order time er pricing snapshot
- `total`: order total amount
- `bagCountAtPickup`: driver pickup time e counted bag
- `bagCountAtDelivery`: delivery time e counted bag
- `timeline`: order-er different status timestamp

Keno banano:

- customer order request store korte
- driver assignment track korte
- order status lifecycle maintain korte
- pricing snapshot save korte
- timeline maintain korte

Order statuses:

- `REQUESTED`
- `DRIVER_ASSIGNED`
- `PICKED_UP`
- `WASHING_DRYING`
- `OUT_FOR_DELIVERY`
- `DELIVERED`
- `COMPLETED`
- `CANCELED`

Main APIs:

- `POST /orders`: customer order create
- `GET /orders`: customer nijer orders
- `GET /orders/:id`: customer/driver/admin order details
- `PATCH /orders/:id/assign-driver`: admin driver assign
- `PATCH /orders/:id/status`: admin status update
- `PATCH /orders/:id/bag-count/pickup`: driver pickup bag count
- `PATCH /orders/:id/bag-count/delivery`: driver delivery bag count

Order flow relation:

- eta whole laundry lifecycle er main source of truth

## Driver Module

Path: `src/app/modules/Driver`

Driver module driver profile, onboarding, availability, and job accept/decline/cancel manage kore.

`DriverModel` fields:

- `user`: User ref, unique
- `stripeConnectedAccountId`: Stripe Connect account id
- `licenseImageUrl`: license image
- `selfieImageUrl`: selfie image
- `identity`: first name, last name, DOB, id number, document type/country, address
- `isAvailable`: driver available kina
- `insurance`: insurance info
- `vehicle`: vehicle info
- `backgroundCheckStatus`: `PENDING`, `APPROVED`, `FAILED`
- `reputationTier`: driver quality tier
- `capacityLimit`: driver capacity
- `status`: `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`

Keno banano:

- User account theke driver-specific data alada rakhte
- driver approval/onboarding support korte
- order matching er shomoy available driver filter korte
- background check/vehicle/insurance info rakhte

Main APIs:

- `POST /drivers/onboarding`
- `POST /drivers/insurance`
- `POST /drivers/vehicle`
- `GET /drivers/me`
- `PATCH /drivers/availability`
- `GET /drivers/jobs/available`
- `POST /drivers/jobs/:orderId/accept`
- `POST /drivers/jobs/:orderId/decline`
- `POST /drivers/jobs/:orderId/cancel`

Order flow relation:

- driver availability true hole order create time e notification pabe
- driver job accept korle order `DRIVER_ASSIGNED` hoy
- driver cancel korle order abar `REQUESTED` hoy

## Dispatch Module

Path: `src/app/modules/Dispatch`

Dispatch module ek driver er jonno multiple order batch/route plan manage kore.

`DispatchModel` fields:

- `driver`: Driver ref
- `orders`: Order ref array
- `zone`: Zone ref
- `timeWindowStart`: dispatch window start
- `timeWindowEnd`: dispatch window end
- `sequence`: order execution sequence
- `status`: `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELED`

Keno banano:

- driver nijer accepted multiple order ek route/batch e organize korte chay
- route/sequence maintain korte
- zone wise dispatch manage korte
- driver er latest dispatch list show korte

Main APIs:

- `POST /dispatch`: driver nijer dispatch create
- `PATCH /dispatch/:id/assign`: admin driver reassign
- `PATCH /dispatch/:id/sequence`: driver/admin sequence update
- `PATCH /dispatch/:id/status`: driver/admin dispatch status update
- `GET /dispatch/driver/me`: driver nijer dispatch list
- `GET /dispatch/:id`: dispatch details

Order flow relation:

- dispatch order status automatically update kore na
- dispatch ekta route/batch planning object
- individual order lifecycle still `OrderModel.status` diye track hoy
- driver dispatch create korar shomoy shudhu nijer assigned orders use korte pare

Important:

- `Dispatch.driver` ref `Driver`
- `Order.driver` ref `User`
- backend logged-in driver user id theke `Driver` profile id ber kore dispatch create/list kore

## Zone Module

Path: `src/app/modules/Zone`

Zone module service area/operational area define kore.

`ZoneModel` fields:

- `name`: unique zone name
- `polygon`: GeoJSON polygon
- `active`: zone active kina

Keno banano:

- area wise dispatch/order planning korte
- future e pickup location kon zone e pore eta detect korte
- admin zone active/inactive korte

Order flow relation:

- Dispatch er `zone` field e Zone ref use hoy
- current order create flow e zone auto detect hocche na

## Payment Module

Path: `src/app/modules/Payment`

Payment module Stripe payment intent and payment record manage kore.

`PaymentModel` fields:

- `order`: Order ref
- `customer`: User ref
- `amount`: payment amount
- `stripePaymentIntentId`: Stripe payment intent id
- `stripeChargeId`: Stripe charge id
- `status`: Stripe-like payment status
- `capturedAt`: payment capture time

Keno banano:

- customer order payment track korte
- Stripe payment status store korte
- payment success/failure state manage korte

Payment statuses:

- `requires_payment_method`
- `requires_confirmation`
- `processing`
- `succeeded`
- `canceled`
- `requires_action`

Order flow relation:

- order total theke payment amount ney
- capture success hole payment `succeeded` hoy
- current code e order status/payment status direct linked na

## Card Module

Path: `src/app/modules/Card`

Card module customer saved payment method manage kore.

`CardModel` fields:

- `user`: User ref
- `stripeCustomerId`: Stripe customer id
- `stripePaymentMethodId`: Stripe payment method id
- `brand`: card brand
- `last4`: last four digits
- `expMonth`, `expYear`: expiry
- `isDefault`: default card kina

Keno banano:

- customer card save korte
- default card diye payment intent create korte

Order flow relation:

- payment intent create er shomoy customer er default card use hoy

## Invoice Module

Path: `src/app/modules/Invoice`

Invoice module order er billing document manage kore.

`InvoiceModel` fields:

- `order`: Order ref
- `customer`: User ref
- `invoiceNumber`: unique invoice number
- `total`: invoice total
- `lineItems`: item name, amount, quantity
- `paid`: paid kina
- `generatedAt`: invoice generate time

Keno banano:

- customer/admin ke billing summary dite
- order er official invoice generate korte

Order flow relation:

- invoice order theke pricePerBag, bags, total niye create hoy
- invoice number `INV-{orderId}`

## Earning Module

Path: `src/app/modules/Earning`

Earning module driver income and platform split track korar jonno.

`EarningModel` fields:

- `driver`: Driver ref
- `order`: Order ref
- `amountGross`: total gross amount
- `amountDriver`: driver share
- `amountPlatform`: platform/admin share
- `payoutStatus`: `PENDING`, `PAID`, `FAILED`
- `payoutAt`: payout time

Keno banano:

- driver earnings list show korte
- today earnings summary calculate korte
- payout status track korte

Order flow relation:

- ideally payment success/order complete hole earning create hobe
- current payment capture service driver/platform share calculate kore, but earning document create kore na

## Notification Module

Path: `src/app/modules/Notification`

Notification module persistent notification store kore.

`NotificationModel` fields:

- `user`: notification receiver
- `type`: `ORDER_STATUS`, `REMINDER`, `PAYMENT`, `SYSTEM`, `CHAT`
- `title`: notification title
- `body`: notification text
- `data`: extra payload
- `readAt`: read time

Keno banano:

- user er notification list maintain korte
- read/unread support korte
- notification delete korte

Order flow relation:

- order status/payment/chat er notification store kora jete pare
- current order status update e auto notification create hocche na
- socket event ache, but persistent notification alada

## Chat Module

Path: `src/app/modules/Chat`

Chat module customer-driver order based message store kore.

`ChatMessageModel` fields:

- `order`: Order ref
- `from`: sender User ref
- `to`: receiver User ref
- `contentType`: `TEXT` ba `IMAGE`
- `content`: message content
- `deliveredAt`: delivered time
- `readAt`: read time

Keno banano:

- customer and driver er moddhe order based chat korte
- message history store korte
- unread count calculate korte

Socket behavior:

- `/chat` namespace
- thread list
- conversation join/leave
- message send/list
- seen
- typing
- online users

Order flow relation:

- order assigned hole customer-driver chat possible
- receiver auto detect korte order er `customer` and `driver` field use hoy

## Rating Module

Path: `src/app/modules/Rating`

Rating module delivery/order complete er por customer feedback store kore.

`RatingModel` fields:

- `order`: Order ref
- `customer`: User ref
- `driver`: User ref
- `rating`: 1 theke 5
- `feedback`: optional feedback

Keno banano:

- customer driver/service ke rate korte
- driver reputation future e calculate korte

Order flow relation:

- order delivered/completed er por rating create kora uchit
- current model driver ke User ref hishebe dhore, Driver ref na

## Dispute Module

Path: `src/app/modules/Dispute`

Dispute module order related complaint/problem manage kore.

`DisputeModel` fields:

- `order`: Order ref
- `raisedBy`: User ref
- `type`: dispute type
- `description`: problem details
- `attachments`: image/file URL list
- `status`: `OPEN`, `IN_REVIEW`, `RESOLVED`, `REJECTED`
- `adminNotes`: admin note

Keno banano:

- lost/damaged item, payment issue, service issue handle korte
- admin review process maintain korte

Order flow relation:

- kono order niye customer/driver dispute raise korte pare
- dispute status order status theke alada

## BackgroundCheck Module

Path: `src/app/modules/BackgroundCheck`

BackgroundCheck module driver verification/background screening track kore.

`BackgroundCheckModel` fields:

- `driver`: Driver ref
- `provider`: currently `VERIFF`
- `status`: `PENDING`, `APPROVED`, `FAILED`
- `reportId`: provider report/session id
- `criminal.status`: criminal check status
- `mvr.status`: motor vehicle record status
- `identity.status`: identity check status
- `startedAt`: check start time
- `completedAt`: check complete time

Keno banano:

- driver approval er age verification track korte
- external provider report connect korte

Order flow relation:

- driver onboarding er shomoy background check doc create hoy
- future e only approved driver ke available/assign allow kora uchit

## Page Module

Path: `src/app/modules/Page`

Page module CMS/static content manage kore.

`PageModel` fields:

- `title`: page title
- `slug`: unique URL key
- `content`: page content
- `published`: page published kina

Keno banano:

- terms, privacy policy, about, FAQ type page store korte
- admin content update korte

Order flow relation:

- direct order flow er sathe relation nai

## Auth Module

Path: `src/app/modules/Auth`

Auth module e current `auth.model.ts` commented out. Auth-related main logic mostly User module e ache.

Commented `AuthTokenModel` intended fields:

- `user`: User ref
- `refreshToken`: refresh token
- `userAgent`: device/browser info
- `ip`: IP address
- `expiresAt`: token expiry
- `revokedAt`: token revoked time

Keno banano hote parto:

- refresh token DB te store korte
- device/session management korte
- logout/revoke token support korte

Current state:

- active model na
- token create/verify helper and User service diye auth flow cholche

## AdminLog Module

Path: `src/app/modules/AdminLog`

AdminLog model commented out and route mount kora nei.

Commented `AdminLogModel` intended fields:

- `adminUser`: admin User ref
- `action`: ki action kora hoyeche
- `entityType`: kon entity type
- `entityId`: affected entity id
- `metadata`: extra data

Keno banano hote parto:

- admin activity audit log rakhte
- sensitive operation trace korte
- support/debugging er jonno history maintain korte

Current state:

- active na

## Socket Layer

Path: `src/app/socket/index.ts`

Socket layer real-time feature manage kore.

Namespaces:

- `/orders`: order notification and live tracking
- `/chat`: chat, online users, typing, read status
- `/call`: WebRTC signaling

Order namespace:

- customer/driver room join
- new order driver notification
- driver accepted customer notification
- order hide for other drivers
- live driver location tracking

Chat namespace:

- thread list
- conversation room
- message send/list
- seen
- typing
- online users

Call namespace:

- call join
- offer
- answer
- ICE candidate
- call end

Keno banano:

- API-only polling chara real-time updates dite
- customer ke live order/driver update dite
- customer-driver chat/call support korte

## Shared Constants

Path: `src/app/constants/index.ts`

Constants file e common enum-like values ache:

- `ORDER_STATUS`
- `ORDER_STAGE`
- `SERVICE_TYPE`
- `PICKUP_TYPE`
- `DRIVER_STATUS`
- `BACKGROUND_STATUS`
- `NOTIFICATION_TYPE`
- `PAYMENT_STATUS`
- `PAYOUT_STATUS`

Keno banano:

- hardcoded string komate
- status values centralized korte
- model/service/validation same vocabulary use korte

## Overall Data Relation

Short relation map:

```txt
User
  -> Order.customer
  -> Order.driver
  -> Driver.user
  -> Card.user
  -> Payment.customer
  -> Invoice.customer
  -> Notification.user
  -> ChatMessage.from / ChatMessage.to
  -> Rating.customer / Rating.driver
  -> Dispute.raisedBy

Driver
  -> Dispatch.driver
  -> Earning.driver
  -> BackgroundCheck.driver

Order
  -> Payment.order
  -> Invoice.order
  -> Earning.order
  -> ChatMessage.order
  -> Rating.order
  -> Dispute.order
  -> Dispatch.orders / Dispatch.sequence

Zone
  -> Dispatch.zone
```

## Current Design-Er Important Mixed Reference Note

Ei project e driver identity duibhabe represent hocche:

- `User` collection e role `DRIVER`
- `Driver` collection e driver profile

Kichu model `User` driver id use kore:

- `Order.driver`
- `Rating.driver`
- `ChatMessage.from/to`

Kichu model `Driver` document id use kore:

- `Dispatch.driver`
- `Earning.driver`
- `BackgroundCheck.driver`

Tai API call korar shomoy careful thakte hobe:

- order assign/accept e driver user id lagbe
- dispatch create/list e client driver id pathay na; backend logged-in user theke Driver document id ber kore
- earning/background check e Driver document id lagbe

Eta future e standardize korle confusion kombe.

## Current Gap Ba Improvement List

- Order create validation e `pickupLat`, `pickupLng`, `expectedRadiusKm` missing, although service support kore.
- Bag count endpoint e request body/controller mismatch ache.
- Ready time endpoint incomplete.
- Driver cancel e `timeline.canceledAt` update style wrong hote pare.
- Payment success er por earning auto create hoy na.
- Invoice create payment capture er sathe automatically linked na.
- Notification model ache, but order/payment flow e auto persistent notification create hoy na.
- Dispatch create korle order-er `driver/status` auto update hoy na.
- Background check status currently driver availability/approval logic e strict vabe enforced na.
