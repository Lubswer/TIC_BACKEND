import { Request, Response } from 'express';
import { ObtenerTopProductosUseCase } from '../../../application/use-cases/reportes/ObtenerTopProductosUseCase.js';
import { ObtenerVentasDiariasUseCase } from '../../../application/use-cases/reportes/ObtenerVentasDiariasUseCase.js';
import { ObtenerProductosVendidosUseCase } from '../../../application/use-cases/reportes/ObtenerProductosVendidosUseCase.js';
import { ListarPedidosUseCase } from '../../../application/use-cases/pedidos/ListarPedidosUseCase.js';
import { ExcelReporteService } from '../../reports/ExcelReporteService.js';

export class ReporteController {
  constructor(
    private obtenerTopProductosUseCase: ObtenerTopProductosUseCase,
    private obtenerVentasDiariasUseCase: ObtenerVentasDiariasUseCase,
    private obtenerProductosVendidosUseCase: ObtenerProductosVendidosUseCase,
    private listarPedidosUseCase: ListarPedidosUseCase,
    private excelReporteService: ExcelReporteService
  ) {}

  private extraerRangoFechas(query: Request['query']): {
    fechaInicio?: string;
    fechaFin?: string;
  } {
    const { fechaInicio, fechaFin } = query;
    return {
      fechaInicio: fechaInicio ? String(fechaInicio) : undefined,
      fechaFin: fechaFin ? String(fechaFin) : undefined,
    };
  }

  obtenerTopProductos = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limite } = req.query;
      const { fechaInicio, fechaFin } = this.extraerRangoFechas(req.query);

      const resultado = await this.obtenerTopProductosUseCase.ejecutar({
        fechaInicio,
        fechaFin,
        limite: limite ? Number(limite) : undefined,
      });

      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener top productos.' });
    }
  };

  obtenerVentasDiarias = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ultimosDias } = req.query;
      const { fechaInicio, fechaFin } = this.extraerRangoFechas(req.query);

      const resultado = await this.obtenerVentasDiariasUseCase.ejecutar({
        fechaInicio,
        fechaFin,
        ultimosDias: ultimosDias ? Number(ultimosDias) : undefined,
      });

      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener ventas diarias.' });
    }
  };

  obtenerProductosVendidos = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productoId, categoria } = req.query;
      const agruparPorFecha = req.query.agruparPorFecha === 'true';
      const { fechaInicio, fechaFin } = this.extraerRangoFechas(req.query);

      const resultado = await this.obtenerProductosVendidosUseCase.ejecutar({
        fechaInicio,
        fechaFin,
        productoId: productoId ? Number(productoId) : undefined,
        categoria: categoria ? String(categoria) : undefined,
        agruparPorFecha,
      });

      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener reporte de productos vendidos.' });
    }
  };

  exportarVentasDiariasExcel = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ultimosDias } = req.query;
      const { fechaInicio, fechaFin } = this.extraerRangoFechas(req.query);
      const ultimosDiasNum = ultimosDias ? Number(ultimosDias) : undefined;

      const datos = await this.obtenerVentasDiariasUseCase.ejecutar({
        fechaInicio,
        fechaFin,
        ultimosDias: ultimosDiasNum,
      });

      await this.excelReporteService.exportarVentasDiarias(res, datos, {
        fechaInicio,
        fechaFin,
        ultimosDias: ultimosDiasNum,
      });
    } catch (error: any) {
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || 'Error al exportar ventas diarias a Excel.' });
      }
    }
  };

  exportarProductosVendidosExcel = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productoId, categoria } = req.query;
      const agruparPorFecha = req.query.agruparPorFecha === 'true';
      const { fechaInicio, fechaFin } = this.extraerRangoFechas(req.query);
      const categoriaStr = categoria ? String(categoria) : undefined;

      const datos = await this.obtenerProductosVendidosUseCase.ejecutar({
        fechaInicio,
        fechaFin,
        productoId: productoId ? Number(productoId) : undefined,
        categoria: categoriaStr,
        agruparPorFecha,
      });

      await this.excelReporteService.exportarProductosVendidos(res, datos, {
        fechaInicio,
        fechaFin,
        categoria: categoriaStr,
        agruparPorFecha,
      });
    } catch (error: any) {
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || 'Error al exportar productos vendidos a Excel.' });
      }
    }
  };

  exportarPedidosExcel = async (req: Request, res: Response): Promise<void> => {
    try {
      const soloExtras = req.query.soloExtras === 'true';
      const { fechaInicio, fechaFin } = this.extraerRangoFechas(req.query);

      const datos = await this.listarPedidosUseCase.ejecutar({
        sinLimite: true,
        soloExtras: soloExtras ? true : undefined,
        fechaInicio,
        fechaFin,
      });

      await this.excelReporteService.exportarPedidos(res, datos, {
        fechaInicio,
        fechaFin,
        soloExtras,
      });
    } catch (error: any) {
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || 'Error al exportar pedidos a Excel.' });
      }
    }
  };
}

