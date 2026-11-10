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

describe("RF-02: envío de correos", () => {
    const _maria = new Contacto("Maria", "maria@gmail.com");
    const _carlos = new Contacto("Carlos", "carlos@gmail.com");
    const _ana = new Contacto("Ana", "ana@gmail.com");

    it("un correo enviado queda en Enviados", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _maria, [_carlos]);

        _buzon.enviar(_correo);

        expect(_buzon.listar("Enviados")).toEqual([_correo]);
        expect(_correo.estaEnviado()).toBe(true);
    });

    it("un correo se puede enviar a varios destinatarios", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _maria, [_carlos, _ana]);

        _buzon.enviar(_correo);

        expect(_buzon.listar("Enviados")).toEqual([_correo]);
        expect(_correo.getDestinatarios()).toEqual([_carlos, _ana]);
    });

    it("un borrador enviado deja de estar en Borradores", () => {
        const _buzon = new Buzon();
        const _borrador = new Correo(1, "", "", _maria, []);
        _buzon.guardarBorrador(_borrador);

        _borrador.setAsunto("Hola");
        _borrador.agregarDestinatario(_carlos);
        _buzon.enviar(_borrador);

        expect(_buzon.cantidad("Borradores")).toBe(0);
        expect(_buzon.listar("Enviados")).toEqual([_borrador]);
        expect(_buzon.ubicacion(_borrador)).toBe("Enviados");
    });

    it("no se puede enviar un correo sin asunto", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "  ", "Texto", _maria, [_carlos]);

        expect(() => _buzon.enviar(_correo)).toThrow("El asunto es obligatorio");
        expect(_buzon.cantidad("Enviados")).toBe(0);
    });

    it("no se puede enviar un correo sin destinatarios", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _maria, []);

        expect(() => _buzon.enviar(_correo)).toThrow("Debe tener al menos un destinatario");
        expect(_buzon.cantidad("Enviados")).toBe(0);
    });

    it("un borrador inválido no se envía y sigue en Borradores", () => {
        const _buzon = new Buzon();
        const _borrador = new Correo(1, "", "", _maria, []);
        _buzon.guardarBorrador(_borrador);

        expect(() => _buzon.enviar(_borrador)).toThrow("No se puede enviar");

        expect(_buzon.listar("Borradores")).toEqual([_borrador]);
        expect(_buzon.cantidad("Enviados")).toBe(0);
        expect(_borrador.estaEnviado()).toBe(false);
    });

    it("enviar dos veces el mismo correo no genera duplicados", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _maria, [_carlos]);
        _buzon.enviar(_correo);

        expect(() => _buzon.enviar(_correo)).toThrow("ya fue enviado");
        expect(_buzon.cantidad("Enviados")).toBe(1);
    });

    it("no se puede enviar un correo que está en Entrada", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _carlos, [_maria]);
        _buzon.recibir(_correo);

        expect(() => _buzon.enviar(_correo)).toThrow('No se puede enviar un correo de la bandeja "Entrada"');
        expect(_buzon.ubicacion(_correo)).toBe("Entrada");
        expect(_correo.estaEnviado()).toBe(false);
    });
});

describe("RF-06: eliminar correos", () => {
    const _maria = new Contacto("Maria", "maria@gmail.com");
    const _carlos = new Contacto("Carlos", "carlos@gmail.com");

    it("un correo de Entrada eliminado pasa a Eliminados", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _carlos, [_maria]);
        _buzon.recibir(_correo);

        _buzon.eliminar(_correo);

        expect(_buzon.cantidad("Entrada")).toBe(0);
        expect(_buzon.listar("Eliminados")).toEqual([_correo]);
        expect(_buzon.ubicacion(_correo)).toBe("Eliminados");
    });

    it("se pueden eliminar correos enviados y borradores", () => {
        const _buzon = new Buzon();
        const _enviado = new Correo(1, "Hola", "Texto", _maria, [_carlos]);
        const _borrador = new Correo(2, "", "", _maria, []);
        _buzon.enviar(_enviado);
        _buzon.guardarBorrador(_borrador);

        _buzon.eliminar(_enviado);
        _buzon.eliminar(_borrador);

        expect(_buzon.cantidad("Enviados")).toBe(0);
        expect(_buzon.cantidad("Borradores")).toBe(0);
        expect(_buzon.listar("Eliminados")).toEqual([_enviado, _borrador]);
    });

    it("recuerda la bandeja de origen del correo eliminado", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _maria, [_carlos]);
        _buzon.enviar(_correo);

        expect(_buzon.origen(_correo)).toBeUndefined();
        _buzon.eliminar(_correo);

        expect(_buzon.origen(_correo)).toBe("Enviados");
    });

    it("no se puede eliminar dos veces el mismo correo", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _carlos, [_maria]);
        _buzon.recibir(_correo);
        _buzon.eliminar(_correo);

        expect(() => _buzon.eliminar(_correo)).toThrow("ya está eliminado");
        expect(_buzon.cantidad("Eliminados")).toBe(1);
    });

    it("no se puede eliminar un correo que no está en el buzón", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _carlos, [_maria]);

        expect(() => _buzon.eliminar(_correo)).toThrow("no está en el buzón");
        expect(_buzon.cantidad("Eliminados")).toBe(0);
    });

    it("un correo eliminado no se puede enviar", () => {
        const _buzon = new Buzon();
        const _borrador = new Correo(1, "Hola", "Texto", _maria, [_carlos]);
        _buzon.guardarBorrador(_borrador);
        _buzon.eliminar(_borrador);

        expect(() => _buzon.enviar(_borrador)).toThrow('No se puede enviar un correo de la bandeja "Eliminados"');
        expect(_borrador.estaEnviado()).toBe(false);
    });
});

describe("RF-06: restaurar correos", () => {
    const _maria = new Contacto("Maria", "maria@gmail.com");
    const _carlos = new Contacto("Carlos", "carlos@gmail.com");

    it("un correo restaurado vuelve a su bandeja de origen", () => {
        const _buzon = new Buzon();
        const _recibido = new Correo(1, "Hola", "Texto", _carlos, [_maria]);
        const _enviado = new Correo(2, "Hola", "Texto", _maria, [_carlos]);
        const _borrador = new Correo(3, "", "", _maria, []);
        _buzon.recibir(_recibido);
        _buzon.enviar(_enviado);
        _buzon.guardarBorrador(_borrador);
        _buzon.eliminar(_recibido);
        _buzon.eliminar(_enviado);
        _buzon.eliminar(_borrador);

        _buzon.restaurar(_recibido);
        _buzon.restaurar(_enviado);
        _buzon.restaurar(_borrador);

        expect(_buzon.ubicacion(_recibido)).toBe("Entrada");
        expect(_buzon.ubicacion(_enviado)).toBe("Enviados");
        expect(_buzon.ubicacion(_borrador)).toBe("Borradores");
        expect(_buzon.cantidad("Eliminados")).toBe(0);
    });

    it("restaurar no genera duplicados", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _carlos, [_maria]);
        _buzon.recibir(_correo);
        _buzon.eliminar(_correo);

        _buzon.restaurar(_correo);

        expect(_buzon.listar("Entrada")).toEqual([_correo]);
        expect(_buzon.listar("Eliminados")).toEqual([]);
    });

    it("después de restaurar, el correo ya no tiene origen guardado", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _carlos, [_maria]);
        _buzon.recibir(_correo);
        _buzon.eliminar(_correo);

        _buzon.restaurar(_correo);

        expect(_buzon.origen(_correo)).toBeUndefined();
    });

    it("no se puede restaurar un correo que no está eliminado", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _carlos, [_maria]);
        _buzon.recibir(_correo);

        expect(() => _buzon.restaurar(_correo)).toThrow("no está en Eliminados");
        expect(_buzon.ubicacion(_correo)).toBe("Entrada");
    });

    it("no se puede restaurar un correo que no está en el buzón", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _carlos, [_maria]);

        expect(() => _buzon.restaurar(_correo)).toThrow("no está en Eliminados");
    });

    it("un borrador restaurado se puede seguir editando y enviar", () => {
        const _buzon = new Buzon();
        const _borrador = new Correo(1, "", "", _maria, []);
        _buzon.guardarBorrador(_borrador);
        _buzon.eliminar(_borrador);
        _buzon.restaurar(_borrador);

        _borrador.setAsunto("Hola");
        _borrador.agregarDestinatario(_carlos);
        _buzon.enviar(_borrador);

        expect(_buzon.ubicacion(_borrador)).toBe("Enviados");
    });

    it("un correo se puede eliminar de nuevo después de restaurarlo", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _carlos, [_maria]);
        _buzon.recibir(_correo);
        _buzon.eliminar(_correo);
        _buzon.restaurar(_correo);

        _buzon.eliminar(_correo);

        expect(_buzon.ubicacion(_correo)).toBe("Eliminados");
        expect(_buzon.origen(_correo)).toBe("Entrada");
    });
});
