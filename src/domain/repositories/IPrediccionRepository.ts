import { ProductoHistoricoParaIADTO } from '../../application/dtos/prediccion.dto.js';

export interface FiltrosHistoricoPrediccion {
  ventanaDias?: number;
  productoId?: number;
  categoria?: string;
}

export interface IPrediccionRepository {
  obtenerHistoricoParaPrediccion(
    filtros?: FiltrosHistoricoPrediccion
  ): Promise<ProductoHistoricoParaIADTO[]>;
}
