import { Router } from 'express';
import { PrediccionMySqlRepository } from '../../database/mysql/PrediccionMySqlRepository.js';
import { FastApiPrediccionClient } from '../../external/FastApiPrediccionClient.js';
import { ConsultarPrediccionUseCase } from '../../../application/use-cases/predicciones/ConsultarPrediccionUseCase.js';
import { PrediccionController } from '../controllers/PrediccionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { Rol } from '../../../domain/enums/Rol.js';

const router = Router();

const prediccionRepository = new PrediccionMySqlRepository();
const prediccionClient = new FastApiPrediccionClient();
const consultarPrediccionUseCase = new ConsultarPrediccionUseCase(
  prediccionRepository,
  prediccionClient
);

const prediccionController = new PrediccionController(
  consultarPrediccionUseCase,
  prediccionClient
);

router.use(authMiddleware, roleMiddleware([Rol.ADMIN]));

router.get('/', prediccionController.obtenerPredicciones);
router.get('/estado', prediccionController.verificarEstado);

export default router;
