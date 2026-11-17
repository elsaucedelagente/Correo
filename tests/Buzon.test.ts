import { describe, it, expect } from "vitest";
import { Buzon } from "../src/Buzon";
import { Contacto } from "../src/Contacto";
import { Correo } from "../src/Correo";
import { and } from "../src/Predicados";
import { asuntoContiene, noLeido } from "../src/predicadosCorreo";

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

    it("redactar crea borradores con ids distintos en Borradores", () => {
        const _buzon = new Buzon();

        const _borrador1 = _buzon.redactar(_maria, "", "", []);
        const _borrador2 = _buzon.redactar(_maria, "Consulta", "Hola", [_carlos]);

        expect(_borrador1.getId()).not.toBe(_borrador2.getId());
        expect(_buzon.listar("Borradores")).toEqual([_borrador1, _borrador2]);
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
describe("RF-08: correos no leídos de una bandeja", () => {
    const _maria = new Contacto("Maria", "maria@gmail.com");
    const _carlos = new Contacto("Carlos", "carlos@gmail.com");

    it("devuelve solo los correos no leídos de la bandeja", () => {
        const _buzon = new Buzon();
        const _uno = new Correo(1, "Uno", "Texto", _carlos, [_maria]);
        const _dos = new Correo(2, "Dos", "Texto", _carlos, [_maria]);
        const _tres = new Correo(3, "Tres", "Texto", _carlos, [_maria]);
        _buzon.recibir(_uno);
        _buzon.recibir(_dos);
        _buzon.recibir(_tres);

        _dos.marcarComoLeido();

        expect(_buzon.noLeidos("Entrada")).toEqual([_uno, _tres]);
    });

    it("devuelve una colección vacía si todos los correos fueron leídos", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _carlos, [_maria]);
        _buzon.recibir(_correo);

        _correo.marcarComoLeido();

        expect(_buzon.noLeidos("Entrada")).toEqual([]);
    });

    it("devuelve una colección vacía si la bandeja está vacía", () => {
        const _buzon = new Buzon();

        expect(_buzon.noLeidos("Entrada")).toEqual([]);
        expect(_buzon.noLeidos("Eliminados")).toEqual([]);
    });

    it("el resultado se actualiza al marcar como leído y como no leído", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _carlos, [_maria]);
        _buzon.recibir(_correo);
        expect(_buzon.noLeidos("Entrada")).toEqual([_correo]);

        _correo.marcarComoLeido();
        expect(_buzon.noLeidos("Entrada")).toEqual([]);

        _correo.marcarComoNoLeido();
        expect(_buzon.noLeidos("Entrada")).toEqual([_correo]);
    });

    it("solo mira la bandeja pedida", () => {
        const _buzon = new Buzon();
        const _recibido = new Correo(1, "Recibido", "Texto", _carlos, [_maria]);
        const _enviado = new Correo(2, "Enviado", "Texto", _maria, [_carlos]);
        _buzon.recibir(_recibido);
        _buzon.enviar(_enviado);

        expect(_buzon.noLeidos("Entrada")).toEqual([_recibido]);
        expect(_buzon.noLeidos("Enviados")).toEqual([_enviado]);
        expect(_buzon.noLeidos("Borradores")).toEqual([]);
    });

    it("no modifica la bandeja ni los correos", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _carlos, [_maria]);
        _buzon.recibir(_correo);

        _buzon.noLeidos("Entrada").pop();

        expect(_buzon.listar("Entrada")).toEqual([_correo]);
        expect(_correo.getLeido()).toBe(false);
    });

    it("un correo eliminado conserva su estado de lectura y vuelve igual al restaurarlo", () => {
        const _buzon = new Buzon();
        const _leido = new Correo(1, "Leído", "Texto", _carlos, [_maria]);
        const _sinLeer = new Correo(2, "Sin leer", "Texto", _carlos, [_maria]);
        _buzon.recibir(_leido);
        _buzon.recibir(_sinLeer);
        _leido.marcarComoLeido();

        _buzon.eliminar(_leido);
        _buzon.eliminar(_sinLeer);

        expect(_buzon.noLeidos("Entrada")).toEqual([]);
        expect(_buzon.noLeidos("Eliminados")).toEqual([_sinLeer]);

        _buzon.restaurar(_leido);
        _buzon.restaurar(_sinLeer);

        expect(_leido.getLeido()).toBe(true);
        expect(_buzon.noLeidos("Entrada")).toEqual([_sinLeer]);
    });
});
describe("RF-10: procesamiento funcional de una bandeja", () => {
    const _maria = new Contacto("Maria", "maria@gmail.com");
    const _carlos = new Contacto("Carlos", "carlos@gmail.com");

    it("obtiene la lista de asuntos de una bandeja", () => {
        const _buzon = new Buzon();
        _buzon.recibir(new Correo(1, "Uno", "Texto", _carlos, [_maria]));
        _buzon.recibir(new Correo(2, "Dos", "Texto", _carlos, [_maria]));

        expect(_buzon.asuntos("Entrada")).toEqual(["Uno", "Dos"]);
    });

    it("los asuntos de una bandeja vacía son una colección vacía", () => {
        const _buzon = new Buzon();

        expect(_buzon.asuntos("Entrada")).toEqual([]);
    });

    it("los asuntos solo corresponden a la bandeja pedida", () => {
        const _buzon = new Buzon();
        _buzon.recibir(new Correo(1, "Recibido", "Texto", _carlos, [_maria]));
        _buzon.enviar(new Correo(2, "Enviado", "Texto", _maria, [_carlos]));

        expect(_buzon.asuntos("Entrada")).toEqual(["Recibido"]);
        expect(_buzon.asuntos("Enviados")).toEqual(["Enviado"]);
    });

    it("filtra los correos de una bandeja que cumplen una condición", () => {
        const _buzon = new Buzon();
        const _reunion = new Correo(1, "Reunión", "Texto", _carlos, [_maria]);
        const _asado = new Correo(2, "Asado", "Texto", _carlos, [_maria]);
        _buzon.recibir(_reunion);
        _buzon.recibir(_asado);

        expect(_buzon.filtrar("Entrada", (c) => c.getAsunto() === "Reunión")).toEqual([_reunion]);
    });

    it("filtrar no modifica la bandeja", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Hola", "Texto", _carlos, [_maria]);
        _buzon.recibir(_correo);

        _buzon.filtrar("Entrada", () => true).pop();

        expect(_buzon.listar("Entrada")).toEqual([_correo]);
    });

    it("resume una bandeja con total, leídos y no leídos", () => {
        const _buzon = new Buzon();
        const _uno = new Correo(1, "Uno", "Texto", _carlos, [_maria]);
        const _dos = new Correo(2, "Dos", "Texto", _carlos, [_maria]);
        _buzon.recibir(_uno);
        _buzon.recibir(_dos);
        _uno.marcarComoLeido();

        expect(_buzon.resumen("Entrada")).toEqual({ total: 2, leidos: 1, noLeidos: 1 });
    });

    it("el resumen de una bandeja vacía es todo cero", () => {
        const _buzon = new Buzon();

        expect(_buzon.resumen("Eliminados")).toEqual({ total: 0, leidos: 0, noLeidos: 0 });
    });
});

describe("RF-09: correos favoritos", () => {
    const _maria = new Contacto("Maria", "maria@gmail.com");
    const _carlos = new Contacto("Carlos", "carlos@gmail.com");

    it("reúne favoritos de distintas bandejas sin moverlos ni repetirlos", () => {
        const _buzon = new Buzon();
        const _entrada = new Correo(1, "Entrada", "Texto", _carlos, [_maria]);
        const _enviado = new Correo(2, "Enviado", "Texto", _maria, [_carlos]);
        const _borrador = new Correo(3, "Borrador", "Texto", _maria, []);
        _buzon.recibir(_entrada);
        _buzon.enviar(_enviado);
        _buzon.guardarBorrador(_borrador);

        _entrada.marcarComoFavorito();
        _enviado.marcarComoFavorito();
        _borrador.marcarComoFavorito();

        expect(_buzon.favoritos()).toEqual([_entrada, _enviado, _borrador]);
        expect(_buzon.ubicacion(_entrada)).toBe("Entrada");
        expect(_buzon.ubicacion(_enviado)).toBe("Enviados");
        expect(_buzon.ubicacion(_borrador)).toBe("Borradores");
        expect(() => _buzon.recibir(new Correo(1, "Duplicado", "Texto", _carlos, [_maria])))
            .toThrow("ya está en la bandeja");
        expect(_buzon.favoritos()).toEqual([_entrada, _enviado, _borrador]);
    });

    it("al desmarcar un correo deja de aparecer en favoritos", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Importante", "Texto", _carlos, [_maria]);
        _buzon.recibir(_correo);
        _correo.marcarComoFavorito();
        expect(_buzon.favoritos()).toEqual([_correo]);

        _correo.desmarcarComoFavorito();

        expect(_buzon.favoritos()).toEqual([]);
        expect(_buzon.ubicacion(_correo)).toBe("Entrada");
    });

    it("combina condiciones para buscar dentro de los favoritos", () => {
        const _buzon = new Buzon();
        const _coincide = new Correo(1, "Proyecto urgente", "Texto", _carlos, [_maria]);
        const _leido = new Correo(2, "Proyecto leído", "Texto", _carlos, [_maria]);
        const _noFavorito = new Correo(3, "Proyecto urgente", "Texto", _carlos, [_maria]);
        const _enviado = new Correo(4, "Proyecto abierto", "Texto", _maria, [_carlos]);
        [_coincide, _leido, _noFavorito].forEach((correo) => _buzon.recibir(correo));
        _buzon.enviar(_enviado);
        _coincide.marcarComoFavorito();
        _leido.marcarComoFavorito();
        _enviado.marcarComoFavorito();
        _leido.marcarComoLeido();

        expect(_buzon.favoritos(and(asuntoContiene("Proyecto"), noLeido))).toEqual([_coincide, _enviado]);
    });

    it("oculta eliminados y conserva su favorito al restaurarlos", () => {
        const _buzon = new Buzon();
        const _correo = new Correo(1, "Importante", "Texto", _carlos, [_maria]);
        _buzon.recibir(_correo);
        _correo.marcarComoFavorito();
        _buzon.eliminar(_correo);

        expect(_buzon.favoritos()).toEqual([]);
        expect(_buzon.listar("Eliminados")).toEqual([_correo]);

        _buzon.restaurar(_correo);

        expect(_correo.getFavorito()).toBe(true);
        expect(_buzon.favoritos()).toEqual([_correo]);
    });
});