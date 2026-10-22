import { Producto } from '../entities/Producto.js';

export interface FiltrosProducto {
  soloDisponibles?: boolean;
  incluirInactivos?: boolean;
  soloInactivos?: boolean;
}

export interface IProductoRepository {
  crear(producto: Producto): Promise<Producto>;
  buscarPorId(id: number): Promise<Producto | null>;
  buscarPorNombre(nombre: string): Promise<Producto | null>;
  listar(filtros?: FiltrosProducto): Promise<Producto[]>;
  actualizar(producto: Producto): Promise<Producto>;
  eliminar(id: number): Promise<boolean>;
  cambiarDisponibilidad(id: number, disponible: boolean): Promise<boolean>;
  actualizarStock(id: number, nuevoStock: number | null): Promise<boolean>;
}
