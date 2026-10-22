import { Router } from 'express';
import { ProductoMySqlRepository } from '../../database/mysql/ProductoMySqlRepository.js';
import { CrearProductoUseCase } from '../../../application/use-cases/productos/CrearProductoUseCase.js';
import { ListarProductosUseCase } from '../../../application/use-cases/productos/ListarProductosUseCase.js';
import { ActualizarProductoUseCase } from '../../../application/use-cases/productos/ActualizarProductoUseCase.js';
import { EliminarProductoUseCase } from '../../../application/use-cases/productos/EliminarProductoUseCase.js';
import { CambiarDisponibilidadUseCase } from '../../../application/use-cases/productos/CambiarDisponibilidadUseCase.js';
import { ProductoController } from '../controllers/ProductoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { Rol } from '../../../domain/enums/Rol.js';

const productosRouter = Router();


const productoRepository = new ProductoMySqlRepository();

const crearProductoUseCase = new CrearProductoUseCase(productoRepository);
const listarProductosUseCase = new ListarProductosUseCase(productoRepository);
const actualizarProductoUseCase = new ActualizarProductoUseCase(productoRepository);
const eliminarProductoUseCase = new EliminarProductoUseCase(productoRepository);
const cambiarDisponibilidadUseCase = new CambiarDisponibilidadUseCase(productoRepository);

const productoController = new ProductoController(
  crearProductoUseCase,
  listarProductosUseCase,
  actualizarProductoUseCase,
  eliminarProductoUseCase,
  cambiarDisponibilidadUseCase
);


productosRouter.use(authMiddleware);

// 1. Listar productos (Acceso: admin, caja, cocina)
productosRouter.get(
  '/',
  productoController.listar
);

// 2. Crear producto (Acceso exclusivo: admin)
productosRouter.post(
  '/',
  roleMiddleware([Rol.ADMIN]),
  productoController.crear
);

// 3. Actualizar producto (Acceso exclusivo: admin)
productosRouter.put(
  '/:id',
  roleMiddleware([Rol.ADMIN]),
  productoController.actualizar
);

// 4. Borrado lógico de producto (Acceso exclusivo: admin)
productosRouter.delete(
  '/:id',
  roleMiddleware([Rol.ADMIN]),
  productoController.eliminar
);

// 5. Apagar/Encender disponibilidad rápida (Acceso: admin y cocina)
productosRouter.patch(
  '/:id/disponibilidad',
  roleMiddleware([Rol.ADMIN, Rol.COCINA]),
  productoController.cambiarDisponibilidad
);

export { productosRouter };
