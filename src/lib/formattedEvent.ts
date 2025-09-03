import type { EventResponse } from "@/types/event"

export const formattedEvent = (data: EventResponse[]) => {
  return data.map((e) => ({
    id: e.id,
    title: e.title,
    color: e.color,
    allDay: e.allDay ?? false,
    fechaInicio: new Date(e.fechaInicio),  // Convertimos a Date
    fechaFin: new Date(e.fechaFin),        // Convertimos a Date
    description: e.description,
    estadoId: e.estadoId,
    estado: e.estado,
    userId: e.userId,
    organizacion: e.organizacion,
    cantidadPersonas: e.cantidadPersonas,
    espacioUtilizar: e.espacioUtilizar,
    requerimientos: e.requerimientos,
    cobertura: e.cobertura,
    horaInicio: e.horaInicio,
    horaFin: e.horaFin,
  }))
}