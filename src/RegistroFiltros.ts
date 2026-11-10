import { ICorreo } from './ICorreo';
import { Filtro } from './Filtro';

export const MAX_FILTROS = 5;

export class RegistroFiltros {
  // La clave es el nombre en minúsculas, para no repetir nombres.
  private readonly _filtros = new Map<string, Filtro>();

  registrar(filtro: Filtro): void {
    const clave = filtro.getNombre().toLowerCase();
    if (this._filtros.has(clave)) {
      throw new Error(`Ya existe un filtro llamado "${filtro.getNombre()}"`);
    }
    if (this._filtros.size >= MAX_FILTROS) {
      throw new Error(`No se pueden registrar más de ${MAX_FILTROS} filtros`);
    }
    this._filtros.set(clave, filtro);
  }

  obtener(nombre: string): Filtro | undefined {
    return this._filtros.get(nombre.trim().toLowerCase());
  }

  listar(): readonly Filtro[] {
    return [...this._filtros.values()];
  }

  // Aplica un filtro registrado sobre cualquier colección de correos.
  aplicar(nombre: string, correos: readonly ICorreo[]): ICorreo[] {
    const filtro = this.obtener(nombre);
    if (filtro === undefined) {
      throw new Error(`No existe el filtro "${nombre}"`);
    }
    return filtro.aplicar(correos);
  }
}