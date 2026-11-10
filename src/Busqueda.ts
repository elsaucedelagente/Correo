import { ICorreo } from './ICorreo';
import { Predicado } from './Predicados';

// Predicado de búsqueda de texto libre: se puede reutilizar dentro de filtros.
// Decisión de diseño: un texto vacío no coincide con nada.
export const coincideConTexto = (texto: string): Predicado<ICorreo> => {
  const t = texto.trim().toLowerCase();

  return (correo) => {
    if (t.length === 0) return false;

    const contactos = [correo.getRemitente(), ...correo.getDestinatarios()];
    const campos = [
      correo.getAsunto(),
      correo.getContenido(),
      ...contactos.flatMap((c) => [c.getNombreCompleto(), c.getEmail()]),
    ];
    return campos.some((campo) => campo.toLowerCase().includes(t));
  };
};

// filter devuelve un array NUEVO y evalúa cada correo una sola vez:
// no hay duplicados y los originales no se modifican.
export const buscarCorreos = (
  correos: readonly ICorreo[],
  texto: string
): ICorreo[] => correos.filter(coincideConTexto(texto));