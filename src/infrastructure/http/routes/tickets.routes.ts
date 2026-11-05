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

// Listar tickets (activos o despachados): Accesible para admin, caja y cocina
router.get(
  '/',
  authMiddleware,
  roleMiddleware([Rol.ADMIN, Rol.CAJA, Rol.COCINA]),
  ticketController.listar
);

// Cambiar estado del ticket (en_preparacion / listo): Exclusivo de admin y cocina
router.patch(
  '/:id/estado',
  authMiddleware,
  roleMiddleware([Rol.ADMIN, Rol.COCINA]),
  ticketController.cambiarEstado
);

export default router;

