import { Body, Controller, Post, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

// Simulamos la colección de Mongo en memoria para cruzar los datos
const activationsDb = new Map();

@Controller('activations')
export class AppController implements OnModuleInit {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka) {}

  async onModuleInit() {
    // Nos suscribimos a las respuestas de los otros servicios antes de conectar
    this.kafkaClient.subscribeToResponseOf('activation.events');
    await this.kafkaClient.connect();
  }

  @Post()
  async createActivation(@Body() body: any) {
    const activationId = uuidv4();
    const customerId = body.customerId || `C-${Math.floor(Math.random() * 10000)}`;

    // Guardamos el estado inicial
    activationsDb.set(activationId, { id: activationId, customerId, status: 'PENDING', steps: {} });

    const event = {
      eventId: uuidv4(),
      eventType: 'ActivationRequested',
      version: 1,
      occurredAt: new Date().toISOString(),
      correlationId: activationId,
      customerId: customerId,
      source: 'activation-api',
      payload: {
        planId: body.planId || 'Plan Base',
        simulateFailure: body.simulateFailure || 'none',
      },
    };

    this.kafkaClient.emit('activation.requested', { key: customerId, value: event });

    return { activationId, status: 'PENDING' };
  }

  // ---- LÓGICA DEL AGREGADOR ----

  @EventPattern('billing.events')
  handleBilling(@Payload() msg: any) {
    this.processResult('billing', msg);
  }

  @EventPattern('provisioning.events')
  handleProvisioning(@Payload() msg: any) {
    this.processResult('provisioning', msg);
  }

  private processResult(serviceName: string, msg: any) {
    const activation = activationsDb.get(msg.correlationId);
    if (!activation || activation.status !== 'PENDING') return;

    // Guardamos el estado parcial (OK o ERROR)
    activation.steps[serviceName] = msg.payload.status;

    // Si ya llegaron las dos respuestas, decidimos el final
    if (activation.steps.billing && activation.steps.provisioning) {
      const hasError = activation.steps.billing === 'ERROR' || activation.steps.provisioning === 'ERROR';
      activation.status = hasError ? 'FAILED' : 'ACTIVE';

      const finalEvent = {
        eventId: uuidv4(),
        eventType: hasError ? 'ActivationFailed' : 'ActivationCompleted',
        version: 1,
        occurredAt: new Date().toISOString(),
        correlationId: msg.correlationId,
        customerId: activation.customerId,
        source: 'activation-api',
        payload: { status: activation.status },
      };

      this.kafkaClient.emit('activation.events', { key: activation.customerId, value: finalEvent });
      console.log(`\n✅ [Orquestador] Saga finalizada. Estado: ${activation.status}`);
    }
  }
}