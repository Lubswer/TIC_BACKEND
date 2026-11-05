import { Router } from 'express';
import { TicketMySqlRepository } from '../../database/mysql/TicketMySqlRepository.js';
import { ListarTicketsCocinaUseCase } from '../../../application/use-cases/tickets/ListarTicketsCocinaUseCase.js';
import { CambiarEstadoTicketUseCase } from '../../../application/use-cases/tickets/CambiarEstadoTicketUseCase.js';
import { TicketController } from '../controllers/TicketController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { Rol } from '../../../domain/enums/Rol.js';

const router = Router();

const ticketRepository = new TicketMySqlRepository();

const listarTicketsCocinaUseCase = new ListarTicketsCocinaUseCase(ticketRepository);
const cambiarEstadoTicketUseCase = new CambiarEstadoTicketUseCase(ticketRepository);

const ticketController = new TicketController(
  listarTicketsCocinaUseCase,
  cambiarEstadoTicketUseCase
);

router.get(
  '/',
  authMiddleware,
  roleMiddleware([Rol.ADMIN, Rol.CAJA, Rol.COCINA]),
  ticketController.listar
);

router.patch(
  '/:id/estado',
  authMiddleware,
  roleMiddleware([Rol.ADMIN, Rol.COCINA]),
  ticketController.cambiarEstado
);

export default router;
