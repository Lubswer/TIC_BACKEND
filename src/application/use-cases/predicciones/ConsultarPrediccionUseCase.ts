import { IPrediccionRepository } from '../../../domain/repositories/IPrediccionRepository.js';
import { IPrediccionClient } from '../../services/IPrediccionClient.js';
import {
  FiltrosPrediccionDTO,
  PrediccionDiaDTO,
  PrediccionProductoDTO,
  ProductoHistoricoParaIADTO,
  RespuestaPrediccionDTO,
} from '../../dtos/prediccion.dto.js';

export class ConsultarPrediccionUseCase {
  constructor(
    private prediccionRepository: IPrediccionRepository,
    private prediccionClient: IPrediccionClient
  ) {}

  private formatearFechaLocal(fecha: Date): string {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private obtenerFechaAyer(): string {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    return this.formatearFechaLocal(ayer);
  }

  private generarRespaldoLocal(
    productos: ProductoHistoricoParaIADTO[],
    dias: number
  ): PrediccionProductoDTO[] {
    const hoy = new Date();

    return productos.map((prod) => {
      const ultimos = prod.historial.slice(-7);
      const suma = ultimos.reduce((acc, item) => acc + item.cantidad, 0);
      const promedio = ultimos.length > 0 ? Math.round(suma / ultimos.length) : 0;
      const margen = promedio > 0 ? Math.max(1, Math.round(promedio * 0.3)) : 0;

      const predicciones: PrediccionDiaDTO[] = [];
      for (let i = 0; i < dias; i++) {
        const fechaDia = new Date(hoy);
        fechaDia.setDate(hoy.getDate() + i);
        predicciones.push({
          fecha: this.formatearFechaLocal(fechaDia),
          cantidad_esperada: promedio,
          minimo: Math.max(0, promedio - margen),
          maximo: promedio + margen,
        });
      }

      return {
        producto_id: prod.producto_id,
        nombre_producto: prod.nombre,
        categoria: prod.categoria,
        producto_temporada: prod.producto_temporada,
        estrategia: 'respaldo_local',
        total_esperado: promedio * dias,
        predicciones,
      };
    });
  }

  async ejecutar(filtros: FiltrosPrediccionDTO = {}): Promise<RespuestaPrediccionDTO> {
    const dias =
      filtros.dias && filtros.dias >= 1 && filtros.dias <= 30 ? Math.floor(filtros.dias) : 7;
    const fechaCorte = this.obtenerFechaAyer();

    const historico = await this.prediccionRepository.obtenerHistoricoParaPrediccion({
      ventanaDias: 90,
      productoId: filtros.productoId,
      categoria: filtros.categoria,
    });

    if (historico.length === 0) {
      return {
        motor: 'StatsForecast AutoETS',
        modelo_activo: true,
        dias_predichos: dias,
        fecha_corte: fechaCorte,
        productos: [],
      };
    }

    const mapaMeta = new Map<number, ProductoHistoricoParaIADTO>();
    for (const p of historico) {
      mapaMeta.set(p.producto_id, p);
    }

    let motor = 'StatsForecast AutoETS';
    let modeloActivo = true;
    let productosPredichos: PrediccionProductoDTO[] = [];

    try {
      const respuestaIA = await this.prediccionClient.predecir(dias, fechaCorte, historico);
      motor = respuestaIA.motor || motor;

      productosPredichos = respuestaIA.resultados.map((res) => {
        const meta = mapaMeta.get(res.producto_id);
        return {
          producto_id: res.producto_id,
          nombre_producto: meta?.nombre || `Producto #${res.producto_id}`,
          categoria: meta?.categoria || '',
          producto_temporada: meta?.producto_temporada ?? false,
          estrategia: res.estrategia,
          total_esperado: res.total_esperado,
          predicciones: res.predicciones,
        };
      });
    } catch {
      modeloActivo = false;
      motor = 'Respaldo Estadístico Local (IA no disponible)';
      productosPredichos = this.generarRespaldoLocal(historico, dias);
    }

    productosPredichos.sort((a, b) => b.total_esperado - a.total_esperado);

    if (filtros.limite && filtros.limite > 0) {
      productosPredichos = productosPredichos.slice(0, filtros.limite);
    }

    return {
      motor,
      modelo_activo: modeloActivo,
      dias_predichos: dias,
      fecha_corte: fechaCorte,
      productos: productosPredichos,
    };
  }
}
