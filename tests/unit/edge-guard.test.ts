import { describe, it, expect } from "vitest";
import {
  canonicalRedirect,
  isBlockedRequest,
  isLocalOrPreviewHost,
  burstLimit,
  isSearchBot,
} from "@/lib/edge-guard";

describe("isSearchBot", () => {
  it("identifies major search engine crawlers", () => {
    expect(
      isSearchBot(
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      ),
    ).toBe(true);
    expect(
      isSearchBot(
        "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/W.X.Y.Z Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      ),
    ).toBe(true);
    expect(isSearchBot("Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)")).toBe(true);
    expect(isSearchBot("DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)")).toBe(true);
    expect(isSearchBot("Applebot/0.1")).toBe(true);
    expect(isSearchBot("YandexBot/3.0")).toBe(true);
  });

  it("returns false for regular user browsers and null", () => {
    expect(
      isSearchBot(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      ),
    ).toBe(false);
    expect(isSearchBot(null)).toBe(false);
    expect(isSearchBot("")).toBe(false);
  });
});

describe("isBlockedRequest", () => {
  it("blocks scanner paths", () => {
    expect(isBlockedRequest("/wp-login.php", "GET")).toBe(true);
    expect(isBlockedRequest("/.env", "GET")).toBe(true);
    expect(isBlockedRequest("/.git/config", "GET")).toBe(true);
    expect(isBlockedRequest("/xmlrpc.php", "POST")).toBe(true);
  });

  it("blocks disallowed methods", () => {
    expect(isBlockedRequest("/", "TRACE")).toBe(true);
    expect(isBlockedRequest("/", "track")).toBe(true);
  });

  it("allows normal requests", () => {
    expect(isBlockedRequest("/fleet/swift-dzire", "GET")).toBe(false);
    expect(isBlockedRequest("/api/enquiry", "POST")).toBe(false);
  });
});

describe("isLocalOrPreviewHost", () => {
  it("recognises local and preview hosts", () => {
    expect(isLocalOrPreviewHost("localhost:3000")).toBe(true);
    expect(isLocalOrPreviewHost("127.0.0.1")).toBe(true);
    expect(isLocalOrPreviewHost("sumpreeth-git-x.vercel.app")).toBe(true);
    expect(isLocalOrPreviewHost("sumpreethtoursandtravels.com")).toBe(false);
  });
});

describe("canonicalRedirect", () => {
  const base = {
    pathname: "/fleet",
    search: "?a=1",
    canonicalHost: "sumpreethtoursandtravels.com",
    isProd: true,
  };

  it("no-ops outside production", () => {
    expect(
      canonicalRedirect({ ...base, proto: "http", host: "x.com", isProd: false }),
    ).toBeNull();
  });

  it("no-ops for local hosts", () => {
    expect(
      canonicalRedirect({ ...base, proto: "http", host: "localhost:3000" }),
    ).toBeNull();
  });

  it("upgrades http to https on the canonical host", () => {
    expect(
      canonicalRedirect({
        ...base,
        proto: "http",
        host: "sumpreethtoursandtravels.com",
      }),
    ).toBe("https://sumpreethtoursandtravels.com/fleet?a=1");
  });

  it("redirects a non-canonical host to the canonical one", () => {
    expect(
      canonicalRedirect({
        ...base,
        proto: "https",
        host: "www.sumpreethtoursandtravels.com",
      }),
    ).toBe("https://sumpreethtoursandtravels.com/fleet?a=1");
  });

  it("leaves canonical https requests alone", () => {
    expect(
      canonicalRedirect({
        ...base,
        proto: "https",
        host: "sumpreethtoursandtravels.com",
      }),
    ).toBeNull();
  });
});

describe("burstLimit", () => {
  it("allows a normal burst then blocks", () => {
    const ip = `test-${Math.random()}`;
    let blocked = false;
    for (let i = 0; i < 60; i++) {
      if (!burstLimit(ip, 40, 10_000).ok) blocked = true;
    }
    expect(blocked).toBe(true);
  });
});
