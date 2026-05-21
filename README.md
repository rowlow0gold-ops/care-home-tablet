# care-home-tablet

Caregiver-facing companion app for the **케어닥** franchise SaaS — Tauri 2 + Vue 3 + Quasar.

Runs on iPad, Android tablets, and desktop (Mac/Windows/Linux) for dev. Talks to
the [care-home-server](https://care.minhojan-world.site) directly over HTTPS.

> This is the **client** of a multi-tenant SaaS. The server (with the data,
> tenant isolation, billing, and business logic) is intentionally not open
> source — this client repo is published under MIT to qualify for free
> code-signing via the [SignPath Foundation](https://about.signpath.io/).
> Anyone is welcome to fork the UI; functionality requires a paid care-home
> tenant on the server.

## Auth model (mirrors Home Instead / BrightStar / Tsukui patterns)

1. **One-time pairing.** A branch manager opens the HQ dashboard and clicks
   "새 태블릿 페어링" — server issues an 8-char code valid 15 min. They hand
   this code to the tablet. Tablet POSTs `/devices/claim` and stores the
   returned `device_token` in Tauri's encrypted store (OS keychain on mobile).
2. **Per-shift PIN login.** Caregivers tap in their email + 4-digit PIN.
   Tablet POSTs `/auth/pin` with `{device_token, email, pin}` and gets an
   8-hour JWT. PIN failures are rate-limited server-side.
3. **Switch user without restart.** Just hit "다른 직원으로 전환" — clears the
   JWT, keeps the device pairing, routes back to PIN screen.

The device_token is **revocable from HQ** at any time (kills the tablet) and
the PIN is **rotatable per caregiver** from the staff page.

## Local dev (desktop preview)

```bash
pnpm install
cp .env.example .env       # point at your server if not using production
pnpm tauri:dev             # opens a desktop window for fast iteration
```

You can pair against the real server in dev — visit HQ, generate a code,
type it in.

## Mobile builds

```bash
# Android (requires Android Studio + NDK)
pnpm tauri:android:init
pnpm tauri:android:dev

# iOS (requires Xcode + Apple Developer account)
pnpm tauri:ios:init
pnpm tauri:ios:dev
```

For production sideload / MDM distribution, use `pnpm tauri:android:build`
(produces signed APK) and `pnpm tauri:ios:build` (produces .ipa for TestFlight).

## Screens

| Route | Purpose |
|---|---|
| `/pair` | First-run pairing — code + device label |
| `/pin` | Per-shift PIN entry, big numeric keypad |
| `/` | Today's residents grid, big touch targets |
| `/residents/:id` | Resident detail + jump buttons |
| `/residents/:id/vital` | Quick vital entry (HR / SpO₂ / BP / 체온) |
| `/residents/:id/care-log` | Quick care log with flag toggle |

## Stack

- Tauri 2 (desktop + mobile)
- Vue 3 + TypeScript
- Quasar 2 (Material Design tablet components, batteries-included)
- Pinia for state
- @tauri-apps/plugin-store for encrypted device-token persistence
- Vite 6

## Not in v1

Offline-first sync. Tablets in care facilities have spotty WiFi but for v1
we assume reachable network. A SQLite write queue + reconciliation pass will
come in v0.2 (see project plan).

## Downloads

Built installers are published on the
[GitHub Releases page](https://github.com/rowlow0gold-ops/care-home-tablet/releases)
on every `vX.Y.Z` tag.

> **Code signing.** Releases are signed using a code-signing certificate
> generously provided by the [SignPath Foundation](https://signpath.org/),
> the non-profit code-signing service for open-source projects.

## Privacy

See [PRIVACY.md](PRIVACY.md). The tablet client is a thin UI over a remote
API; it does not collect telemetry of any kind.
