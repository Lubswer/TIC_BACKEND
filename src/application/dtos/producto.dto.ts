import { CategoriaProducto } from '../../domain/enums/CategoriaProducto.js';

export interface CrearProductoDTO {
  nombre: string;
  categoria: CategoriaProducto;
  precio: number;
  descripcion?: string | null;
  imagen_url?: string | null;
  stock?: number | null;
  disponible?: boolean;
  producto_temporada?: boolean;
}

export interface ActualizarProductoDTO {
  nombre?: string;
  categoria?: CategoriaProducto;
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
  categoria: CategoriaProducto;
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
