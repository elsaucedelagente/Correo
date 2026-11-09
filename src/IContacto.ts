export interface IContacto {
  getNombreCompleto(): string;
  getEmail(): string;
  equals(otro: IContacto): boolean;
}
