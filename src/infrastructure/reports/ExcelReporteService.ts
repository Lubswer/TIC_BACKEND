import ExcelJS from 'exceljs';
import { Response } from 'express';
import {
  VentasDiariasDTO,
  ItemVendidoDetalleDTO,
} from '../../application/dtos/reporte.dto.js';
import { PedidoResumenDTO } from '../../application/dtos/pedido.dto.js';

const FORMATO_MONEDA = '$#,##0.00';

export class ExcelReporteService {
  private crearLibroYHoja(nombreHoja: string, titulo: string, subtitulo: string): {
    workbook: ExcelJS.Workbook;
    sheet: ExcelJS.Worksheet;
    filaInicioTabla: number;
  } {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Heladería Ciocolatto';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(nombreHoja);

    sheet.getCell('A1').value = `Heladería Ciocolatto — ${titulo}`;
    sheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF4A2C2A' } };

    sheet.getCell('A2').value = subtitulo;
    sheet.getCell('A2').font = { italic: true, size: 10, color: { argb: 'FF555555' } };

    sheet.getCell('A3').value = `Generado: ${new Date().toLocaleString('es-EC')}`;
    sheet.getCell('A3').font = { size: 9, color: { argb: 'FF777777' } };

    return { workbook, sheet, filaInicioTabla: 5 };
  }

  private configurarEncabezados(
    sheet: ExcelJS.Worksheet,
    filaHeader: number,
    columnas: { header: string; key: string; width: number; numFmt?: string }[]
  ): void {
    columnas.forEach((col, index) => {
      sheet.getColumn(index + 1).width = col.width;
      if (col.numFmt) {
        sheet.getColumn(index + 1).numFmt = col.numFmt;
      }
    });

    const row = sheet.getRow(filaHeader);
    row.values = columnas.map((c) => c.header);
    row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    row.alignment = { vertical: 'middle', horizontal: 'center' };
    row.height = 22;

    row.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4A2C2A' },
      };
    });
  }

  private estilizarFilaTotales(row: ExcelJS.Row): void {
    row.font = { bold: true };
    row.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3E5AB' },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF4A2C2A' } },
      };
    });
  }

  private formatearSubtituloFechas(fechaInicio?: string, fechaFin?: string, extra?: string): string {
    const rango =
      fechaInicio || fechaFin
        ? `Período: ${fechaInicio || 'Inicio'} hasta ${fechaFin || 'Actualidad'}`
        : 'Período: Histórico completo (todos los días)';
    return extra ? `${rango} | ${extra}` : rango;
  }

  private async enviarLibro(
    res: Response,
    workbook: ExcelJS.Workbook,
    nombreArchivo: string
  ): Promise<void> {
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);

    await workbook.xlsx.write(res);
    res.end();
  }

  async exportarVentasDiarias(
    res: Response,
    datos: VentasDiariasDTO[],
    filtros: { fechaInicio?: string; fechaFin?: string; ultimosDias?: number }
  ): Promise<void> {
    const extraDias =
      !filtros.fechaInicio && !filtros.fechaFin && filtros.ultimosDias && filtros.ultimosDias > 0
        ? `Últimos ${filtros.ultimosDias} días`
        : undefined;
    const subtitulo =
      extraDias || this.formatearSubtituloFechas(filtros.fechaInicio, filtros.fechaFin);
    const { workbook, sheet, filaInicioTabla } = this.crearLibroYHoja(
      'Ventas Diarias',
      'Reporte de Ventas Diarias',
      subtitulo
    );

    this.configurarEncabezados(sheet, filaInicioTabla, [
      { header: 'Fecha', key: 'fecha', width: 18 },
      { header: 'Cantidad de Pedidos', key: 'cantidad_pedidos', width: 22, numFmt: '#,##0' },
      { header: 'Total Ingresos', key: 'total_ingresos', width: 20, numFmt: FORMATO_MONEDA },
    ]);

    let totalPedidos = 0;
    let totalIngresos = 0;

    datos.forEach((item, idx) => {
      const fila = sheet.getRow(filaInicioTabla + 1 + idx);
      fila.values = [item.fecha, item.cantidad_pedidos, item.total_ingresos];
      totalPedidos += item.cantidad_pedidos;
      totalIngresos += item.total_ingresos;
    });

    const filaTotal = sheet.getRow(filaInicioTabla + 1 + datos.length);
    filaTotal.values = ['TOTAL', totalPedidos, Number(totalIngresos.toFixed(2))];
    this.estilizarFilaTotales(filaTotal);

    await this.enviarLibro(res, workbook, 'reporte_ventas_diarias.xlsx');
  }

  async exportarProductosVendidos(
    res: Response,
    datos: ItemVendidoDetalleDTO[],
    filtros: { fechaInicio?: string; fechaFin?: string; categoria?: string }
  ): Promise<void> {
    const extra = filtros.categoria ? `Categoría: ${filtros.categoria}` : 'Categoría: Todas';
    const subtitulo = this.formatearSubtituloFechas(filtros.fechaInicio, filtros.fechaFin, extra);
    const { workbook, sheet, filaInicioTabla } = this.crearLibroYHoja(
      'Productos Vendidos',
      'Reporte de Productos Vendidos',
      subtitulo
    );

    this.configurarEncabezados(sheet, filaInicioTabla, [
      { header: 'ID', key: 'producto_id', width: 10 },
      { header: 'Producto', key: 'nombre_producto', width: 32 },
      { header: 'Categoría', key: 'categoria', width: 16 },
      { header: 'Precio Actual', key: 'precio_unitario_actual', width: 16, numFmt: FORMATO_MONEDA },
      { header: 'Unidades Vendidas', key: 'cantidad_total', width: 20, numFmt: '#,##0' },
      { header: 'Total Recaudado', key: 'total_recaudado', width: 20, numFmt: FORMATO_MONEDA },
    ]);

    let totalUnidades = 0;
    let totalRecaudado = 0;

    datos.forEach((item, idx) => {
      const fila = sheet.getRow(filaInicioTabla + 1 + idx);
      fila.values = [
        item.producto_id,
        item.nombre_producto,
        item.categoria,
        item.precio_unitario_actual,
        item.cantidad_total,
        item.total_recaudado,
      ];
      totalUnidades += item.cantidad_total;
      totalRecaudado += item.total_recaudado;
    });

    const filaTotal = sheet.getRow(filaInicioTabla + 1 + datos.length);
    filaTotal.values = ['TOTAL', '', '', '', totalUnidades, Number(totalRecaudado.toFixed(2))];
    this.estilizarFilaTotales(filaTotal);

    await this.enviarLibro(res, workbook, 'reporte_productos_vendidos.xlsx');
  }

  async exportarPedidos(
    res: Response,
    datos: PedidoResumenDTO[],
    filtros: { fechaInicio?: string; fechaFin?: string; soloExtras?: boolean }
  ): Promise<void> {
    const extra = filtros.soloExtras ? 'Filtro: Solo pedidos con extras' : 'Filtro: Todos';
    const subtitulo = this.formatearSubtituloFechas(filtros.fechaInicio, filtros.fechaFin, extra);
    const { workbook, sheet, filaInicioTabla } = this.crearLibroYHoja(
      'Historial de Pedidos',
      'Historial de Pedidos',
      subtitulo
    );

    this.configurarEncabezados(sheet, filaInicioTabla, [
      { header: 'ID Pedido', key: 'id', width: 12 },
      { header: 'Fecha y Hora', key: 'fecha', width: 22 },
      { header: 'Cajero', key: 'usuario_nombre', width: 24 },
      { header: 'Tipo de Pago', key: 'tipo_pago', width: 20 },
      { header: '¿Extras?', key: 'extras', width: 12 },
      { header: 'Detalle Extras', key: 'descripcion_extras', width: 28 },
      { header: 'Total Productos', key: 'total_productos', width: 18, numFmt: FORMATO_MONEDA },
      { header: 'Total Extras', key: 'total_extras', width: 16, numFmt: FORMATO_MONEDA },
      { header: 'Total Cobrado', key: 'total', width: 18, numFmt: FORMATO_MONEDA },
      { header: 'Notas', key: 'notas', width: 30 },
    ]);

    let sumProductos = 0;
    let sumExtras = 0;
    let sumTotal = 0;

    datos.forEach((p, idx) => {
      const fila = sheet.getRow(filaInicioTabla + 1 + idx);
      const fechaStr = p.fecha_creacion
        ? new Date(p.fecha_creacion).toLocaleString('es-EC')
        : '';

      fila.values = [
        p.id,
        fechaStr,
        p.usuario_nombre || `Usuario #${p.usuario_id}`,
        p.tipo_pago,
        p.extras ? 'Sí' : 'No',
        p.descripcion_extras || '',
        p.total_productos,
        p.total_extras,
        p.total,
        p.notas || '',
      ];

      sumProductos += p.total_productos;
      sumExtras += p.total_extras;
      sumTotal += p.total;
    });

    const filaTotal = sheet.getRow(filaInicioTabla + 1 + datos.length);
    filaTotal.values = [
      'TOTAL',
      `${datos.length} pedidos`,
      '',
      '',
      '',
      '',
      Number(sumProductos.toFixed(2)),
      Number(sumExtras.toFixed(2)),
      Number(sumTotal.toFixed(2)),
      '',
    ];
    this.estilizarFilaTotales(filaTotal);

    await this.enviarLibro(res, workbook, 'reporte_pedidos.xlsx');
  }
}
