import { describe, it, expect } from "vitest";
import { Contacto } from "../src/Contacto";
import { Correo } from "../src/Correo";
import { IContacto } from "../src/IContacto";

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

    it("cada correo tiene un id unico", () => {
    const maria = new Contacto("María", "maria@gmail.com");
    const carlos = new Contacto("Carlos", "carlos@gmail.com");

    const correo1 = new Correo(
        1, "Consulta", "Mismo contenido", maria, [carlos]
    );

    const correo2 = new Correo(
        2, "Consulta", "Mismo contenido", maria, [carlos]
    );

    expect(correo1.getId()).toBe(1);
    expect(correo2.getId()).toBe(2);
    expect(correo1.getId()).not.toBe(correo2.getId());
});

    it("conserva la información recibida y los estados iniciales", () => {
        const maria = new Contacto("Maria", "maria@gmail.com");
        const carlos = new Contacto("Carlos", "carlos@ucp.com");

        const correo = new Correo(
            1, "Navidad", "El 25 de diciembre es Navidad", maria, [carlos]
        );

        expect(correo.getId()).toBe(1);
        expect(correo.getAsunto()).toBe("Navidad");
        expect(correo.getContenido()).toBe("El 25 de diciembre es Navidad");
        expect(correo.getRemitente()).toBe(maria);
        expect(correo.getDestinatarios()).toEqual([carlos]);
        expect(correo.getLeido()).toBe(false);
        expect(correo.getFavorito()).toBe(false);
    });

    it("validar los datos obligatorios de contacto", () => {
        expect(() => { new Contacto("Maria", " ");

        }).toThrow("Formato de email inválido");
    });
        expect(() => {new Contacto("   ", "maria@email.com");

        }).toThrow("El nombre completo es obligatorio");

    it("conserva sus destinatarios aunque se modifique el array original", () => {
    const maria = new Contacto("Maria", "maria@email.edu.ar");
    const carlos = new Contacto("Carlos", "carlos@email.edu.ar");
    const destinatarios = [carlos];

    const correo = new Correo(
        1, "Consulta", "Primera consulta", maria, destinatarios
    );

    // Quitamos a Carlos del array externo.
    destinatarios.pop();

    // Carlos debe seguir siendo destinatario del correo.
    expect(correo.getDestinatarios()).toEqual([carlos]);
});
});
