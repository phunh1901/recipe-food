import { test } from "node:test";
import assert from "node:assert/strict";
import { configureAuthInterceptors } from "../src/api/authInterceptors.js";
import { escapeHtml } from "../src/utils/recipeContent.js";

const fixture = () => {
  const handlers = {}, calls = { retried: [], refresh: 0, logout: 0 };
  const client = async config => { calls.retried.push(config); return { ok: true }; };
  client.interceptors = {
    request: { use: fn => { handlers.request = fn; } },
    response: { use: (success, failure) => { handlers.success = success; handlers.failure = failure; } },
  };
  const auth = {
    getSession: async () => ({ data: { session: { access_token: "current" } } }),
    refreshSession: async () => { calls.refresh++; await new Promise(resolve => setTimeout(resolve, 5)); return { data: { session: { access_token: "refreshed" } }, error: null }; },
    signOut: async () => { calls.logout++; },
  };
  configureAuthInterceptors(client, auth);
  return { handlers, calls, auth };
};
const unauthorized = (url = "/user/myProfile") => ({
  config: { url, headers: {} }, response: { status: 401, data: { message: "Unauthorized" } },
});
test("requests use the current SDK token and remove stale credentials after sign-out", async () => {
  const { handlers, auth } = fixture();
  const config = { url: "/recipes/my-recipes", headers: { Authorization: "Bearer stale" } };
  assert.equal((await handlers.request(config)).headers.Authorization, "Bearer current");
  auth.getSession = async () => ({ data: { session: null } });
  assert.equal((await handlers.request(config)).headers.Authorization, undefined);
});
test("simultaneous 401 responses share one refresh and retry with the new token", async () => {
  const { handlers, calls } = fixture();
  await Promise.all([handlers.failure(unauthorized()), handlers.failure(unauthorized())]);
  assert.equal(calls.refresh, 1);
  assert.equal(calls.retried.length, 2);
  assert.ok(calls.retried.every(config => config.headers.Authorization === "Bearer refreshed"));
});
test("a failed retry does not loop and clears the expired session", async () => {
  const { handlers, calls } = fixture();
  const error = unauthorized();
  error.config._retried = true;
  await assert.rejects(handlers.failure(error));
  assert.equal(calls.refresh, 0);
  assert.equal(calls.logout, 1);
});
test("invalid login credentials do not refresh or sign out another session", async () => {
  const { handlers, calls } = fixture();
  await assert.rejects(handlers.failure(unauthorized("/auth/login")));
  assert.equal(calls.refresh, 0);
  assert.equal(calls.logout, 0);
});
test("refresh outages preserve the session; invalid refresh credentials clear it", async () => {
  const { handlers, calls, auth } = fixture();
  auth.refreshSession = async () => ({ data: { session: null }, error: { status: 503 } });
  await assert.rejects(handlers.failure(unauthorized()));
  assert.equal(calls.logout, 0);
  auth.refreshSession = async () => ({ data: { session: null }, error: { status: 400 } });
  await assert.rejects(handlers.failure(unauthorized()));
  assert.equal(calls.logout, 1);
});
test("ingredient text is escaped without changing its displayed meaning", () => {
  assert.equal(escapeHtml('2 < 3 & "oil"'), "2 &lt; 3 &amp; &quot;oil&quot;");
  assert.equal(escapeHtml("<img src=x onerror=alert(1)>"), "&lt;img src=x onerror=alert(1)&gt;");
});
