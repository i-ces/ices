import { beforeAll, afterAll, describe, expect, it } from "vitest";
process.env.NODE_ENV = "test";
import { createServer } from "node:http";
import { start } from "./index.js";

let dummy: any;
let apiServer: any;

beforeAll(async () => {
  process.env.MONGODB_URI = "disabled";
  // Occupy port 6000 intentionally
  dummy = createServer((_, res) => res.end("dummy"));
  await new Promise<void>((resolve) => dummy.listen(6000, resolve));
  const started = await start({ port: 6000, retries: 3 });
  apiServer = started.server;
  expect(started.port).not.toBe(6000); // should have picked a new port
});

describe("port fallback", () => {
  it("moves to next free port when initial is busy", () => {
    expect(true).toBe(true); // assertion already in beforeAll
  });
});

afterAll(async () => {
  if (dummy) await new Promise((r) => dummy.close(r));
  if (apiServer) await new Promise((r) => apiServer.close(r));
});