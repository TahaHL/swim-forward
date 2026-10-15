# Production implementation plan

The 13 October V2 brief supersedes the earlier single-coach/no-payments scope. Owner confirmed navy/teal/rounded cards and waived the static-design selection gate. Continue local implementation between phases. Public, paid and irreversible external actions still require approval.

## Audit findings

The redesign is a Next-compatible React app running on Vinext/Sites. A single dense client component owns routing, forms and temporary drafts. Four D1 tables and one action API enforce application ownership; dispatch headers authenticate only inside Sites. The inherited shadcn library is mostly unused. Original reference source has rich front-crawl criteria and explanations worth retaining. Keep progressive disclosure, five statuses, parent feedback, skill detail and instructor publish concepts, but split them into features.

Earlier M0 checks passed. They are baseline evidence only. They do not validate the new stack. The prior claim that all original IDs were retained is incorrect: br-alignment, br-return and co-armleg were replaced by br-timing, co-arms-legs and co-breathing. Restore the original catalogue. Never automatically migrate those mismatched IDs; require explicit mapping and preserve source IDs/history in any import.

Replace Sites identity, D1, in-memory-only drafts, hardcoded owner role, mock onboarding and single-parent mapping. Never trust a role from a client. Parents must not query internal teacher notes. Authorisation must account for disabled accounts even with a still-valid token. Booking capacity and publication need transactional checks, and payment events need signature verification and idempotency.

## Architecture

Standard Next.js App Router on Vercel; Supabase Auth and Postgres in London; scoped organisation memberships (admin/instructor) and parent links; RLS on all application tables. Email OTP is the primary sign-in flow. Single business, multiple venues and instructors. Use user-scoped clients for normal requests; service credentials only for verified webhooks/background tasks. Atomic database functions handle publication and capacity reservations. Separate internal notes table. Append-only assessment events. Stripe-hosted Checkout; opaque booking IDs only in metadata. Resend for generic notification emails. No analytics by default.

## Phases and evidence

0. Audit and plan: baseline complete; current architecture and migration risks recorded here.
1. Foundation: runtime migration, relational schema, RLS tests, identity, routes and components.
2. Core coaching: swimmers, blocks, selected skills, assessments, targets and journey.
3. Instructor: assigned sessions, local drafts, explicit publish, internal notes.
4. Parent: simple dashboard, details, comparison, notifications and responsive checks.
5. Commercial: capacity-safe booking, Checkout, signed event processing, reconciliation/refund controls.
6. Admin: scoped management and teaching framework approval.
7. Hardening: RLS/integration/browser/accessibility tests, safe errors, retention and restore drill.
8. Deployment: separate staging/production projects; staging uses fictional data; real-provider tests require credentials and hosting approval.

Do not mark an integration complete based on fixtures or mocked calls. No real parents may be invited by the agent. Provider accounts/credentials are not present in the environment; hosted verification remains a dependency.

## Latest owner direction
Pricing and payments are deferred. Continue all non-commercial work locally; no provider accounts exist yet. Keep the visible hot-reloading preview at port 5175 available.
