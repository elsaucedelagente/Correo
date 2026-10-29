// Función auxiliar: decide si un texto tiene formato de email válido.
// No es parte de la clase; es una función suelta que solo se usa acá
function esEmailValido(email: string): boolean {
  // [...email] convierte el texto en una lista de caracteres sueltos.
  // .some(...) pregunta: "¿el caracter cumple esta condición?".
  // tieneEspacios es true si el email tiene algún espacio en cualquier parte.
  const tieneEspacios = [...email].some((caracter) => caracter.trim() === '');
  // Si tiene espacios, ya sabemos que es inválido y cortamos acá.
  if (tieneEspacios) return false;

  // split('@') corta el texto cada vez que aparece una arroba y devuelve las partes.
  const partes = email.split('@');
  // Tiene que haber un arroba, o sea 2 partes.
  if (partes.length !== 2) return false;

  // guardamos la primera parte en "local" (antes de la @)
  // y la segunda en "dominio" (después de la @).
  const [local, dominio] = partes;
  // La parte de antes de la arroba no puede estar vacía ("@ucp.com" es inválido).
  if (local.length === 0) return false;

  // Cortamos el dominio por los puntos.
  const etiquetas = dominio.split('.');

  return etiquetas.length >= 2 && etiquetas.every((etiqueta) => etiqueta.length > 0);
}

export class Contacto {

  readonly nombreCompleto: string;
  readonly email: string;
 
  constructor(nombreCompleto: string, email: string) 
  {

    const nombre = nombreCompleto?.trim() ?? '';

    const mail = email?.trim().toLowerCase() ?? '';
 

    if (nombre.length === 0) {
      throw new Error('El nombre completo es obligatorio');
    }

    if (!esEmailValido(mail)) {
      throw new Error(`Formato de email inválido: "${email}"`);
    }
 

    this.nombreCompleto = nombre;
    this.email = mail;
    // Object.freeze "congela" el objeto: nadie puede agregarle ni cambiarle propiedades desde afuera. 
    Object.freeze(this);
  }
 

  get dominio(): string {
    return this.email.split('@')[1];
  }
  // Compara dos contactosos contactos son "el mismo" si tienen el mismo email,
  // aunque el nombre sea distinto. Con esto la Agenda puede detectar duplicados.
  equals(otro: Contacto): boolean {
    return this.email === otro.email;
  }
 
  // creamos un contacto NUEVO con el nombre nuevo y el mismo email.
  // El original queda intacto, así los correos viejos que lo referencian no se alteran.
  conNombre(nuevoNombre: string): Contacto {
    return new Contacto(nuevoNombre, this.email);
  }
 
  // Lo mismo pero cambiando el email. Como pasa por el constructor,
  // el email nuevo también se valida y se normaliza.
  conEmail(nuevoEmail: string): Contacto {
    return new Contacto(this.nombreCompleto, nuevoEmail);
  }
 
  // Dice si el texto buscado aparece en el nombre o en el email.
  // Se va a usar en la búsqueda de correos (RF-04), para revisar remitente y destinatarios.
  coincideCon(texto: string): boolean {
    // Pasamos lo buscado a minúsculas para no distinguir mayúsculas de minúsculas.
    const t = texto.toLowerCase();
    // includes(t) es true si el texto aparece en cualquier parte (coincidencia parcial).
    // "||" significa "o": alcanza con que coincida el nombre O el email.
    // El email ya está guardado en minúsculas, por eso no hace falta convertirlo de nuevo.
    return (
      this.nombreCompleto.toLowerCase().includes(t) ||
      this.email.includes(t)
    );
  }
}
