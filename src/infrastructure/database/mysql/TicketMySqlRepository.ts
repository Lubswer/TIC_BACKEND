import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../../../config/database.js';
import { ITicketRepository, TicketCocina, ItemTicketCocina } from '../../../domain/repositories/ITicketRepository.js';
import { Ticket } from '../../../domain/entities/Ticket.js';
import { EstadoTicket } from '../../../domain/enums/EstadoTicket.js';

export class TicketMySqlRepository implements ITicketRepository {
  private mapearFilaATicket(fila: RowDataPacket): Ticket {
    return new Ticket(
      fila.pedido_id,
      fila.estado as EstadoTicket,
      fila.id,
      new Date(fila.fecha_creacion),
      new Date(fila.fecha_actualizacion)
    );
  }

  async buscarPorId(id: number): Promise<Ticket | null> {
    const query = `
      SELECT id, pedido_id, estado, fecha_creacion, fecha_actualizacion
      FROM ticket
      WHERE id = ?
      LIMIT 1
    `;

    const [filas] = await pool.execute<RowDataPacket[]>(query, [id]);

    if (filas.length === 0) {
      return null;
    }

    return this.mapearFilaATicket(filas[0]);
  }

  async buscarPorPedidoId(pedidoId: number): Promise<Ticket | null> {
    const query = `
      SELECT id, pedido_id, estado, fecha_creacion, fecha_actualizacion
      FROM ticket
      WHERE pedido_id = ?
      LIMIT 1
    `;

    const [filas] = await pool.execute<RowDataPacket[]>(query, [pedidoId]);

    if (filas.length === 0) {
      return null;
    }

    return this.mapearFilaATicket(filas[0]);
  }

  async actualizarEstado(id: number, nuevoEstado: EstadoTicket): Promise<boolean> {
    const query = `
      UPDATE ticket
      SET estado = ?
      WHERE id = ?
    `;

    const [resultado] = await pool.execute<ResultSetHeader>(query, [nuevoEstado, id]);
    return resultado.affectedRows > 0;
  }

  async listarTicketsActivos(): Promise<TicketCocina[]> {
    const query = `
      SELECT 
        t.id AS ticket_id,
        t.pedido_id,
        t.estado,
        t.fecha_creacion,
        t.fecha_actualizacion,
        p.notas AS notas_pedido,
        p.descripcion_extras,
        pp.cantidad,
        pp.notas AS notas_producto,
        prod.nombre AS nombre_producto
      FROM ticket t
      INNER JOIN pedido p ON t.pedido_id = p.id
      INNER JOIN producto_pedido pp ON p.id = pp.pedido_id
      INNER JOIN producto prod ON pp.producto_id = prod.id
      WHERE t.estado IN ('pendiente', 'en_preparacion')
      ORDER BY t.fecha_creacion ASC, pp.id ASC
    `;

    const [filas] = await pool.execute<RowDataPacket[]>(query);
    return this.agruparFilasATicketsCocina(filas);
  }

  async listarTicketsDespachados(limite: number = 50): Promise<TicketCocina[]> {
    const queryIds = `
      SELECT id 
      FROM ticket 
      WHERE estado = 'listo' 
      ORDER BY fecha_actualizacion DESC 
      LIMIT ?
    `;

    const [filasIds] = await pool.execute<RowDataPacket[]>(queryIds, [String(limite)]);

    if (filasIds.length === 0) {
      return [];
    }

    const ids = filasIds.map((f) => f.id);

    const placeholders = ids.map(() => '?').join(',');
    const queryDetalle = `
      SELECT 
        t.id AS ticket_id,
        t.pedido_id,
        t.estado,
        t.fecha_creacion,
        t.fecha_actualizacion,
        p.notas AS notas_pedido,
        p.descripcion_extras,
        pp.cantidad,
        pp.notas AS notas_producto,
        prod.nombre AS nombre_producto
      FROM ticket t
      INNER JOIN pedido p ON t.pedido_id = p.id
      INNER JOIN producto_pedido pp ON p.id = pp.pedido_id
      INNER JOIN producto prod ON pp.producto_id = prod.id
      WHERE t.id IN (${placeholders})
      ORDER BY t.fecha_actualizacion DESC, pp.id ASC
    `;

    const [filas] = await pool.execute<RowDataPacket[]>(queryDetalle, ids);
    return this.agruparFilasATicketsCocina(filas);
  }

  private agruparFilasATicketsCocina(filas: RowDataPacket[]): TicketCocina[] {
    const mapaTickets = new Map<number, TicketCocina>();

    for (const fila of filas) {
      if (!mapaTickets.has(fila.ticket_id)) {
        mapaTickets.set(fila.ticket_id, {
          ticket_id: fila.ticket_id,
          pedido_id: fila.pedido_id,
          estado: fila.estado as EstadoTicket,
          notas_pedido: fila.notas_pedido,
          descripcion_extras: fila.descripcion_extras,
          fecha_creacion: new Date(fila.fecha_creacion),
          fecha_actualizacion: new Date(fila.fecha_actualizacion),
          items: [],
        });
      }

      const ticket = mapaTickets.get(fila.ticket_id)!;

      ticket.items.push({
        producto: fila.nombre_producto,
        cantidad: Number(fila.cantidad),
        notas: fila.notas_producto,
      });
    }

    return Array.from(mapaTickets.values());
  }
}
