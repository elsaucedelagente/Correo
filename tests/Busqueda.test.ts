import { describe, it, expect } from "vitest";
import { buscarCorreos, coincideConTexto } from "../src/Busqueda";
import { Buzon } from "../src/Buzon";
import { Contacto } from "../src/Contacto";
import { Correo } from "../src/Correo";

describe("RF-04: búsqueda de correos", () => {
    const _maria = new Contacto("Maria Perez", "maria@gmail.com");
    const _carlos = new Contacto("Carlos Gomez", "carlos@ucp.edu.ar");
    const _ana = new Contacto("Ana Lopez", "ana@hotmail.com");

    const _examen = new Correo(1, "Fecha de examen", "El parcial es el lunes", _carlos, [_maria]);
    const _asado = new Correo(2, "Asado", "Nos vemos el sábado", _ana, [_maria, _carlos]);
    const _tp = new Correo(3, "TP final", "Entrega del trabajo práctico", _maria, [_ana]);
    const _correos = [_examen, _asado, _tp];

    it("encuentra coincidencias en el asunto", () => {
        expect(buscarCorreos(_correos, "asado")).toEqual([_asado]);
    });

    it("encuentra coincidencias en el contenido", () => {
        expect(buscarCorreos(_correos, "parcial")).toEqual([_examen]);
    });

    it("encuentra coincidencias en el nombre o email del remitente", () => {
        expect(buscarCorreos(_correos, "Gomez")).toContain(_examen);
        expect(buscarCorreos(_correos, "hotmail")).toContain(_asado);
    });

    it("encuentra coincidencias en el nombre o email de cualquier destinatario", () => {
        expect(buscarCorreos(_correos, "Lopez")).toEqual([_asado, _tp]);
        expect(buscarCorreos(_correos, "ucp.edu.ar")).toEqual([_examen, _asado]);
    });

    it("no distingue mayúsculas de minúsculas", () => {
        expect(buscarCorreos(_correos, "EXAMEN")).toEqual([_examen]);
        expect(buscarCorreos(_correos, "fEcHa")).toEqual([_examen]);
    });

    it("admite coincidencias parciales", () => {
        expect(buscarCorreos(_correos, "exam")).toEqual([_examen]);
    });

    it("un correo aparece una sola vez aunque coincida en varios campos", () => {
        // "maria" está en el remitente de _tp y en los destinatarios de _examen y _asado.
        const _resultado = buscarCorreos(_correos, "maria");

        expect(_resultado).toEqual([_examen, _asado, _tp]);
    });

    it("devuelve una colección vacía si no hay coincidencias", () => {
        expect(buscarCorreos(_correos, "inexistente")).toEqual([]);
    });

    it("un texto vacío no coincide con nada", () => {
        expect(buscarCorreos(_correos, "   ")).toEqual([]);
        expect(coincideConTexto("")(_examen)).toBe(false);
    });

    it("no modifica los correos ni la colección original", () => {
        const _copia = [..._correos];

        buscarCorreos(_correos, "examen");

        expect(_correos).toEqual(_copia);
        expect(_examen.getAsunto()).toBe("Fecha de examen");
        expect(_examen.getDestinatarios()).toEqual([_maria]);
    });

    it("devuelve un array nuevo", () => {
        const _resultado = buscarCorreos(_correos, "a");

        expect(_resultado).not.toBe(_correos);
    });
});

describe("RF-04: búsqueda en la Bandeja de Entrada", () => {
    const _maria = new Contacto("Maria", "maria@gmail.com");
    const _carlos = new Contacto("Carlos", "carlos@gmail.com");

    it("busca solo en los correos de Entrada", () => {
        const _buzon = new Buzon();
        const _recibido = new Correo(1, "Reunión", "Texto", _carlos, [_maria]);
        const _enviado = new Correo(2, "Reunión", "Texto", _maria, [_carlos]);
        _buzon.recibir(_recibido);
        _buzon.enviar(_enviado);

        expect(_buzon.buscar("reunión")).toEqual([_recibido]);
    });

    it("sobre una bandeja vacía devuelve una colección vacía", () => {
        const _buzon = new Buzon();

        expect(_buzon.buscar("hola")).toEqual([]);
    });

    it("no modifica la Bandeja de Entrada", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _carlos, [_maria]);
        _buzon.recibir(_correo);

        _buzon.buscar("hola").pop();

        expect(_buzon.listar("Entrada")).toEqual([_correo]);
    });
});
