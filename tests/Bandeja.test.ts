import { describe, it, expect } from "vitest";
import { Bandeja } from "../src/Bandeja";
import { Contacto } from "../src/Contacto";
import { Correo } from "../src/Correo";

describe("RF-06: bandejas", () => {
    const _maria = new Contacto("Maria", "maria@gmail.com");
    const _carlos = new Contacto("Carlos", "carlos@gmail.com");

    it("una bandeja nueva tiene nombre y está vacía", () => {
        const _entrada = new Bandeja("Entrada");

        expect(_entrada.getNombre()).toBe("Entrada");
        expect(_entrada.cantidad()).toBe(0);
        expect(_entrada.listar()).toEqual([]);
    });

    it("permite agregar correos y consultarlos", () => {
        const _bandeja = new Bandeja("Entrada");
        const _correo1 = new Correo(1, "Hola", "Texto", _maria, [_carlos]);
        const _correo2 = new Correo(2, "Chau", "Texto", _carlos, [_maria]);

        _bandeja.agregar(_correo1);
        _bandeja.agregar(_correo2);

        expect(_bandeja.cantidad()).toBe(2);
        expect(_bandeja.listar()).toEqual([_correo1, _correo2]);
        expect(_bandeja.contiene(_correo1)).toBe(true);
    });

    it("no permite agregar el mismo correo dos veces", () => {
        const _bandeja = new Bandeja("Entrada");
        const _correo = new Correo(1, "Hola", "Texto", _maria, [_carlos]);
        _bandeja.agregar(_correo);

        expect(() => _bandeja.agregar(_correo)).toThrow("ya está en la bandeja");
        expect(_bandeja.cantidad()).toBe(1);
    });

    it("permite quitar un correo", () => {
        const _bandeja = new Bandeja("Entrada");
        const _correo = new Correo(1, "Hola", "Texto", _maria, [_carlos]);
        _bandeja.agregar(_correo);

        _bandeja.quitar(_correo);

        expect(_bandeja.cantidad()).toBe(0);
        expect(_bandeja.contiene(_correo)).toBe(false);
    });

    it("no permite quitar un correo que no está", () => {
        const _bandeja = new Bandeja("Entrada");
        const _correo = new Correo(1, "Hola", "Texto", _maria, [_carlos]);

        expect(() => _bandeja.quitar(_correo)).toThrow("no está en la bandeja");
    });

    it("listar devuelve una copia que no modifica la bandeja", () => {
        const _bandeja = new Bandeja("Entrada");
        const _correo = new Correo(1, "Hola", "Texto", _maria, [_carlos]);
        _bandeja.agregar(_correo);

        (_bandeja.listar() as Correo[]).pop();

        expect(_bandeja.cantidad()).toBe(1);
    });
});
