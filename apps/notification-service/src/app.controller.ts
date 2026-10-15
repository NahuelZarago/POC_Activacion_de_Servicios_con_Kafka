import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import * as nodemailer from 'nodemailer';

@Controller()
export class AppController {
  // Nos conectamos al Mailhog local (puerto 1025)
  private transporter = nodemailer.createTransport({ host: 'localhost', port: 1025, ignoreTLS: true });

  @EventPattern('activation.events')
  async handleActivationEvents(@Payload() message: any) {
    const { eventType, customerId } = message;
    const subject = eventType === 'ActivationCompleted' ? '¡Bienvenido! Tu plan está activo' : 'Hubo un problema con tu activación';
    
    await this.transporter.sendMail({
      from: 'sistema@empresa.com',
      to: `${customerId}@cliente.com`,
      subject,
      text: `El estado de tu activación es: ${eventType}`,
    });
    console.log(`📧 [Notification] Email enviado a ${customerId} por evento: ${eventType}`);
  }
}
