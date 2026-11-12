import { IPedidoRepository } from '../../../domain/repositories/IPedidoRepository.js';
import { IProductoRepository } from '../../../domain/repositories/IProductoRepository.js';
import { Pedido } from '../../../domain/entities/Pedido.js';
import { ProductoPedido } from '../../../domain/entities/ProductoPedido.js';
import { CrearPedidoDTO, PedidoResumenDTO } from '../../dtos/pedido.dto.js';
import { INotificadorTiempoReal } from '../../services/INotificadorTiempoReal.js';
import { EstadoTicket } from '../../../domain/enums/EstadoTicket.js';

export class ConfirmarPedidoUseCase {
  constructor(
    private pedidoRepository: IPedidoRepository,
    private productoRepository: IProductoRepository,
    private notificadorTiempoReal?: INotificadorTiempoReal
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
    const productosAgotados: Array<{ id: number; nombre: string }> = [];

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

      if (producto.stock !== null && producto.stock - item.cantidad <= 0) {
        productosAgotados.push({ id: producto.id!, nombre: producto.nombre });
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

    const tieneExtrasMarcado = Boolean(dto.extras);
    const montoExtras = dto.total_extras !== undefined ? Number(Number(dto.total_extras).toFixed(2)) : 0;
    const tieneDescripcion = Boolean(dto.descripcion_extras && dto.descripcion_extras.trim().length > 0);

    if (!tieneExtrasMarcado && (montoExtras > 0 || tieneDescripcion)) {
      throw new Error('No se pueden enviar montos o descripciones de extras si el campo "extras" no está en true.');
    }

    if (tieneExtrasMarcado && montoExtras <= 0 && !tieneDescripcion) {
      throw new Error('Si el campo "extras" está en true, debe especificar un monto en total_extras o una descripcion_extras.');
    }

    const totalExtras = tieneExtrasMarcado ? montoExtras : 0;
    const descripcionExtras = tieneExtrasMarcado && dto.descripcion_extras ? dto.descripcion_extras.trim() : null;
    const totalGeneral = Number((acumuladorTotalProductos + totalExtras).toFixed(2));

    const nuevoPedido = new Pedido(
      dto.usuario_id,
      acumuladorTotalProductos,
      totalExtras,
      descripcionExtras,
      tieneExtrasMarcado,
      totalGeneral,
      dto.tipo_pago.trim(),
      dto.notas ? dto.notas.trim() : null
    );

    const pedidoCreado = await this.pedidoRepository.crearConLineas(nuevoPedido, lineasProducto);

    if (this.notificadorTiempoReal && pedidoCreado.id && pedidoCreado.ticket_id) {
      try {
        this.notificadorTiempoReal.notificarNuevoTicket({
          ticket_id: pedidoCreado.ticket_id,
          pedido_id: pedidoCreado.id,
          estado: EstadoTicket.PENDIENTE,
          usuario_id: pedidoCreado.usuario_id,
          tipo_pago: pedidoCreado.tipo_pago,
          total_productos: pedidoCreado.total_productos,
          total_extras: pedidoCreado.total_extras,
          descripcion_extras: pedidoCreado.descripcion_extras,
          extras: pedidoCreado.extras,
          total: pedidoCreado.total,
          notas_pedido: pedidoCreado.notas,
          fecha_creacion: pedidoCreado.fecha_creacion || new Date(),
          fecha_actualizacion: pedidoCreado.fecha_actualizacion || new Date(),
          items: (pedidoCreado.lineas || []).map((l) => ({
            producto: l.nombre_producto || `Producto #${l.producto_id}`,
            cantidad: l.cantidad,
            precio_unitario: l.precio_unitario,
            subtotal: l.calcularSubtotal(),
            notas: l.notas ?? null,
          })),
        });
      } catch (notifError) {
        console.error('Error no bloqueante al notificar a cocina:', notifError);
      }
    }

    if (this.notificadorTiempoReal?.notificarCambioDisponibilidad && productosAgotados.length > 0) {
      for (const prod of productosAgotados) {
        try {
          this.notificadorTiempoReal.notificarCambioDisponibilidad({
            producto_id: prod.id,
            disponible: false,
            nombre: prod.nombre,
          });
        } catch (errorDisp) {
          console.error(`Error no bloqueante al notificar disponibilidad de producto ${prod.id}:`, errorDisp);
        }
      }
    }

    return {
      id: pedidoCreado.id!,
      usuario_id: pedidoCreado.usuario_id,
      total_productos: pedidoCreado.total_productos,
      total_extras: pedidoCreado.total_extras,
      descripcion_extras: pedidoCreado.descripcion_extras,
      extras: pedidoCreado.extras,
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
        total: l.total,
        subtotal: l.calcularSubtotal(),
        notas: l.notas,
      })),
    };
  }
}
