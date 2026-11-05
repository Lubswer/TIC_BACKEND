import { Request, Response } from 'express';
import { ConfirmarPedidoUseCase } from '../../../application/use-cases/pedidos/ConfirmarPedidoUseCase.js';
import { ConsultarDetallePedidoUseCase } from '../../../application/use-cases/pedidos/ConsultarDetallePedidoUseCase.js';
import { ListarPedidosPorUsuarioUseCase } from '../../../application/use-cases/pedidos/ListarPedidosPorUsuarioUseCase.js';
import { CrearPedidoDTO } from '../../../application/dtos/pedido.dto.js';
import { ITicketRepository } from '../../../domain/repositories/ITicketRepository.js';
import { SocketService } from '../../websocket/SocketService.js';
import { EstadoTicket } from '../../../domain/enums/EstadoTicket.js';

export class PedidoController {
  constructor(
    private confirmarPedidoUseCase: ConfirmarPedidoUseCase,
    private consultarDetallePedidoUseCase: ConsultarDetallePedidoUseCase,
    private listarPedidosPorUsuarioUseCase: ListarPedidosPorUsuarioUseCase,
    private ticketRepository?: ITicketRepository
  ) {}

  crear = async (req: Request, res: Response): Promise<void> => {
    try {
      const { items, total_extras, descripcion_extras, tipo_pago, notas } = req.body;

      // El usuario responsable se extrae con seguridad del token JWT decodificado en authMiddleware
      const usuarioId = (req as any).usuario?.id;

      if (!usuarioId) {
        res.status(401).json({ error: 'No se pudo identificar al usuario responsable desde el token.' });
        return;
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: 'El pedido debe contener al menos un producto en "items".' });
        return;
      }

      if (!tipo_pago) {
        res.status(400).json({ error: 'El campo "tipo_pago" es obligatorio.' });
        return;
      }

      const dto: CrearPedidoDTO = {
        usuario_id: usuarioId,
        items,
        total_extras: total_extras !== undefined ? Number(total_extras) : 0,
        descripcion_extras: descripcion_extras || null,
        tipo_pago,
        notas: notas || null,
      };

      const pedidoConfirmado = await this.confirmarPedidoUseCase.ejecutar(dto);

      // Emitir ticket en vivo hacia la sala de cocina por WebSockets
      if (this.ticketRepository && pedidoConfirmado.id) {
        try {
          const ticketCreado = await this.ticketRepository.buscarPorPedidoId(pedidoConfirmado.id);
          if (ticketCreado) {
            SocketService.emitirTicketNuevo({
              ticket_id: ticketCreado.id!,
              pedido_id: pedidoConfirmado.id,
              estado: ticketCreado.estado,
              notas_pedido: pedidoConfirmado.notas,
              fecha_creacion: ticketCreado.fecha_creacion || new Date(),
              fecha_actualizacion: ticketCreado.fecha_actualizacion || new Date(),
              items: (pedidoConfirmado.lineas || []).map((l) => ({
                producto: l.nombre_producto || `Producto #${l.producto_id}`,
                cantidad: l.cantidad,
                notas: l.notas ?? null,
              })),
            });
          }
        } catch (socketErr) {
          console.error('Error no bloqueante al emitir WebSocket de ticket de cocina:', socketErr);
        }
      }

      res.status(201).json(pedidoConfirmado);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al procesar el pedido.' });
    }
  };

  obtenerPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.status(400).json({ error: 'El ID del pedido proporcionado no es válido.' });
        return;
      }

      const pedido = await this.consultarDetallePedidoUseCase.ejecutar(id);
      res.status(200).json(pedido);
    } catch (error: any) {
      res.status(404).json({ error: error.message || 'Error al consultar el pedido.' });
    }
  };

  listarPorUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioId = Number(req.params.usuarioId);

      if (isNaN(usuarioId) || usuarioId <= 0) {
        res.status(400).json({ error: 'El ID del usuario proporcionado no es válido.' });
        return;
      }

      const pedidos = await this.listarPedidosPorUsuarioUseCase.ejecutar(usuarioId);
      res.status(200).json(pedidos);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al listar los pedidos del usuario.' });
    }
  };
}
