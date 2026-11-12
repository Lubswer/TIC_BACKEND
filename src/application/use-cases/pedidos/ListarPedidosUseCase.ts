import { IPedidoRepository, FiltrosPedido } from '../../../domain/repositories/IPedidoRepository.js';
import { PedidoResumenDTO } from '../../dtos/pedido.dto.js';

export class ListarPedidosUseCase {
  constructor(private pedidoRepository: IPedidoRepository) {}

  async ejecutar(filtros: FiltrosPedido = {}): Promise<PedidoResumenDTO[]> {
    const pedidos = await this.pedidoRepository.listar(filtros);

    return pedidos.map((p) => ({
      id: p.id!,
      usuario_id: p.usuario_id,
      total_productos: p.total_productos,
      total_extras: p.total_extras,
      descripcion_extras: p.descripcion_extras,
      extras: p.extras,
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

