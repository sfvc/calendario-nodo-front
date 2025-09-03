import * as z from "zod";

// Expresion regular para validar horas HH:mm
const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const eventFormSchema = z
  .object({
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

    // Horas en formato HH:mm
    horaInicio: z.string("Formato de hora inválido").optional(),
    horaFin: z.string("Formato de hora inválido").optional(),

    description: z.string().optional(),

    color: z
      .string()
      .regex(/^#[0-9A-F]{6}$/i, "Formato de color inválido"),

    allDay: z.boolean(),

    estadoId: z
      .number({
        required_error: "El estado es requerido",
        invalid_type_error: "El estado debe ser un número",
      })
      .int()
      .positive(),

    organizacion: z.string().min(1, "La organización es requerida"),

    cantidadPersonas: z
      .number()
      .min(1, "Debe haber al menos 1 persona")
      .max(1000, "Número máximo de personas es 1000"),

    espacioUtilizar: z.string().min(1, "El espacio a utilizar es requerido"),

    requerimientos: z.string().optional(),
    cobertura: z.string().optional(),

    userId: z.string().min(1, "ID de usuario requerido"),
  })
  // Validar que fechaFin >= fechaInicio
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
  // Validar que horaFin > horaInicio
  .refine(
    (data) => {
      if (data.horaInicio && data.horaFin) {
        const [hiH, hiM] = data.horaInicio.split(":").map(Number);
        const [hfH, hfM] = data.horaFin.split(":").map(Number);
        return hfH > hiH || (hfH === hiH && hfM > hiM);
      }
      return true;
    },
    {
      message: "La hora de fin debe ser posterior a la hora de inicio",
      path: ["horaFin"],
    }
  );
