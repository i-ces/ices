import { beforeAll, afterAll, describe, expect, it } from "vitest";
process.env.NODE_ENV = "test";
import request from "supertest";
import { app, start } from "./index.js";

let server: any;
beforeAll(async () => {
  process.env.MONGODB_URI = "disabled"; // ensure test doesn't try real connection
  const started = await start({ port: 4990, retries: 2 });
  server = started.server;
});

// Ensure server closed after tests
afterAll(async () => {
  if (server && server.close) {
    await new Promise((r) => server.close(r));
  }
});

describe("GET /health", () => {
  it("returns ok status", async () => {
    const res = await request(app).get("/health").expect(200);
    expect(res.body.status).toBe("ok");
    expect(["connected", "disconnected", "disabled"]).toContain(res.body.mongo);
  });
});
