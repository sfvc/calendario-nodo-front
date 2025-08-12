import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, MapPin, Shield, Users } from "lucide-react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context";
import { eventFormSchema } from "./event-schema";
import { colorOptions } from "@/constants/colors-options";
import type { EventFormData, EventResponse } from "@/types/event";
import { EventAPI } from "@/lib/eventApi";
import { toast } from "sonner";
import api from "@/lib/api"; // Asegúrate que esta es la instancia correcta para llamar a la API

// Tipo para estados dinámicos
type EstadoEvento = {
  id: number;
  nombre: string;
};

interface Props {
  event: EventResponse | null;
  canEdit: boolean;
  isReadOnly: boolean;
  isEditing: boolean;
  handleDelete: () => void;
  onClose: () => void;
}

export const EventForm: React.FC<Props> = ({
  event,
  canEdit,
  isReadOnly,
  isEditing,
  handleDelete,
  onClose,
}) => {
  const { user } = useAuth();

  // Estados para los estados dinámicos de evento
  const [estados, setEstados] = useState<EstadoEvento[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(true);
  const [errorEstados, setErrorEstados] = useState<string | null>(null);

  // Cargar estados desde la API
  useEffect(() => {
    setLoadingEstados(true);
    api
      .get("/evento-estado")
      .then((res) => {
        setEstados(res.data);
        setLoadingEstados(false);
      })
      .catch(() => {
        setErrorEstados("Error cargando estados.");
        setLoadingEstados(false);
      });
  }, []);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title ?? "",
      start: event?.start ?? "",
      end: event?.end ?? "",
      description: event?.description ?? "",
      color: event?.color ?? "#3b82f6",
      allDay: event?.allDay ?? false,
      status: event?.status ?? "", // vacio si no hay evento
      organizacion: event?.organizacion ?? "",
      dia_y_horario: event?.dia_y_horario ?? "",
      cantidadPersonas: event?.cantidadPersonas ?? 0,
      espacioUtilizar: event?.espacioUtilizar ?? "",
      requerimientos: event?.requerimientos ?? "",
      cobertura: event?.cobertura ?? "",
      userId: event?.userId ?? user?.id,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (data: EventFormData) => {
    if (!user) {
      toast.error("Usuario no autenticado");
      return;
    }

    // Si tu backend acepta strings "YYYY-MM-DD" para start y end, simplemente no hagas new Date:
    const payload = {
      ...data,
      start: data.start,  // No convertir
      end: data.end,      // No convertir
    };

    try {
      if (event) {
        // Update solo con campos que cambian (puedes filtrar si quieres)
        // Pero si quieres actualizar todo igual, envía el payload entero
        await EventAPI.update(event.id, payload);
        toast.success("✅ Evento actualizado correctamente");
      } else {
        await EventAPI.create(payload);
        toast.success("✅ Evento creado correctamente");
      }
      handleClose();
    } catch (error) {
      console.error("Error al guardar el evento:", error);
      toast.error("❌ Ocurrió un error al guardar el evento");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (loadingEstados) {
    return <div>Cargando estados...</div>;
  }

  if (errorEstados) {
    return <div className="text-red-500">{errorEstados}</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Información básica */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Información Básica</h3>

        <div className="space-y-2">
          <Label htmlFor="title">Título del Evento *</Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="Ingresa el título del evento"
            disabled={isReadOnly}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <textarea
            id="description"
            {...register("description")}
            placeholder="Describe el evento..."
            className="w-full rounded-md border px-3 py-2 min-h-[100px] resize-none"
            disabled={isReadOnly}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizacion">Organización *</Label>
          <Input
            id="organizacion"
            {...register("organizacion")}
            placeholder="Nombre de la organización"
            disabled={isReadOnly}
          />
          {errors.organizacion && (
            <p className="text-red-500 text-sm mt-1">{errors.organizacion.message}</p>
          )}
        </div>
      </section>

      {/* Fecha y hora */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start">Fecha de Inicio *</Label>
            <Input
              id="start"
              type="date"
              {...register("start")}
              disabled={isReadOnly}
            />
            {errors.start && (
              <p className="text-red-500 text-sm mt-1">{errors.start.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end">Fecha de Fin *</Label>
            <Input
              id="end"
              type="date"
              {...register("end")}
              disabled={isReadOnly}
            />
            {errors.end && (
              <p className="text-red-500 text-sm mt-1">{errors.end.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dia_y_horario">Día y Horario *</Label>
          <Input
            id="dia_y_horario"
            {...register("dia_y_horario")}
            placeholder="Ej: Lunes 14:00 - 16:00"
            disabled={isReadOnly}
          />
          {errors.dia_y_horario && (
            <p className="text-red-500 text-sm mt-1">{errors.dia_y_horario.message}</p>
          )}
        </div>
      </section>

      {/* Detalles del evento */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Detalles del Evento
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cantidadPersonas">Cantidad de Personas *</Label>
            <Input
              id="cantidadPersonas"
              type="number"
              {...register("cantidadPersonas", { valueAsNumber: true })}
              disabled={isReadOnly}
            />
            {errors.cantidadPersonas && (
              <p className="text-red-500 text-sm mt-1">
                {errors.cantidadPersonas.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              {...register("status")}
              className="w-full rounded-md border px-3 py-2"
              disabled={isReadOnly}
            >
              <option value="">Seleccione un estado</option>
              {estados.map((estado) => (
                <option key={estado.id} value={estado.nombre}>
                  {estado.nombre}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="espacioUtilizar" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Espacio a Utilizar *
          </Label>
          <Input
            id="espacioUtilizar"
            {...register("espacioUtilizar")}
            placeholder="Ej: Salón principal, Auditorio, etc."
            disabled={isReadOnly}
          />
          {errors.espacioUtilizar && (
            <p className="text-red-500 text-sm mt-1">{errors.espacioUtilizar.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="requerimientos" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Requerimientos
          </Label>
          <textarea
            id="requerimientos"
            {...register("requerimientos")}
            placeholder="Describe los requerimientos técnicos, equipos, etc."
            className="w-full rounded-md border px-3 py-2 min-h-[60px] resize-none"
            disabled={isReadOnly}
          />
          {errors.requerimientos && (
            <p className="text-red-500 text-sm mt-1">{errors.requerimientos.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cobertura" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Cobertura
          </Label>
          <textarea
            id="cobertura"
            {...register("cobertura")}
            placeholder="Información sobre cobertura, seguros, etc."
            className="w-full rounded-md border px-3 py-2 min-h-[60px] resize-none"
            disabled={isReadOnly}
          />
          {errors.cobertura && (
            <p className="text-red-500 text-sm mt-1">{errors.cobertura.message}</p>
          )}
        </div>
      </section>

      {/* Apariencia */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Apariencia</h3>

        <div className="space-y-2">
          <Label>Color del Evento</Label>
          <div className="flex gap-2 flex-wrap mt-2">
            {colorOptions.map((color) => {
              const selected = watch("color") === color.value;
              return (
                <button
                  key={color.value}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selected ? "border-gray-800 scale-110" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setValue("color", color.value)}
                  title={color.label}
                  disabled={isReadOnly}
                  aria-label={`Seleccionar color ${color.label}`}
                />
              );
            })}
          </div>
          {errors.color && (
            <p className="text-red-500 text-sm mt-1">{errors.color.message}</p>
          )}
        </div>
      </section>

      {/* Botones */}
      <div className="flex justify-between pt-4">
        {canEdit && (
          <div className="space-x-2 flex items-center">
            <Button
              type="submit"
              className="botonazul text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Crear"} Evento
            </Button>

            <Button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isSubmitting || !isEditing}
            >
              Eliminar
            </Button>
          </div>
        )}

        <Button
          type="button"
          variant="secondary"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
};
