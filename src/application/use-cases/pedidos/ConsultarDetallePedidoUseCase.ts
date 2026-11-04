import { IPedidoRepository } from '../../../domain/repositories/IPedidoRepository.js';
import { PedidoResumenDTO } from '../../dtos/pedido.dto.js';

export class ConsultarDetallePedidoUseCase {
  constructor(private pedidoRepository: IPedidoRepository) {}

  async ejecutar(id: number): Promise<PedidoResumenDTO> {
    if (!id || id <= 0) {
      throw new Error('ID de pedido inválido.');
    }

    const pedido = await this.pedidoRepository.buscarPorId(id);

    if (!pedido) {
      throw new Error(`Pedido con ID ${id} no encontrado.`);
    }

    return {
      id: pedido.id!,
      usuario_id: pedido.usuario_id,
      total_productos: pedido.total_productos,
      total_extras: pedido.total_extras,
      descripcion_extras: pedido.descripcion_extras,
      total: pedido.total,
      tipo_pago: pedido.tipo_pago,
      notas: pedido.notas,
      fecha_creacion: pedido.fecha_creacion,
      lineas: pedido.lineas?.map((l) => ({
        id: l.id,
        producto_id: l.producto_id,
        nombre_producto: l.nombre_producto,
        cantidad: l.cantidad,
        precio_unitario: l.precio_unitario,
        subtotal: l.calcularSubtotal(),
        notas: l.notas,
      })),
    };
  }
}

