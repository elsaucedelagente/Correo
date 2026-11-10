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
  cantidad(): number {
    return this._contactos.length;
  }

  // Como Contacto es inmutable, "modificar" reemplaza el contacto por uno nuevo.
  // Si algo falla (contacto inexistente, dato inválido o email duplicado),
  // la agenda queda exactamente como estaba.
  modificar(
    email: string,
    cambios: { nombreCompleto?: string; email?: string }
  ): Contacto {
    const actual = this.consultar(email);
    if (actual === undefined) {
      throw new Error(`No existe un contacto con el email "${email}"`);
    }

    let nuevo = actual;
    if (cambios.nombreCompleto !== undefined) {
      nuevo = nuevo.conNombre(cambios.nombreCompleto);
    }
    if (cambios.email !== undefined) {
      nuevo = nuevo.conEmail(cambios.email);
    }

    // Si el email cambió, no puede chocar con otro contacto de la agenda.
    if (!nuevo.equals(actual) && this.existe(nuevo.getEmail())) {
      throw new Error(`Ya existe un contacto con el email "${nuevo.getEmail()}"`);
    }

    this._contactos[this._contactos.indexOf(actual)] = nuevo;
    return nuevo;
  }

  // Baja. Los correos que referencian al contacto no se tocan,
  // porque guardan su propia referencia al objeto Contacto.
  eliminar(email: string): void {
    const actual = this.consultar(email);
    if (actual === undefined) {
      throw new Error(`No existe un contacto con el email "${email}"`);
    }
    this._contactos.splice(this._contactos.indexOf(actual), 1);
  }
}