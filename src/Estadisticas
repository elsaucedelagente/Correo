import { ICorreo } from "./ICorreo";
import { Predicado } from "./Predicados";

// RF-10: procesamiento funcional de colecciones de correos.
// Son funciones puras: reciben una colección y devuelven un resultado nuevo,
// sin modificar ni los correos ni la colección original.

export interface ResumenCorreos {
    total: number;
    leidos: number;
    noLeidos: number;
}

// RF-10 (map): transforma cada correo en su asunto, manteniendo el orden.
export const listarAsuntos = (correos: readonly ICorreo[]): string[] =>
    correos.map((_correo) => _correo.getAsunto());

// RF-10 (filter): se queda con los correos que cumplen la condición.
export const filtrarCorreos = (
    correos: readonly ICorreo[],
    condicion: Predicado<ICorreo>
): ICorreo[] => correos.filter((_correo) => condicion(_correo));

// RF-10 (reduce): junta toda la colección en un solo resumen.
export const resumirCorreos = (correos: readonly ICorreo[]): ResumenCorreos =>
    correos.reduce<ResumenCorreos>(
        (_resumen, _correo) => ({
            total: _resumen.total + 1,
            leidos: _resumen.leidos + (_correo.getLeido() ? 1 : 0),
            noLeidos: _resumen.noLeidos + (_correo.getLeido() ? 0 : 1),
        }),
        { total: 0, leidos: 0, noLeidos: 0 }
    );

// RF-10 (reduce): cuántos correos hay de cada remitente, por email.
// El Map se crea dentro de la función y es lo único que se modifica.
export const contarPorRemitente = (correos: readonly ICorreo[]): Map<string, number> =>
    correos.reduce((_conteo, _correo) => {
        const _email = _correo.getRemitente().getEmail();
        _conteo.set(_email, (_conteo.get(_email) ?? 0) + 1);
        return _conteo;
    }, new Map<string, number>());