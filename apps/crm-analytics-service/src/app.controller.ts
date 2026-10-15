import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  @EventPattern('activation.requested')
  handleReq(@Payload() msg: any) { console.log(`📊 [CRM] Nueva solicitud de: ${msg.customerId}`); }

  @EventPattern('billing.events')
  handleBill(@Payload() msg: any) { console.log(`📊 [CRM] Billing respondió: ${msg.eventType}`); }

  @EventPattern('provisioning.events')
  handleProv(@Payload() msg: any) { console.log(`📊 [CRM] Provisioning respondió: ${msg.eventType}`); }

  @EventPattern('activation.events')
  handleAct(@Payload() msg: any) { console.log(`📊 [CRM] Cierre de activación: ${msg.eventType}`); }
}