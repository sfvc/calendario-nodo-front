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
import type { CalendarEvent, CalendarEventFormDTO } from "@/types/event";
import { EventAPI } from "@/lib/eventApi";
import { toast } from "sonner";
import api from "@/lib/api";
import { useFieldArray } from "react-hook-form";
import { PlusCircle, Trash2, Image as ImageIcon, Link as LinkIcon, File as FileIcon } from "lucide-react";
import { arch } from "os";


type EstadoEvento = {
  id: number;
  nombre: string;
};

interface Props {
  event: CalendarEvent | null;
  canEdit: boolean;
  isReadOnly: boolean;
  isEditing: boolean;
  handleDelete: () => void;
  onClose: () => void;
  onSave?: () => void;
}

export const EventForm: React.FC<Props> = ({
  event,
  canEdit,
  isReadOnly,
  isEditing,
  handleDelete,
  onClose,
  onSave,
}) => {
  const { user } = useAuth();
  const [estados, setEstados] = useState<EstadoEvento[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(true);
  const [errorEstados, setErrorEstados] = useState<string | null>(null);

  const safeToISODate = (value: any): string => {
    const date = new Date(value);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  const mapEventToFormDTO = (event: CalendarEvent): CalendarEventFormDTO => ({
    ...event,
    fechaInicio: safeToISODate(event.fechaInicio),
    fechaFin: safeToISODate(event.fechaFin),
    horaInicio: event.horaInicio ?? "",
    horaFin: event.horaFin ?? "",
    informacionUtil: "",
    fotos: event.fotos?.length ? event.fotos : [],       // mantener si existen
    archivos: event.archivos?.length ? event.archivos : [],
    links: event.links?.length ? event.links : [],
  });

  // Cargar estados dinámicos
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

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control, // <-- necesario para useFieldArray
    formState: { errors, isSubmitting },
  } = useForm<CalendarEventFormDTO>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      fechaInicio: "",
      fechaFin: "",
      horaInicio: "",
      horaFin: "",
      description: "",
      color: "#3b82f6",
      allDay: false,
      estadoId: 0,
      organizacion: "",
      cantidadPersonas: 0,
      espacioUtilizar: "",
      requerimientos: "",
      cobertura: "",
      informacionUtil: "",
      userId: user?.id ?? "",
      fotos: [],     // array de URLs de fotos
      archivos: [],  // array de URLs de archivos
      links: [],     // array de URLs de links
    },
  });


  const fotosFieldArray = useFieldArray({ control, name: "fotos" });
  const archivosFieldArray = useFieldArray({ control, name: "archivos" });
  const linksFieldArray = useFieldArray({ control, name: "links" });

  // Asignar primer estado si no hay evento
  useEffect(() => {
    if (estados.length > 0 && !event) {
      setValue("estadoId", estados[0].id);
    }
  }, [estados, event, setValue]);

  useEffect(() => {
    if (event) {
      const dto = mapEventToFormDTO(event);
      reset(dto);
    }
  }, [event, reset]);

  const onSubmit = async (data: CalendarEventFormDTO) => {
    if (!user) {
      toast.error("Usuario no autenticado");
      return;
    }

    const fechaInicioDate = new Date(data.fechaInicio);
    const fechaFinDate = new Date(data.fechaFin);

  const payload: CalendarEvent = {
    ...data,
    fechaInicio: fechaInicioDate,
    fechaFin: fechaFinDate,
    userId: user.id,
    fotos: data.fotos,
    archivos: data.archivos,
    links: data.links,
    informacionUtil: data.informacionUtil
  };

    console.log(payload);

    // try {
    //   if (event) {
    //     await EventAPI.update(event.id, payload);
    //     toast.success("✅ Evento actualizado correctamente");
    //   } else {
    //     await EventAPI.create(payload);
    //     toast.success("✅ Evento creado correctamente");
    //   }

    //   onClose();           // cierra el modal
    //   onSave?.();          // <-- notifica al padre que recargue eventos
    //   reset();             // limpia el formulario
    // } catch (error) {
    //   console.error("Error al guardar el evento:", error);
    //   toast.error("❌ Ocurrió un error al guardar el evento");
    // }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (loadingEstados) return <div>Cargando estados...</div>;
  if (errorEstados) return <div className="text-red-500">{errorEstados}</div>;

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
            <p className="text-red-500 text-sm mt-1">{errors.title?.message}</p>
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
            <p className="text-red-500 text-sm">{errors.description?.message}</p>
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
            <p className="text-red-500 text-sm mt-1">{errors.organizacion?.message}</p>
          )}
        </div>
      </section>

      {/* Fecha y Hora */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Fecha y Hora</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fechaInicio">Fecha de Inicio *</Label>
            <Input
              id="fechaInicio"
              type="date"
              {...register("fechaInicio")}
              disabled={isReadOnly}
            />
            {errors.fechaInicio && (
              <p className="text-red-500 text-sm">{errors.fechaInicio?.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="horaInicio">Hora de Inicio</Label>
            <Input
              id="horaInicio"
              type="time"
              {...register("horaInicio")}
              disabled={isReadOnly}
            />
            {errors.horaInicio && (
              <p className="text-red-500 text-sm">{errors.horaInicio?.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaFin">Fecha de Fin *</Label>
            <Input
              id="fechaFin"
              type="date"
              {...register("fechaFin")}
              disabled={isReadOnly}
            />
            {errors.fechaFin && (
              <p className="text-red-500 text-sm">{errors.fechaFin?.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="horaFin">Hora de Fin</Label>
            <Input
              id="horaFin"
              type="time"
              {...register("horaFin")}
              disabled={isReadOnly}
            />
            {errors.horaFin && (
              <p className="text-red-500 text-sm">{errors.horaFin?.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Detalles del evento */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" /> Detalles del Evento
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
              <p className="text-red-500 text-sm">{errors.cantidadPersonas?.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="estadoId">Estado</Label>
            <select
              {...register("estadoId", { 
                valueAsNumber: true, // Convierte el valor a número
                required: "El estado es requerido", // Asegura que el campo no esté vacío
              })}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={isReadOnly}
            >
              {/* <option value="">Seleccione un estado</option> */}
              {estados.map((estado) => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))}
            </select>

            {/* Mostrar el error si existe */}
            {errors.estadoId && (
              <p className="text-red-500 text-sm">{errors.estadoId.message}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="espacioUtilizar" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Espacio a Utilizar *
          </Label>
          <Input
            id="espacioUtilizar"
            {...register("espacioUtilizar")}
            placeholder="Ej: Salón principal, Auditorio, etc."
            disabled={isReadOnly}
          />
          {errors.espacioUtilizar && (
            <p className="text-red-500 text-sm">{errors.espacioUtilizar?.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="requerimientos" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Requerimientos
          </Label>
          <textarea
            id="requerimientos"
            {...register("requerimientos")}
            placeholder="Describe los requerimientos técnicos, equipos, etc."
            className="w-full rounded-md border px-3 py-2 min-h-[60px] resize-none"
            disabled={isReadOnly}
          />
          {errors.requerimientos && (
            <p className="text-red-500 text-sm">{errors.requerimientos?.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cobertura" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Cobertura
          </Label>
          <textarea
            id="cobertura"
            {...register("cobertura")}
            placeholder="Información sobre cobertura, seguros, etc."
            className="w-full rounded-md border px-3 py-2 min-h-[60px] resize-none"
            disabled={isReadOnly}
          />
          {errors.cobertura && (
            <p className="text-red-500 text-sm">{errors.cobertura?.message}</p>
          )}
        </div>
      </section>

      {/* NUEVO CAMPO: informacionUtil */}
      <div className="space-y-2">
        <Label htmlFor="informacionUtil" className="flex items-center gap-2">
          <FileText className="h-4 w-4" /> Información Útil
        </Label>
        <textarea
          id="informacionUtil"
          {...register("informacionUtil")}
          placeholder="Información adicional útil del evento"
          className="w-full rounded-md border px-3 py-2 min-h-[60px] resize-none"
          disabled={isReadOnly}
        />
        {errors.informacionUtil && (
          <p className="text-red-500 text-sm">{errors.informacionUtil?.message}</p>
        )}
      </div>

      {/* Links */}    
      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <LinkIcon className="h-5 w-5" /> Links
        </h3>
        <div className="space-y-2">
          {linksFieldArray.fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <Input
                {...register(`links.${index}` as const)}
                placeholder="Enlace relacionado"
                disabled={isReadOnly}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => linksFieldArray.remove(index)}
                disabled={isReadOnly}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => linksFieldArray.append("")}
            disabled={isReadOnly}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Añadir link
          </Button>
        </div>
      </section>

      {/* Fotos */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ImageIcon className="h-5 w-5" /> Fotos
          </h3>
          <div className="space-y-2">
            {fotosFieldArray.fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                {/* Preview de la imagen */}
                {watch(`fotos.${index}`)?.preview && (
                  <img
                    src={watch(`fotos.${index}`).preview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded"
                  />
                )}

                {/* Botón de subir imagen */}
                <label className="flex-1 flex items-center justify-between px-4 py-2 border rounded-lg cursor-pointer bg-white hover:bg-gray-100">
                  <span className="truncate">
                    {watch(`fotos.${index}`)?.file?.name || "Selecciona una foto"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      // Guardar el objeto file y la URL de preview
                      setValue(`fotos.${index}`, {
                        file,
                        preview: URL.createObjectURL(file),
                      });
                    }}
                    disabled={isReadOnly}
                  />
                </label>

                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => fotosFieldArray.remove(index)}
                  disabled={isReadOnly}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => fotosFieldArray.append({ file: null, preview: null })}
              disabled={isReadOnly}
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Añadir foto
            </Button>
          </div>
        </section>


      {/* Archivos */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileIcon className="h-5 w-5" /> Archivos
        </h3>

        {archivosFieldArray.fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            {/* Preview con icono según tipo de archivo */}
            {watch(`archivos.${index}`) && (
              <div className="w-10 h-10 flex items-center justify-center border rounded bg-gray-100">
                {(() => {
                  const file = watch(`archivos.${index}`);
                  if (!file) return null;
                  const ext = file.name.split(".").pop()?.toLowerCase();
                    switch (ext) {
                      case "pdf":
                        return <span className="text-red-500 text-xl">📄</span>;
                      case "doc":
                      case "docx":
                        return <span className="text-blue-500 text-xl">📄</span>;
                      default:
                        return <span className="text-gray-500 text-xl">📁</span>;
                    }
                })()}
              </div>
            )}


            {/* Botón personalizado */}
            <label className="flex-1 flex items-center justify-between px-4 py-2 border rounded-lg cursor-pointer bg-white hover:bg-gray-100">
              <span className="truncate">
                {watch(`archivos.${index}`)?.name ||
                  "Selecciona un archivo (.pdf, .doc, .docx)"}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  // Guardar el objeto File completo
                  setValue(`archivos.${index}`, file);
                }}
                disabled={isReadOnly}
              />
            </label>

            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => archivosFieldArray.remove(index)}
              disabled={isReadOnly}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() => archivosFieldArray.append("")}
          disabled={isReadOnly}
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Añadir archivo
        </Button>
      </section>

        
      {/* Apariencia */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Apariencia</h3>
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
                disabled={isReadOnly}
              />
            );
          })}
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
