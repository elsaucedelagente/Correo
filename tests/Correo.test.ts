import { describe, it, expect } from "vitest";
import { Contacto } from "../src/Contacto";
import { Correo } from "../src/Correo";

describe("RF-01: creación de correos", () => {
    it("permite crear correos con diferentes remitentes y destinatarios", () => {
        const maria = new Contacto("Maria", "maria@gmail.com");
        const carlos = new Contacto("Carlos", "carlos@gmail.com");

        const correo1 = new Correo(
            1, "Consulta", "Primera consulta", maria, [carlos]
        );

        const correo2 = new Correo(
            2, "Respuesta", "Primera respuesta", carlos, [maria]
        );

        expect(correo1.getRemitente()).toBe(maria);
        expect(correo1.getDestinatarios()).toEqual([carlos]);

        expect(correo2.getRemitente()).toBe(carlos);
        expect(correo2.getDestinatarios()).toEqual([maria]);
    });
});
