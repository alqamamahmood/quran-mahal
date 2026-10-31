import { describe, expect, it } from "vitest";
import { slugify, formatDuration, youtubeId } from "@/lib/utils";
import { rolesGrantAccess } from "@/lib/auth/roles";

describe("slugify", () => {
  it("creates url-safe slugs", () => {
    expect(slugify("Seerat-un-Nabi Introduction")).toBe("seerat-un-nabi-introduction");
  });
  it("handles empty/whitespace", () => {
    expect(slugify("   ")).toBe("");
  });
});

describe("formatDuration", () => {
  it("formats h:mm:ss and m:ss", () => {
    expect(formatDuration(3720)).toBe("1:02:00");
    expect(formatDuration(90)).toBe("1:30");
    expect(formatDuration(null)).toBe("—");
  });
});

describe("youtubeId", () => {
  it("extracts IDs from watch, short and embed URLs", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("returns null for non-youtube urls", () => {
    expect(youtubeId("https://example.com/video.mp4")).toBeNull();
    expect(youtubeId(null)).toBeNull();
  });
});

describe("rolesGrantAccess (authorization helper)", () => {
  it("grants staff/admin, denies plain users and guests", () => {
    const staff = ["editor", "content_manager", "administrator", "super_administrator"];
    expect(rolesGrantAccess(["administrator"], staff)).toBe(true);
    expect(rolesGrantAccess(["editor"], staff)).toBe(true);
    expect(rolesGrantAccess(["user"], staff)).toBe(false);
    expect(rolesGrantAccess([], staff)).toBe(false);
  });
});
