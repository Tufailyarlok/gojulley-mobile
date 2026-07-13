# GoJulley — Mobile (Expo / React Native)

The native app for **GoJulley**, the Ladakh trip-booking platform. It talks to the
**same backend** as the web app (`https://api.gojulley.com`) — a mobile
app is just another client of the stateless JWT REST API, so there are **no backend changes**.

Built on **Expo SDK 54** (Expo Router). Routes live in `src/app/`, shared logic in `src/lib/`.

> Pinned to SDK 54 (not newer) so it runs in **Expo Go** — the installed Expo Go
> only bundles the SDK 54 runtime; a newer SDK would require a custom dev build.

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
  - `trips` + `trip/[id]` — packages + booking · `bookings` — my bookings: **pick-an-offer coupons**
    (live discount preview) + pay, cancel, balance-due-at-Leh
  - `explore` — Ladakh map + routes (`react-native-svg`) · `login` — login / signup / OTP

## Payments

Same Razorpay flow as the web app, handled in `src/lib/pay.ts`:

- **Mock mode** (backend has no keys) → checkout confirms instantly with placeholder ids.
- **Real mode** (backend has `RAZORPAY_KEY_*` — currently **test** keys) → `payOrder` opens
  Razorpay Checkout inside a **WebView** (`src/components/RazorpayCheckout.tsx`, mounted once at
  the app root) that loads the same `checkout.js` the web uses, returns the signed result, and
  verifies it with the backend before the booking flips to `CONFIRMED`. **Works in Expo Go** —
  no native module or EAS dev build required.

Razorpay **domestic test** card (the account has international cards off, so
`4111…` is rejected as international): Mastercard `5267 3181 8797 5449` or Visa
`4718 6091 0820 4366` · any future expiry · any CVV · pick **Success** on the OTP page.

## Ship to stores (later)

```bash
npm i -g eas-cli
eas build --platform ios      # / android
eas submit
```
