export type Predicado<T> = (elemento: T) => boolean;

// Cumple todos los predicados.
export const and = <T>(...predicados: Predicado<T>[]): Predicado<T> =>
  (elemento) => predicados.every((p) => p(elemento));

// Cumple AL MENOS UNO.
export const or = <T>(...predicados: Predicado<T>[]): Predicado<T> =>
  (elemento) => predicados.some((p) => p(elemento));

// Invierte el resultado.
export const not = <T>(predicado: Predicado<T>): Predicado<T> =>
  (elemento) => !predicado(elemento);