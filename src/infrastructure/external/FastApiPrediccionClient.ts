import { ENV } from '../../config/env.js';
import {
  IPrediccionClient,
  RespuestaMotorIA,
  EstadoMotorIA,
} from '../../application/services/IPrediccionClient.js';
import { ProductoHistoricoParaIADTO } from '../../application/dtos/prediccion.dto.js';

const TIMEOUT_MS = 3000;

export class FastApiPrediccionClient implements IPrediccionClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = ENV.PREDICCION_API_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async predecir(
    dias: number,
    fechaCorte: string,
    productos: ProductoHistoricoParaIADTO[]
  ): Promise<RespuestaMotorIA> {
    const respuesta = await fetch(`${this.baseUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dias,
        fecha_corte: fechaCorte,
        productos: productos.map((p) => ({
          producto_id: p.producto_id,
          nombre: p.nombre,
          producto_temporada: p.producto_temporada,
          historial: p.historial,
        })),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.text().catch(() => '');
      throw new Error(`Motor IA respondió ${respuesta.status}: ${detalle}`);
    }

    return (await respuesta.json()) as RespuestaMotorIA;
  }

  async verificarSalud(): Promise<EstadoMotorIA> {
    try {
      const respuesta = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!respuesta.ok) {
        return { disponible: false };
      }

      const data = (await respuesta.json()) as { status?: string; motor?: string };
      return {
        disponible: data.status === 'ok',
        motor: data.motor,
      };
    } catch {
      return { disponible: false };
    }
  }
}
