# GoJulley — Mobile (Expo / React Native)

The native app for **GoJulley**, the Ladakh trip-booking platform. It talks to the
**same backend** as the web app (`https://gojulley-backend.onrender.com`) — a mobile
app is just another client of the stateless JWT REST API, so there are **no backend changes**.

Built on **Expo SDK 57** (Expo Router). Routes live in `src/app/`, shared logic in `src/lib/`.

## Run it

```bash
npm install          # first time only
npx expo start
```

Then:
- scan the QR with **Expo Go** on your phone (phone + laptop on the same Wi-Fi), or
- press **i** / **a** for a simulator, or **w** for a browser preview.

> Uses the live Render backend by default, so it works over the internet with no setup.
> For a **local** backend, change `BASE` in `src/lib/api.ts` to your machine's LAN IP.

## Structure

- **`src/lib/`** — `types.ts` (mirrors the backend), `api.ts` (fetch + JWT), `auth.tsx`
  (token in **Expo SecureStore**), `cart.tsx` (persisted via **AsyncStorage**), `money.ts`,
  `pay.ts` (mock checkout), `theme.ts`.
- **`src/app/`** (Expo Router):
  - `index` — home hub · `search` — browse by category · `listing/[id]` — details + Add to cart
  - `cart` — quantities, trip window, **pay-in-full or 10% advance**, one checkout
  - `trips` + `trip/[id]` — packages + booking · `bookings` — my bookings (with balance-due-at-Leh)
  - `explore` — Ladakh map + routes (`react-native-svg`) · `login` — login / signup / OTP

## Payments

Backend is in **mock mode** (no Razorpay keys), so checkout confirms instantly — same as the
web app. For live card/UPI, add **`react-native-razorpay`** (a native module → needs an **EAS
dev build**, not Expo Go) and open checkout in `src/lib/pay.ts` when `order.real` is true.

## Ship to stores (later)

```bash
npm i -g eas-cli
eas build --platform ios      # / android
eas submit
```
