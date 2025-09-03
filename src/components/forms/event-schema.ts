import * as z from "zod";

// Expresión regular para validar horas HH:mm
const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const eventFormSchema = z
  .object({
    // Título del evento
    title: z
      .string()
      .min(1, "El título es requerido")
      .max(100, "El título no puede exceder 100 caracteres"),

    // Fechas en formato YYYY-MM-DD
    fechaInicio: z
      .string()
      .min(1, "La fecha de inicio es requerida")
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Fecha de inicio inválida",
      }),

    fechaFin: z
      .string()
      .min(1, "La fecha de fin es requerida")
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Fecha de fin inválida",
      }),

    // Horas en formato HH:mm (opcional)
    horaInicio: z
      .string()
      .regex(horaRegex, "Formato de hora de inicio inválido")
      .optional(),

    horaFin: z
      .string()
      .regex(horaRegex, "Formato de hora de fin inválido")
      .optional(),

    // Descripción del evento (opcional)
    description: z
      .string()
      .min(1, "La descripción es requerida si se proporciona")
      .optional(),

    // Color del evento en formato hexadecimal
    color: z
      .string()
      .regex(/^#[0-9A-F]{6}$/i, "Formato de color inválido"),

    // Indica si es un evento de día completo
    allDay: z.boolean(),

    // Estado del evento
    estadoId: z
      .number({
        required_error: "El estado es requerido", // Mensaje cuando no se selecciona un estado
        invalid_type_error: "El estado debe ser un número", // Mensaje si no es un número válido
      })
      .int()
      .positive()
      .min(1, "Por favor, selecciona un estado válido.")
      .optional(),

    // Organización que organiza el evento
    organizacion: z
      .string()
      .min(1, "La organización es requerida")
      .max(200, "El nombre de la organización no puede exceder 200 caracteres"),

    // Cantidad de personas esperadas
    cantidadPersonas: z
      .number()
      .min(1, "Debe haber al menos 1 persona")
      .max(1000, "Número máximo de personas es 1000"),

    // Espacio que se utilizará
    espacioUtilizar: z
      .string()
      .min(1, "El espacio a utilizar es requerido")
      .max(200, "El nombre del espacio no puede exceder 200 caracteres"),

    // Requerimientos (opcional)
    requerimientos: z
      .string()
      .min(1, "Los requerimientos son necesarios si se especifican.")
      .optional(),

    // Cobertura (opcional)
    cobertura: z
      .string()
      .min(1, "La cobertura es requerida si se especifica.")
      .optional(),

    // ID del usuario que crea el evento
    userId: z.string().min(1, "ID de usuario requerido"),
  })
  // Validación de que la fecha de fin debe ser posterior o igual a la fecha de inicio
  .refine(
    (data) => {
      if (data.fechaInicio && data.fechaFin) {
        return new Date(data.fechaInicio) <= new Date(data.fechaFin);
      }
      return true;
    },
    {
      message: "La fecha de fin debe ser posterior o igual a la fecha de inicio",
      path: ["fechaFin"],
    }
  )

