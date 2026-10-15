# Deployment preparation

Hosting is not configured. Owner chose to keep development local until accounts exist. Do not run these steps against real child data or create paid/public resources without approval.

## Local

Node 24 recommended. `npm ci`, `npm test`, `npm run lint`, `npm run build`, `npm run typecheck`. Run `npm run dev` for editing or `npm start` after a build. Both use 127.0.0.1:5175. `/demo` contains explicitly fictional records; `/app` requires Supabase configuration and a verified active account. On Windows use the npm JavaScript entrypoint if the npm shell shim is unavailable.

Run `npx playwright install chromium`, start the app, then `npm run test:browser`. In a restricted Windows environment set PLAYWRIGHT_BROWSERS_PATH to a writable project-local directory. The test suite uses embedded Postgres/PGlite; it does not require Docker but does not exercise Supabase's gateway or hosted Auth.

## Future staging setup

1. Create separate Supabase staging and production projects in the explicitly selected London region (eu-west-2), or owner-approved EU region. Do not assume a general Europe region provides UK-only residency.
2. Apply all supabase/migrations/*.sql in filename order using Supabase CLI migrations. Do not edit deployed migration history; add new forward migrations.
3. Configure Auth email OTP, verified sending domain/custom SMTP, redirect allowlist, rate limits and bot protection. Email template must show the numeric token, not just a magic link. Verify production signup policy before enabling real registration.
4. Create the owner account through Auth, then insert the organisation and its admin membership using an authorised database administration session. There is intentionally no public 'make me admin' endpoint. Assign later instructors through authorised administration.
5. Import reference skills using `psql -v organisation_id=... -f supabase/seed-library.sql`. This imports teaching content only, leaves it unapproved and does not create children. Approve criteria in-app after owner review. Do not run demonstration fixtures in production.
6. Create separate Vercel staging/production projects, framework Next.js, build `npm run build`. Supply .env.example variables independently to each project. Set APP_URL to its exact HTTPS origin. Never expose service credentials through NEXT_PUBLIC variables.
7. Keep staging access restricted. Test two parents, an assigned instructor, an unrelated instructor, an admin and a disabled account. Verify RLS through REST as well as SQL, cookie refresh, logout, invite expiry/replay and explicit publishing.
8. Configure the domain only after launch approval. HTTPS, correct DNS and secure cookies are required. Check staging/production Auth redirect allowlists separately. No wildcard production redirects.

## Environment

APP_URL: exact browser origin; write requests fail closed if missing/mismatched.
NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: project public identifiers, protected by RLS.
SUPABASE_SERVICE_ROLE_KEY: server-only privileged jobs; never browser or ordinary data reads.
STRIPE_*: unused/deferred commercial extension. Leave unset. Checkout remains disabled.
RESEND_API_KEY / EMAIL_FROM: reserved for future delivery integration; not active yet.
SENTRY_DSN: reserved; monitoring integration and scrubbing remain to be implemented/tested.

## Provider assessment checked 13 October 2026

Supabase supports [London eu-west-2](https://supabase.com/docs/guides/platform/regions). [Pro pricing](https://supabase.com/pricing) includes daily backups retained seven days; free projects have no automatic backups and can pause. [Supabase DPA](https://supabase.com/legal/customer-resources/data-processing-addendum) and [residency FAQ](https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq) need owner/adviser review; region alone does not guarantee all processing stays there.

Vercel's [Hobby plan](https://vercel.com/docs/plans/hobby) is non-commercial. Configure a commercial plan and review [Vercel DPA](https://vercel.com/legal/dpa); a London compute region does not confine every CDN/control-plane operation to the UK.

Resend offers [Ireland sending](https://www.resend.com/changelog/multi-region-for-everyone), but its [DPA](https://resend.com/legal/dpa) describes US processing/transfers. Treat this as a legal-review item rather than a UK-only email guarantee. Pricing decisions are deferred by the owner.

## Legacy migration

No production data currently exist in the redesign. Original front-crawl IDs br-alignment, br-return and co-armleg were changed in the prior redesign. Do not infer automatic mappings for br-timing, co-arms-legs or co-breathing. Preserve raw history and obtain explicit mapping approval before any future import. Never import the original reference demo's fictional people into production.
