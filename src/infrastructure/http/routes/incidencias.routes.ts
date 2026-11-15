import { Router } from 'express';
import { IncidenciaMySqlRepository } from '../../database/mysql/IncidenciaMySqlRepository.js';
import { RegistrarIncidenciaUseCase } from '../../../application/use-cases/incidencias/RegistrarIncidenciaUseCase.js';
import { ListarIncidenciasUseCase } from '../../../application/use-cases/incidencias/ListarIncidenciasUseCase.js';
import { ListarIncidenciasPorUsuarioUseCase } from '../../../application/use-cases/incidencias/ListarIncidenciasPorUsuarioUseCase.js';
import { IncidenciaController } from '../controllers/IncidenciaController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { Rol } from '../../../domain/enums/Rol.js';

const router = Router();

const incidenciaRepository = new IncidenciaMySqlRepository();

const registrarIncidenciaUseCase = new RegistrarIncidenciaUseCase(incidenciaRepository);
const listarIncidenciasUseCase = new ListarIncidenciasUseCase(incidenciaRepository);
const listarIncidenciasPorUsuarioUseCase = new ListarIncidenciasPorUsuarioUseCase(incidenciaRepository);

const incidenciaController = new IncidenciaController(
  registrarIncidenciaUseCase,
  listarIncidenciasUseCase,
  listarIncidenciasPorUsuarioUseCase
);

router.use(authMiddleware);

// 1. Reportar incidencia: EXCLUSIVO COCINA
router.post('/', roleMiddleware([Rol.COCINA]), incidenciaController.registrar);

// 2. Listar incidencias en general: EXCLUSIVO ADMIN
router.get('/', roleMiddleware([Rol.ADMIN]), incidenciaController.listar);

// 3. Listar incidencias por ID de usuario: CAJA Y ADMIN
router.get('/usuario/:usuarioId', roleMiddleware([Rol.ADMIN, Rol.CAJA]), incidenciaController.listarPorUsuario);

export default router;
