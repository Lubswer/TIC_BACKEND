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

const router = Router();

// 1. Instanciación de dependencias
const pedidoRepository = new PedidoMySqlRepository();
const productoRepository = new ProductoMySqlRepository();

const confirmarPedidoUseCase = new ConfirmarPedidoUseCase(pedidoRepository, productoRepository);
const consultarDetallePedidoUseCase = new ConsultarDetallePedidoUseCase(pedidoRepository);
const listarPedidosPorUsuarioUseCase = new ListarPedidosPorUsuarioUseCase(pedidoRepository);

const pedidoController = new PedidoController(
  confirmarPedidoUseCase,
  consultarDetallePedidoUseCase,
  listarPedidosPorUsuarioUseCase
);

// 2. Definición de rutas protegidas

// Solo 'admin' y 'caja' pueden registrar ventas y cobrar pedidos
router.post(
  '/',
  authMiddleware,
  roleMiddleware([Rol.ADMIN, Rol.CAJA]),
  pedidoController.crear
);

// Solo 'admin' y 'caja' pueden listar los pedidos hechos por un usuario específico
router.get(
  '/usuario/:usuarioId',
  authMiddleware,
  roleMiddleware([Rol.ADMIN, Rol.CAJA]),
  pedidoController.listarPorUsuario
);

// Cualquier usuario autenticado (incluida cocina) puede consultar el detalle del pedido
router.get(
  '/:id',
  authMiddleware,
  pedidoController.obtenerPorId
);

export default router;
