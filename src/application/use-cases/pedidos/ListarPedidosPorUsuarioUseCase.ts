import { IPedidoRepository } from '../../../domain/repositories/IPedidoRepository.js';
import { PedidoResumenDTO } from '../../dtos/pedido.dto.js';

export class ListarPedidosPorUsuarioUseCase {
  constructor(private pedidoRepository: IPedidoRepository) {}

  async ejecutar(usuarioId: number): Promise<PedidoResumenDTO[]> {
    if (!usuarioId || usuarioId <= 0) {
      throw new Error('ID de usuario inválido.');
    }

    const pedidos = await this.pedidoRepository.buscarPorUsuarioId(usuarioId);

    return pedidos.map((p) => ({
      id: p.id!,
      usuario_id: p.usuario_id,
      total_productos: p.total_productos,
      total_extras: p.total_extras,
      descripcion_extras: p.descripcion_extras,
      total: p.total,
      tipo_pago: p.tipo_pago,
      notas: p.notas,
      fecha_creacion: p.fecha_creacion,
      lineas: p.lineas?.map((l) => ({
        id: l.id,
        producto_id: l.producto_id,
        nombre_producto: l.nombre_producto,
        cantidad: l.cantidad,
        precio_unitario: l.precio_unitario,
        subtotal: l.calcularSubtotal(),
        notas: l.notas,
      })),
    }));
  }
}

