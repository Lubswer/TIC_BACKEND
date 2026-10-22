import { Request, Response } from 'express';
import { CrearProductoUseCase } from '../../../application/use-cases/productos/CrearProductoUseCase.js';
import { ListarProductosUseCase } from '../../../application/use-cases/productos/ListarProductosUseCase.js';
import { ActualizarProductoUseCase } from '../../../application/use-cases/productos/ActualizarProductoUseCase.js';
import { EliminarProductoUseCase } from '../../../application/use-cases/productos/EliminarProductoUseCase.js';
import { CambiarDisponibilidadUseCase } from '../../../application/use-cases/productos/CambiarDisponibilidadUseCase.js';
import { CrearProductoDTO, ActualizarProductoDTO } from '../../../application/dtos/producto.dto.js';
import { FiltrosProducto } from '../../../domain/repositories/IProductoRepository.js';

export class ProductoController {
  constructor(
    private crearProductoUseCase: CrearProductoUseCase,
    private listarProductosUseCase: ListarProductosUseCase,
    private actualizarProductoUseCase: ActualizarProductoUseCase,
    private eliminarProductoUseCase: EliminarProductoUseCase,
    private cambiarDisponibilidadUseCase: CambiarDisponibilidadUseCase
  ) {}

  crear = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nombre, precio, descripcion, imagen_url, stock, disponible, producto_temporada } = req.body;


      if (!nombre || precio === undefined || precio === null) {
        res.status(400).json({ error: 'Nombre y precio son obligatorios para crear un producto.' });
        return;
      }

      const dto: CrearProductoDTO = {
        nombre,
        precio: Number(precio),
        descripcion,
        imagen_url,
        stock: stock !== undefined && stock !== null ? Number(stock) : null,
        disponible,
        producto_temporada,
      };

      const nuevoProducto = await this.crearProductoUseCase.ejecutar(dto);
      res.status(201).json(nuevoProducto);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al crear el producto.' });
    }
  };

  listar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { soloDisponibles, incluirInactivos } = req.query;

      const filtros: FiltrosProducto = {};
      if (soloDisponibles === 'true') filtros.soloDisponibles = true;
      if (incluirInactivos === 'true') filtros.incluirInactivos = true;

      const productos = await this.listarProductosUseCase.ejecutar(filtros);
      res.status(200).json(productos);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al listar los productos.' });
    }
  };

  actualizar = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.status(400).json({ error: 'El ID del producto proporcionado en la URL no es válido.' });
        return;
      }

      const dto: ActualizarProductoDTO = req.body;
      if (dto.precio !== undefined) dto.precio = Number(dto.precio);
      if (dto.stock !== undefined && dto.stock !== null) dto.stock = Number(dto.stock);

      const productoActualizado = await this.actualizarProductoUseCase.ejecutar(id, dto);
      res.status(200).json(productoActualizado);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al actualizar el producto.' });
    }
  };

  eliminar = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.status(400).json({ error: 'El ID del producto proporcionado en la URL no es válido.' });
        return;
      }

      await this.eliminarProductoUseCase.ejecutar(id);
      res.status(200).json({ mensaje: `Producto con ID ${id} eliminado lógicamente con éxito.` });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al eliminar el producto.' });
    }
  };

  cambiarDisponibilidad = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const { disponible } = req.body;

      if (isNaN(id) || id <= 0) {
        res.status(400).json({ error: 'El ID del producto proporcionado en la URL no es válido.' });
        return;
      }

      if (disponible === undefined || typeof disponible !== 'boolean') {
        res.status(400).json({ error: 'El campo booleano "disponible" es obligatorio (true o false).' });
        return;
      }

      const productoActualizado = await this.cambiarDisponibilidadUseCase.ejecutar(id, disponible);
      res.status(200).json(productoActualizado);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al cambiar la disponibilidad.' });
    }
  };
}
