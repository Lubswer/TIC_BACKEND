export interface CrearIncidenciaDTO {
  descripcion: string;
}

export interface IncidenciaResumenDTO {
  id: number;
  usuario_id: number;
  usuario_nombre?: string;
  descripcion: string;
  fecha_creacion: Date;
}

export interface FiltrosIncidenciaDTO {
  fechaInicio?: string;
  fechaFin?: string;
  limite?: number;
}
