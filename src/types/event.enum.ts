export const EventStatus = {
  CANCELADO: 'CANCELADO',
  FIN_DE_SEMANA: 'FIN_DE_SEMANA',
  ESPERANDO_RTA: 'ESPERANDO_RTA',
  INFO_SOLICITADA: 'INFO_SOLICITADA',
  INTERNO_NODO: 'INTERNO_NODO'
} as const;

export type EventStatus = typeof EventStatus[keyof typeof EventStatus];
