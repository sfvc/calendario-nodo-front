import type { EventStatus } from "./event.enum"

// 📅 Evento completo tal como lo maneja FullCalendar y se recibe del backend
export interface CalendarEvent {
  id: string
  title: string
  start: string // Formato ISO
  end: string
  description?: string
  color?: string
  allDay?: boolean
  status: EventStatus
  userId: string

  // Nuevos campos
  organizacion?: string
  dia_y_horario?: string
  cantidadPersonas?: number
  espacioUtilizar?: string
  requerimientos?: string
  cobertura?: string
}

// 📝 Datos de formulario antes de ser enviados al backend
export interface EventFormData {
  title: string
  start: string
  end: string
  description?: string
  color?: string
  allDay?: boolean
  status: EventStatus
  userId: string

  // Nuevos campos
  organizacion?: string
  dia_y_horario?: string
  cantidadPersonas?: number
  espacioUtilizar?: string
  requerimientos?: string
  cobertura?: string
}