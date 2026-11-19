import { Rol } from '../../domain/enums/Rol.js';

export interface DatosBienvenidaEmail {
  nombre: string;
  email: string;
  rol: Rol;
  passwordTemporal: string;
}

export interface DatosSolicitudRecuperacionEmail {
  nombre: string;
  email: string;
  urlConfirmacion: string;
}

export interface DatosPasswordRecuperadaEmail {
  nombre: string;
  email: string;
  passwordTemporal: string;
}

export interface IEmailService {
  enviarBienvenidaConPassword(datos: DatosBienvenidaEmail): Promise<void>;
  enviarSolicitudRecuperacion(datos: DatosSolicitudRecuperacionEmail): Promise<void>;
  enviarNuevaPasswordRecuperada(datos: DatosPasswordRecuperadaEmail): Promise<void>;
}
