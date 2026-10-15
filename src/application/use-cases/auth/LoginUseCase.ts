import jwt from 'jsonwebtoken';
import { ENV } from '../../../config/env.js';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository.js';
import { LoginDTO, AuthRespuestaDTO } from '../../dtos/auth.dto.js';

export class LoginUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async ejecutar(dto: LoginDTO): Promise<AuthRespuestaDTO> {
    
    const usuario = await this.usuarioRepository.buscarPorEmail(dto.email);
    if (!usuario) {
      throw new Error('Credenciales incorrectas.');
    }

    if (!usuario.estaHabilitado()) {
      throw new Error('Tu cuenta está desactivada. Contacta al administrador.');
    }

    const passwordValida = await usuario.verificarPassword(dto.password);
    if (!passwordValida) {
      throw new Error('Credenciales incorrectas.');
    }


    const payload = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };

    const token = jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn:'24h',
    });


    return {
      token,
      usuario: {
        id: usuario.id!,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        activo: usuario.activo,
      },
    };
  }
}
