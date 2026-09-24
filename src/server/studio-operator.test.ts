import { describe, expect, it } from "vitest";

import { studioOperator } from "./studio-operator";

const COMPLETE = {
  STUDIO_OPERATOR_NAME: "Erika Muster",
  STUDIO_OPERATOR_ADDRESS: "Musterweg 1, 00000 Musterort",
  STUDIO_OPERATOR_EMAIL: "studio@example.com",
};

describe("studioOperator", () => {
  it("liefert die Betreiberangaben, wenn alle drei gesetzt sind", () => {
    expect(studioOperator(COMPLETE)).toEqual({ name: "Erika Muster", address: "Musterweg 1, 00000 Musterort", email: "studio@example.com" });
  });

  it("liefert null ohne Angaben", () => {
    expect(studioOperator({})).toBeNull();
  });

  it("liefert null bei halben oder ungültigen Angaben statt eines lückenhaften Impressums", () => {
    expect(studioOperator({ STUDIO_OPERATOR_NAME: "Erika Muster" })).toBeNull();
    expect(studioOperator({ ...COMPLETE, STUDIO_OPERATOR_EMAIL: "keine-adresse" })).toBeNull();
    expect(studioOperator({ ...COMPLETE, STUDIO_OPERATOR_ADDRESS: "  " })).toBeNull();
  });
});
