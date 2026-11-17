import {IContacto} from "./IContacto";

export interface ICorreo {
  getAsunto(): string;
  getId():number;
  getContenido(): string;
  getRemitente(): IContacto;
  getDestinatarios(): readonly IContacto[];
  getLeido(): boolean;
  getFavorito(): boolean;
  // RF-08: estado de lectura
  marcarComoLeido(): void;
  marcarComoNoLeido(): void;
  marcarComoFavorito(): void;
  desmarcarComoFavorito(): void;
  validarParaEnvio(): string[];
  puedeEnviarse(): boolean;
  estaEnviado(): boolean;
  marcarComoEnviado(): void;
  setAsunto(asunto: string): void;
  setContenido(contenido: string): void;
  agregarDestinatario(destinatario: IContacto): void;
  quitarDestinatario(destinatario: IContacto): void;

}