import { IPedidoRepository } from '../../../domain/repositories/IPedidoRepository.js';
import { IProductoRepository } from '../../../domain/repositories/IProductoRepository.js';
import { Pedido } from '../../../domain/entities/Pedido.js';
import { ProductoPedido } from '../../../domain/entities/ProductoPedido.js';
import { CrearPedidoDTO, PedidoResumenDTO } from '../../dtos/pedido.dto.js';
import { INotificadorCocina } from '../../services/INotificadorCocina.js';
import { EstadoTicket } from '../../../domain/enums/EstadoTicket.js';

export class ConfirmarPedidoUseCase {
  constructor(
    private pedidoRepository: IPedidoRepository,
    private productoRepository: IProductoRepository,
    private notificadorCocina?: INotificadorCocina
  ) {}

  async ejecutar(dto: CrearPedidoDTO): Promise<PedidoResumenDTO> {
    if (!dto.usuario_id || dto.usuario_id <= 0) {
      throw new Error('El ID del usuario responsable es obligatorio.');
    }

    if (!dto.tipo_pago || dto.tipo_pago.trim().length === 0) {
      throw new Error('El tipo de pago es obligatorio.');
    }

    if (!dto.items || !Array.isArray(dto.items) || dto.items.length === 0) {
      throw new Error('El pedido debe incluir al menos un producto.');
    }

    const lineasProducto: ProductoPedido[] = [];
    let acumuladorTotalProductos = 0;

    for (const item of dto.items) {
      if (!item.producto_id || item.producto_id <= 0) {
        throw new Error('ID de producto inválido en el detalle del pedido.');
      }

      if (!item.cantidad || item.cantidad <= 0) {
        throw new Error(`La cantidad del producto ID ${item.producto_id} debe ser mayor a 0.`);
      }

      const producto = await this.productoRepository.buscarPorId(item.producto_id);

      if (!producto || !producto.activo) {
        throw new Error(`El producto con ID ${item.producto_id} no existe o no está activo.`);
      }

      if (!producto.disponible) {
        throw new Error(`El producto "${producto.nombre}" está marcado actualmente como NO disponible.`);
      }

      if (!producto.tieneStockSuficiente(item.cantidad)) {
        throw new Error(
          `Stock insuficiente para "${producto.nombre}". Stock actual: ${producto.stock}, solicitado: ${item.cantidad}.`
        );
      }

      const precioUnitario = Number(producto.precio);
      const subtotal = Number((precioUnitario * item.cantidad).toFixed(2));
      acumuladorTotalProductos = Number((acumuladorTotalProductos + subtotal).toFixed(2));

      lineasProducto.push(
        new ProductoPedido(
          producto.id!,
          item.cantidad,
          precioUnitario,
          item.notas ? item.notas.trim() : null
        )
      );
    }

    const totalExtras = dto.total_extras && dto.total_extras > 0 ? Number(Number(dto.total_extras).toFixed(2)) : 0;
    const totalGeneral = Number((acumuladorTotalProductos + totalExtras).toFixed(2));

    const nuevoPedido = new Pedido(
      dto.usuario_id,
      acumuladorTotalProductos,
      totalExtras,
      dto.descripcion_extras ? dto.descripcion_extras.trim() : null,
      totalGeneral,
      dto.tipo_pago.trim(),
      dto.notas ? dto.notas.trim() : null
    );

    const pedidoCreado = await this.pedidoRepository.crearConLineas(nuevoPedido, lineasProducto);

    if (this.notificadorCocina && pedidoCreado.id && pedidoCreado.ticket_id) {
      try {
        this.notificadorCocina.notificarNuevoTicket({
          ticket_id: pedidoCreado.ticket_id,
          pedido_id: pedidoCreado.id,
          estado: EstadoTicket.PENDIENTE,
          notas_pedido: pedidoCreado.notas,
          descripcion_extras: pedidoCreado.descripcion_extras,
          fecha_creacion: pedidoCreado.fecha_creacion || new Date(),
          fecha_actualizacion: pedidoCreado.fecha_actualizacion || new Date(),
          items: (pedidoCreado.lineas || []).map((l) => ({
            producto: l.nombre_producto || `Producto #${l.producto_id}`,
            cantidad: l.cantidad,
            notas: l.notas ?? null,
          })),
        });
      } catch (notifError) {
        console.error('Error no bloqueante al notificar a cocina:', notifError);
      }
    }

    return {
      id: pedidoCreado.id!,
      usuario_id: pedidoCreado.usuario_id,
      total_productos: pedidoCreado.total_productos,
      total_extras: pedidoCreado.total_extras,
      descripcion_extras: pedidoCreado.descripcion_extras,
      total: pedidoCreado.total,
      tipo_pago: pedidoCreado.tipo_pago,
      notas: pedidoCreado.notas,
      fecha_creacion: pedidoCreado.fecha_creacion,
      lineas: pedidoCreado.lineas?.map((l) => ({
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
