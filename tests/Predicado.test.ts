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