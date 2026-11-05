import { Pedido } from '../entities/Pedido.js';
import { ProductoPedido } from '../entities/ProductoPedido.js';

export interface IPedidoRepository {
  crearConLineas(pedido: Pedido, lineas: ProductoPedido[]): Promise<Pedido>;

  buscarPorId(id: number): Promise<Pedido | null>;

  buscarPorUsuarioId(usuarioId: number): Promise<Pedido[]>;

  listar(limite?: number): Promise<Pedido[]>;
}
