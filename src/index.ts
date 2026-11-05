import http from 'http';
import { app } from './app.js';
import { ENV } from './config/env.js';
import { SocketService } from './infrastructure/websocket/SocketService.js';

const servidor = http.createServer(app);

// Inicializar Socket.io acoplado al servidor HTTP nativo
SocketService.inicializar(servidor);

servidor.listen(ENV.PORT, () => {
  console.log(`Servidor de Heladería Ciocolatto ENCENDIDO`);
  console.log(`Corriendo en: http://localhost:${ENV.PORT}`);
  console.log(`WebSockets (Socket.io) activos para tiempo real`);
});
