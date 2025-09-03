
export interface EventResponse {
  id: string;
  title: string;
  fechaInicio: Date;      // ahora es Date
  fechaFin: Date;         // ahora es Date
  horaInicio?: string;
  horaFin?: string;
  description?: string;
  color: string;
  allDay: boolean;

  // relación con Eventoestado
  estadoId: number;

  organizacion?: string;
  cantidadPersonas?: number;
  espacioUtilizar?: string;
  requerimientos?: string;
  cobertura?: string;
  userId: string;

  
}

export interface EventFormData {
  title: string;
  fechaInicio: Date;      // ahora es Date
  fechaFin: Date;         // ahora es Date
  horaInicio?: string;      // opcional, Date
  horaFin?: string;         // opcional, Date
  description?: string;
  color: string;
  allDay: boolean;

  // relación con Eventoestado
  estadoId: number;

  organizacion?: string;
  cantidadPersonas?: number;
  espacioUtilizar?: string;
  requerimientos?: string;
  cobertura?: string;
  userId: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  color?: string;
  allDay?: boolean;
  fechaInicio: Date;      // ahora es Date
  fechaFin: Date;         // ahora es Date
  description?: string;
  estadoId?: number;
  estado?: string; // ahora es string según tu backend
  userId?: string;
  organizacion?: string;
  cantidadPersonas?: number;
  espacioUtilizar?: string;
  requerimientos?: string;
  cobertura?: string;
  horaInicio?: string | null;
  horaFin?: string | null;
}


export interface CalendarEventFormDTO {
  title: string;
  description?: string;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string;    // YYYY-MM-DD
  horaInicio?: string;
  horaFin?: string;
  color?: string;
  allDay?: boolean;
  estadoId?: number;
  organizacion?: string;
  cantidadPersonas?: number;
  espacioUtilizar?: string;
  requerimientos?: string;
  cobertura?: string;
  userId?: string;
}