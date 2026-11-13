# VKS Realty 2.0 — Phase 2 Implementation Plan

## Product goal
Build an owned property discovery and interactive exploration platform. Customers should be able to inspect project spaces, compare options, explore together and enquire without leaving VKS Realty.

## Confirmed product decisions
- Pilot scope: all six catalogue projects.
- Tour approach: hybrid — 360° panorama and hotspots first, with navigable 3D/GLB and optional WebXR progressively.
- Co-browsing: included in Phase 2.
- Initial media: sample/representative assets; never label them as actual project media.
- CRM: HubSpot planned; do not claim connected until credentials and end-to-end tests pass.
- Email: keep disabled.
- Prices, availability, legal/RERA information, possession and construction progress: unverified until VKS supplies evidence.

## Milestone 1 — Project catalogue foundation
**Status: in progress**
- Keep all project detail navigation on the VKS domain.
- Provide a consistent internal detail-page template for all six projects.
- Show project name, indicative configuration/location/price with verification disclaimers.
- Add differentiated representative sample galleries and internal related-project navigation.
- Preserve enquiry context when a customer opens a project page.
- Next: centralise project content into a single structured catalogue, validate every listing and route, and establish asset metadata.

## Milestone 2 — Hybrid property explorer
- Add a dedicated explorer route and reusable experience component.
- Start with panorama scenes and hotspot navigation: entrance/lobby, living area, bedroom, kitchen/bathroom and facilities.
- Provide a scene selector, hotspot information panels, accessibility controls and mobile touch navigation.
- Add optional GLB loading only when a model is available; use a clear fallback when not.
- Add WebXR only as progressive enhancement after browser/device capability checks.
- Initial sample scenes must be labelled illustrative and not project-accurate.

## Milestone 3 — Co-browsing
- Express/TypeScript session service.
- Private session IDs with expiry and host/guest roles.
- SSE broadcasts for room changes, selected hotspots and presence; POST endpoints for commands.
- Rate limits, session validation, reconnection and stale-session handling.
- Do not transmit personal lead data in shared session events.

## Milestone 4 — Concierge and share
- Scripted, catalogue-grounded intents first.
- Optional OpenAI-compatible model behind a server-side API with bounded project context.
- Shareable project and scene deep links; QR generation.
- Capture/recording only after browser compatibility, consent and privacy handling are tested.
- Preserve project/scene context in enquiry submission.

## Milestone 5 — Operations and production
- Secure admin authentication, roles and audit trail.
- Database-backed project, media, scene, hotspot, amenity and construction-update management.
- Upload pipeline for panorama/GLB assets, validation and CDN delivery.
- HubSpot integration and tested lead lifecycle.
- Performance budgets, accessibility, security review, analytics and device QA.

## Suggested stack
- Frontend: React + TypeScript; Vite build.
- 3D: React Three Fiber + Three.js.
- Panorama: equirectangular panorama rendering with hotspot overlays.
- VR: @react-three/xr as optional progressive enhancement.
- API/realtime: Node.js + Express + TypeScript; SSE for server-to-client updates and POST for actions.
- Database: PostgreSQL.
- Media: S3 + CloudFront.
- Hosting: Vercel frontend; separately hosted Node API/realtime service when needed.
- CRM: HubSpot.

## Acceptance criteria
1. Every project card opens an internal VKS page; no project-detail redirect to vksrealtygroup.com.
2. Each page clearly distinguishes verified information from sample/indicative content.
3. Each project has its own content record and media mapping.
4. Explorer supports mobile and desktop without requiring a VR headset.
5. Co-browsing sessions are private, expiring and resilient to reconnects.
6. Enquiry success is shown only after the backend confirms storage/CRM acceptance.
7. Email remains disabled until explicitly approved.
8. Conversion claims are made only after controlled measurement.

## Key dependencies and risks
- Actual project accuracy depends on VKS-approved photos, floor plans, panoramas, CAD/BIM or GLB models.
- Sample imagery is only for layout and interaction prototyping.
- WebXR support varies by browser, OS and headset; desktop/mobile fallback is mandatory.
- Realtime sessions require a persistent backend; serverless request functions alone are not sufficient for long-lived SSE.
- HubSpot and database credentials must remain server-side.
