import { describe, it, expect } from "vitest";
import { Buzon } from "../src/Buzon";
import { Contacto } from "../src/Contacto";
import { Correo } from "../src/Correo";

describe("Buzón: bandejas y borradores", () => {
    const _maria = new Contacto("Maria", "maria@gmail.com");
    const _carlos = new Contacto("Carlos", "carlos@gmail.com");

    it("un buzón nuevo tiene las cuatro bandejas vacías", () => {
        const _buzon = new Buzon();

        expect(_buzon.cantidad("Entrada")).toBe(0);
        expect(_buzon.cantidad("Enviados")).toBe(0);
        expect(_buzon.cantidad("Borradores")).toBe(0);
        expect(_buzon.cantidad("Eliminados")).toBe(0);
    });

    it("un correo recibido queda en Entrada", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _carlos, [_maria]);

        _buzon.recibir(_correo);

        expect(_buzon.listar("Entrada")).toEqual([_correo]);
        expect(_buzon.ubicacion(_correo)).toBe("Entrada");
    });

    it("un borrador incompleto se puede guardar en Borradores", () => {
        const _buzon = new Buzon();
        const _borrador = new Correo(1, "", "", _maria, []);

        _buzon.guardarBorrador(_borrador);

        expect(_buzon.listar("Borradores")).toEqual([_borrador]);
        expect(_buzon.ubicacion(_borrador)).toBe("Borradores");
    });

    it("un correo enviado no se puede guardar como borrador", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _maria, [_carlos]);
        _correo.marcarComoEnviado();

        expect(() => _buzon.guardarBorrador(_correo)).toThrow("no puede guardarse como borrador");
    });

    it("un correo no puede estar en dos bandejas a la vez", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _maria, [_carlos]);
        _buzon.guardarBorrador(_correo);

        expect(() => _buzon.recibir(_correo)).toThrow('ya está en la bandeja "Borradores"');
        expect(() => _buzon.guardarBorrador(_correo)).toThrow('ya está en la bandeja "Borradores"');
        expect(_buzon.cantidad("Entrada")).toBe(0);
        expect(_buzon.cantidad("Borradores")).toBe(1);
    });

    it("un correo que no está en el buzón no tiene ubicación", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _maria, [_carlos]);

        expect(_buzon.ubicacion(_correo)).toBeUndefined();
    });
});
