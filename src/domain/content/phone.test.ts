import { describe, expect, it } from "vitest";

import { parsePhoneNumber, telHref, whatsAppHref } from "./phone";

describe("parsePhoneNumber", () => {
  it.each([
    ["08631 12345", "+49863112345"],
    ["08631/12345", "+49863112345"],
    ["+49 8631 12345", "+49863112345"],
    ["+49 (0) 8631 12345", "+49863112345"],
    ["0049 8631-12345", "+49863112345"],
    ["+43 1 5123456", "+4315123456"],
    ["0171 1234567", "+491711234567"],
  ])("%s → %s", (input, e164) => {
    const result = parsePhoneNumber(input);
    expect(result).toEqual({ ok: true, phone: { e164, display: input.replace(/\s+/g, " ").trim() } });
  });

  it("vereinheitlicht Leerraum in der Anzeigeform", () => {
    const result = parsePhoneNumber("  08631   12345 ");
    expect(result.ok && result.phone.display).toBe("08631 12345");
  });

  it.each([
    ["", /Nur Ziffern/],
    ["08631 12345 Durchwahl 2", /Nur Ziffern/],
    ["8631 12345", /Vorwahl fehlt/],
    ["08631+12345", /\+ ist nur am Anfang/],
    ["0123", /zu kurz/],
    ["+49 1234 5678 9012 3456", /zu lang/],
  ])("lehnt %j ab", (input, reason) => {
    const result = parsePhoneNumber(input);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toMatch(reason);
  });
});

describe("Links", () => {
  const phone = { e164: "+49863112345", display: "08631 12345" };

  it("baut tel:- und WhatsApp-Links aus der E.164-Form", () => {
    expect(telHref(phone)).toBe("tel:+49863112345");
    expect(whatsAppHref(phone)).toBe("https://wa.me/49863112345");
  });
});
