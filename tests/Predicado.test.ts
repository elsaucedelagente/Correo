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
