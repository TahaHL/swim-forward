# Operational runbook — draft, not launch-approved

## Release checks

Run lint, typecheck, all unit/Postgres tests, build and browser/axe checks. Hosted auth and REST/RLS tests are mandatory once staging exists. A passing local build is not production approval. Pricing/checkout are intentionally disabled.

## Backups and restore

No managed backup or restore drill has been performed because no Supabase project exists. This is a launch blocker.

For the future drill: use a restricted staging project with fictional users; record row counts and representative assessment sequences; trigger/obtain a provider-supported backup; restore into an isolated project; validate auth identity mapping, migrations, RLS grants, invitations, internal-note isolation and historical comparisons. Record restore duration, loss window, checksums/counts and evidence. Do not overwrite production as a test. Confirm the selected plan's backup retention and recovery limits. Keep any logical dumps encrypted outside Git and never in public artifacts.

## Rollback

Application: redeploy the last tested immutable commit using the host's rollback mechanism. Database: prefer forward repair migrations. Never reverse a migration containing child records without an approved recovery plan and backup. Confirm old application compatibility before rolling it back across a schema change.

## Suspected data exposure

Disable affected accounts using authorised administration; verify database active-account checks deny old tokens. Revoke parent links where appropriate. Restrict the deployment. Preserve minimal access evidence without copying child records into tickets/chat. Owner determines incident communication and obtains legal advice. Do not enable session replay.

## Failed publication

The instructor retains the local draft and retries using the same request ID. Database publication is atomic and idempotent for that author/swimmer/request. Published updates are not silently overwritten. An explicit audited correction workflow remains outstanding.

## Privacy and retention

No automated deletion job is enabled. Retention fields/configuration exist, but the owner must approve periods, dry-run results and deletion procedure before enabling it. Parent deletion requests currently record a request; they do not immediately erase records. Financial scaffolding may require separate retention rules if commerce is introduced later.

Local draft text remains in this browser's storage until publishing/sign-out, and expired drafts are ignored on restore. It is not encrypted storage. Device trust, actual expiry cleanup and a stronger offline-storage review remain required before use with real child records.
