import { describe, it, expect, beforeEach } from 'vitest';
import { Agenda } from '../src/Agenda';
import { Contacto } from '../src/Contacto';

describe('Agenda', () => {
  let agenda: Agenda;
  let contacto1: Contacto;
  let contacto2: Contacto;

  beforeEach(() => {
    agenda = new Agenda();
    contacto1 = new Contacto('Juan Pérez', 'juan.perez@example.com');
    contacto2 = new Contacto('Ana Gómez', 'ana.gomez@example.com');
  });

  it('debe iniciar vacía', () => {
    expect(agenda.cantidad()).toBe(0);
    expect(agenda.listar()).toEqual([]);
  });

  it('debe permitir agregar un contacto y aumentar la cantidad', () => {
    agenda.agregar(contacto1);
    
    expect(agenda.cantidad()).toBe(1);
    expect(agenda.listar()).toContain(contacto1);
  });

  it('no debe permitir agregar dos contactos con el mismo correo (insensible a mayúsculas)', () => {
    agenda.agregar(contacto1);
    
    // Creamos otro contacto con el mismo email pero distintas mayúsculas
    const contactoDuplicado = new Contacto('Juan Modificado', 'JUAN.PEREZ@example.com');

    expect(() => agenda.agregar(contactoDuplicado)).toThrowError(
      /Ya existe un contacto con el email/i
    );
    expect(agenda.cantidad()).toBe(1);
  });

  it('debe permitir consultar un contacto existente (normalizando el email)', () => {
    agenda.agregar(contacto1);

    const encontrado = agenda.consultar('  JUAN.Perez@Example.com  ');
    
    expect(encontrado).toBeDefined();
    expect(encontrado?.getNombreCompleto()).toBe('Juan Pérez');
  });

  it('debe retornar undefined al consultar un correo que no existe', () => {
    const encontrado = agenda.consultar('noexiste@example.com');
    expect(encontrado).toBeUndefined();
  });

  it('el método listar debe retornar una copia de solo lectura (inmutable)', () => {
    agenda.agregar(contacto1);
    const lista1 = agenda.listar();
    
    // Intentamos mutar el array retornado (si TypeScript lo permite en runtime o modificando la referencia)
    expect(() => {
      (lista1 as Contacto[]).push(contacto2);
    }).not.toThrow(); // El array externo cambia, pero la agenda interna debe mantenerse intacta

    expect(agenda.cantidad()).toBe(1);
  });

  it('debe permitir modificar los datos de un contacto existente', () => {
    agenda.agregar(contacto1);

    const modificado = agenda.modificar('juan.perez@example.com', {
      nombreCompleto: 'Juan Carlos Pérez',
      email: 'nuevo.juan@example.com'
    });

    expect(modificado.getNombreCompleto()).toBe('Juan Carlos Pérez');
    expect(modificado.getEmail()).toBe('nuevo.juan@example.com');
    expect(agenda.consultar('juan.perez@example.com')).toBeUndefined();
    expect(agenda.consultar('nuevo.juan@example.com')).toBeDefined();
  });

  it('debe lanzar un error al intentar modificar un contacto que no existe', () => {
    expect(() => {
      agenda.modificar('fantasma@example.com', { nombreCompleto: 'Otro' });
    }).toThrowError(/No existe un contacto con el email/i);
  });

  it('debe permitir eliminar un contacto correctamente', () => {
    agenda.agregar(contacto1);
    agenda.agregar(contacto2);
    expect(agenda.cantidad()).toBe(2);

    agenda.eliminar('juan.perez@example.com');

    expect(agenda.cantidad()).toBe(1);
    expect(agenda.consultar('juan.perez@example.com')).toBeUndefined();
    expect(agenda.listar()).toContain(contacto2);
  });

  it('debe lanzar un error al intentar eliminar un correo inexistente', () => {
    expect(() => {
      agenda.eliminar('noexiste@example.com');
    }).toThrowError(/No existe un contacto con el email/i);
  });
});