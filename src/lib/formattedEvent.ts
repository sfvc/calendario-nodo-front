import type { EventResponse } from "@/types/event"

export const formattedEvent = (data: EventResponse[]) => {
	const formatted = data.map((e) => ({
		id: e.id,
		title: e.title,
		start: e.start,
		end: e.end,
		color: e.color,
		allDay: e.allDay,
		
		// Propiedades
		extendedProps: {
			description: e.description,
			status: e.status,
			userId: e.userId,
			organizacion: e.organizacion,
			dia_y_horario: e.dia_y_horario,
			cantidadPersonas: e.cantidadPersonas,
			espacioUtilizar: e.espacioUtilizar,
			requerimientos: e.requerimientos,
			cobertura: e.cobertura
		},
	}))

	return formatted
}
