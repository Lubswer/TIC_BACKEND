import { IProductoRepository } from '../../../domain/repositories/IProductoRepository.js';
import { Producto } from '../../../domain/entities/Producto.js';
import { CrearProductoDTO, ProductoResumenDTO } from '../../dtos/producto.dto.js';

export class CrearProductoUseCase {
  constructor(private productoRepository: IProductoRepository) {}

  async ejecutar(dto: CrearProductoDTO): Promise<ProductoResumenDTO> {

    if (!dto.nombre || dto.nombre.trim().length === 0) {
      throw new Error('El nombre del producto es obligatorio.');
    }

    if (dto.precio === undefined || dto.precio === null || dto.precio <= 0) {
      throw new Error('El precio del producto debe ser mayor a 0.');
    }

    if (dto.stock !== undefined && dto.stock !== null && dto.stock < 0) {
      throw new Error('El stock no puede ser negativo.');
    }

    const nombreLimpio = dto.nombre.trim();

    const productoExistente = await this.productoRepository.buscarPorNombre(nombreLimpio);

    if (productoExistente) {
      if (productoExistente.activo) {
        throw new Error(`Ya existe un producto activo con el nombre '${nombreLimpio}'.`);
      }
      //Inactivo
      productoExistente.descripcion = dto.descripcion !== undefined ? dto.descripcion : productoExistente.descripcion;
      productoExistente.imagen_url = dto.imagen_url !== undefined ? dto.imagen_url : productoExistente.imagen_url;
      productoExistente.precio = dto.precio;
      productoExistente.stock = dto.stock !== undefined ? dto.stock : null;
      productoExistente.disponible = dto.disponible !== undefined ? dto.disponible : true;
      productoExistente.producto_temporada = dto.producto_temporada !== undefined ? dto.producto_temporada : false;
      productoExistente.reactivar(); 

      const productoActualizado = await this.productoRepository.actualizar(productoExistente);

      return this.mapearAResumenDTO(productoActualizado);
    }

    // no existe 
    const nuevoProducto = new Producto(
      nombreLimpio,
      dto.precio,
      dto.descripcion ?? null,
      dto.imagen_url ?? null,
      dto.stock ?? null,
      dto.disponible ?? true,
      dto.producto_temporada ?? false,
      true // activo = true
    );

    const productoGuardado = await this.productoRepository.crear(nuevoProducto);

    return this.mapearAResumenDTO(productoGuardado);
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
