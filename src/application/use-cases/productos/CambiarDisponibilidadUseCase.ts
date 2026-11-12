import { IProductoRepository } from '../../../domain/repositories/IProductoRepository.js';
import { ProductoResumenDTO } from '../../dtos/producto.dto.js';
import { INotificadorTiempoReal } from '../../services/INotificadorTiempoReal.js';

export class CambiarDisponibilidadUseCase {
  constructor(
    private productoRepository: IProductoRepository,
    private notificadorTiempoReal?: INotificadorTiempoReal
  ) {}

  async ejecutar(id: number, disponible: boolean): Promise<ProductoResumenDTO> {
    const producto = await this.productoRepository.buscarPorId(id);

    if (!producto) {
      throw new Error(`Producto con ID ${id} no encontrado.`);
    }

    await this.productoRepository.cambiarDisponibilidad(id, disponible);
    producto.disponible = disponible;

    if (this.notificadorTiempoReal) {
      try {
        this.notificadorTiempoReal.notificarCambioDisponibilidad({
          producto_id: producto.id!,
          disponible: producto.disponible,
          nombre: producto.nombre,
        });
      } catch (notifError) {
        console.error('Error no bloqueante al notificar cambio de disponibilidad:', notifError);
      }
    }

    return {
      id: producto.id!,
      nombre: producto.nombre,
      categoria: producto.categoria,
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
