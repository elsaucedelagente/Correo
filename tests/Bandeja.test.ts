import { describe, it, expect } from "vitest";
import { Bandeja } from "../src/Bandeja";

describe("RF-06: bandejas", () => {
    it("una bandeja nueva tiene nombre y está vacía", () => {
        const _entrada = new Bandeja("Entrada");

        expect(_entrada.getNombre()).toBe("Entrada");
        expect(_entrada.cantidad()).toBe(0);
    });
});
