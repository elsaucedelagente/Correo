import { Filtro } from './Filtro';
import { and, or, not } from './Predicados';
import {
  asuntoContiene,
  contenidoContiene,
  remitenteDeDominio,
  remitenteEs,
  noLeido,
  leido,
  esFavorito,
} from './predicadosCorreo';

// Predicado compartido: se reutiliza en dos filtros.
const deLaUCP = remitenteDeDominio('ucp.edu.ar');

export const correosDeLaUCP = (): Filtro =>
  new Filtro('Correos de la UCP', deLaUCP);

export const correosAcademicosImportantes = (): Filtro =>
  new Filtro('Correos académicos importantes', and(deLaUCP, asuntoContiene('Examen')));

export const pendientesDeRevision = (): Filtro =>
  new Filtro('Pendientes de revisión', and(noLeido, contenidoContiene('Entrega')));

export const correosPersonalesPrioritarios = (emailContacto: string): Filtro =>
  new Filtro('Correos personales prioritarios', and(esFavorito, remitenteEs(emailContacto)));

export const correosParaSeguimiento = (): Filtro =>
  new Filtro(
    'Correos para seguimiento',
    and(or(asuntoContiene('Proyecto'), asuntoContiene('Reunión')), not(leido))
  );