import { test } from "node:test";
import assert from "node:assert/strict";
import {
  currentRatings,
  improved,
  type Assessment,
} from "../features/progress/model.ts";
const event = (sequence: number, status: Assessment["status"]): Assessment => ({
  id: String(sequence),
  sequence,
  status,
  skill_id: "br-side",
  swimmer_id: "child",
  update_id: "update",
  observation: "",
  target: "",
  created_at: `2026-10-${String(sequence).padStart(2, "0")}T12:00:00Z`,
});
test("a later reset retains history but removes the current rating", () => {
  const events = [event(1, "pass"), event(2, null)];
  assert.equal(currentRatings(events).get("br-side")?.status, null);
  assert.equal(events.length, 2);
});
test("sequence resolves same-day observations without random ID ordering", () => {
  assert.equal(
    currentRatings([event(3, "fair"), event(1, "pass")]).get("br-side")?.status,
    "fair",
  );
});
test("Not Assessed is not zero ability and Good is not Pass", () => {
  assert.equal(improved(null, "good"), false);
  assert.equal(improved("fair", "good"), true);
  assert.equal(improved("pass", "good"), false);
});
test("historical cutoff compares the actual selected date", () => {
  assert.equal(
    currentRatings(
      [event(1, "fair"), event(3, "good")],
      new Date("2026-10-02").getTime(),
    ).get("br-side")?.status,
    "fair",
  );
});
