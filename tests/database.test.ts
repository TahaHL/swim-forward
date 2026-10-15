import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("Postgres RLS, transactional publishing, disabled identities and capacity reservations", async (t) => {
  const db = new PGlite();
  await db.exec(`create schema auth; create role anon; create role authenticated; create role service_role;
 create table auth.users(id uuid primary key,email text);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema public,auth to authenticated; grant execute on function auth.uid() to authenticated;`);
  for (const file of (
    await readdir(new URL("../supabase/migrations/", import.meta.url))
  ).sort())
    await db.exec(
      await readFile(
        new URL("../supabase/migrations/" + file, import.meta.url),
        "utf8",
      ),
    );
  const ids = Array.from(
    { length: 18 },
    (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  );
  const [
    admin,
    coach,
    parent,
    other,
    disabled,
    org,
    venue,
    programme,
    block,
    session,
    swimmer,
    second,
    skill,
    otherBlock,
  ] = ids;
  await db.exec(`insert into auth.users(id,email) values('${admin}','admin@example.test'),('${coach}','coach@example.test'),('${parent}','parent@example.test'),('${other}','other@example.test'),('${disabled}','disabled@example.test');
 insert into organisations(id,name) values('${org}','Test only');
 insert into memberships values('${org}','${admin}','admin'),('${org}','${coach}','instructor');
 insert into venues(id,organisation_id,name) values('${venue}','${org}','Fictional pool');
 insert into programmes(id,organisation_id,name) values('${programme}','${org}','Fictional coaching');
 insert into blocks(id,organisation_id,programme_id,venue_id,name,format,capacity,price_pence,starts_on,ends_on,bookable)
 values('${block}','${org}','${programme}','${venue}','Block','small_group',1,1000,current_date+1,current_date+42,true),
 ('${otherBlock}','${org}','${programme}','${venue}','Unassigned block','small_group',1,1000,current_date+1,current_date+42,true);
 insert into sessions(id,block_id,week,starts_at,ends_at) values('${session}','${block}',1,now(),now()+interval '30 minutes');
 insert into block_instructors values('${block}','${coach}');
 insert into swimmers(id,organisation_id,first_name,last_name,birth_year) values('${swimmer}','${org}','Child','A',2018),('${second}','${org}','Child','B',2018);
 insert into parent_swimmers values('${swimmer}','${parent}',now()),('${second}','${other}',now()),('${swimmer}','${disabled}',now());
 insert into enrolments values('${block}','${swimmer}');
 insert into skills(id,organisation_id,legacy_id,stroke,category,title,approved_at) values('${skill}','${org}','br-side','front_crawl','breathing','Side breathing',now());
 insert into swimmer_skills values('${swimmer}','${skill}','');
 update profiles set disabled_at=now() where id='${disabled}';`);
  const as = async (id: string) => {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
    await db.exec("set role authenticated");
  };
  const count = async (table: string) =>
    Number(
      (
        await db.query<{ n: number }>(
          `select count(*)::integer n from ${table}`,
        )
      ).rows[0].n,
    );
  await t.test("all application tables have RLS", async () => {
    const rows = await db.query<{ relname: string }>(
      "select relname from pg_class join pg_namespace n on n.oid=relnamespace where n.nspname='public' and relkind='r' and not relrowsecurity",
    );
    assert.equal(rows.rows.length, 0);
  });
  await t.test(
    "parent only reads linked child, cannot insert assessments or escalate membership",
    async () => {
      await as(parent);
      assert.equal(await count("swimmers"), 1);
      assert.equal(
        (await db.query("select * from swimmers where id=$1", [second])).rows
          .length,
        0,
      );
      await assert.rejects(
        db.query("insert into memberships values($1,$2,'admin')", [
          org,
          parent,
        ]),
      );
      await assert.rejects(
        db
          .query(
            "update swimmers set first_name='Changed' where id=$1 returning id",
            [swimmer],
          )
          .then((r) => {
            assert.equal(r.rows.length, 1);
          }),
      );
      await assert.rejects(
        db.query(
          "insert into assessments(update_id,swimmer_id,skill_id,author_id,criteria_snapshot) values($1,$2,$3,$4,'[]')",
          [ids[14], swimmer, skill, parent],
        ),
      );
    },
  );
  await t.test(
    "instructor has only assigned children and cannot teach unrelated block",
    async () => {
      await as(coach);
      assert.equal(await count("swimmers"), 1);
      assert.equal(
        (
          await db.query<{ ok: boolean }>("select teaches_block($1) ok", [
            otherBlock,
          ])
        ).rows[0].ok,
        false,
      );
    },
  );
  const publish = async (status: string | null, request = ids[14]) =>
    db.query("select publish_update($1,$2,$3,$4,$5::jsonb,$6,$7) id", [
      swimmer,
      session,
      "A fictional update",
      "A steady kick",
      JSON.stringify([
        {
          skill_id: skill,
          status,
          observation: "Visible feedback",
          target: "Next target",
        },
      ]),
      "Private teacher note",
      request,
    ]);
  await t.test("publication is explicit, atomic and idempotent", async () => {
    await as(coach);
    await publish("good");
    await publish("good");
    assert.equal(await count("assessments"), 1);
    assert.equal(await count("updates"), 1);
    await assert.rejects(publish("pass", ids[15]));
    assert.equal(await count("assessments"), 1);
  });
  await t.test(
    "parent sees feedback and notification but never internal note/audit",
    async () => {
      await as(parent);
      assert.equal(await count("updates"), 1);
      assert.equal(await count("notifications"), 1);
      assert.equal(await count("internal_notes"), 0);
      assert.equal(await count("audit_logs"), 0);
      await assert.rejects(publish("pass"));
    },
  );
  await t.test("stranger sees no assessment or notes", async () => {
    await as(other);
    assert.equal(await count("assessments"), 0);
    assert.equal(await count("internal_notes"), 0);
    assert.equal(await count("updates"), 0);
  });
  await t.test(
    "disabled parent cannot access records with an existing identity",
    async () => {
      await as(disabled);
      assert.equal(await count("swimmers"), 0);
      assert.equal(await count("assessments"), 0);
      await assert.rejects(
        db.query("select reserve_booking($1,$2)", [block, swimmer]),
      );
    },
  );
  await t.test(
    "deferred pricing prevents checkout reservations for every parent",
    async () => {
      await as(parent);
      await assert.rejects(
        db.query("select reserve_booking($1,$2)", [block, swimmer]),
      );
      assert.equal(await count("bookings"), 0);
      await as(other);
      await assert.rejects(
        db.query("select reserve_booking($1,$2)", [block, second]),
      );
    },
  );
  await t.test(
    "invitation is email-bound, single-use and revocable",
    async () => {
      const hash = "a".repeat(64);
      await as(admin);
      await db.query("select invite_parent($1,$2,$3)", [
        second,
        "parent@example.test",
        hash,
      ]);
      await as(other);
      await assert.rejects(db.query("select accept_invitation($1)", [hash]));
      await as(parent);
      await db.query("select accept_invitation($1)", [hash]);
      assert.equal(await count("swimmers"), 2);
      await assert.rejects(db.query("select accept_invitation($1)", [hash]));
      await as(admin);
      await db.query("select manage_record($1,$2,$3::jsonb)", [
        "revoke_parent",
        second,
        JSON.stringify({ parent_id: parent }),
      ]);
      await as(parent);
      assert.equal(await count("swimmers"), 1);
    },
  );
  await t.test(
    "skill approval is restricted to the operation administrator",
    async () => {
      await as(parent);
      await assert.rejects(
        db.query("select manage_record($1,$2,$3::jsonb)", [
          "approve_skill",
          skill,
          "{}",
        ]),
      );
      await as(coach);
      await assert.rejects(
        db.query("select manage_record($1,$2,$3::jsonb)", [
          "approve_skill",
          skill,
          "{}",
        ]),
      );
    },
  );
  await db.close();
});
