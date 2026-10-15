import http from 'http';
import { app } from './app.js';
import { ENV } from './config/env.js';


const servidor = http.createServer(app);


servidor.listen(ENV.PORT, () => {
  console.log(`Servidor de Heladería Ciocolatto ENCENDIDO`);
  console.log(`Corriendo en: http://localhost:${ENV.PORT}`);
});
