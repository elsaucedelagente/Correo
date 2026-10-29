import {ICorreo} from "./ICorreo";
import {IContacto} from "./IContacto";

export class Correo {
    private readonly _id: number;
    private _asunto: string;
    private _contenido: string;
    private _remitente: IContacto;
    private _destinatarios: readonly IContacto[];
    private _leido: boolean;
    private _favorito: boolean;

    constructor(
        

    )

    getId(): number{
        return this._id;
    }

    getAsunto(): string {
        return this._asunto;
    }


    getContenido(): string {
        return this._contenido;
    }

    getRemitente(): IContacto {
        return this._remitente;
    }

    getDestinatarios(): readonly IContacto[] {
        return [...this._destinatarios];
    }

    getLeido(): boolean{
        return this._leido;
    }

    getFavorito(): boolean{
        return this._favorito;
    }


    

}