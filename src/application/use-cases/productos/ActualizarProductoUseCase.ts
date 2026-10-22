import { IProductoRepository } from '../../../domain/repositories/IProductoRepository.js';
import { ActualizarProductoDTO, ProductoResumenDTO } from '../../dtos/producto.dto.js';
import { Producto } from '../../../domain/entities/Producto.js';

export class ActualizarProductoUseCase {
  constructor(private productoRepository: IProductoRepository) {}

  async ejecutar(id: number, dto: ActualizarProductoDTO): Promise<ProductoResumenDTO> {
    const producto = await this.productoRepository.buscarPorId(id);

    if (!producto) {
      throw new Error(`Producto con ID ${id} no encontrado.`);
    }

    if (dto.nombre && dto.nombre.trim() !== producto.nombre) {
      const nombreLimpio = dto.nombre.trim();
      const existente = await this.productoRepository.buscarPorNombre(nombreLimpio);

      if (existente && existente.id !== id) {
        throw new Error(`Ya existe otro producto con el nombre '${nombreLimpio}'.`);
      }

      producto.nombre = nombreLimpio;
    }

    if (dto.precio !== undefined) {
      if (dto.precio <= 0) {
        throw new Error('El precio del producto debe ser mayor a 0.');
      }
      producto.precio = dto.precio;
    }


    if (dto.stock !== undefined) {
      if (dto.stock !== null && dto.stock < 0) {
        throw new Error('El stock no puede ser un número negativo.');
      }
      producto.stock = dto.stock;
    }

    if (dto.descripcion !== undefined) producto.descripcion = dto.descripcion;
    if (dto.imagen_url !== undefined) producto.imagen_url = dto.imagen_url;
    if (dto.disponible !== undefined) producto.disponible = dto.disponible;
    if (dto.producto_temporada !== undefined) producto.producto_temporada = dto.producto_temporada;
    if (dto.activo !== undefined) producto.activo = dto.activo;

    const productoActualizado = await this.productoRepository.actualizar(producto);

    return this.mapearAResumenDTO(productoActualizado);
  }

  private mapearAResumenDTO(producto: Producto): ProductoResumenDTO {
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
