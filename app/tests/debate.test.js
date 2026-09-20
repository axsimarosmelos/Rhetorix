import test from "node:test";
import assert from "node:assert/strict";
import { buildDebatePrompt, getDebateReply } from "../src/lib/debate.js";
const config = {
  topic: "Test the claim.",
  stance: "Defend",
  framework: "PREP",
  targets: ["credible", "tenable", "persuasive"],
};
test("adapter prompt includes the position, framework, vocabulary, and grounded opponent behavior", () => {
  const p = buildDebatePrompt(config);
  assert.ok(p.includes("PREP"));
  assert.ok(p.includes("credible, tenable, persuasive"));
  assert.ok(p.includes("Do not invent sources"));
});
test("API hook sends the contract and accepts a bounded reply", async () => {
  const previous = global.fetch;
  let request;
  global.fetch = async (url, init) => {
    request = { url, body: JSON.parse(init.body) };
    return {
      ok: true,
      json: async () => ({ reply: "What evidence supports this?" }),
    };
  };
  try {
    const reply = await getDebateReply({
      messages: [{ role: "user", content: "My opening." }],
      config,
      settings: { mode: "api", endpoint: "/api/debate" },
    });
    assert.equal(reply, "What evidence supports this?");
    assert.equal(request.url, "/api/debate");
    assert.equal(request.body.messages[0].content, "My opening.");
  } finally {
    global.fetch = previous;
  }
});
test("API hook rejects invalid responses and off-origin endpoints", async () => {
  const previous = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ text: "wrong field" }),
  });
  try {
    await assert.rejects(
      getDebateReply({
        messages: [],
        config,
        settings: { mode: "api", endpoint: "/api/debate" },
      }),
      /reply/,
    );
    await assert.rejects(
      getDebateReply({
        messages: [],
        config,
        settings: { mode: "api", endpoint: "//external.test" },
      }),
      /same-origin/,
    );
  } finally {
    global.fetch = previous;
  }
});
