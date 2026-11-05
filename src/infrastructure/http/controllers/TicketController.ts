import { Request, Response } from 'express';
import { ListarTicketsCocinaUseCase } from '../../../application/use-cases/tickets/ListarTicketsCocinaUseCase.js';
import { CambiarEstadoTicketUseCase } from '../../../application/use-cases/tickets/CambiarEstadoTicketUseCase.js';
import { EstadoTicket } from '../../../domain/enums/EstadoTicket.js';
import { SocketService } from '../../websocket/SocketService.js';

export class TicketController {
  constructor(
    private listarTicketsCocinaUseCase: ListarTicketsCocinaUseCase,
    private cambiarEstadoTicketUseCase: CambiarEstadoTicketUseCase
  ) {}

  listar = async (req: Request, res: Response): Promise<void> => {
    try {
      const tipo = req.query.tipo === 'despachados' ? 'despachados' : 'activos';
      const limite = req.query.limite ? Number(req.query.limite) : 50;

      const tickets = await this.listarTicketsCocinaUseCase.ejecutar(tipo, limite);
      res.status(200).json(tickets);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al listar los tickets de cocina.' });
    }
  };

  cambiarEstado = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const { nuevoEstado } = req.body;

      if (isNaN(id) || id <= 0) {
        res.status(400).json({ error: 'El ID del ticket proporcionado no es válido.' });
        return;
      }

      if (!nuevoEstado) {
        res.status(400).json({ error: 'El campo "nuevoEstado" es obligatorio.' });
        return;
      }

      const ticketActualizado = await this.cambiarEstadoTicketUseCase.ejecutar(id, nuevoEstado as EstadoTicket);

      SocketService.emitirTicketActualizado({
        ticket_id: ticketActualizado.id!,
        pedido_id: ticketActualizado.pedido_id,
        estado: ticketActualizado.estado,
      });

      res.status(200).json(ticketActualizado);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al cambiar el estado del ticket.' });
    }
  };
}
