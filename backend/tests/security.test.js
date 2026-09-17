import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";

// No real project keys or network services are used by this suite.
process.env.SUPABASE_URL = "https://recipe-test.invalid";
process.env.SUPABASE_ANON_KEY = "test-anon";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service";
process.env.SUPER_ADMIN_ID = "root";
process.env.NODE_ENV = "test";
const nativeFetch = globalThis.fetch;
let calls = [], recipes, users, favorites, failStorage = false;
const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
  status, headers: { "Content-Type": "application/json", ...headers },
});
globalThis.fetch = async (input, options = {}) => {
  const url = new URL(input);
  assert.equal(url.origin, "https://recipe-test.invalid", "Unexpected outbound request");
  const headers = new Headers(options.headers);
  const token = headers.get("authorization")?.replace("Bearer ", "");
  const method = options.method || "GET";
  const body = options.body ? JSON.parse(options.body) : null;
  calls.push({ url, method, body, token });
  if (url.pathname === "/auth/v1/token") {
    const id = body.email.split("@")[0];
    await new Promise(resolve => setTimeout(resolve, id === "alice" ? 5 : 1));
    return json({ access_token: id, refresh_token: id + "-refresh", expires_in: 3600, token_type: "bearer", user: { id, email: body.email } });
  }
  if (url.pathname === "/auth/v1/user") {
    if (!users[token]) return json({ message: "Invalid token" }, 401);
    return json({ id: token, email: token + "@example.test" });
  }
  if (url.pathname === "/auth/v1/logout") return new Response(null, { status: 204 });
  if (url.pathname.startsWith("/storage/v1/object/")) {
    return failStorage ? json({ message: "Storage unavailable" }, 500) : json([]);
  }
  if (url.pathname.startsWith("/rest/v1/")) {
    assert.equal(token, "test-service", "User session contaminated admin client");
    const table = url.pathname.split("/").pop();
    const id = url.searchParams.get("id")?.replace(/^eq\./, "");
    if (method === "PATCH") return json(table === "users" ? { ...users[id], ...body } : { ...recipes[id], ...body });
    if (method === "DELETE") return new Response(null, { status: 204 });
    if (table === "users") return json(users[id] || null);
    if (table === "recipes") {
      if (id) return json(recipes[id] || null);
      return json(Object.values(recipes), 200, { "content-range": "0-1/2" });
    }
    if (table === "favorites") return json(favorites, 200, { "content-range": "0-0/0" });
    if (table === "follows") return json({ id: "follow" });
    return json([], 200, { "content-range": "0-0/0" });
  }
  throw new Error("Unhandled mock route " + url.pathname);
};
const { default: app } = await import("../src/app.js");
const { sanitizeInput } = await import("../src/middlewares/validators.js");
const { getPagination } = await import("../src/middlewares/pagination.js");
const { getStoragePath } = await import("../src/config/storage.js");
const { isImageBuffer } = await import("../src/middlewares/multer.js");
let server, base;
before(async () => {
  server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  base = "http://127.0.0.1:" + server.address().port;
});
after(async () => {
  await new Promise(resolve => server.close(resolve));
  globalThis.fetch = nativeFetch;
});
beforeEach(() => {
  calls = []; failStorage = false; favorites = [];
  users = Object.fromEntries(["alice", "bob", "admin", "root", "banned"].map(id => [id, {
    id, role: ["admin", "root"].includes(id) ? "admin" : "user", is_banned: id === "banned",
    avatar_url: "https://recipe-test.invalid/storage/v1/object/public/avatar/" + id + "/avatar.png",
  }]));
  recipes = {
    private: { id: "private", user_id: "alice", visibility: "private", status: "pending", content: "<h3>Steps</h3><img src=x onerror=alert(1)>", image_url: "https://recipe-test.invalid/storage/v1/object/public/recipes/alice/food.png" },
    public: { id: "public", user_id: "alice", visibility: "public", status: "approved", content: "<p>Safe</p><svg onload=alert(1)></svg>" },
  };
});
const request = (path, token, method = "GET", body) => nativeFetch(base + path, {
  method, headers: { ...(token ? { Authorization: "Bearer " + token } : {}), ...(body ? { "Content-Type": "application/json" } : {}) },
  ...(body ? { body: JSON.stringify(body) } : {}),
});

test("private recipes and their comments/reactions are hidden from guests and other users", async () => {
  for (const path of ["/api/recipes/detail-recipe/private", "/api/comments/private", "/api/reaction/private"]) {
    for (const token of [undefined, "bob"]) assert.equal((await request(path, token)).status, 404);
  }
  for (const [path, method, body] of [
    ["/api/comments/private", "POST", { content: "hello" }],
    ["/api/reaction/private", "POST", { reaction: "like" }],
    ["/api/recipes/bookmark/private", "PUT", {}],
  ]) assert.equal((await request(path, "bob", method, body)).status, 404);
  assert.equal(calls.some(call => call.method === "POST"), false);
});
test("owners/admins can read drafts; public and pending HTML is sanitized on read", async () => {
  for (const token of ["alice", "admin"]) {
    const response = await request("/api/recipes/detail-recipe/private", token);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).data.content, "<h3>Steps</h3>");
  }
  const response = await request("/api/recipes/detail-recipe/public");
  assert.equal((await response.json()).data.content, "<p>Safe</p>");
  const pending = await request("/api/recipes/admin/list-pending", "admin");
  assert.equal(pending.status, 200);
  for (const recipe of (await pending.json()).data) assert.doesNotMatch(recipe.content, /onerror|onload/);
});
test("banned users cannot regain draft access through optional authentication", async () => {
  assert.equal((await request("/api/recipes/detail-recipe/private", "banned")).status, 403);
});
test("favorites omit other owners' private recipes", async () => {
  favorites = [{ recipe: recipes.private }, { recipe: recipes.public }];
  const response = await request("/api/recipes/favorite", "bob");
  assert.deepEqual((await response.json()).data.map(item => item.id), ["public"]);
});
test("admin update cannot bypass super-admin role or account protections", async () => {
  for (const [target, body] of [["bob", { role: "admin" }], ["root", { is_banned: true }], ["admin", { is_banned: true }]]) {
    assert.equal((await request("/api/user/admin/updateuser/" + target, "admin", "PUT", body)).status, 403);
  }
  assert.equal((await request("/api/user/admin/delete/root", "admin", "DELETE")).status, 403);
  assert.equal((await request("/api/user/delete", "root", "DELETE")).status, 403);
  assert.equal((await request("/api/auth/ban/root", "admin", "PATCH", {})).status, 403);
  assert.equal(calls.some(call => ["PATCH", "DELETE"].includes(call.method)), false);
  assert.equal((await request("/api/user/admin/updateuser/bob", "root", "PUT", { role: "admin" })).status, 200);
  assert.equal((await request("/api/user/admin/updateuser/bob", "admin", "PUT", { role: "superadmin" })).status, 400);
});
test("concurrent logins and password changes leave admin queries isolated", async () => {
  const responses = await Promise.all(["alice", "bob"].map(id => request("/api/auth/login", undefined, "POST", { email: id + "@example.test", password: "secret123" })));
  for (const response of responses) assert.equal(response.status, 200);
  const changed = await Promise.all(["alice", "bob"].map(id => request("/api/user/change-password", id, "PATCH", { oldPassword: "secret123", newPassword: "new-secret123", confirmNewPassword: "new-secret123" })));
  for (const response of changed) assert.equal(response.status, 200);
  const updates = calls.filter(call => call.url.pathname === "/auth/v1/user" && call.method === "PUT");
  assert.deepEqual(updates.map(call => call.token).sort(), ["alice", "bob"]);
  assert.equal((await request("/api/recipes/detail-recipe/public")).status, 200);
});
test("logout revokes the requesting session and banned login returns 403", async () => {
  assert.equal((await request("/api/auth/logout", "alice", "POST", {})).status, 200);
  assert.equal(calls.find(call => call.url.pathname === "/auth/v1/logout").token, "alice");
  assert.equal((await request("/api/auth/login", undefined, "POST", { email: "banned@example.test", password: "secret123" })).status, 403);
});
test("edits to public recipes return to moderation", async () => {
  const response = await request("/api/recipes/update/public", "alice", "PUT", { content: "<p>Updated recipe</p>" });
  assert.equal(response.status, 200);
  const update = calls.find(call => call.url.pathname === "/rest/v1/recipes" && call.method === "PATCH");
  assert.equal(update.body.visibility, "private");
  assert.equal(update.body.status, "pending");
  assert.equal(update.body.is_public_request, true);
});
test("image removal uses the actual owner path and avatar bucket", async () => {
  assert.equal((await request("/api/recipes/private/image", "admin", "DELETE")).status, 200);
  assert.equal((await request("/api/user/avatar", "alice", "DELETE")).status, 200);
  const removals = calls.filter(call => call.url.pathname.startsWith("/storage/"));
  assert.deepEqual(removals.map(call => [call.url.pathname, call.body.prefixes]), [
    ["/storage/v1/object/recipes", ["alice/food.png"]],
    ["/storage/v1/object/avatar", ["alice/avatar.png"]],
  ]);
});
test("storage failures are reported without clearing the database image URL", async () => {
  failStorage = true;
  assert.equal((await request("/api/recipes/private/image", "alice", "DELETE")).status, 500);
  assert.equal(calls.some(call => call.method === "PATCH"), false);
});
test("notifications support bodyless mark/read and delete requests", async () => {
  assert.equal((await request("/api/notifications", "alice", "PUT")).status, 200);
  assert.equal((await request("/api/notifications", "alice", "DELETE")).status, 200);
});
test("HTML allowlist removes event handlers, SVG, scripts and encoded protocols", () => {
  for (const value of ["<img src=x onerror=alert(1)>", "<svg onload='alert(1)'/>", "<script>alert(1)</script>", '<a href="java&#115;cript:alert(1)" onclick=alert(1)>link</a>']) {
    assert.doesNotMatch(sanitizeInput(value), /<img|<svg|<script|href=|onload|onclick|onerror/);
  }
  assert.equal(sanitizeInput("<h3>Nguyên liệu</h3><ul><li>2 trứng</li></ul>"), "<h3>Nguyên liệu</h3><ul><li>2 trứng</li></ul>");
  assert.equal(sanitizeInput({}), "");
});
test("pagination and storage paths reject unsafe inputs", () => {
  assert.deepEqual(getPagination(-2, -10), { from: 0, to: 9, currentPage: 1, pageSize: 10 });
  assert.equal(getPagination(1, 1000000).pageSize, 100);
  assert.throws(() => getStoragePath("https://attacker.test/storage/v1/object/public/avatar/alice/a.png", "avatar", "alice"));
  assert.throws(() => getStoragePath("https://recipe-test.invalid/storage/v1/object/public/avatar/bob/a.png", "avatar", "alice"));
});
test("uploads reject HTML disguised as an image", async () => {
  assert.equal(isImageBuffer(Buffer.from("<script>alert(1)</script>"), "image/png"), false);
  const data = new FormData();
  data.append("image", new Blob(["<script>alert(1)</script>"], { type: "image/png" }), "fake.png");
  const response = await nativeFetch(base + "/api/user/update", { method: "PUT", headers: { Authorization: "Bearer alice" }, body: data });
  assert.equal(response.status, 400);
});
