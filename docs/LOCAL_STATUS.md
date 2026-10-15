# Local implementation status — 13 October 2026

This is an implementation in progress, not a launch-ready service. No provider accounts exist yet. Owner requested local development and deferred pricing on 13 October.

## Implemented in source

- Standard Next.js/React/TypeScript replaces Sites/Vinext/D1 and dispatch-header identity.
- Supabase email-code handlers, cookie refresh and active-account checks; live auth not yet exercised.
- Postgres migrations, RLS on every application table, organisation roles and block instructor assignments.
- Atomic explicit publication, assessment history, criteria snapshots, internal notes kept separate, audit entries and in-app notifications.
- Original front-crawl skill content and IDs restored. Other strokes require authored and approved skills. New library entries start unapproved.
- Parent Home, skill checklist/detail/history and date comparisons. Only Pass completes a skill; resets retain history.
- Instructor five-button controls, numeric keyboard shortcuts, optional feedback/targets, one note/focus, local device drafts with 24-hour expiry on restore, explicit publication.
- Admin creation forms for swimmers, venues, programmes, blocks, sessions, enrolments, assignments and selected skills. Criteria edit/approval/retirement UI.
- Email-bound invitation codes, single-use/seven-day expiry, up to two linked parents, revocation RPC, parent linking UI.
- Notice-version recording, parent deletion requests and record-download endpoint.
- Navy/teal responsive interface, system fonts, dark mode, bottom navigation and modal sheets. Public informational pages and isolated fictional `/demo` route.
- Install manifest and raster icons. No sensitive-response service-worker cache.
- GitHub Actions workflow prepared locally; not run on GitHub.

## Pricing deferred

Admin blocks need no price. Parent block view shows enrolled coaching blocks plus a “Coming later” message for pricing/online booking. Checkout endpoint always returns 410; authenticated database roles cannot call reserve_booking. Existing schema/integration scaffolding is retained as an extension point. No charges, refunds or live Stripe tests have occurred. The prior cost estimate is not an owner-approved budget.

## Verification

15 local Node/PostgreSQL tests passed after the deferral, including table RLS, parent/instructor isolation, internal note separation, disabled accounts, idempotent publication, invitation binding/replay/revocation, denied commercial reservations and rating semantics.

The previous browser pass completed seven checks across 390/768/1440 widths in light/dark, including automated axe scans, skill detail, journey controls, draft refresh and unauthenticated denial. Final rerun adds the deferred-pricing checks; consult the final turn report for its result. Screenshots are in ignored test-results/.

An earlier comparison-label test failed and was corrected. Intermediate lint errors and stale generated Next route types were corrected. The latest final build/check outcome must be recorded after completion. Automated scans do not constitute a full WCAG audit.

## Outstanding — do not imply these are finished

- Actual Supabase staging authentication, OTP delivery, RLS/PostgREST parity, account disabling and end-to-end persistence against hosted services.
- Full parent onboarding/add-child flow and verified consent/legal wording; current notice is a template/test acknowledgement.
- Staff account provisioning/disable UI, polished group/session management, attendance UI, block reviews, durable corrections and programme templates.
- Automated invitation emails and generic update emails, email retry/outbox delivery and notification read-state controls.
- Complete permanent-deletion UI/workflow, retention dry-run and approved automatic deletion, managed-backup restore drill.
- Monitoring with tested PII scrubbing, rate-limit/CAPTCHA configuration, full OWASP review and abuse testing.
- Install/device/offline lifecycle tests, performance/Lighthouse/INP evidence, Safari and real-device accessibility checks.
- Production deployment and owner/legal launch gates. No real families should use this build yet.

Only local preview uses fictional content. Production never falls back to demo data. No original GitHub repository was modified, pushed or published.

## Final verification for this local pass
The latest standard Next.js build, TypeScript check and lint passed. All 15 domain/PostgreSQL tests passed. The latest browser result is reported in this chat. The live dev preview remains on 127.0.0.1:5175.

Final browser rerun: all eight checks passed, including automated parent/instructor axe scans at 390, 768 and 1440 pixels in light and dark, and pricing placeholder/direct checkout denial.
