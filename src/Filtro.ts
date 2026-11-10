import { ICorreo } from './ICorreo';
import { Predicado } from './Predicados';

// Un filtro es un nombre + un predicado. NO guarda correos:
// evalúa los que le pasen en el momento de la consulta.
export class Filtro {
  private readonly _nombre: string;
  private readonly _predicado: Predicado<ICorreo>;

  constructor(nombre: string, predicado: Predicado<ICorreo>) {
    const n = nombre?.trim() ?? '';
    if (n.length === 0) {
      throw new Error('El filtro necesita un nombre');
    }
    this._nombre = n;
    this._predicado = predicado;
  }

  getNombre(): string {
    return this._nombre;
  }

  // Permite reutilizar el predicado de un filtro para construir otros.
  getPredicado(): Predicado<ICorreo> {
    return this._predicado;
  }

  cumple(correo: ICorreo): boolean {
    return this._predicado(correo);
  }

  aplicar(correos: readonly ICorreo[]): ICorreo[] {
    return correos.filter((correo) => this._predicado(correo));
  }
}