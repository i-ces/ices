// Shared placeholder types & utilities

export interface HealthStatus {
  status: string;
  mongo: "connected" | "disconnected" | "disabled";
}

export const PROJECT_NAME = "i-CES";
