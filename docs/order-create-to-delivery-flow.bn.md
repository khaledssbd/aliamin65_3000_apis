# Order Create Theke Delivery Porjonto Flow

Ei note ta current codebase-er upor base kore lekha. Flow bujhar shomoy mone rakhte hobe: ekhane order flow-er duita path ache. Ekta driver nijey job accept kore, arekta admin manually driver assign korte pare. Dispatch module driver-owned batch/route planning er jonno, mane driver nijer accepted orders diye nijer dispatch/sequence create korte pare.

## 1. Customer Order Create Korle Ki Hoy

Customer `POST /orders` hit kore order create kore. Ei route shudhu `CUSTOMER` role er jonno allowed.

Request body te expected data:

- `serviceType`: `WASH_DRY` ba `DRY_CLEAN`
- `pickupType`: `ASAP` ba `SCHEDULED`
- `scheduledPickupAt`: scheduled pickup hole datetime
- `bags`: koyta bag
- `specialInstructions`: optional instruction

Service layer `OrderService.createOrderIntoDB` prothome pricing ber kore:

- `PricingModel.findOne({})` diye pricing neya hoy
- pricing na thakle fallback `pricePerBag = 45`
- `total = bags * pricePerBag`

Tarpor order create hoy `OrderModel` e:

- `customer`: logged-in customer er `_id`
- `address`: customer user profile er `address`
- `serviceType`, `pickupType`, `bags`, `specialInstructions`
- optional `pickupLocation`
- optional `expectedRadiusKm`
- `status`: `REQUESTED`
- `pricePerBag`, `total`
- `timeline.requestedAt`: current date

Order create howar por API response e newly created order return hoy. Customer ke alada `order:created` socket event pathano hocche na, karon REST response already confirmation/data dicche.

## 2. Driver Der Kache New Job Notification Jay

Order create howar por controller available drivers khuje:

- `DriverModel.find({ isAvailable: true })`
- driver profile theke `user` id collect kore
- tarpor oi user der `currentLocation` `UserModel` theke load kore

Jodi order e `pickupLocation` thake:

- pickup location er lat/lng neya hoy
- driver er `currentLocation` er lat/lng neya hoy
- haversine formula diye distance calculate hoy
- driver jodi `expectedRadiusKm` er moddhe thake, tahole target driver hishebe dhora hoy
- `expectedRadiusKm` na thakle fallback `3 km`

Jodi radius er moddhe kono driver na mile:

- fallback hishebe shob available driver ke target kora hoy

Tarpor target driver der socket room e event emit hoy:

- room: `driver:{driverUserId}`
- event: `driver:job:new`
- payload: `{ orderId }`

Driver ke ei event pawar jonno socket e `/orders` namespace e connect kore `orders:join` event dite hobe:

```ts
{
  role: 'DRIVER';
}
```

Tokhon driver `driver:{userId}` room e join kore.

## 3. Driver Available Job Dekhte Pare

Driver `GET /drivers/jobs/available` hit korte pare.

Ei route:

- shudhu `DRIVER` role er jonno
- `OrderModel` theke `REQUESTED` status er order ane
- condition: `driver` field ekhono set hoy nai
- latest 50 ta order return kore

Query logic:

```ts
{
  status: "REQUESTED",
  driver: { $exists: false }
}
```

## 4. Driver Job Accept Korle Ki Hoy

Driver `POST /drivers/jobs/:orderId/accept` hit kore job accept kore.

Backend:

- prothome check kore driver profile ache kina: `DriverModel.findOne({ user: userId })`
- tarpor order update kore, but only jodi order ekhono available thake

Order update condition:

```ts
{
  _id: orderId,
  status: "REQUESTED",
  driver: { $exists: false }
}
```

Update:

- `driver`: logged-in driver user id
- `status`: `DRIVER_ASSIGNED`
- `timeline.driverAssignedAt`: current date
- `pendingDriver` unset kora hoy, jodio model e eta defined na

Accept successful hole socket event jay:

- customer room `customer:{customerId}` e `order:driver:accepted`
- payload:

```ts
{
  (orderId, driverUserId);
}
```

Tarpor onno available driver der kache `order:hidden` event jay:

- room: `driver:{otherDriverUserId}`
- payload: `{ orderId }`

Eta front-end ke bolte pare je ei order ta list theke hide korte, karon arek driver accept kore feleche.

## 5. Driver Job Decline Korle Ki Hoy

Driver `POST /drivers/jobs/:orderId/decline` hit kore decline korte pare.

Current implementation e database e kono order update hoy na. Response e sudhu eta return kore:

```ts
{
  userId,
  orderId,
  declined: true,
  declinedAt
}
```

Comment e bola ache future e declined driver track kora jete pare, jate same driver ke abar oi job offer na hoy.

## 6. Driver Job Cancel Korle Ki Hoy

Driver `POST /drivers/jobs/:orderId/cancel` hit kore accepted job cancel korte pare.

Backend:

- driver profile ache kina check kore
- order er `driver` jodi logged-in driver hoy tahole order update kore

Update:

- `driver`: `null`
- `status`: `REQUESTED`
- timeline e cancel time push korte chay

Important caution:

- `timeline.canceledAt` model e single `Date`, but service e `$push` use kora hoy. Eta mismatch. Ekhane `$set` use kora uchit chilo.

Cancel er por order abar `REQUESTED` hoye jay, mane theoretically abar available job list e aste pare.

## 7. Admin Manually Driver Assign Korte Pare

Admin ba super admin `PATCH /orders/:id/assign-driver` hit korte pare.

Body:

```ts
{
  "driverId": "..."
}
```

Backend:

- order er `driver` set kore
- status `DRIVER_ASSIGNED` kore
- `timeline.driverAssignedAt` set kore

Tarpor global socket event emit kore:

- event: `order:assigned`
- payload:

```ts
{
  (orderId, driverId);
}
```

Note:

- Driver accept flow e `Order.driver` field e `User` id set hoy.
- Admin assign flow e body er `driverId` directly set hoy. Model e `Order.driver` ref `User`, tai ekhane `driverId` ideally user id hote hobe, driver profile id na.

## 8. Order Status Update Flow

Admin ba super admin `PATCH /orders/:id/status` diye status update korte pare.

Allowed status:

- `REQUESTED`
- `DRIVER_ASSIGNED`
- `PICKED_UP`
- `WASHING_DRYING`
- `OUT_FOR_DELIVERY`
- `DELIVERED`
- `COMPLETED`
- `CANCELED`

Status update hole timeline field auto set hoy:

- `PICKED_UP` hole `timeline.pickedUpAt`
- `WASHING_DRYING` hole `timeline.washingDryingAt`
- `OUT_FOR_DELIVERY` hole `timeline.outForDeliveryAt`
- `DELIVERED` hole `timeline.deliveredAt`
- `COMPLETED` hole `timeline.completedAt`

Expected real-life status flow:

```txt
REQUESTED
-> DRIVER_ASSIGNED
-> PICKED_UP
-> WASHING_DRYING
-> OUT_FOR_DELIVERY
-> DELIVERED
-> COMPLETED
```

Meaning:

- `REQUESTED`: customer order submit koreche, driver ekhono final hoy nai
- `DRIVER_ASSIGNED`: driver order niyeche/admin assign koreche
- `PICKED_UP`: driver customer theke laundry bag pickup koreche
- `WASHING_DRYING`: laundry processing cholche
- `OUT_FOR_DELIVERY`: clean laundry customer er kache ferot jacche
- `DELIVERED`: customer er kache delivery hoyeche
- `COMPLETED`: order fully closed
- `CANCELED`: order cancel hoyeche

## 9. Driver Bag Count Update

Routes ache:

- `PATCH /orders/:id/bag-count/pickup`
- `PATCH /orders/:id/bag-count/delivery`

Intent:

- pickup er shomoy driver actual bag count set korbe
- delivery er shomoy delivered bag count set korbe

Model fields:

- `bagCountAtPickup`
- `bagCountAtDelivery`

Important caution:

- validation schema body te `bagCount` expect kore
- controller service e `req.body.kind` and `req.body.count` pathay
- route theke `kind` set kora hoy na
- tai current code e ei endpoint thik moto kaj nao korte pare

Expected fix idea:

- pickup route e controller `kind = "pickup"` set korbe
- delivery route e controller `kind = "delivery"` set korbe
- `count` er jaygay `bagCount` use korbe

## 10. Ready Time Route

Route ache:

```txt
POST /orders/:id/ready-time
```

Eta `DRIVER` role er jonno.

Validation body:

```ts
{
  isoTime: string;
}
```

But controller `OrderController.updateOrderStatus` call kore, ja body te `status` expect kore.

Important caution:

- current code e ready-time route er behavior incomplete/mismatch.
- model eo `readyTime` field nei.
- eta implement korte hole order model e ready time field ba stage field add korte hobe.

## 11. Dispatch Module Kothay Fit Kore

Dispatch order create-er direct automatic part na. Eta driver side batch/route planning er moto.

Driver `POST /dispatch` diye dispatch create kore. Driver request body te `driverId` pathay na; backend logged-in driver user theke `Driver` profile ber kore dispatch er `driver` set kore.

Body expected:

```ts
{
  orders: (['orderId1', 'orderId2'], zoneId, timeWindowStart, timeWindowEnd);
}
```

Dispatch create hole:

- `driver`: logged-in driver er `Driver` profile id
- `orders`: ei dispatch er under e order list
- `zone`: optional zone
- `timeWindowStart`, `timeWindowEnd`: optional delivery/pickup window
- `sequence`: initial vabe `orders` er same list
- `status`: `ASSIGNED`

Important validation:

- driver profile thakte hobe
- dispatch er shob `orders` logged-in driver er assigned order hote hobe
- driver onno driver er order diye dispatch create korte parbe na

Dispatch status:

- `ASSIGNED`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELED`

Driver dispatch update korte pare:

- `PATCH /dispatch/:id/sequence`: order sequence update
- `PATCH /dispatch/:id/status`: dispatch status update

Driver sequence update korle backend check kore:

- sequence e sudhu oi dispatch er order thakte hobe
- dispatch er shob order sequence e thakte hobe
- onno order id add kora jabe na

Admin dispatch update korte pare:

- `PATCH /dispatch/:id/assign`: driver reassign
- `PATCH /dispatch/:id/sequence`: sequence update
- `PATCH /dispatch/:id/status`: status update

Driver nijer dispatch list dekhte pare:

- `GET /dispatch/driver/me`
- latest 5 dispatch return kore

Driver/admin dispatch details dekhte pare:

- `GET /dispatch/:id`
- orders populate kore return kore

Important caution:

- `Dispatch.driver` model e ref `Driver`
- `Order.driver` model e ref `User`
- tai dispatch create er shomoy backend logged-in user id theke `Driver` profile id ber kore
- order assign/accept er shomoy `Order.driver` e driver user id thake

## 12. Driver Location Tracking

Driver socket diye location push korte pare:

Namespace: `/orders`

Event:

```txt
order:tracking:location:push
```

Payload:

```ts
{
  (orderId, lat, lng);
}
```

Backend check kore:

- order ache kina
- order er `driver` logged-in socket user kina

Valid hole:

- driver user er `currentLocation` update hoy
- order room `order:{orderId}` e `order:tracking:location` event emit hoy

Customer live tracking pete order room e join korte pare:

```ts
{
  orderId,
  role: "CUSTOMER"
}
```

## 13. Customer-Driver Chat

Chat module `/chat` namespace diye order based conversation manage kore.

Customer/driver:

- conversation join kore: `chat:conversation:join`
- message list chay: `chat:messages:list`
- message pathay: `chat:message:send`
- seen kore: `chat:message:seen`
- typing event dey: `chat:typing`

Jodi message send er payload e `to` na thake:

- backend order theke `customer` and `driver` ber kore
- sender customer hole receiver driver
- sender driver hole receiver customer

Eta order assigned na hole kaj korbe na, karon receiver driver thakbe na.

## 14. Payment, Invoice, Earning Flow

Payment order create-er sathe automatic create hoy na. Customer alada payment endpoint use kore payment intent create/capture korbe.

Payment intent create:

- order total amount neya hoy
- pricing theke driver earning percentage neya hoy
- customer er default card thakle Stripe customer/payment method use hoy
- `Payment` document create hoy status `requires_confirmation`

Payment capture:

- Stripe payment intent confirm kore
- payment status `succeeded`
- `capturedAt` set hoy
- driver/admin share calculate kora hoy, but currently earning document auto create kora hoy na

Invoice:

- order id diye invoice create hoy
- invoice number: `INV-{orderId}`
- line item: Laundry Service, price per bag, quantity bags
- `paid: true`

Earning:

- `Earning` model driver earning track korar jonno ache
- current payment capture service e earning document create hoy na
- future enhancement hote pare payment success er por earning create kora

## 15. Full End-to-End Flow Summary

Typical flow:

```txt
1. Customer signup/login kore
2. Customer address set kore
3. Admin pricing set kore
4. Driver profile/onboarding complete kore
5. Driver availability true kore
6. Customer order create kore
7. Order status REQUESTED hoy
8. Nearby available driver der socket e driver:job:new jay
9. Driver available jobs list dekhe ba socket notification peye job accept kore
10. Order status DRIVER_ASSIGNED hoy
11. Customer socket e order:driver:accepted pay
12. Driver pickup kore, admin/status API diye PICKED_UP set hoy
13. Laundry process cholte thake, WASHING_DRYING set hoy
14. Delivery start hole OUT_FOR_DELIVERY set hoy
15. Driver live location push korte pare
16. Delivered hole DELIVERED set hoy
17. Payment/invoice complete hoy
18. Finally COMPLETED set hoy
```

Driver dispatch based flow:

```txt
1. Customer ra order create kore
2. Driver ek ba multiple order accept kore
3. Driver accepted order list theke nijer dispatch create kore
4. Dispatch e order sequence/time window/zone set hoy
5. Driver GET /dispatch/driver/me diye nijer dispatch list dekhe
6. Driver sequence/status update kore
7. Admin chaile reassign ba correction korte pare
8. Orders er individual status alada vabe update korte hoy
```

## 16. Current Code-Er Important Cautions

- `Order.driver` ref `User`, but `Dispatch.driver` ref `Driver`. Backend dispatch create/list e ei mapping handle kore.
- `createOrderSchema` validation e `pickupLat`, `pickupLng`, `expectedRadiusKm` nei, but service eigulo support kore. Tai validation pass korte hole schema update dorkar.
- bag count route e validation/controller mismatch ache.
- ready-time route incomplete/mismatch.
- driver cancel flow e `timeline.canceledAt` e `$push` use hoy, but schema field `Date`.
- order status update route admin-only, driver pickup/delivery status direct update korte pare na current route permission onujayi.
- payment success hole earning auto create hoy na.
- notification model ache, but order status update e notification document auto create kora hocche na.
