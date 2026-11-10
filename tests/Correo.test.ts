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

    it("conserva estados iniciales", () => {
        const maria = new Contacto("Maria", "maria@gmail.com");
        const carlos = new Contacto("Carlos", "carlos@gmail.com");

        const correo = new Correo(1, "Navidad", "El 25 de diciembre es Navidad", maria, [carlos]);

        expect(correo.getLeido()).toBe(false);
        expect(correo.getFavorito()).toBe(false);
    });

    it("conserva la información recibida y los estados iniciales", () => {
        const maria = new Contacto("Maria", "maria@gmail.com");
        const carlos = new Contacto("Carlos", "carlos@gmail.com");

        const correo = new Correo(1, "Navidad", "El 25 de diciembre es Navidad", maria, [carlos]);

        expect(correo.getId()).toBe(1);
        expect(correo.getAsunto()).toBe("Navidad");
        expect(correo.getContenido()).toBe("El 25 de diciembre es Navidad");
        expect(correo.getRemitente()).toBe(maria);
        expect(correo.getDestinatarios()).toEqual([carlos]);
        expect(correo.getLeido()).toBe(false);
        expect(correo.getFavorito()).toBe(false);
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

    it("no permite crear un correo sin remitente", () => {
        const _carlos = new Contacto("Carlos", "carlos@gmail.com");

        expect(() => {
            new Correo(1, "Consulta", "Hola", undefined as unknown as Contacto, [_carlos]);
        }).toThrow("El remitente es obligatorio");
    });

    it("no repite destinatarios con el mismo email", () => {
        const _maria = new Contacto("Maria", "maria@gmail.com");
        const _carlos = new Contacto("Carlos", "carlos@gmail.com");
        const _carlosOtraVez = new Contacto("Carlos Gomez", "CARLOS@gmail.com");

        const _correo = new Correo(1, "Consulta", "Hola", _maria, [_carlos, _carlosOtraVez]);

        expect(_correo.getDestinatarios()).toEqual([_carlos]);
    });
});

describe("RF-01: validación para envío", () => {
    const _maria = new Contacto("Maria", "maria@gmail.com");
    const _carlos = new Contacto("Carlos", "carlos@gmail.com");

    it("un correo completo no tiene errores", () => {
        const _correo = new Correo(1, "Consulta", "Hola", _maria, [_carlos]);

        expect(_correo.validarParaEnvio()).toEqual([]);
    });

    it("un correo sin asunto no se puede enviar", () => {
        const _correo = new Correo(1, "   ", "Hola", _maria, [_carlos]);

        expect(_correo.validarParaEnvio()).toEqual(["El asunto es obligatorio"]);
    });

    it("un correo sin destinatarios no se puede enviar", () => {
        const _correo = new Correo(1, "Consulta", "Hola", _maria, []);

        expect(_correo.validarParaEnvio()).toEqual(["Debe tener al menos un destinatario"]);
    });

    it("informa todos los problemas juntos", () => {
        const _correo = new Correo(1, "", "", _maria, []);

        expect(_correo.validarParaEnvio()).toEqual([
            "El asunto es obligatorio",
            "Debe tener al menos un destinatario",
        ]);
    });

    it("puedeEnviarse resume la validación", () => {
        const _completo = new Correo(1, "Consulta", "Hola", _maria, [_carlos]);
        const _incompleto = new Correo(2, "", "Hola", _maria, [_carlos]);

        expect(_completo.puedeEnviarse()).toBe(true);
        expect(_incompleto.puedeEnviarse()).toBe(false);
    });
});

describe("RF-07: borradores", () => {
    const _maria = new Contacto("Maria", "maria@gmail.com");
    const _carlos = new Contacto("Carlos", "carlos@gmail.com");

    it("es borrador hasta que se marca como enviado", () => {
        const _correo = new Correo(1, "Consulta", "Hola", _maria, [_carlos]);
        expect(_correo.estaEnviado()).toBe(false);

        _correo.marcarComoEnviado();

        expect(_correo.estaEnviado()).toBe(true);
    });

    it("un borrador incompleto no se puede marcar como enviado", () => {
        const _correo = new Correo(1, "", "Hola", _maria, [_carlos]);

        expect(() => _correo.marcarComoEnviado()).toThrow("El asunto es obligatorio");
        expect(_correo.estaEnviado()).toBe(false);
    });

    it("no se puede enviar dos veces", () => {
        const _correo = new Correo(1, "Consulta", "Hola", _maria, [_carlos]);
        _correo.marcarComoEnviado();

        expect(() => _correo.marcarComoEnviado()).toThrow("El correo ya fue enviado");
    });

    it("un borrador incompleto se puede completar y enviar", () => {
        const _correo = new Correo(1, "", "", _maria, [_carlos]);

        _correo.setAsunto("Consulta");
        _correo.setContenido("Hola Carlos");

        expect(_correo.getAsunto()).toBe("Consulta");
        expect(_correo.getContenido()).toBe("Hola Carlos");
        expect(_correo.puedeEnviarse()).toBe(true);
    });

    it("a un borrador se le pueden agregar y quitar destinatarios", () => {
        const _ana = new Contacto("Ana", "ana@gmail.com");
        const _correo = new Correo(1, "Consulta", "Hola", _maria, [_carlos]);

        _correo.agregarDestinatario(_ana);
        _correo.agregarDestinatario(_ana);
        expect(_correo.getDestinatarios()).toEqual([_carlos, _ana]);

        _correo.quitarDestinatario(_carlos);
        expect(_correo.getDestinatarios()).toEqual([_ana]);
    });

    it("un correo enviado ya no se puede editar", () => {
        const _correo = new Correo(1, "Consulta", "Hola", _maria, [_carlos]);
        _correo.marcarComoEnviado();

        expect(() => _correo.setAsunto("Otro")).toThrow("Un correo enviado no se puede modificar");
        expect(() => _correo.setContenido("Otro")).toThrow("Un correo enviado no se puede modificar");
        expect(() => _correo.agregarDestinatario(_maria)).toThrow("Un correo enviado no se puede modificar");
        expect(() => _correo.quitarDestinatario(_carlos)).toThrow("Un correo enviado no se puede modificar");
    });
});
