# GoJulley — Mobile (Expo / React Native)

The native app for **GoJulley**, the Ladakh trip-booking platform. It talks to the
**same backend** as the web app (`https://gojulley-backend.onrender.com`) — a mobile
app is just another client of the stateless JWT REST API, so there are **no backend changes**.

## Run it

```bash
npm install
# if any versions conflict, align native deps to the Expo SDK:
npx expo install --fix

npx expo start
```

Then:
- press **i** (iOS simulator) / **a** (Android emulator), or
- scan the QR code with **Expo Go** on your phone.

> The API defaults to the live Render backend, so it works over the internet with no setup.
> For a **local** backend, change `BASE` in `src/lib/api.ts` to your machine's LAN IP
> (e.g. `http://192.168.1.5:8080/api/v1`) — `localhost` won't resolve from a phone.

## What's in this scaffold

Reuses the web app's shapes and API layer, rebuilt with React Native:

- **`src/lib/`** — `types.ts` (mirrors the backend), `api.ts` (fetch + JWT), `auth.tsx`
  (token in **Expo SecureStore**), `cart.tsx` (persisted via **AsyncStorage**), `money.ts`, `theme.ts`.
- **`app/`** (Expo Router):
  - `index` — home hub ("two ways to plan")
  - `search` — browse the catalogue by category (Stays · Bikes · Taxi · Services), live from the API
  - `listing/[id]` — details, "Good to know", **Add to cart** (green when added)
  - `cart` — quantities, trip window, **pay in full or 10% advance**, one combined checkout
  - `login` — login / signup / email-OTP verify

## Payments

The backend is in **mock mode** (no Razorpay keys), so checkout confirms instantly —
same as the web app today. For live card/UPI, add **`react-native-razorpay`** (a native
module → needs an **EAS dev build**, not Expo Go) and open checkout in `src/lib/pay.ts`
when `order.real` is true.

## Not built yet (roadmap)

- Trips list + trip detail (booking a package) — reuse `getTrips`/`getTrip` + the trip-payment flow
- My Bookings (reuse `getMyBookings` / `getMyTrips`, show balance-due-at-Leh)
- Explore map + routes guide (`react-native-svg`)
- A native date picker (`@react-native-community/datetimepicker`) in the cart (currently a text field)
- Push notifications (Expo), and an **EAS build → TestFlight / Play Store**

## Ship to stores (later)

```bash
npm i -g eas-cli
eas build --platform ios      # / android
eas submit
```
