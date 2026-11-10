import {ICorreo} from "./ICorreo";
import {IContacto} from "./IContacto";

export class Correo implements ICorreo{
    private readonly _id: number;
    private _asunto: string;
    private _contenido: string;
    private _remitente: IContacto;
    private _destinatarios: IContacto[];
    private _leido: boolean;
    private _favorito: boolean;
    private _enviado: boolean;

    constructor(id: number, asunto: string, contenido: string, remitente: IContacto, destinatarios: IContacto[]){
        if (!remitente) {
            throw new Error("El remitente es obligatorio");
        }
        this._id = id;
        this._asunto = asunto;
        this._contenido = contenido;
        this._remitente = remitente;
        this._destinatarios = [];
        for (const _destinatario of destinatarios) {
            this.agregarSinRepetir(_destinatario);
        }
        this._leido = false;
        this._favorito = false;
        this._enviado = false;
    }

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

    // Un borrador puede estar incompleto. Esto devuelve la lista de lo que
    // le falta para poder enviarse; si está vacía, se puede enviar.
    validarParaEnvio(): string[] {
        const _errores: string[] = [];
        if (this._asunto.trim() === "") {
            _errores.push("El asunto es obligatorio");
        }
        if (this._destinatarios.length === 0) {
            _errores.push("Debe tener al menos un destinatario");
        }
        return _errores;
    }

    puedeEnviarse(): boolean {
        return this.validarParaEnvio().length === 0;
    }

    setAsunto(asunto: string): void {
        this._asunto = asunto;
    }

    setContenido(contenido: string): void {
        this._contenido = contenido;
    }

    // Mientras no está enviado, el correo es un borrador (RF-07).
    estaEnviado(): boolean {
        return this._enviado;
    }

    // Solo se envía un correo completo, y una sola vez.
    marcarComoEnviado(): void {
        if (this._enviado) {
            throw new Error("El correo ya fue enviado");
        }
        const _errores = this.validarParaEnvio();
        if (_errores.length > 0) {
            throw new Error(`No se puede enviar: ${_errores.join(", ")}`);
        }
        this._enviado = true;
    }

    // Dos contactos con el mismo email son el mismo destinatario,
    // así que solo se agrega si todavía no está en la lista.
    private agregarSinRepetir(destinatario: IContacto): void {
        const _yaEsta = this._destinatarios.some((_d) => _d.equals(destinatario));
        if (!_yaEsta) {
            this._destinatarios.push(destinatario);
        }
    }
}