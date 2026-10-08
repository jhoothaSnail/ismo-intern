# Architectural Decision Records (Phase 0)

This document tracks the integration spikes and structural decisions made during Phase 0 to de-risk the deployment and security posture of the project.

## S2: Cross-Origin Cookie Transport & Refresh Token Security
**Date:** 2026-10-08
**Context:** We are running a decoupled architecture with a React SPA hosted on Vercel and an Express 5 API hosted on Render. We need to securely persist a long-lived Refresh Token. 
**Problem:** If the API (on Render) attempts to set an `HttpOnly` cookie across domains, strict browser privacy mechanisms (like Safari's ITP and Chrome's Third-Party Cookie Deprecation) will block the cookie, breaking the session lifecycle. The alternative—storing refresh tokens in `localStorage`—exposes them to Cross-Site Scripting (XSS) extraction.
**Decision:** We are adopting the **Same-Origin Edge Proxy Pattern**.
By configuring a Vercel Edge Rewrite (`/api/*` → `https://[RENDER_API]`), the React frontend only communicates with its own origin. The API returns the Refresh Token in an `HttpOnly; Secure; SameSite=Lax` cookie. Because the browser sees this as a first-party request, it readily accepts the cookie. 
**Consequences:** 
- Eliminates brittle CORS preflight (`OPTIONS`) latency for credentialed requests.
- Makes the app immune to ITP/third-party cookie blocking.
- Secures the refresh token against XSS.

## S5: IP Resolution & Rate Limiting Integrity Behind Proxies
**Date:** 2026-10-08
**Context:** To prevent brute-force attacks and enumeration, the API uses strict rate-limiting. This requires identifying the true IP of the requester.
**Problem:** The API sits behind Render's Layer 7 load balancers. By default, Express will report the load balancer's internal IP as `req.ip`. If we naively configure `app.set('trust proxy', true)`, Express will trust the entire `X-Forwarded-For` chain. A malicious user can spoof their IP by sending a fake `X-Forwarded-For` header, bypassing our rate limiters completely.
**Decision:** We enforce **Deterministic Proxy Trust Bound**. 
We configure Express using `app.set('trust proxy', 1)`. Render guarantees that the actual client IP is always appended as the right-most IP in the `X-Forwarded-For` chain. By explicitly trusting exactly `1` hop, Express will discard any spoofed IPs injected by the attacker and securely extract the true client IP for the rate-limiter bucket.
**Consequences:**
- Guarantees rate limiting integrity.
- Prevents IP spoofing via headers.

## S1: Monorepo Package Resolution (Metro vs. pnpm)
**Date:** 2026-10-08
**Context:** We use `pnpm` workspaces to share a `@pms/contracts` package (Zod schemas and Enums) across the API, Web, and Expo (Mobile) apps.
**Problem:** Expo's bundler (Metro) notoriously fails to resolve symlinked packages out-of-the-box, which is the default behavior of `pnpm`.
**Decision:** We utilize `node-linker=hoisted` in the root `.npmrc`.
**Consequences:** `pnpm` builds a flat `node_modules` structure similar to `yarn v1`, completely avoiding symlink resolution errors in Metro without needing heavy custom Metro configuration files.

## S4: Production Database Migrations
**Date:** 2026-10-08
**Context:** Applying schema changes via Prisma to the Neon Serverless Postgres instance.
**Problem:** Running `prisma migrate deploy` automatically inside the API Docker container's boot script creates a severe race condition. If the API scales to 2 instances simultaneously, both containers will attempt to mutate the schema at the exact same time, potentially corrupting the migration table.
**Decision:** **Decoupled Release Step**. Migrations are executed out-of-band via a manual trigger (or CI/CD release command) prior to boot, using the direct (non-pooled) Neon connection string. The API container purely consumes the schema.
