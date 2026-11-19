import { Rol } from '../../domain/enums/Rol.js';

export interface DatosBienvenidaEmail {
  nombre: string;
  email: string;
  rol: Rol;
  passwordTemporal: string;
}

export interface IEmailService {
  enviarBienvenidaConPassword(datos: DatosBienvenidaEmail): Promise<void>;
}
