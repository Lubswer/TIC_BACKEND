import { ITicketRepository, TicketCocina } from '../../../domain/repositories/ITicketRepository.js';

export class ListarTicketsCocinaUseCase {
  constructor(private ticketRepository: ITicketRepository) {}

  async ejecutar(tipo: 'activos' | 'despachados' = 'activos', limite: number = 50): Promise<TicketCocina[]> {
    if (tipo === 'despachados') {
      return await this.ticketRepository.listarTicketsDespachados(limite);
    }

    return await this.ticketRepository.listarTicketsActivos();
  }
}

