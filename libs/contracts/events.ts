export interface BaseEvent<T> {
  eventId: string;
  eventType: string;
  version: number;
  occurredAt: string;
  correlationId: string;
  customerId: string;
  source: string;
  payload: T;
}

// Payload específico para cuando se solicita la activación
export interface ActivationRequestedPayload {
  planId: string;
  channel: string;
  simulateFailure: 'none' | 'billing' | 'provisioning';
}

export type ActivationRequestedEvent = BaseEvent<ActivationRequestedPayload>;