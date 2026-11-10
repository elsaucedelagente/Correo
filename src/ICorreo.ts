import {IContacto} from "./IContacto";

export interface ICorreo {
  getAsunto(): string;
  getId():number;
  getContenido(): string;
  getRemitente(): IContacto;
  getDestinatarios(): readonly IContacto[];
  getLeido(): boolean;
  getFavorito(): boolean;
  validarParaEnvio(): string[];
  puedeEnviarse(): boolean;
  estaEnviado(): boolean;
  marcarComoEnviado(): void;
  setAsunto(asunto: string): void;
  setContenido(contenido: string): void;

}