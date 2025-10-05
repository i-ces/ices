import dotenv from "dotenv";
import express from "express";
import { MongoClient } from "mongodb";
import type { HealthStatus } from "@ices/shared";
import type { Server } from "node:http";

dotenv.config();

export const app = express();
const BASE_PORT = parseInt(process.env.PORT || "4000", 10);
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ices";

let client: MongoClient | null = null;

async function connectMongo() {
  // uri always has a fallback value; still allow opt-out by setting MONGODB_URI="disabled"
  if (uri === "disabled") {
    console.warn("MongoDB disabled via MONGODB_URI=disabled");
    return;
  }
  try {
    client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

app.get("/health", (_req, res) => {
  const payload: HealthStatus = {
    status: "ok",
    mongo: client ? "connected" : uri === "disabled" ? "disabled" : "disconnected",
  };
  res.json(payload);
});

interface StartOptions {
  port?: number;
  retries?: number; // number of additional ports to try if occupied
}

async function listenWithRetry(port: number, retries: number): Promise<{ server: Server; port: number }> {
  return new Promise((resolve) => {
    const attempt = (p: number, remaining: number) => {
      const server = app
        .listen(p, () => {
          console.log(`API server listening on http://localhost:${p}`);
          resolve({ server, port: p });
        })
        .on("error", (err: any) => {
          if (err.code === "EADDRINUSE" && remaining > 0) {
            console.warn(`Port ${p} in use, retrying on ${p + 1} (${remaining - 1} retries left)`);
            attempt(p + 1, remaining - 1);
          } else {
            console.error("Failed to bind server:", err);
            // still resolve to allow tests to handle failure
            resolve({ server: server as unknown as Server, port: p });
          }
        });
    };
    attempt(port, retries);
  });
}

export async function start(options: StartOptions = {}) {
  await connectMongo();
  const desired = options.port ?? BASE_PORT;
  const retries = options.retries ?? 5;
  return listenWithRetry(desired, retries);
}

// Only auto-start if not in a test environment
if (process.env.NODE_ENV !== "test") {
  void start();
}
