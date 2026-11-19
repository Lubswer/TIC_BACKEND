import { Router } from 'express';
import { UsuarioMySqlRepository } from '../../database/mysql/UsuarioMySqlRepository.js';
import { NodemailerGmailService } from '../../external/NodemailerGmailService.js';
import { RegistrarUsuarioUseCase } from '../../../application/use-cases/auth/RegistrarUsuarioUseCase.js';
import { LoginUseCase } from '../../../application/use-cases/auth/LoginUseCase.js';
import { ActualizarMiPerfilUseCase } from '../../../application/use-cases/auth/ActualizarMiPerfilUseCase.js';
import { SolicitarRecuperacionPasswordUseCase } from '../../../application/use-cases/auth/SolicitarRecuperacionPasswordUseCase.js';
import { ConfirmarRecuperacionPasswordUseCase } from '../../../application/use-cases/auth/ConfirmarRecuperacionPasswordUseCase.js';
import { AuthController } from '../controllers/AuthController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { Rol } from '../../../domain/enums/Rol.js';


const authRouter = Router();


const usuarioRepository = new UsuarioMySqlRepository();
const emailService = new NodemailerGmailService();


const registrarUsuarioUseCase = new RegistrarUsuarioUseCase(usuarioRepository, emailService);
const loginUseCase = new LoginUseCase(usuarioRepository);
const actualizarMiPerfilUseCase = new ActualizarMiPerfilUseCase(usuarioRepository);
const solicitarRecuperacionUseCase = new SolicitarRecuperacionPasswordUseCase(
  usuarioRepository,
  emailService
);
const confirmarRecuperacionUseCase = new ConfirmarRecuperacionPasswordUseCase(
  usuarioRepository,
  emailService
);


const authController = new AuthController(
  registrarUsuarioUseCase,
  loginUseCase,
  actualizarMiPerfilUseCase,
  solicitarRecuperacionUseCase,
  confirmarRecuperacionUseCase
);




authRouter.post('/login', authController.login);

authRouter.post('/olvide-password', authController.olvidePassword);

authRouter.get('/confirmar-recuperacion', authController.confirmarRecuperacion);


authRouter.post(
  '/registro',
  authMiddleware,
  roleMiddleware([Rol.ADMIN]),
  authController.registrar
);

authRouter.put('/mi-perfil', authMiddleware, authController.actualizarMiPerfil);

export { authRouter };
