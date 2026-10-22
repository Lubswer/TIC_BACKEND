export interface CrearProductoDTO {
  nombre: string;
  precio: number;
  descripcion?: string | null;
  imagen_url?: string | null;
  stock?: number | null;
  disponible?: boolean;
  producto_temporada?: boolean;
}

export interface ActualizarProductoDTO {
  nombre?: string;
  precio?: number;
  descripcion?: string | null;
  imagen_url?: string | null;
  stock?: number | null;
  disponible?: boolean;
  producto_temporada?: boolean;
  activo?: boolean;
}

export interface ProductoResumenDTO {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  precio: number;
  stock: number | null;
  disponible: boolean;
  producto_temporada: boolean;
  activo: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}
