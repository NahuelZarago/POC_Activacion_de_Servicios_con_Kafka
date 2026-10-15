import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import { EventPattern, Payload, ClientKafka } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

@Controller()
export class AppController implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  @EventPattern('activation.requested')
  handleActivationRequested(@Payload() message: any) {
    console.log('\n📦 [Billing Service] Procesando solicitud...');
    const payload = message.payload;
    const customerId = message.customerId;

    // Evaluamos si el frontend mandó a forzar un fallo en billing
    const hasFailed = payload.simulateFailure === 'billing';
    const eventType = hasFailed ? 'BillingFailed' : 'BillingAccountCreated';

    // Armamos el evento de respuesta
    const resultEvent = {
      eventId: uuidv4(),
      eventType: eventType,
      version: 1,
      occurredAt: new Date().toISOString(),
      correlationId: message.correlationId,
      customerId: customerId,
      source: 'billing-service',
      payload: {
        status: hasFailed ? 'ERROR' : 'OK',
        detail: hasFailed ? 'Error simulado al crear cuenta' : 'Cuenta de facturación creada',
      },
    };

    // Publicamos el resultado en el topic de billing
    this.kafkaClient.emit('billing.events', {
      key: customerId,
      value: resultEvent,
    });

    console.log(`✅ [Billing Service] Resultado publicado: ${eventType}`);
  }
}