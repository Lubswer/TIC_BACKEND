import {
  EstrategiaPrediccion,
  PrediccionDiaDTO,
  ProductoHistoricoParaIADTO,
} from '../dtos/prediccion.dto.js';

export interface ResultadoPrediccionIA {
  producto_id: number;
  estrategia: EstrategiaPrediccion;
  total_esperado: number;
  predicciones: PrediccionDiaDTO[];
}

export interface RespuestaMotorIA {
  motor: string;
  resultados: ResultadoPrediccionIA[];
}

export interface EstadoMotorIA {
  disponible: boolean;
  motor?: string;
}

export interface IPrediccionClient {
  predecir(
    dias: number,
    fechaCorte: string,
    productos: ProductoHistoricoParaIADTO[]
  ): Promise<RespuestaMotorIA>;

  verificarSalud(): Promise<EstadoMotorIA>;
}
