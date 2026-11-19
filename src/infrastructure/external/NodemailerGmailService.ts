import nodemailer from 'nodemailer';
import { ENV } from '../../config/env.js';
import {
  IEmailService,
  DatosBienvenidaEmail,
  DatosSolicitudRecuperacionEmail,
  DatosPasswordRecuperadaEmail,
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

  private envolverPlantillaHtml(subtitulo: string, contenidoHtml: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e5d8d0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #4A2C2A; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Heladería Ciocolatto</h2>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">${subtitulo}</p>
        </div>
        <div style="padding: 24px; color: #333333; line-height: 1.6;">
          ${contenidoHtml}
        </div>
      </div>
    `;
  }

  private async enviar(para: string, asunto: string, html: string): Promise<void> {
    const transporter = this.crearTransporter();
    await transporter.sendMail({
      from: `"Heladería Ciocolatto" <${ENV.EMAIL_USER}>`,
      to: para,
      subject: asunto,
      html,
    });
  }

  async enviarBienvenidaConPassword(datos: DatosBienvenidaEmail): Promise<void> {
    const html = this.envolverPlantillaHtml(
      'Acceso al Sistema de Gestión Interna',
      `
        <p>Hola <strong>${datos.nombre}</strong>,</p>
        <p>El administrador ha creado tu cuenta de acceso con el rol de <strong>${datos.rol}</strong>.</p>
        <div style="background-color: #faf5f0; border-left: 4px solid #4A2C2A; padding: 14px 18px; margin: 18px 0;">
          <p style="margin: 4px 0;"><strong>Correo:</strong> ${datos.email}</p>
          <p style="margin: 4px 0;"><strong>Contraseña temporal:</strong> <code style="font-size: 16px; background: #eee; padding: 2px 6px; border-radius: 4px;">${datos.passwordTemporal}</code></p>
        </div>
        <p style="color: #8a4b08; font-size: 14px;">
          <strong>Recomendación de seguridad:</strong> Por favor cambia esta contraseña temporal desde tu perfil apenas inicies sesión.
        </p>
      `
    );

    await this.enviar(
      datos.email,
      'Tu cuenta y contraseña de acceso — Heladería Ciocolatto',
      html
    );
  }

  async enviarSolicitudRecuperacion(datos: DatosSolicitudRecuperacionEmail): Promise<void> {
    const html = this.envolverPlantillaHtml(
      'Solicitud de Restablecimiento de Contraseña',
      `
        <p>Hola <strong>${datos.nombre}</strong>,</p>
        <p>Recibimos una solicitud para cambiar la contraseña de tu cuenta.</p>
        <p>Si fuiste tú quien lo solicitó, haz clic en el siguiente botón para generar una nueva contraseña temporal (el enlace expira en <strong>15 minutos</strong>):</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${datos.urlConfirmacion}" style="background-color: #4A2C2A; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Confirmar y generar nueva contraseña
          </a>
        </div>
        <p style="color: #666666; font-size: 13px;">
          Si tú no solicitaste este cambio, ignora este correo. Tu contraseña actual seguirá funcionando sin cambios.
        </p>
      `
    );

    await this.enviar(
      datos.email,
      'Confirmación para restablecer contraseña — Heladería Ciocolatto',
      html
    );
  }

  async enviarNuevaPasswordRecuperada(datos: DatosPasswordRecuperadaEmail): Promise<void> {
    const html = this.envolverPlantillaHtml(
      'Nueva Contraseña Temporal',
      `
        <p>Hola <strong>${datos.nombre}</strong>,</p>
        <p>Hemos confirmado tu solicitud y generado una nueva contraseña temporal para tu cuenta:</p>
        <div style="background-color: #faf5f0; border-left: 4px solid #4A2C2A; padding: 14px 18px; margin: 18px 0;">
          <p style="margin: 4px 0;"><strong>Correo:</strong> ${datos.email}</p>
          <p style="margin: 4px 0;"><strong>Nueva contraseña temporal:</strong> <code style="font-size: 16px; background: #eee; padding: 2px 6px; border-radius: 4px;">${datos.passwordTemporal}</code></p>
        </div>
        <p style="color: #8a4b08; font-size: 14px;">
          <strong>Recomendación de seguridad:</strong> Inicia sesión con esta clave y cámbiala de inmediato desde tu perfil.
        </p>
      `
    );

    await this.enviar(
      datos.email,
      'Tu nueva contraseña temporal — Heladería Ciocolatto',
      html
    );
  }
}
