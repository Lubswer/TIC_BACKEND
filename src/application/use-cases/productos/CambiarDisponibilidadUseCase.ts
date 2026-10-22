import { IProductoRepository } from '../../../domain/repositories/IProductoRepository.js';
import { ProductoResumenDTO } from '../../dtos/producto.dto.js';

export class CambiarDisponibilidadUseCase {
  constructor(private productoRepository: IProductoRepository) {}

  async ejecutar(id: number, disponible: boolean): Promise<ProductoResumenDTO> {
    const producto = await this.productoRepository.buscarPorId(id);

    if (!producto) {
      throw new Error(`Producto con ID ${id} no encontrado.`);
    }

    await this.productoRepository.cambiarDisponibilidad(id, disponible);
    producto.cambiarDisponibilidad(disponible);

    return {
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
    };
  }
}
