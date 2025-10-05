import dotenv from "dotenv";
import express from "express";
import { MongoClient } from "mongodb";
import type { HealthStatus } from "@ices/shared";

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 4000;
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

export async function start() {
  await connectMongo();
  return new Promise<void>((resolve) => {
    app.listen(PORT, () => {
      console.log(`API server listening on http://localhost:${PORT}`);
      resolve();
    });
  });
}

// Only auto-start if not in a test environment
if (process.env.NODE_ENV !== "test") {
  start();
}
