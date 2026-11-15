export class Incidencia {
  id?: number;
  usuario_id: number;
  descripcion: string;
  fecha_creacion?: Date;
  usuario_nombre?: string;

  constructor(
    usuario_id: number,
    descripcion: string,
    id?: number,
    fecha_creacion?: Date,
    usuario_nombre?: string
  ) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.descripcion = descripcion;
    this.fecha_creacion = fecha_creacion;
    this.usuario_nombre = usuario_nombre;
  }
}
