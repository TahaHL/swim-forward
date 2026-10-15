# Swim Forward

Production migration in progress. The app runs locally; it has not been deployed and is not ready for real child data. Pricing and payments are deferred.

## Preview

`npm ci`, then `npm run dev`.

- http://127.0.0.1:5175/ — public website
- http://127.0.0.1:5175/demo — isolated fictional parent/instructor/admin preview
- http://127.0.0.1:5175/app — authenticated application; requires Supabase configuration

The older redesign at port 5173 is separate. This repository replaces Sites/Vinext/D1 with standard Next.js and Supabase Postgres/Auth. The GitHub repository is TahaHL/swim-forward (renamed from swim-progress-plan). The original app history is preserved in a local backup.

## Checks

- `npm run lint`
- `npm test` — domain tests and embedded PostgreSQL RLS/transaction tests
- `npm run build`
- `npm run typecheck`
- `npx playwright install chromium`, start the app, then `npm run test:browser`

## Project map

- app/ — public pages, authenticated entrypoint, validated API routes
- components/ — shared UI and application shell
- features/ — parent progress, instructor assessment, administration and separate fictional demo data
- features/skills/original.ts — original reference content, with original IDs preserved
- supabase/migrations/ — schema, RLS, publication, access management and deferred commerce
- supabase/seed-library.sql — teaching reference content only, initially unapproved
- tests/ — domain, PostgreSQL and browser/accessibility checks

Only Pass completes a skill. Not Assessed is null, not zero. Resets and downgrades retain assessment history. Internal teacher notes are stored separately and denied to parents by RLS.

See [local status](docs/LOCAL_STATUS.md) for exact limitations, [deployment](docs/DEPLOYMENT.md) for configuration, [runbook](RUNBOOK.md) for operational preparation and [launch gates](LAUNCH_CHECKLIST.md). Live authentication, delivery, managed backup/restore and deployment remain unverified. No production readiness or legal compliance claim is made.

## GitHub Pages

The public website and fictional preview are published at https://tahahl.github.io/swim-forward/. Run npm run build:pages to export them into .pages-out. The Pages workflow deploys on main updates. Parent accounts and server APIs require separate server hosting; Pages shows an availability notice instead of a sign-in form.

