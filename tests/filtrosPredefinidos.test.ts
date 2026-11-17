import { describe, it, expect, beforeEach } from "vitest";
import {
    correosDeLaUCP,
    correosAcademicosImportantes,
    pendientesDeRevision,
    correosPersonalesPrioritarios,
    correosParaSeguimiento,
} from "../src/filtrosPredefinidos";
import { RegistroFiltros } from "../src/RegistroFiltros";
import { Contacto } from "../src/Contacto";
import { Correo } from "../src/Correo";

describe("RF-05: los cinco filtros del enunciado", () => {
    const _docente = new Contacto("Docente UCP", "docente@ucp.edu.ar");
    const _ana = new Contacto("Ana", "ana@gmail.com");
    const _amigo = new Contacto("Amigo", "amigo@gmail.com");
    const _luis = new Contacto("Luis", "luis@gmail.com");

    let _c1: Correo;
    let _c2: Correo;
    let _c3: Correo;
    let _c4: Correo;
    let _c5: Correo;
    let _c6: Correo;
    let _todos: Correo[];

    // Se recrean antes de cada test, así los cambios de un test no afectan al siguiente.
    beforeEach(() => {
        _c1 = new Correo(1, "Examen final de Paradigmas", "Fecha del examen", _docente, [_luis]);
        _c2 = new Correo(2, "Notas del parcial", "Ya están las notas", _docente, [_luis]);
        _c3 = new Correo(3, "Entrega del proyecto", "Recordá la Entrega del TP", _ana, [_luis]);
        _c4 = new Correo(4, "Asado", "El sábado a la noche", _amigo, [_luis]);
        _c5 = new Correo(5, "Reunión de proyecto", "Nos vemos el lunes", _ana, [_luis]);
        _c6 = new Correo(6, "Proyecto final", "Avance del proyecto", _ana, [_luis]);
        _c2.marcarComoLeido();
        _c4.marcarComoFavorito();
        _c5.marcarComoFavorito();
        _c6.marcarComoLeido();
        _todos = [_c1, _c2, _c3, _c4, _c5, _c6];
    });

    describe("Correos de la UCP", () => {
        it("tiene el nombre del enunciado", () => {
            expect(correosDeLaUCP().getNombre()).toBe("Correos de la UCP");
        });

        it("encuentra los correos cuyo remitente es del dominio @ucp.edu.ar", () => {
            expect(correosDeLaUCP().aplicar(_todos)).toEqual([_c1, _c2]);
        });
    });

    describe("Correos académicos importantes", () => {
        it("tiene el nombre del enunciado", () => {
            expect(correosAcademicosImportantes().getNombre()).toBe("Correos académicos importantes");
        });

        it("exige dominio UCP y asunto con Examen (AND)", () => {
            expect(correosAcademicosImportantes().aplicar(_todos)).toEqual([_c1]);
        });

        it("no alcanza con cumplir solo una de las dos condiciones", () => {
            const _soloDominio = new Correo(7, "Notas", "Texto", _docente, [_luis]);
            const _soloAsunto = new Correo(8, "Examen", "Texto", _ana, [_luis]);

            expect(correosAcademicosImportantes().aplicar([_soloDominio, _soloAsunto])).toEqual([]);
        });
    });

    describe("Pendientes de revisión", () => {
        it("tiene el nombre del enunciado", () => {
            expect(pendientesDeRevision().getNombre()).toBe("Pendientes de revisión");
        });

        it("exige no leído y contenido con Entrega (AND con NOT)", () => {
            expect(pendientesDeRevision().aplicar(_todos)).toEqual([_c3]);
        });

        it("un correo con Entrega que ya fue leído no aparece", () => {
            const _leidoConEntrega = new Correo(7, "Hola", "Entrega", _ana, [_luis]);
            _leidoConEntrega.marcarComoLeido();

            expect(pendientesDeRevision().aplicar([_leidoConEntrega])).toEqual([]);
        });

        it("un correo no leído sin Entrega en el contenido no aparece", () => {
            expect(pendientesDeRevision().aplicar([_c1])).toEqual([]);
        });
    });

    describe("Correos personales prioritarios", () => {
        it("tiene el nombre del enunciado", () => {
            expect(correosPersonalesPrioritarios("amigo@gmail.com").getNombre()).toBe(
                "Correos personales prioritarios"
            );
        });

        it("exige favorito y remitente indicado (AND)", () => {
            expect(correosPersonalesPrioritarios("amigo@gmail.com").aplicar(_todos)).toEqual([_c4]);
        });

        it("cambia el resultado según el contacto elegido", () => {
            expect(correosPersonalesPrioritarios("ana@gmail.com").aplicar(_todos)).toEqual([_c5]);
        });

        it("un contacto sin correos favoritos devuelve una colección vacía", () => {
            expect(correosPersonalesPrioritarios("docente@ucp.edu.ar").aplicar(_todos)).toEqual([]);
        });

        it("al desmarcar el favorito deja de aparecer y al marcarlo vuelve", () => {
            const _filtro = correosPersonalesPrioritarios("amigo@gmail.com");

            _c4.desmarcarComoFavorito();
            expect(_filtro.aplicar(_todos)).toEqual([]);

            _c4.marcarComoFavorito();
            expect(_filtro.aplicar(_todos)).toEqual([_c4]);
        });
    });

    describe("Correos para seguimiento", () => {
        it("tiene el nombre del enunciado", () => {
            expect(correosParaSeguimiento().getNombre()).toBe("Correos para seguimiento");
        });

        it("exige asunto con Proyecto o Reunión y que no esté leído (OR dentro de AND, con NOT)", () => {
            expect(correosParaSeguimiento().aplicar(_todos)).toEqual([_c3, _c5]);
        });

        it("excluye los correos leídos aunque el asunto coincida", () => {
            expect(correosParaSeguimiento().aplicar(_todos)).not.toContain(_c6);
        });

        it("encuentra por cualquiera de las dos palabras del asunto", () => {
            expect(correosParaSeguimiento().aplicar([_c3])).toEqual([_c3]);
            expect(correosParaSeguimiento().aplicar([_c5])).toEqual([_c5]);
        });
    });

    describe("comportamiento general", () => {
        it("cada llamada devuelve un filtro nuevo", () => {
            expect(correosDeLaUCP()).not.toBe(correosDeLaUCP());
        });

        it("un mismo filtro se aplica sobre distintas colecciones", () => {
            const _filtro = correosDeLaUCP();

            expect(_filtro.aplicar([_c1, _c3])).toEqual([_c1]);
            expect(_filtro.aplicar([_c2, _c4])).toEqual([_c2]);
            expect(_filtro.aplicar([])).toEqual([]);
        });

        it("aplicar los filtros no modifica los correos ni la colección", () => {
            const _copia = [..._todos];
            const _estadoLeido = _todos.map((c) => c.getLeido());
            const _estadoFavorito = _todos.map((c) => c.getFavorito());

            correosDeLaUCP().aplicar(_todos);
            correosAcademicosImportantes().aplicar(_todos);
            pendientesDeRevision().aplicar(_todos);
            correosPersonalesPrioritarios("amigo@gmail.com").aplicar(_todos);
            correosParaSeguimiento().aplicar(_todos);

            expect(_todos).toEqual(_copia);
            expect(_todos.map((c) => c.getLeido())).toEqual(_estadoLeido);
            expect(_todos.map((c) => c.getFavorito())).toEqual(_estadoFavorito);
        });

        it("los cinco filtros entran justo en el registro de cinco", () => {
            const _registro = new RegistroFiltros();

            _registro.registrar(correosDeLaUCP());
            _registro.registrar(correosAcademicosImportantes());
            _registro.registrar(pendientesDeRevision());
            _registro.registrar(correosPersonalesPrioritarios("amigo@gmail.com"));
            _registro.registrar(correosParaSeguimiento());

            expect(_registro.listar()).toHaveLength(5);
            expect(_registro.aplicar("Correos de la UCP", _todos)).toEqual([_c1, _c2]);
        });

        it("hay un filtro simple y cuatro complejos que combinan dos o más condiciones", () => {
            // El simple es el de la UCP: coincide con todo lo que cumple una sola condición.
            // Los otros cuatro dan un resultado más chico porque exigen más de una condición.
            expect(correosDeLaUCP().aplicar(_todos)).toHaveLength(2);
            expect(correosAcademicosImportantes().aplicar(_todos)).toHaveLength(1);
            expect(pendientesDeRevision().aplicar(_todos)).toHaveLength(1);
            expect(correosPersonalesPrioritarios("amigo@gmail.com").aplicar(_todos)).toHaveLength(1);
            expect(correosParaSeguimiento().aplicar(_todos)).toHaveLength(2);
        });
    });
});
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