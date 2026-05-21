# Privacy Policy

Last updated: 2026-05-21

**케어닥 Tablet (care-home-tablet)** is a thin caregiver-facing client that
connects to a remote API maintained by the 케어닥 service operator. This
document covers **only the tablet client's behavior** — it does not describe
the server's data handling.

## What the tablet client does

- During first-run pairing, sends an 8-character code (issued by a branch
  manager from the HQ dashboard) to the configured server to claim a
  long-lived `device_token`.
- Stores the `device_token` and basic device metadata in the operating
  system's encrypted application data store (via `@tauri-apps/plugin-store`).
- When a caregiver signs in with a 4–8 digit PIN, sends the PIN + their
  email + the `device_token` to the server in exchange for an 8-hour JWT.
- Sends authenticated HTTP requests (with the JWT) to the configured server
  to read today's residents and to record vitals / care logs.

## What the tablet client does NOT do

- It does **not** send telemetry, analytics, crash reports, or any usage
  data to any third party.
- It does **not** contact any service other than the server URL configured
  at build time via `VITE_API_BASE`.
- It does **not** include embedded advertising, fingerprinting, or any
  third-party tracking SDK.

## Data stored locally

| Item | Location | Purpose |
|---|---|---|
| `device_token` (long-lived) | OS keychain via Tauri store plugin | Identify this tablet to the server |
| Branch name + ID | Same as above | Display in the UI |
| Per-shift JWT | In-memory only — discarded when app closes | Authenticate API requests during a shift |

## Server-side handling

All resident, staff, vitals, and care-log data is stored on the server you
connect to, under the privacy policy of the care-home operator that runs
that server.

## Contact

Open an issue at https://github.com/rowlow0gold-ops/care-home-tablet/issues.
