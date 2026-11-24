import { describe, it, expect } from "vitest";
import { GestorMail } from "../src/GestorMail";
import { Contacto } from "../src/Contacto";
import { Correo } from "../src/Correo";

describe("GestorMail: usuarios y buzones", () => {
    const _ivan = new Contacto("Ivan", "ivan@gmail.com");
    const _mariano = new Contacto("Mariano", "mariano@gmail.com");

    it("registrar crea un buzón propio con las cuatro bandejas vacías", () => {
        const _gestor = new GestorMail();

        const _buzon = _gestor.registrar(_ivan);

        expect(_gestor.estaRegistrado(_ivan)).toBe(true);
        expect(_gestor.cantidadDeUsuarios()).toBe(1);
        expect(_buzon.cantidad("Entrada")).toBe(0);
        expect(_buzon.cantidad("Enviados")).toBe(0);
        expect(_buzon.cantidad("Borradores")).toBe(0);
        expect(_buzon.cantidad("Eliminados")).toBe(0);
    });

    it("cada usuario tiene un buzón distinto", () => {
        const _gestor = new GestorMail();

        const _buzonIvan = _gestor.registrar(_ivan);
        const _buzonMariano = _gestor.registrar(_mariano);

        expect(_buzonIvan).not.toBe(_buzonMariano);
        expect(_gestor.buzonDe(_ivan)).toBe(_buzonIvan);
        expect(_gestor.buzonDe(_mariano)).toBe(_buzonMariano);
    });

    it("no se puede registrar dos veces al mismo usuario", () => {
        const _gestor = new GestorMail();
        _gestor.registrar(_ivan);

        expect(() => _gestor.registrar(new Contacto("Otro Ivan", "IVAN@gmail.com"))).toThrow("ya está registrado");
        expect(_gestor.cantidadDeUsuarios()).toBe(1);
    });

    it("pedir el buzón de un usuario no registrado es un error", () => {
        const _gestor = new GestorMail();

        expect(() => _gestor.buzonDe(_ivan)).toThrow("no está registrado");
    });

    it("un usuario no registrado no puede enviar", () => {
        const _gestor = new GestorMail();
        _gestor.registrar(_mariano);
        const _correo = Correo.crear("Hola", "Texto", _ivan, [_mariano]);

        expect(() => _gestor.enviar(_correo)).toThrow("no está registrado");
        expect(_gestor.buzonDe(_mariano).cantidad("Entrada")).toBe(0);
    });
});

describe("GestorMail: envío entre usuarios", () => {
    const _ivan = new Contacto("Ivan", "ivan@gmail.com");
    const _mariano = new Contacto("Mariano", "mariano@gmail.com");
    const _pepe = new Contacto("Pepe", "pepe@gmail.com");
    const _carlos = new Contacto("Carlos", "carlos@gmail.com");

    function _crearGestor() {
        const _gestor = new GestorMail();
        const _buzonIvan = _gestor.registrar(_ivan);
        const _buzonMariano = _gestor.registrar(_mariano);
        const _buzonPepe = _gestor.registrar(_pepe);
        const _buzonCarlos = _gestor.registrar(_carlos);
        return { _gestor, _buzonIvan, _buzonMariano, _buzonPepe, _buzonCarlos };
    }

    it("un correo a 3 destinatarios llega a la Entrada de cada uno", () => {
        const { _gestor, _buzonIvan, _buzonMariano, _buzonPepe, _buzonCarlos } = _crearGestor();
        const _correo = Correo.crear("Reunión", "Nos juntamos el martes", _ivan, [_mariano, _pepe, _carlos]);

        _gestor.enviar(_correo);

        expect(_buzonIvan.listar("Enviados")).toEqual([_correo]);
        expect(_buzonIvan.cantidad("Entrada")).toBe(0); // no se lo manda a sí mismo

        [_buzonMariano, _buzonPepe, _buzonCarlos].forEach((_buzon) => {
            const _recibidos = _buzon.listar("Entrada");
            expect(_recibidos.length).toBe(1);
            expect(_recibidos[0].getAsunto()).toBe("Reunión");
            expect(_recibidos[0].getRemitente()).toBe(_ivan);
        });
    });

    it("Escenario: respuesta y eliminación, cada buzón es independiente", () => {
        const { _gestor, _buzonIvan, _buzonMariano, _buzonPepe, _buzonCarlos } = _crearGestor();
        const _correo = Correo.crear("Reunión", "Nos juntamos el martes", _ivan, [_mariano, _pepe, _carlos]);
        _gestor.enviar(_correo);

        // Mariano le contesta a Ivan.
        const _respuesta = Correo.crear("Re: Reunión", "Dale, ahí estoy", _mariano, [_ivan]);
        _gestor.enviar(_respuesta);

        expect(_buzonMariano.listar("Enviados")).toEqual([_respuesta]);
        expect(_buzonIvan.cantidad("Entrada")).toBe(1); // ahora Ivan sí recibe
        expect(_buzonPepe.cantidad("Entrada")).toBe(1); // Pepe sigue con el suyo

        // Mariano elimina el correo que recibió.
        const _delMariano = _buzonMariano.listar("Entrada")[0];
        _buzonMariano.eliminar(_delMariano);

        expect(_buzonMariano.cantidad("Entrada")).toBe(0);
        expect(_buzonMariano.cantidad("Eliminados")).toBe(1);
        expect(_buzonPepe.cantidad("Entrada")).toBe(1);   // Pepe no se entera
        expect(_buzonCarlos.cantidad("Entrada")).toBe(1); // Carlos tampoco
        expect(_buzonIvan.cantidad("Enviados")).toBe(1);  // Ivan sigue con su Enviado
    });

    it("el estado de lectura y favorito es propio de cada destinatario", () => {
        const { _gestor, _buzonMariano, _buzonPepe } = _crearGestor();
        const _correo = Correo.crear("Reunión", "Texto", _ivan, [_mariano, _pepe]);
        _gestor.enviar(_correo);

        const _deMariano = _buzonMariano.listar("Entrada")[0];
        _deMariano.marcarComoLeido();
        _deMariano.marcarComoFavorito();

        expect(_buzonMariano.noLeidos("Entrada")).toEqual([]);
        expect(_buzonMariano.favoritos()).toEqual([_deMariano]);
        expect(_buzonPepe.noLeidos("Entrada").length).toBe(1);
        expect(_buzonPepe.favoritos()).toEqual([]);
    });

    it("un destinatario no registrado se ignora y los demás igual reciben", () => {
        const { _gestor, _buzonIvan, _buzonMariano } = _crearGestor();
        const _externo = new Contacto("Externo", "externo@otra.com");
        const _correo = Correo.crear("Hola", "Texto", _ivan, [_mariano, _externo]);

        _gestor.enviar(_correo);

        expect(_buzonMariano.cantidad("Entrada")).toBe(1);
        expect(_buzonIvan.listar("Enviados")).toEqual([_correo]);
        expect(_gestor.estaRegistrado(_externo)).toBe(false);
    });

    it("un correo inválido no se entrega a nadie", () => {
        const { _gestor, _buzonIvan, _buzonMariano } = _crearGestor();
        const _sinAsunto = Correo.crear("  ", "Texto", _ivan, [_mariano]);

        expect(() => _gestor.enviar(_sinAsunto)).toThrow("El asunto es obligatorio");

        expect(_buzonIvan.cantidad("Enviados")).toBe(0);
        expect(_buzonMariano.cantidad("Entrada")).toBe(0);
    });

    it("un borrador enviado sale de Borradores y llega al destinatario", () => {
        const { _gestor, _buzonIvan, _buzonMariano } = _crearGestor();
        const _borrador = _buzonIvan.redactar(_ivan, "", "", []);
        _borrador.setAsunto("Hola");
        _borrador.agregarDestinatario(_mariano);

        _gestor.enviar(_borrador);

        expect(_buzonIvan.cantidad("Borradores")).toBe(0);
        expect(_buzonIvan.listar("Enviados")).toEqual([_borrador]);
        expect(_buzonMariano.listar("Entrada").length).toBe(1);
    });

    it("enviar dos veces el mismo correo no lo duplica en ningún buzón", () => {
        const { _gestor, _buzonIvan, _buzonMariano } = _crearGestor();
        const _correo = Correo.crear("Hola", "Texto", _ivan, [_mariano]);
        _gestor.enviar(_correo);

        expect(() => _gestor.enviar(_correo)).toThrow();

        expect(_buzonIvan.cantidad("Enviados")).toBe(1);
        expect(_buzonMariano.cantidad("Entrada")).toBe(1);
    });

    it("el correo recibido ya está enviado: el destinatario no puede editarlo", () => {
        const { _gestor, _buzonMariano } = _crearGestor();
        _gestor.enviar(Correo.crear("Hola", "Texto", _ivan, [_mariano]));

        const _recibido = _buzonMariano.listar("Entrada")[0];

        expect(() => _recibido.setAsunto("Cambiado")).toThrow("no se puede modificar");
    });
});