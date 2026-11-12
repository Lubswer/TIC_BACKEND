import { Request, Response } from 'express';
import { ObtenerTopProductosUseCase } from '../../../application/use-cases/reportes/ObtenerTopProductosUseCase.js';
import { ObtenerVentasDiariasUseCase } from '../../../application/use-cases/reportes/ObtenerVentasDiariasUseCase.js';
import { ObtenerProductosVendidosUseCase } from '../../../application/use-cases/reportes/ObtenerProductosVendidosUseCase.js';

export class ReporteController {
  constructor(
    private obtenerTopProductosUseCase: ObtenerTopProductosUseCase,
    private obtenerVentasDiariasUseCase: ObtenerVentasDiariasUseCase,
    private obtenerProductosVendidosUseCase: ObtenerProductosVendidosUseCase
  ) {}

  obtenerTopProductos = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fechaInicio, fechaFin, limite } = req.query;

      const resultado = await this.obtenerTopProductosUseCase.ejecutar({
        fechaInicio: fechaInicio ? String(fechaInicio) : undefined,
        fechaFin: fechaFin ? String(fechaFin) : undefined,
        limite: limite ? Number(limite) : undefined,
      });

      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener top productos.' });
    }
  };

  obtenerVentasDiarias = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fechaInicio, fechaFin } = req.query;

      const resultado = await this.obtenerVentasDiariasUseCase.ejecutar({
        fechaInicio: fechaInicio ? String(fechaInicio) : undefined,
        fechaFin: fechaFin ? String(fechaFin) : undefined,
      });

      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener ventas diarias.' });
    }
  };

  obtenerProductosVendidos = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fechaInicio, fechaFin, productoId, categoria } = req.query;

      const resultado = await this.obtenerProductosVendidosUseCase.ejecutar({
        fechaInicio: fechaInicio ? String(fechaInicio) : undefined,
        fechaFin: fechaFin ? String(fechaFin) : undefined,
        productoId: productoId ? Number(productoId) : undefined,
        categoria: categoria ? String(categoria) : undefined,
      });

      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener reporte de productos vendidos.' });
    }
  };
}

