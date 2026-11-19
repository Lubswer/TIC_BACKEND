import nodemailer from 'nodemailer';
import { ENV } from '../../config/env.js';
import {
  IEmailService,
  DatosBienvenidaEmail,
} from '../../application/services/IEmailService.js';

export class NodemailerGmailService implements IEmailService {
  private crearTransporter() {
    if (!ENV.EMAIL_USER || !ENV.EMAIL_APP_PASSWORD) {
      throw new Error(
        'Faltan configurar las credenciales de correo (EMAIL_USER y EMAIL_APP_PASSWORD) en .env.'
      );
    }

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_APP_PASSWORD,
      },
    });
  }

  async enviarBienvenidaConPassword(datos: DatosBienvenidaEmail): Promise<void> {
    const transporter = this.crearTransporter();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e5d8d0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #4A2C2A; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Heladería Ciocolatto</h2>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Acceso al Sistema de Gestión Interna</p>
        </div>
        <div style="padding: 24px; color: #333333; line-height: 1.6;">
          <p>Hola <strong>${datos.nombre}</strong>,</p>
          <p>El administrador ha creado tu cuenta de acceso con el rol de <strong>${datos.rol}</strong>.</p>
          <div style="background-color: #faf5f0; border-left: 4px solid #4A2C2A; padding: 14px 18px; margin: 18px 0;">
            <p style="margin: 4px 0;"><strong>Correo:</strong> ${datos.email}</p>
            <p style="margin: 4px 0;"><strong>Contraseña temporal:</strong> <code style="font-size: 16px; background: #eee; padding: 2px 6px; border-radius: 4px;">${datos.passwordTemporal}</code></p>
          </div>
          <p style="color: #8a4b08; font-size: 14px;">
            <strong>Recomendación de seguridad:</strong> Por favor cambia esta contraseña temporal desde tu perfil apenas inicies sesión.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Heladería Ciocolatto" <${ENV.EMAIL_USER}>`,
      to: datos.email,
      subject: 'Tu cuenta y contraseña de acceso — Heladería Ciocolatto',
      html,
    });
  }
}
