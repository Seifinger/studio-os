import { describe, expect, it } from "vitest";

import { IntegrationNotConfiguredError } from "./ports";

describe("IntegrationNotConfiguredError", () => {
  it("nennt die Integration und ist als Fehlerart erkennbar", () => {
    const error = new IntegrationNotConfiguredError("googlePlaces");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(IntegrationNotConfiguredError);
    expect(error.name).toBe("IntegrationNotConfiguredError");
    expect(error.integration).toBe("googlePlaces");
    expect(error.message).toBe('Integration "googlePlaces" ist nicht konfiguriert.');
  });
});
