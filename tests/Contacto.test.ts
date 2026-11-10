import { describe, it, expect } from "vitest";
import { Contacto } from "../src/Contacto";
import { Correo } from "../src/Correo";
import { IContacto } from "../src/IContacto";

describe("RF-01: creación de correos", () => {
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


    it("conserva sus destinatarios ante modificaciones", () => {
    const maria = new Contacto("Maria", "maria@gmail.com");
    const carlos = new Contacto("Carlos", "carlos@gmail.com");
    const destinatarios = [carlos];

    const correo = new Correo(1, "Consulta", "Primera consulta", maria, destinatarios);

    // Quitamos a Carlos del array externo.
    destinatarios.pop();

    // Carlos debe seguir siendo destinatario del correo.
    expect(correo.getDestinatarios()).toEqual([carlos]);
});
});
