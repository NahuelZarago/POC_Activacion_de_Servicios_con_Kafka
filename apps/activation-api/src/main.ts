import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitamos CORS para que React pueda comunicarse sin bloqueos
  app.enableCors();

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: { clientId: 'activation-api-consumer', brokers: ['localhost:9092'] },
      consumer: { groupId: 'activation-aggregator-group' },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();