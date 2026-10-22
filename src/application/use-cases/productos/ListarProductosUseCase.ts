import { IProductoRepository, FiltrosProducto } from '../../../domain/repositories/IProductoRepository.js';
import { ProductoResumenDTO } from '../../dtos/producto.dto.js';
import { Producto } from '../../../domain/entities/Producto.js';

export class ListarProductosUseCase {
  constructor(private productoRepository: IProductoRepository) {}

  async ejecutar(filtros?: FiltrosProducto): Promise<ProductoResumenDTO[]> {
    const productos = await this.productoRepository.listar(filtros);

    return productos.map((producto: Producto) => ({
      id: producto.id!,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      imagen_url: producto.imagen_url,
      precio: producto.precio,
      stock: producto.stock,
      disponible: producto.disponible,
      producto_temporada: producto.producto_temporada,
      activo: producto.activo,
      fecha_creacion: producto.fecha_creacion,
      fecha_actualizacion: producto.fecha_actualizacion,
    }));
  }
}
