import { describe, it, expect } from "vitest";
import {
    listarAsuntos,
    filtrarCorreos,
    resumirCorreos,
    contarPorRemitente,
} from "../src/Estadisticas";
import { and, not } from "../src/Predicados";
import { asuntoContiene, noLeido, remitenteEs } from "../src/predicadosCorreo";
import { Contacto } from "../src/Contacto";
import { Correo } from "../src/Correo";

describe("RF-10: procesamiento funcional de colecciones de correos", () => {
    const _ana = new Contacto("Ana", "ana@gmail.com");
    const _luis = new Contacto("Luis", "luis@ucp.edu.ar");

    // Se crean nuevos en cada test para que ninguno dependa del estado de otro.
    function _crearCorreos() {
        const _examen = new Correo(1, "Examen final", "Fecha del examen", _luis, [_ana]);
        const _asado = new Correo(2, "Asado", "El sábado", _ana, [_luis]);
        const _proyecto = new Correo(3, "Proyecto final", "Avance del proyecto", _ana, [_luis]);
        return { _examen, _asado, _proyecto, _todos: [_examen, _asado, _proyecto] };
    }

    describe("listarAsuntos (map)", () => {
        it("devuelve los asuntos en el mismo orden que los correos", () => {
            const { _todos } = _crearCorreos();

            expect(listarAsuntos(_todos)).toEqual(["Examen final", "Asado", "Proyecto final"]);
        });

        it("devuelve una colección vacía si no hay correos", () => {
            expect(listarAsuntos([])).toEqual([]);
        });

        it("conserva los asuntos repetidos", () => {
            const _uno = new Correo(1, "Hola", "Texto", _ana, [_luis]);
            const _dos = new Correo(2, "Hola", "Otro texto", _luis, [_ana]);

            expect(listarAsuntos([_uno, _dos])).toEqual(["Hola", "Hola"]);
        });

        it("no modifica los correos ni la colección original", () => {
            const { _examen, _todos } = _crearCorreos();
            const _copia = [..._todos];

            const _resultado = listarAsuntos(_todos);
            _resultado.pop();

            expect(_todos).toEqual(_copia);
            expect(_examen.getAsunto()).toBe("Examen final");
        });
    });

    describe("filtrarCorreos (filter)", () => {
        it("devuelve solo los correos que cumplen la condición, en el mismo orden", () => {
            const { _examen, _proyecto, _todos } = _crearCorreos();

            expect(filtrarCorreos(_todos, asuntoContiene("final"))).toEqual([_examen, _proyecto]);
        });

        it("acepta condiciones combinadas con and y not", () => {
            const { _proyecto, _todos } = _crearCorreos();
            const _condicion = and(remitenteEs("ana@gmail.com"), not(asuntoContiene("asado")));

            expect(filtrarCorreos(_todos, _condicion)).toEqual([_proyecto]);
        });

        it("acepta una condición escrita como lambda", () => {
            const { _asado, _todos } = _crearCorreos();

            expect(filtrarCorreos(_todos, (c) => c.getAsunto().length < 6)).toEqual([_asado]);
        });

        it("devuelve una colección vacía si ninguno cumple o si la colección está vacía", () => {
            const { _todos } = _crearCorreos();

            expect(filtrarCorreos(_todos, asuntoContiene("zzzz"))).toEqual([]);
            expect(filtrarCorreos([], asuntoContiene("final"))).toEqual([]);
        });

        it("el resultado refleja los cambios de estado de los correos", () => {
            const { _examen, _todos } = _crearCorreos();
            expect(filtrarCorreos(_todos, noLeido)).toHaveLength(3);

            _examen.marcarComoLeido();

            expect(filtrarCorreos(_todos, noLeido)).not.toContain(_examen);
            expect(filtrarCorreos(_todos, noLeido)).toHaveLength(2);
        });

        it("devuelve un array nuevo y no modifica la colección original", () => {
            const { _todos } = _crearCorreos();
            const _copia = [..._todos];

            const _resultado = filtrarCorreos(_todos, () => true);
            _resultado.pop();

            expect(_resultado).not.toBe(_todos);
            expect(_todos).toEqual(_copia);
        });
    });

    describe("resumirCorreos (reduce)", () => {
        it("cuenta el total, los leídos y los no leídos", () => {
            const { _examen, _todos } = _crearCorreos();
            _examen.marcarComoLeido();

            expect(resumirCorreos(_todos)).toEqual({ total: 3, leidos: 1, noLeidos: 2 });
        });

        it("con una colección vacía devuelve todo en cero", () => {
            expect(resumirCorreos([])).toEqual({ total: 0, leidos: 0, noLeidos: 0 });
        });

        it("refleja los cambios al marcar como leído y como no leído", () => {
            const { _examen, _todos } = _crearCorreos();

            _examen.marcarComoLeido();
            expect(resumirCorreos(_todos).leidos).toBe(1);

            _examen.marcarComoNoLeido();
            expect(resumirCorreos(_todos).leidos).toBe(0);
        });

        it("leídos más no leídos siempre suman el total", () => {
            const { _examen, _asado, _todos } = _crearCorreos();
            _examen.marcarComoLeido();
            _asado.marcarComoLeido();

            const _resumen = resumirCorreos(_todos);

            expect(_resumen.leidos + _resumen.noLeidos).toBe(_resumen.total);
        });

        it("no modifica los correos", () => {
            const { _examen, _todos } = _crearCorreos();

            resumirCorreos(_todos);

            expect(_examen.getLeido()).toBe(false);
            expect(_todos).toHaveLength(3);
        });
    });

    describe("contarPorRemitente (reduce)", () => {
        it("cuenta los correos de cada remitente", () => {
            const { _todos } = _crearCorreos();

            const _conteo = contarPorRemitente(_todos);

            expect(_conteo.get("ana@gmail.com")).toBe(2);
            expect(_conteo.get("luis@ucp.edu.ar")).toBe(1);
        });

        it("mantiene el orden de aparición de los remitentes", () => {
            const { _todos } = _crearCorreos();

            expect([...contarPorRemitente(_todos).keys()]).toEqual(["luis@ucp.edu.ar", "ana@gmail.com"]);
        });

        it("con una colección vacía devuelve un conteo vacío", () => {
            expect(contarPorRemitente([]).size).toBe(0);
        });

        it("un remitente que no aparece no figura en el conteo", () => {
            const { _todos } = _crearCorreos();

            expect(contarPorRemitente(_todos).has("otro@gmail.com")).toBe(false);
        });
    });
});