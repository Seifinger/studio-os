import { describe, expect, it } from "vitest";

import { isLoopbackHost } from "./local-only";

describe("isLoopbackHost", () => {
  it.each(["localhost", "localhost:3000", "127.0.0.1", "127.0.0.1:3100", "[::1]:3000", " LOCALHOST "])("erkennt %j als lokal", (host) => {
    expect(isLoopbackHost(host)).toBe(true);
  });

  it.each([null, "", "studio.example", "localhost.studio.example", "127.0.0.1.nip.io", "10.0.0.1", "[::2]"])("lehnt %j ab", (host) => {
    expect(isLoopbackHost(host)).toBe(false);
  });
});
