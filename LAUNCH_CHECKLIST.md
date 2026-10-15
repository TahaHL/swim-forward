# Launch checklist

## Owner actions / legal advice — agent must not attempt

- [ ] Written employer consent for outside business.
- [ ] Legal advice on employment IP and restrictive clauses.
- [ ] ICO data protection fee check.
- [ ] Data protection impact assessment.
- [ ] Solicitor review of privacy notice, terms and consent language.
- [ ] Insurance, safeguarding policy and venue agreement.
- [ ] Approved teaching criteria and rating descriptions.
- [ ] Provider accounts, region/DPA decisions and operational budget.
- [ ] Real-parent invitations sent by owner only after all launch gates.

## Engineering gates

- [x] Local database authorisation tests for parent isolation, assigned instructors, internal notes and disabled identities.
- [x] Local publication/history and invitation tests.
- [x] Pricing and checkout explicitly deferred and blocked.
- [ ] Repeat through real Supabase Auth and REST in staging.
- [ ] Complete remaining non-commercial features listed in docs/LOCAL_STATUS.md.
- [ ] Test email delivery/retry, deletion, retention and access revocation in staging.
- [ ] Managed backup/restore drill with recorded evidence.
- [ ] Full security/accessibility review and performance/device checks.
- [ ] Monitoring with verified personal-data scrubbing.
- [ ] Separate empty production environment, verified configuration and recovery plan.
