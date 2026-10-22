import { IProductoRepository } from '../../../domain/repositories/IProductoRepository.js';

export class EliminarProductoUseCase {
  constructor(private productoRepository: IProductoRepository) {}

  async ejecutar(id: number): Promise<boolean> {
    const producto = await this.productoRepository.buscarPorId(id);

    if (!producto) {
      throw new Error(`Producto con ID ${id} no encontrado.`);
    }

    return this.productoRepository.eliminar(id);
  }
}
