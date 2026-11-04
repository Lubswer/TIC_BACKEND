import { Router } from 'express';
import { UsuarioMySqlRepository } from '../../database/mysql/UsuarioMySqlRepository.js';
import { ListarUsuariosUseCase } from '../../../application/use-cases/usuarios/ListarUsuariosUseCase.js';
import { ActualizarUsuarioUseCase } from '../../../application/use-cases/usuarios/ActualizarUsuarioUseCase.js';
import { EliminarUsuarioUseCase } from '../../../application/use-cases/usuarios/EliminarUsuarioUseCase.js';
import { UsuarioController } from '../controllers/UsuarioController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { Rol } from '../../../domain/enums/Rol.js';

const router = Router();

const usuarioRepository = new UsuarioMySqlRepository();

const listarUsuariosUseCase = new ListarUsuariosUseCase(usuarioRepository);
const actualizarUsuarioUseCase = new ActualizarUsuarioUseCase(usuarioRepository);
const eliminarUsuarioUseCase = new EliminarUsuarioUseCase(usuarioRepository);

const usuarioController = new UsuarioController(
  listarUsuariosUseCase,
  actualizarUsuarioUseCase,
  eliminarUsuarioUseCase
);

// Todas las rutas de gestión de usuarios son exclusivas del Administrador
router.use(authMiddleware, roleMiddleware([Rol.ADMIN]));

router.get('/', usuarioController.listar);
router.put('/:id', usuarioController.actualizar);
router.delete('/:id', usuarioController.eliminar);

export default router;

