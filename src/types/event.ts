import type { EventStatus } from "./event.enum"

export interface EventResponse {
  id: string
  title: string
  start: string
  end: string
  color: string
  allDay?: boolean
  
  // Propiedades extendidas
  description: string
  status: EventStatus
  userId: string
  organizacion: string
  dia_y_horario: string
  cantidadPersonas: number
  espacioUtilizar: string
  requerimientos: string
  cobertura: string
}

export interface EventFormData {
  title: string;
  start: string;
  end: string;
  description?: string;
  color: string;
  allDay: boolean;
  status: EventStatus;
  organizacion: string;
  dia_y_horario: string;
  cantidadPersonas: number;
  espacioUtilizar: string;
  requerimientos?: string;
  cobertura?: string;
  userId: string;
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  color: string
  allDay?: boolean
  
  // Propiedades extendidas
  extendedProps: {
    description: string
    status: EventStatus
    userId: string
    organizacion: string
    dia_y_horario: string
    cantidadPersonas: number
    espacioUtilizar: string
    requerimientos: string
    cobertura: string
  }
}