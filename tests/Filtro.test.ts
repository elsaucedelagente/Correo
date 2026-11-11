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