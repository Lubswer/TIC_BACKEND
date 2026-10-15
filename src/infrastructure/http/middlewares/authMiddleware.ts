import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../../../config/env.js';
import { Rol } from '../../../domain/enums/Rol.js';


interface UsuarioTokenPayload {
  id: number;
  email: string;
  rol: Rol;
}

export interface RequestAutenticado extends Request {
  usuario?: UsuarioTokenPayload;
}


export function authMiddleware(req: RequestAutenticado,res: Response,next: NextFunction): void {
  
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Acceso no autorizado: Token no proporcionado o formato inválido.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {

    const payloadDecodificado = jwt.verify(
      token,
      ENV.JWT_SECRET
    ) as UsuarioTokenPayload;

    req.usuario = payloadDecodificado;

    next();
  } catch (error) {
    res.status(401).json({
      error: 'Token inválido o expirado. Inicia sesión nuevamente.',
    });
  }
}
