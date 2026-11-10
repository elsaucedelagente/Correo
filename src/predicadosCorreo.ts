import { ICorreo } from './ICorreo';
import { Predicado } from './Predicados';

const normalizar = (texto: string): string => texto.trim().toLowerCase();

export const asuntoContiene = (texto: string): Predicado<ICorreo> => {
  const t = normalizar(texto);
  return (correo) => correo.getAsunto().toLowerCase().includes(t);
};

export const contenidoContiene = (texto: string): Predicado<ICorreo> => {
  const t = normalizar(texto);
  return (correo) => correo.getContenido().toLowerCase().includes(t);
};

// Acepta "ucp.edu.ar" o "@ucp.edu.ar". El "@" evita que "miucp.edu.ar" coincida.
export const remitenteDeDominio = (dominio: string): Predicado<ICorreo> => {
  const d = normalizar(dominio);
  const sufijo = d.startsWith('@') ? d : '@' + d;
  return (correo) => correo.getRemitente().getEmail().endsWith(sufijo);
};

export const remitenteEs = (email: string): Predicado<ICorreo> => {
  const e = normalizar(email);
  return (correo) => correo.getRemitente().getEmail() === e;
};

export const noLeido: Predicado<ICorreo> = (correo) => !correo.getLeido();
export const leido: Predicado<ICorreo> = (correo) => correo.getLeido();
export const esFavorito: Predicado<ICorreo> = (correo) => correo.getFavorito();