import {ICorreo} from "./ICorreo";
import {IContacto} from "./IContacto";
import {Correo} from "./Correo";
import {Buzon} from "./Buzon";

// El gestor de mail es el sistema completo: tiene un Buzon por cada usuario
// registrado y es el único que reparte un correo enviado entre los buzones.
// Cada Buzon sigue manejando solo las bandejas de UNA persona.
export class GestorMail {
    // La clave es el email del usuario (ya viene normalizado por Contacto).
    private readonly _buzones = new Map<string, Buzon>();

    // Da de alta a un usuario con su buzón propio (4 bandejas vacías).
    registrar(usuario: IContacto): Buzon {
        if (this.estaRegistrado(usuario)) {
            throw new Error(`El usuario ${usuario.getEmail()} ya está registrado`);
        }
        const _buzon = new Buzon();
        this._buzones.set(usuario.getEmail(), _buzon);
        return _buzon;
    }

    estaRegistrado(usuario: IContacto): boolean {
        return this._buzones.has(usuario.getEmail());
    }

    cantidadDeUsuarios(): number {
        return this._buzones.size;
    }

    buzonDe(usuario: IContacto): Buzon {
        const _buzon = this._buzones.get(usuario.getEmail());
        if (_buzon === undefined) {
            throw new Error(`El usuario ${usuario.getEmail()} no está registrado`);
        }
        return _buzon;
    }

    // Envío simulado entre usuarios:
    //  - el original queda en Enviados del remitente (o sale de Borradores);
    //  - cada destinatario registrado recibe SU copia en Entrada;
    //  - el remitente no se lo manda a sí mismo;
    //  - un destinatario que no está registrado es externo: no tiene buzón acá.
    // Se valida todo antes de mover algo, así si falla no queda nada a medias.
    enviar(correo: ICorreo): void {
        const _buzonRemitente = this.buzonDe(correo.getRemitente());
        const _receptores = this.buzonesReceptores(correo);

        for (const _buzon of _receptores) {
            if (_buzon.ubicacion(correo) !== undefined) {
                throw new Error(`El correo ${correo.getId()} ya está en el buzón de un destinatario`);
            }
        }

        // Valida asunto y destinatarios y marca como enviado; si falla, corta acá.
        _buzonRemitente.enviar(correo);

        for (const _buzon of _receptores) {
            _buzon.recibir(this.copiaParaRecibir(correo));
        }
    }

    // Buzones de los destinatarios registrados, sin el del propio remitente.
    private buzonesReceptores(correo: ICorreo): Buzon[] {
        const _emailRemitente = correo.getRemitente().getEmail();
        return correo.getDestinatarios()
            .filter((_d) => _d.getEmail() !== _emailRemitente && this.estaRegistrado(_d))
            .map((_d) => this.buzonDe(_d));
    }

    // Cada destinatario recibe su propia copia (mismo id), así leer o marcar
    // como favorito un correo en un buzón no cambia el de las otras personas.
    private copiaParaRecibir(correo: ICorreo): Correo {
        const _copia = new Correo(
            correo.getId(),
            correo.getAsunto(),
            correo.getContenido(),
            correo.getRemitente(),
            [...correo.getDestinatarios()]
        );
        _copia.marcarComoEnviado();
        return _copia;
    }
}