import { Request, Response } from 'express';
import { ConsultarPrediccionUseCase } from '../../../application/use-cases/predicciones/ConsultarPrediccionUseCase.js';
import { IPrediccionClient } from '../../../application/services/IPrediccionClient.js';

export class PrediccionController {
  constructor(
    private consultarPrediccionUseCase: ConsultarPrediccionUseCase,
    private prediccionClient: IPrediccionClient
  ) {}

  obtenerPredicciones = async (req: Request, res: Response): Promise<void> => {
    try {
      const { dias, productoId, categoria, limite } = req.query;

      const resultado = await this.consultarPrediccionUseCase.ejecutar({
        dias: dias ? Number(dias) : undefined,
        productoId: productoId ? Number(productoId) : undefined,
        categoria: categoria ? String(categoria) : undefined,
        limite: limite ? Number(limite) : undefined,
      });

      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al generar predicciones.' });
    }
  };

  verificarEstado = async (_req: Request, res: Response): Promise<void> => {
    try {
      const estado = await this.prediccionClient.verificarSalud();
      res.status(200).json({
        ia_disponible: estado.disponible,
        motor: estado.motor || null,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al verificar estado de IA.' });
    }
  };
}
