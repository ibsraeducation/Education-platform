import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips special characters", () => {
    expect(slugify("Math 101: Intro!")).toBe("math-101-intro");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("a   b___c")).toBe("a-b-c");
  });

  it("returns article for empty-after-strip input", () => {
    expect(slugify("!!!")).toBe("article");
  });

  it("truncates to 80 chars", () => {
    const long = "a".repeat(100);
    expect(slugify(long).length).toBe(80);
  });
});
