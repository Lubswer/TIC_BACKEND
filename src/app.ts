import express, { Request, Response } from 'express';
import cors from 'cors';
import { authRouter } from './infrastructure/http/routes/auth.routes.js';
import usuariosRouter from './infrastructure/http/routes/usuarios.routes.js';
import { productosRouter } from './infrastructure/http/routes/productos.routes.js';
import pedidosRouter from './infrastructure/http/routes/pedidos.routes.js';
import ticketsRouter from './infrastructure/http/routes/tickets.routes.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/pruebitajeje', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    sistema: 'Heladería Ciocolatto API',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/productos', productosRouter);
app.use('/api/pedidos', pedidosRouter);
app.use('/api/tickets', ticketsRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});
