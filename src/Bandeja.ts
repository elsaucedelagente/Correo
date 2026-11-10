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
}
