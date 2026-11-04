import { Pedido } from '../entities/Pedido.js';
import { ProductoPedido } from '../entities/ProductoPedido.js';

export interface IPedidoRepository {
  /**
   * Inserta en una única transacción:
   * 1. Cabecera del pedido en la tabla `pedido`.
   * 2. Todas las líneas en la tabla `producto_pedido`.
   * 3. El ticket inicial en la tabla `ticket` con estado 'pendiente'.
   * 4. Descuenta el stock de cada producto si corresponde.
   */
  crearConLineas(pedido: Pedido, lineas: ProductoPedido[]): Promise<Pedido>;

  /**
   * Busca un pedido por su ID junto con todas sus líneas de detalle
   * y los nombres de los productos relacionados.
   */
  buscarPorId(id: number): Promise<Pedido | null>;

  /**
   * Busca todos los pedidos registrados por un usuario específico (ej. un cajero),
   * ordenados del más reciente al más antiguo.
   */
  buscarPorUsuarioId(usuarioId: number): Promise<Pedido[]>;

  /**
   * Lista los pedidos ordenados de forma descendente por fecha de creación.
   */
  listar(limite?: number): Promise<Pedido[]>;
}
