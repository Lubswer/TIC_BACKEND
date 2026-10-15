import { Response, NextFunction } from 'express';
import { Rol } from '../../../domain/enums/Rol.js';
import { RequestAutenticado } from './authMiddleware.js';

export function roleMiddleware(rolesPermitidos: Rol[]) {
  return (req: RequestAutenticado, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({
        error: 'No autenticado: Se requiere iniciar sesión primero.',
      });
      return;
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      res.status(403).json({
        error: `Acceso denegado: Tu rol '${req.usuario.rol}' no tiene permisos para realizar esta acción.`,
      });
      return;
    }
    next();
  };
}
