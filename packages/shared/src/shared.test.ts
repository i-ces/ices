import { describe, it, expect } from "vitest";
import { PROJECT_NAME } from "./index";

describe("shared constants", () => {
  it("PROJECT_NAME matches expected", () => {
    expect(PROJECT_NAME).toBe("i-CES");
  });
});
