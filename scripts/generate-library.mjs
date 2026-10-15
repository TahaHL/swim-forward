import {SKILLS} from '../features/skills/original.ts';
import {writeFile} from 'node:fs/promises';
const sql=s=>"'"+String(s).replaceAll("'","''")+"'";
const rows=SKILLS.map(s=>`(:'organisation_id'::uuid,${sql(s.id)},'front_crawl',${sql(s.categoryId)},${sql(s.name)},${sql(s.whyItMatters)},${sql(JSON.stringify(s.successCriteria))}::jsonb)`);
await writeFile('supabase/seed-library.sql',`-- Reference content only; no people or assessments. Owner must approve criteria in-app.\n-- psql -v organisation_id=YOUR_ORGANISATION_UUID -f supabase/seed-library.sql\ninsert into public.skills(organisation_id,legacy_id,stroke,category,title,explanation,criteria) values\n${rows.join(',\n')}\non conflict(organisation_id,legacy_id) do nothing;\n`);
