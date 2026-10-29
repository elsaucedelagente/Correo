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