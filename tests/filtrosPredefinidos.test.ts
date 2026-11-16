import { describe, it, expect } from "vitest";
import { pendientesDeRevision, correosParaSeguimiento } from "../src/filtrosPredefinidos";
import { RegistroFiltros } from "../src/RegistroFiltros";
import { Contacto } from "../src/Contacto";
import { Correo } from "../src/Correo";

describe("RF-08: el estado de lectura se refleja en los filtros", () => {
    const _ana = new Contacto("Ana", "ana@gmail.com");
    const _luis = new Contacto("Luis", "luis@gmail.com");

    // Se crean nuevos en cada test para que ninguno dependa del estado de otro.
    function _crearCorreos() {
        const _entrega = new Correo(1, "Trabajo práctico", "Recordá la Entrega del TP", _ana, [_luis]);
        const _proyecto = new Correo(2, "Reunión de proyecto", "Nos vemos el lunes", _ana, [_luis]);
        const _asado = new Correo(3, "Asado", "El sábado a la noche", _ana, [_luis]);
        return { _entrega, _proyecto, _asado, _todos: [_entrega, _proyecto, _asado] };
    }

    describe("Pendientes de revisión (no leído y con Entrega)", () => {
        it("un correo no leído con Entrega aparece", () => {
            const { _entrega, _todos } = _crearCorreos();

            expect(pendientesDeRevision().aplicar(_todos)).toEqual([_entrega]);
        });

        it("al marcarlo como leído desaparece inmediatamente", () => {
            const { _entrega, _todos } = _crearCorreos();
            const _filtro = pendientesDeRevision();
            expect(_filtro.aplicar(_todos)).toEqual([_entrega]);

            _entrega.marcarComoLeido();

            expect(_filtro.aplicar(_todos)).toEqual([]);
        });

        it("al marcarlo de nuevo como no leído vuelve a aparecer", () => {
            const { _entrega, _todos } = _crearCorreos();
            const _filtro = pendientesDeRevision();
            _entrega.marcarComoLeido();

            _entrega.marcarComoNoLeido();

            expect(_filtro.aplicar(_todos)).toEqual([_entrega]);
        });

        it("marcar como leído un correo que no cumple el resto de la condición no cambia nada", () => {
            const { _entrega, _asado, _todos } = _crearCorreos();

            _asado.marcarComoLeido();

            expect(pendientesDeRevision().aplicar(_todos)).toEqual([_entrega]);
        });
    });

    describe("Correos para seguimiento (Proyecto o Reunión, excluyendo leídos)", () => {
        it("un correo no leído con Reunión aparece", () => {
            const { _proyecto, _todos } = _crearCorreos();

            expect(correosParaSeguimiento().aplicar(_todos)).toEqual([_proyecto]);
        });

        it("al marcarlo como leído sale del resultado", () => {
            const { _proyecto, _todos } = _crearCorreos();
            const _filtro = correosParaSeguimiento();
            expect(_filtro.aplicar(_todos)).toEqual([_proyecto]);

            _proyecto.marcarComoLeido();

            expect(_filtro.aplicar(_todos)).toEqual([]);
        });

        it("al marcarlo de nuevo como no leído vuelve a entrar", () => {
            const { _proyecto, _todos } = _crearCorreos();
            const _filtro = correosParaSeguimiento();
            _proyecto.marcarComoLeido();

            _proyecto.marcarComoNoLeido();

            expect(_filtro.aplicar(_todos)).toEqual([_proyecto]);
        });
    });

    describe("filtros registrados", () => {
        it("un filtro registrado refleja los cambios sin volver a guardar los correos", () => {
            const { _entrega, _proyecto, _todos } = _crearCorreos();
            const _registro = new RegistroFiltros();
            _registro.registrar(pendientesDeRevision());
            _registro.registrar(correosParaSeguimiento());

            expect(_registro.aplicar("Pendientes de revisión", _todos)).toEqual([_entrega]);
            expect(_registro.aplicar("Correos para seguimiento", _todos)).toEqual([_proyecto]);

            _entrega.marcarComoLeido();
            _proyecto.marcarComoLeido();

            expect(_registro.aplicar("Pendientes de revisión", _todos)).toEqual([]);
            expect(_registro.aplicar("Correos para seguimiento", _todos)).toEqual([]);
        });
    });
});