import { describe, it, expect } from "vitest";
import { Filtro } from "../src/Filtro";
import { and, not } from "../src/Predicados";
import type { Predicado } from "../src/Predicados";
import { Contacto } from "../src/Contacto";
import { Correo } from "../src/Correo";
import type { ICorreo } from "../src/ICorreo";

describe("Filtro (RF-05)", () => {
    const _docente = new Contacto("Docente UCP", "docente@ucp.edu.ar");
    const _ana = new Contacto("Ana", "ana@gmail.com");
    const _luis = new Contacto("Luis", "luis@gmail.com");

    const _asuntoContiene = (texto: string): Predicado<ICorreo> =>
        (correo) => correo.getAsunto().toLowerCase().includes(texto.toLowerCase());
    const _deLaUCP: Predicado<ICorreo> =
        (correo) => correo.getRemitente().getEmail().endsWith("@ucp.edu.ar");

    // Crea correos nuevos en cada test, así ninguno depende del estado de otro.
    function _crearCorreos() {
        const _examen = new Correo(1, "Examen final", "Fecha del examen", _docente, [_ana]);
        const _asado = new Correo(2, "Asado", "Nos vemos el sábado", _ana, [_luis]);
        const _tp = new Correo(3, "Entrega del TP", "Trabajo práctico", _luis, [_ana]);
        return { _examen, _asado, _tp, _todos: [_examen, _asado, _tp] as ICorreo[] };
    }

    describe("creación", () => {
        it("conserva el nombre y el predicado", () => {
            const _filtro = new Filtro("Correos de la UCP", _deLaUCP);

            expect(_filtro.getNombre()).toBe("Correos de la UCP");
            expect(_filtro.getPredicado()).toBe(_deLaUCP);
        });

        it("quita los espacios sobrantes del nombre", () => {
            const _filtro = new Filtro("  Mi filtro  ", _deLaUCP);

            expect(_filtro.getNombre()).toBe("Mi filtro");
        });

        it("rechaza un nombre vacío o de solo espacios", () => {
            expect(() => new Filtro("", _deLaUCP)).toThrow();
            expect(() => new Filtro("   ", _deLaUCP)).toThrow();
        });
    });
     describe("evaluación de un correo", () => {
        it("cumple devuelve true si el correo cumple la condición", () => {
            const { _examen } = _crearCorreos();

            expect(new Filtro("UCP", _deLaUCP).cumple(_examen)).toBe(true);
        });

        it("cumple devuelve false si el correo no cumple la condición", () => {
            const { _asado } = _crearCorreos();

            expect(new Filtro("UCP", _deLaUCP).cumple(_asado)).toBe(false);
        });
    });

    describe("aplicar sobre una colección", () => {
        it("devuelve solo los correos que cumplen, en el mismo orden", () => {
            const { _examen, _tp, _todos } = _crearCorreos();
            const _filtro = new Filtro("Con T", _asuntoContiene("e"));

            expect(_filtro.aplicar(_todos)).toEqual([_examen, _tp]);
        });

        it("devuelve una colección vacía si ninguno cumple", () => {
            const { _todos } = _crearCorreos();
            const _filtro = new Filtro("Inexistente", _asuntoContiene("zzzz"));

            expect(_filtro.aplicar(_todos)).toEqual([]);
        });

        it("devuelve una colección vacía si la colección está vacía", () => {
            expect(new Filtro("UCP", _deLaUCP).aplicar([])).toEqual([]);
        });

        it("un mismo filtro se puede aplicar sobre distintas colecciones", () => {
            const { _examen, _asado, _tp } = _crearCorreos();
            const _filtro = new Filtro("UCP", _deLaUCP);

            expect(_filtro.aplicar([_examen, _asado])).toEqual([_examen]);
            expect(_filtro.aplicar([_asado, _tp])).toEqual([]);
            expect(_filtro.aplicar([_tp, _examen])).toEqual([_examen]);
        });
          it("un mismo filtro se puede reutilizar en consultas distintas con el mismo resultado", () => {
            const { _todos } = _crearCorreos();
            const _filtro = new Filtro("UCP", _deLaUCP);

            expect(_filtro.aplicar(_todos)).toEqual(_filtro.aplicar(_todos));
        });
    });

    describe("no almacena ni modifica correos", () => {
        it("aplicar devuelve un array nuevo y deja intacta la colección original", () => {
            const { _todos } = _crearCorreos();
            const _copia = [..._todos];
            const _filtro = new Filtro("UCP", _deLaUCP);

            const _resultado = _filtro.aplicar(_todos);

            expect(_resultado).not.toBe(_todos);
            expect(_todos).toEqual(_copia);
        });

        it("no modifica los correos originales", () => {
            const { _examen, _todos } = _crearCorreos();

            new Filtro("UCP", _deLaUCP).aplicar(_todos);

            expect(_examen.getAsunto()).toBe("Examen final");
            expect(_examen.getContenido()).toBe("Fecha del examen");
            expect(_examen.getRemitente()).toBe(_docente);
            expect(_examen.getDestinatarios()).toEqual([_ana]);
        });

        it("modificar el resultado no afecta a la colección original", () => {
            const { _todos } = _crearCorreos();

            new Filtro("Todos", () => true).aplicar(_todos).pop();

            expect(_todos).toHaveLength(3);
        });