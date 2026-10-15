import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'billing-service',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'billing-group',
      },
    },
  });
  await app.listen();
  console.log('💸 Billing Service escuchando en Kafka...');
}
bootstrap();