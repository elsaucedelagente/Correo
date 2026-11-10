import {ICorreo} from "./ICorreo";
import {Bandeja} from "./Bandeja";

export type NombreBandeja = "Entrada" | "Enviados" | "Borradores" | "Eliminados";

// El buzón es el único que mueve correos entre bandejas.
// Las bandejas no se exponen hacia afuera, así nadie puede agregar
// un correo a una bandeja salteándose las reglas del dominio.
export class Buzon {
    private readonly _bandejas: Map<NombreBandeja, Bandeja>;

    constructor() {
        this._bandejas = new Map<NombreBandeja, Bandeja>([
            ["Entrada", new Bandeja("Entrada")],
            ["Enviados", new Bandeja("Enviados")],
            ["Borradores", new Bandeja("Borradores")],
            ["Eliminados", new Bandeja("Eliminados")],
        ]);
    }

    listar(nombre: NombreBandeja): readonly ICorreo[] {
        return this.bandeja(nombre).listar();
    }

    cantidad(nombre: NombreBandeja): number {
        return this.bandeja(nombre).cantidad();
    }

    // En qué bandeja está el correo, o undefined si no está en el buzón.
    ubicacion(correo: ICorreo): NombreBandeja | undefined {
        for (const [_nombre, _bandeja] of this._bandejas) {
            if (_bandeja.contiene(correo)) {
                return _nombre;
            }
        }
        return undefined;
    }

    // Un correo que llega de afuera va a Entrada.
    recibir(correo: ICorreo): void {
        this.verificarQueNoEsteEnElBuzon(correo);
        this.bandeja("Entrada").agregar(correo);
    }

    // Un borrador puede estar incompleto, pero no puede estar ya enviado.
    guardarBorrador(correo: ICorreo): void {
        if (correo.estaEnviado()) {
            throw new Error("Un correo enviado no puede guardarse como borrador");
        }
        this.verificarQueNoEsteEnElBuzon(correo);
        this.bandeja("Borradores").agregar(correo);
    }

    // Envío simulado (RF-02). Se puede enviar un correo nuevo o un borrador.
    // marcarComoEnviado valida remitente, asunto y destinatarios, y falla si
    // ya se envió; como se llama antes de mover nada, si falla el buzón queda igual.
    enviar(correo: ICorreo): void {
        const _actual = this.ubicacion(correo);
        if (_actual === "Enviados") {
            throw new Error(`El correo ${correo.getId()} ya fue enviado`);
        }
        if (_actual !== undefined && _actual !== "Borradores") {
            throw new Error(`No se puede enviar un correo de la bandeja "${_actual}"`);
        }

        correo.marcarComoEnviado();

        if (_actual === "Borradores") {
            this.bandeja("Borradores").quitar(correo);
        }
        this.bandeja("Enviados").agregar(correo);
    }

    private bandeja(nombre: NombreBandeja): Bandeja {
        return this._bandejas.get(nombre)!;
    }

    // Cada correo pertenece a una sola bandeja a la vez.
    private verificarQueNoEsteEnElBuzon(correo: ICorreo): void {
        const _actual = this.ubicacion(correo);
        if (_actual !== undefined) {
            throw new Error(`El correo ${correo.getId()} ya está en la bandeja "${_actual}"`);
        }
    }
}
