import { Router } from 'express';
import { PedidoMySqlRepository } from '../../database/mysql/PedidoMySqlRepository.js';
import { ProductoMySqlRepository } from '../../database/mysql/ProductoMySqlRepository.js';
import { ConfirmarPedidoUseCase } from '../../../application/use-cases/pedidos/ConfirmarPedidoUseCase.js';
import { ConsultarDetallePedidoUseCase } from '../../../application/use-cases/pedidos/ConsultarDetallePedidoUseCase.js';
import { ListarPedidosPorUsuarioUseCase } from '../../../application/use-cases/pedidos/ListarPedidosPorUsuarioUseCase.js';
import { PedidoController } from '../controllers/PedidoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { Rol } from '../../../domain/enums/Rol.js';
import { SocketService } from '../../websocket/SocketService.js';

const router = Router();

const pedidoRepository = new PedidoMySqlRepository();
const productoRepository = new ProductoMySqlRepository();
const notificadorCocina = new SocketService();

const confirmarPedidoUseCase = new ConfirmarPedidoUseCase(
  pedidoRepository,
  productoRepository,
  notificadorCocina
);
const consultarDetallePedidoUseCase = new ConsultarDetallePedidoUseCase(pedidoRepository);
const listarPedidosPorUsuarioUseCase = new ListarPedidosPorUsuarioUseCase(pedidoRepository);

const pedidoController = new PedidoController(
  confirmarPedidoUseCase,
  consultarDetallePedidoUseCase,
  listarPedidosPorUsuarioUseCase
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware([Rol.ADMIN, Rol.CAJA]),
  pedidoController.crear
);

router.get(
  '/usuario/:usuarioId',
  authMiddleware,
  roleMiddleware([Rol.ADMIN, Rol.CAJA]),
  pedidoController.listarPorUsuario
);

router.get(
  '/:id',
  authMiddleware,
  pedidoController.obtenerPorId
);

export default router;
