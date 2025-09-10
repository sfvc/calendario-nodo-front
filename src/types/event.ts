
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
  informacionUtil?: string;
  userId: string;

  // NUEVAS PROPIEDADES PARA useFieldArray
  fotos: { file?: File | null; preview?: string | null }[]; // 👈 objetos
  archivos: (File | null)[];                                // 👈 array de File
  links: string[];                                          // 👈 array de strings                   
  
}

export interface EventFormData {
  title: string;
  fechaInicio: Date;
  fechaFin: Date;
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
  informacionUtil?: string;
  userId: string;

  // NUEVAS PROPIEDADES PARA useFieldArray
  fotos: { file?: File | null; preview?: string | null }[]; // 👈 objetos
  archivos: (File | null)[];                                // 👈 array de File
  links: string[];                                          // 👈 array de strings                           // para links
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
  informacionUtil?: string;
  horaInicio?: string | null;
  horaFin?: string | null;

    // NUEVAS PROPIEDADES PARA useFieldArray
  fotos: { file?: File | null; preview?: string | null }[];
  archivos: (File | null)[];
  links: string[];
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
  informacionUtil?: string;
  userId?: string;
  fotos: { file?: File | null; preview?: string | null }[];
  archivos:  { file?: File | null }[]
  links: { url: string }[];
}