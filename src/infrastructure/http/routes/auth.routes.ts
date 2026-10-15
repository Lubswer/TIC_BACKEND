import { Router } from 'express';
import { UsuarioMySqlRepository } from '../../database/mysql/UsuarioMySqlRepository.js';
import { RegistrarUsuarioUseCase } from '../../../application/use-cases/auth/RegistrarUsuarioUseCase.js';
import { LoginUseCase } from '../../../application/use-cases/auth/LoginUseCase.js';
import { AuthController } from '../controllers/AuthController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { Rol } from '../../../domain/enums/Rol.js';


const authRouter = Router();


const usuarioRepository = new UsuarioMySqlRepository();


const registrarUsuarioUseCase = new RegistrarUsuarioUseCase(usuarioRepository);
const loginUseCase = new LoginUseCase(usuarioRepository);


const authController = new AuthController(registrarUsuarioUseCase, loginUseCase);




authRouter.post('/login', authController.login);


authRouter.post(
  '/registro',
  authMiddleware,
  roleMiddleware([Rol.ADMIN]),
  authController.registrar
);

export { authRouter };
