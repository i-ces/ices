import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app, start } from "./index.js";

beforeAll(async () => {
  process.env.MONGODB_URI = "disabled"; // ensure test doesn't try real connection
  await start();
});

describe("GET /health", () => {
  it("returns ok status", async () => {
    const res = await request(app).get("/health").expect(200);
    expect(res.body.status).toBe("ok");
    expect(["connected", "disconnected", "disabled"]).toContain(res.body.mongo);
  });
});
