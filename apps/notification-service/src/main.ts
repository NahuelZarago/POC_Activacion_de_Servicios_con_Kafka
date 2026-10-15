import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.KAFKA,
    options: {
      client: { clientId: 'notification-service', brokers: ['localhost:9092'] },
      consumer: { groupId: 'notification-group' },
    },
  });
  await app.listen();
}
bootstrap();