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
  async handleActivationRequested(@Payload() message: any) {
    console.log('\n⚙️ [Provisioning Service] Iniciando aprovisionamiento...');

    // Simulamos la demora de 1 a 3 segundos
    const delay = Math.floor(Math.random() * 2000) + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    const payload = message.payload;
    const customerId = message.customerId;
    const hasFailed = payload.simulateFailure === 'provisioning';
    const eventType = hasFailed ? 'ProvisioningFailed' : 'ProvisioningCompleted';

    const resultEvent = {
      eventId: uuidv4(),
      eventType: eventType,
      version: 1,
      occurredAt: new Date().toISOString(),
      correlationId: message.correlationId,
      customerId: customerId,
      source: 'provisioning-service',
      payload: {
        status: hasFailed ? 'ERROR' : 'OK',
        detail: hasFailed ? 'Error simulado en red' : 'Servicio aprovisionado con éxito',
      },
    };

    this.kafkaClient.emit('provisioning.events', {
      key: customerId,
      value: resultEvent,
    });

    console.log(`✅ [Provisioning Service] Listo en ${delay}ms. Resultado: ${eventType}`);
  }
}