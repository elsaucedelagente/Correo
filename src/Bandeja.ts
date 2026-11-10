import {ICorreo} from "./ICorreo";

export class Bandeja {
    private readonly _nombre: string;
    private _correos: ICorreo[];

    constructor(nombre: string){
        this._nombre = nombre;
        this._correos = [];
    }

    getNombre(): string {
        return this._nombre;
    }

    cantidad(): number {
        return this._correos.length;
    }

    // Devuelve una copia: modificar la lista de afuera no cambia la bandeja.
    listar(): readonly ICorreo[] {
        return [...this._correos];
    }

    // Un correo se identifica por su id, así que dos objetos con el
    // mismo id cuentan como el mismo correo.
    contiene(correo: ICorreo): boolean {
        return this._correos.some((_c) => _c.getId() === correo.getId());
    }

    // No se permiten duplicados: agregar dos veces el mismo correo es un error.
    agregar(correo: ICorreo): void {
        if (this.contiene(correo)) {
            throw new Error(`El correo ${correo.getId()} ya está en la bandeja "${this._nombre}"`);
        }
        this._correos.push(correo);
    }

    quitar(correo: ICorreo): void {
        if (!this.contiene(correo)) {
            throw new Error(`El correo ${correo.getId()} no está en la bandeja "${this._nombre}"`);
        }
        this._correos = this._correos.filter((_c) => _c.getId() !== correo.getId());
    }
}
