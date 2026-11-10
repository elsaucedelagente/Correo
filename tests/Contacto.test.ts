import { describe, it, expect } from "vitest";
import { Contacto } from "../src/Contacto";

describe("RF-03: contactos", () => {
    it("rechaza un email con formato inválido", () => {
        expect(() => {
            new Contacto("Maria", " ");
        }).toThrow("Formato de email inválido");
    });

    it("rechaza un nombre vacío", () => {
        expect(() => {
            new Contacto("   ", "maria@gmail.com");
        }).toThrow("El nombre completo es obligatorio");
    });

    it("expone el nombre y el email normalizado", () => {
        const _maria = new Contacto("  Maria Perez ", " Maria@Gmail.com ");

        expect(_maria.getNombreCompleto()).toBe("Maria Perez");
        expect(_maria.getEmail()).toBe("maria@gmail.com");
    });
});
