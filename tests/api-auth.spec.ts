import { test, expect } from "@playwright/test";

const REGISTER_URL = "/api/auth/register";
const LOGIN_URL = "/api/auth/login";

// Use a unique email per test run to avoid conflicts across retries
const timestamp = Date.now();
const testUser = {
  email: `testuser-${timestamp}@example.com`,
  username: `testuser${timestamp}`,
  password: "SecurePass123!",
};

test.describe("POST /api/auth/register", () => {
  test("creates a new user", async ({ request }) => {
    const res = await request.post(REGISTER_URL, { data: testUser });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.user.email).toBe(testUser.email);
    expect(body.user.username).toBe(testUser.username);
  });

  test("rejects duplicate email/username", async ({ request }) => {
    // Register once
    await request.post(REGISTER_URL, { data: testUser });
    // Try again with same credentials
    const res = await request.post(REGISTER_URL, { data: testUser });
    expect(res.status()).toBe(409);
  });

  test("rejects missing fields", async ({ request }) => {
    const res = await request.post(REGISTER_URL, {
      data: { email: "incomplete@example.com" },
    });
    expect(res.status()).toBe(400);
  });

  test("rejects short password", async ({ request }) => {
    const res = await request.post(REGISTER_URL, {
      data: {
        email: `short-${timestamp}@example.com`,
        username: `short${timestamp}`,
        password: "abc",
      },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("POST /api/auth/login", () => {
  test.beforeAll(async ({ request }) => {
    // Ensure the test user exists
    await request.post(REGISTER_URL, { data: testUser });
  });

  test("logs in with valid credentials", async ({ request }) => {
    const res = await request.post(LOGIN_URL, {
      data: { email: testUser.email, password: testUser.password },
    });
    expect(res.status()).toBe(200);
    const headers = res.headers();
    expect(headers["set-cookie"]).toMatch(/token=/);
  });

  test("rejects wrong password", async ({ request }) => {
    const res = await request.post(LOGIN_URL, {
      data: { email: testUser.email, password: "WrongPassword!" },
    });
    expect(res.status()).toBe(401);
  });

  test("rejects unknown email", async ({ request }) => {
    const res = await request.post(LOGIN_URL, {
      data: { email: "ghost@example.com", password: "whatever123" },
    });
    expect(res.status()).toBe(401);
  });

  test("rejects missing fields", async ({ request }) => {
    const res = await request.post(LOGIN_URL, {
      data: { email: testUser.email },
    });
    expect(res.status()).toBe(400);
  });
});
