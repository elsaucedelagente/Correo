import {IContacto} from "./IContacto";

export interface ICorreo {
  getAsunto(): string;
  getId():number;
  getContenido(): string;
  getRemitente(): IContacto;
  getDestinatarios(): readonly IContacto[];
  getLeido(): boolean;
  getFavorito(): boolean;

}