# M0 baseline audit

13 October 2026. Local audit only; no deployment or external repository created.

## Sources

Read the redesign README and full handover before running checks. Both redesign source and original reference checkout are accessible. Created a separate `outputs/swim-progress-production` copy with its own local Git repository. Original reference repository and running redesign preview remain separate.

The supplied production brief and section 5c are recorded in PRODUCTION_BRIEF.txt and DESIGN_STANDARD.md. The production brief ends at section 9, “Never”; remaining working rules are still needed. Supabase/email authentication supersedes the earlier Sites choice. No platform selection, paid service, public deployment or real-parent invitation was made.

## Observed results

| Check | Result |
| --- | --- |
| Clean install from lockfile into new directory | Passed, 682 packages; cached offline install |
| TypeScript `tsc --noEmit` | Passed, explicit exit 0 |
| `node --experimental-strip-types --test tests/progress.test.mjs` | 4 passed, 0 failed |
| `node tests/access.mjs` on isolated loopback port 5174 | 39 checks passed |
| `node scripts/run-framework.mjs build` | Passed, all five Vinext build stages, exit 0 |
| Common credential-pattern scan | 126 candidate source files scanned, zero matches |
| Sensitive/generated file inventory | No environment files, private keys, dependency directory, database state or runtime state staged |

Node v24.20.0, Git 2.46.0.windows.1. Install emitted warnings about six packages with install scripts not covered by allowScripts, plus two deprecated esbuild-kit packages. No dependency vulnerability audit was performed; the cached installer disables npm audit. Pattern scanning is not an exhaustive secret audit.

The first Wrangler migration attempt used its default build-relative local state and encountered a log-directory permission error. Re-ran with project-local WRANGLER_LOG_PATH, metrics disabled and explicit `--persist-to .wrangler/state`; all four SQL commands succeeded against the actual test server database. All data were fictional test records. The isolated server was stopped after testing.

## Reproduce

Install: run the package's `install:ci` script with npm. On this Windows host, invoke npm using `node "C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js" --prefix . --workspaces=false run install:ci`. The existing workspace npm cache supported a fresh offline install.

Run the typecheck, progress tests and build above. For the access suite, a local-only test Vite config imports the base config, replaces the `sites` plugin with `sites({mockAuth:false})`, and binds 127.0.0.1:5174 with strictPort. This permits the test's synthetic dispatch identity headers; it must never be deployed or exposed remotely. Build first, then run Wrangler `d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_glamorous_boomerang.sql` with project-local logs. Start Vite using the test config, run tests/access.mjs, then stop it. The executed config is retained in ignored .sites-runtime/test-vite.config.ts.

## Gaps against the new brief

- Existing platform remains Vinext/Sites, D1 and the previous identity provider. M1 must replace these with the requested stack after region, terms, limits and cost verification.
- Current access tests exercise application checks and local dispatch headers, not Postgres RLS or production identity. The origin rejection test can be intercepted by Vite and therefore does not independently prove the route's origin check.
- Current model supports one parent per swimmer, no programmes/groups/attendance, no durable offline drafts, no comprehensive assessment audit log, no email delivery or versioned consent.
- Original 17 front-crawl entries remain. The 18 generic extra-stroke entries must become hidden until owner-added criteria are approved. Preserve existing history when migrating.
- Skills editor, comparisons, achievements, retention dry run, automatic retention, backup/restore, monitoring, PWA, CI/E2E and accessibility/performance evidence remain future milestone work.
- Current UI does not satisfy section 5c. M1a components and both design directions require owner selection before screen construction.
- Legal templates and all owner launch gates remain outstanding. No security, teaching, legal or accessibility certification is claimed.

## Gate

M0 verification complete. Stop for owner go-ahead before M1. Ask separately before creating a private GitHub repository or pushing. M1a must stop for design selection; do not treat milestone approval as selection of a visual direction or authorization to publish.
