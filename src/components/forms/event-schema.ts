import * as z from 'zod';

export const eventFormSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100, 'El título no puede exceder 100 caracteres'),
  start: z.string().min(1, 'La fecha de inicio es requerida'),
  end: z.string().min(1, 'La fecha de fin es requerida'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Formato de color inválido'),
  allDay: z.boolean(),
  status: z.string().min(1, 'El título es requerido').max(100, 'El título no puede exceder 100 caracteres'),
  organizacion: z.string().min(1, 'La organización es requerida'),
  dia_y_horario: z.string().min(1, 'El día y horario son requeridos'),
  cantidadPersonas: z.number().min(1, 'Debe haber al menos 1 persona').max(1000, 'Número máximo de personas es 1000'),
  espacioUtilizar: z.string().min(1, 'El espacio a utilizar es requerido'),
  requerimientos: z.string().optional(),
  cobertura: z.string().optional(),
  userId: z.string().min(1, 'ID de usuario requerido'),
}).refine((data) => {
  if (data.start && data.end) {
    return new Date(data.start) <= new Date(data.end);
  }
  return true;
}, {
  message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio',
  path: ['end']
});