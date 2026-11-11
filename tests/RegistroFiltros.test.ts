import { describe, it, expect } from "vitest";
import { RegistroFiltros, MAX_FILTROS } from "../src/RegistroFiltros";
import { Filtro } from "../src/Filtro";
import { asuntoContiene } from "../src/predicadosCorreo";
import { Contacto } from "../src/Contacto";
import { Correo } from "../src/Correo";

describe("RF-05: registro de filtros", () => {
    const _maria = new Contacto("Maria", "maria@gmail.com");
    const _carlos = new Contacto("Carlos", "carlos@gmail.com");

    const _filtro = (nombre: string, texto = nombre): Filtro =>
        new Filtro(nombre, asuntoContiene(texto));

    it("un registro nuevo está vacío", () => {
        const _registro = new RegistroFiltros();

        expect(_registro.listar()).toEqual([]);
    });

    it("permite registrar filtros y consultarlos por nombre", () => {
        const _registro = new RegistroFiltros();
        const _examen = _filtro("Examen");

        _registro.registrar(_examen);

        expect(_registro.obtener("Examen")).toBe(_examen);
        expect(_registro.listar()).toEqual([_examen]);
    });

    it("la consulta por nombre ignora mayúsculas y espacios", () => {
        const _registro = new RegistroFiltros();
        const _examen = _filtro("Examen");
        _registro.registrar(_examen);

        expect(_registro.obtener("  EXAMEN ")).toBe(_examen);
    });

    it("devuelve undefined si el filtro no existe", () => {
        const _registro = new RegistroFiltros();

        expect(_registro.obtener("Inexistente")).toBeUndefined();
    });

    it("permite registrar hasta cinco filtros", () => {
        const _registro = new RegistroFiltros();

        for (let _i = 1; _i <= MAX_FILTROS; _i++) {
            _registro.registrar(_filtro(`Filtro ${_i}`));
        }

        expect(MAX_FILTROS).toBe(5);
        expect(_registro.listar()).toHaveLength(5);
    });

    it("impide registrar más de cinco filtros", () => {
        const _registro = new RegistroFiltros();
        for (let _i = 1; _i <= MAX_FILTROS; _i++) {
            _registro.registrar(_filtro(`Filtro ${_i}`));
        }

        expect(() => _registro.registrar(_filtro("Sexto"))).toThrow("No se pueden registrar más de 5 filtros");
        expect(_registro.listar()).toHaveLength(5);
        expect(_registro.obtener("Sexto")).toBeUndefined();
    });

    it("impide registrar dos filtros con el mismo nombre", () => {
        const _registro = new RegistroFiltros();
        _registro.registrar(_filtro("Examen"));

        expect(() => _registro.registrar(_filtro("examen", "otro"))).toThrow('Ya existe un filtro llamado "examen"');
        expect(_registro.listar()).toHaveLength(1);
    });

    it("listar devuelve una copia que no modifica el registro", () => {
        const _registro = new RegistroFiltros();
        _registro.registrar(_filtro("Examen"));

        (_registro.listar() as Filtro[]).pop();

        expect(_registro.listar()).toHaveLength(1);
    });

    describe("aplicar un filtro registrado", () => {
        const _examen = new Correo(1, "Fecha de examen", "Texto", _carlos, [_maria]);
        const _asado = new Correo(2, "Asado", "Texto", _maria, [_carlos]);
        const _final = new Correo(3, "Examen final", "Texto", _maria, [_carlos]);

        it("aplica el filtro por nombre sobre una colección", () => {
            const _registro = new RegistroFiltros();
            _registro.registrar(_filtro("Examen"));

            expect(_registro.aplicar("Examen", [_examen, _asado, _final])).toEqual([_examen, _final]);
        });

        it("el mismo filtro registrado se aplica sobre colecciones distintas", () => {
            const _registro = new RegistroFiltros();
            _registro.registrar(_filtro("Examen"));

            expect(_registro.aplicar("Examen", [_examen, _asado])).toEqual([_examen]);
            expect(_registro.aplicar("Examen", [_asado, _final])).toEqual([_final]);
            expect(_registro.aplicar("Examen", [])).toEqual([]);
        });

        it("falla si se aplica un filtro que no está registrado", () => {
            const _registro = new RegistroFiltros();

            expect(() => _registro.aplicar("Inexistente", [_examen])).toThrow('No existe el filtro "Inexistente"');
        });

        it("no modifica la colección original", () => {
            const _registro = new RegistroFiltros();
            _registro.registrar(_filtro("Examen"));
            const _correos = [_examen, _asado, _final];

            _registro.aplicar("Examen", _correos);

            expect(_correos).toEqual([_examen, _asado, _final]);
        });
    });
});
