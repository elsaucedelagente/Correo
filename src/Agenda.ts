import { Contacto } from './Contacto';

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export class Agenda {
  private readonly _contactos: Contacto[] = [];

  agregar(contacto: Contacto): void {
    if (this.existe(contacto.getEmail())) {
      throw new Error(`Ya existe un contacto con el email "${contacto.getEmail()}"`);
    }
    this._contactos.push(contacto);
  }

  existe(email: string): boolean {
    return this.consultar(email) !== undefined;
  }
  consultar(email: string): Contacto | undefined {
    const buscado = normalizarEmail(email);
    return this._contactos.find((c) => c.getEmail() === buscado);
  }

  listar(): readonly Contacto[] {
    return [...this._contactos];
  }