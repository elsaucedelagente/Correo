import { describe, it, expect, vi } from "vitest";
import { and, or, not } from "../src/Predicados";
import type { Predicado } from "../src/Predicados";

describe("Predicados: combinadores AND / OR / NOT", () => {
    const _esPar: Predicado<number> = (n) => n % 2 === 0;
    const _mayorA10: Predicado<number> = (n) => n > 10;
    const _numeros = [3, 4, 12, 13, 7];

    describe("and", () => {
        it("exige que se cumplan todos los predicados", () => {
            expect(_numeros.filter(and(_esPar, _mayorA10))).toEqual([12]);
        });
        it("con un solo predicado se comporta como ese predicado", () => {
            expect(_numeros.filter(and(_esPar))).toEqual([4, 12]);
        });

        it("sin predicados acepta todo", () => {
            expect(_numeros.filter(and())).toEqual(_numeros);
        });

        it("deja de evaluar en cuanto un predicado falla", () => {
            const _segundo = vi.fn(() => true);

            and<number>(() => false, _segundo)(1);

            expect(_segundo).not.toHaveBeenCalled();
        });
    });
    
describe("or", () => {
        it("exige que se cumpla al menos uno", () => {
            expect(_numeros.filter(or(_esPar, _mayorA10))).toEqual([4, 12, 13]);
        });

        it("con un solo predicado se comporta como ese predicado", () => {
            expect(_numeros.filter(or(_mayorA10))).toEqual([12, 13]);
        });

        it("sin predicados no acepta nada", () => {
            expect(_numeros.filter(or())).toEqual([]);
        });

        it("deja de evaluar en cuanto un predicado se cumple", () => {
            const _segundo = vi.fn(() => false);

            or<number>(() => true, _segundo)(1);

            expect(_segundo).not.toHaveBeenCalled();
        });
    });

    describe("not", () => {
        it("invierte el resultado del predicado", () => {
            expect(_numeros.filter(not(_esPar))).toEqual([3, 13, 7]);
        });

        it("negar dos veces devuelve el resultado original", () => {
            expect(_numeros.filter(not(not(_esPar)))).toEqual([4, 12]);
        });
    });

    describe("composición", () => {
        it("se pueden anidar combinadores", () => {
            expect(_numeros.filter(not(and(_esPar, _mayorA10)))).toEqual([3, 4, 13, 7]);
            expect(_numeros.filter(and(or(_esPar, _mayorA10), not(_esPar)))).toEqual([13]);
        });

        it("combinar predicados no modifica los predicados originales", () => {
            const _combinado = and(_esPar, _mayorA10);

            _combinado(12);

            expect(_esPar(3)).toBe(false);
            expect(_mayorA10(3)).toBe(false);
            expect(_esPar(4)).toBe(true);
        });

        it("devuelve un predicado nuevo y no el mismo que se le pasó", () => {
            expect(and(_esPar)).not.toBe(_esPar);
            expect(or(_esPar)).not.toBe(_esPar);
            expect(not(_esPar)).not.toBe(_esPar);
        });
    });
});