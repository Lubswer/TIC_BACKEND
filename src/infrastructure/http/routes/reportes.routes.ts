import { Router } from 'express';
import { ReporteMySqlRepository } from '../../database/mysql/ReporteMySqlRepository.js';
import { PedidoMySqlRepository } from '../../database/mysql/PedidoMySqlRepository.js';
import { ObtenerTopProductosUseCase } from '../../../application/use-cases/reportes/ObtenerTopProductosUseCase.js';
import { ObtenerVentasDiariasUseCase } from '../../../application/use-cases/reportes/ObtenerVentasDiariasUseCase.js';
import { ObtenerProductosVendidosUseCase } from '../../../application/use-cases/reportes/ObtenerProductosVendidosUseCase.js';
import { ListarPedidosUseCase } from '../../../application/use-cases/pedidos/ListarPedidosUseCase.js';
import { ExcelReporteService } from '../../reports/ExcelReporteService.js';
import { ReporteController } from '../controllers/ReporteController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { Rol } from '../../../domain/enums/Rol.js';

const router = Router();

const reporteRepository = new ReporteMySqlRepository();
const pedidoRepository = new PedidoMySqlRepository();
const excelReporteService = new ExcelReporteService();

const obtenerTopProductosUseCase = new ObtenerTopProductosUseCase(reporteRepository);
const obtenerVentasDiariasUseCase = new ObtenerVentasDiariasUseCase(reporteRepository);
const obtenerProductosVendidosUseCase = new ObtenerProductosVendidosUseCase(reporteRepository);
const listarPedidosUseCase = new ListarPedidosUseCase(pedidoRepository);

const reporteController = new ReporteController(
  obtenerTopProductosUseCase,
  obtenerVentasDiariasUseCase,
  obtenerProductosVendidosUseCase,
  listarPedidosUseCase,
  excelReporteService
);

router.use(authMiddleware, roleMiddleware([Rol.ADMIN]));

router.get('/top-productos', reporteController.obtenerTopProductos);
router.get('/ventas-diarias', reporteController.obtenerVentasDiarias);
router.get('/productos-vendidos', reporteController.obtenerProductosVendidos);

router.get('/ventas-diarias/excel', reporteController.exportarVentasDiariasExcel);
router.get('/productos-vendidos/excel', reporteController.exportarProductosVendidosExcel);
router.get('/pedidos/excel', reporteController.exportarPedidosExcel);

export default router;

