import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'provisioning-service',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'provisioning-group',
      },
    },
  });
  await app.listen();
  console.log('⚙️ Provisioning Service escuchando en Kafka...');
}
bootstrap();