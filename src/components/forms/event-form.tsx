import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, MapPin, Shield, Users, Upload, Link as LinkIcon, Image, File, X, Plus } from "lucide-react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context";
import { eventFormSchema } from "./event-schema";
import { colorOptions } from "@/constants/colors-options";
import type { CalendarEvent, CalendarEventFormDTO } from "@/types/event";
import { toast } from "sonner";
import api from "@/lib/api";
import { EventAPI } from "@/lib/eventApi";

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
  onSave
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
    informacionUtil: event.informacionUtil ?? "",
    // 🔧 Para fotos: si viene URL, va en preview (sin file)
    fotos: event.fotos?.length
      ? event.fotos.map((url) => ({ file: null, preview: url }))
      : [],
    // 🔧 Para archivos: si viene URL, va en url (sin file)
    archivos: event.archivos?.length
      ? event.archivos.map(url => ({ file: null, url }))
      : [],
    links: event.links?.length ? event.links.map(url => ({ url })) : [],
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
    control,
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
      fotos: [],
      archivos: [],
      links: [],
    },
  });

  // useFieldArray para manejar arrays dinámicos
  const { fields: fotosFields, append: appendFoto, remove: removeFoto } = useFieldArray({
    control,
    name: "fotos"
  });

  const { fields: archivosFields, append: appendArchivo, remove: removeArchivo } = useFieldArray({
    control,
    name: "archivos"
  });

  const { fields: linksFields, append: appendLink, remove: removeLink } = useFieldArray({
    control,
    name: "links"
  });

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

  // Función para manejar la carga de fotos
  const handleFotoChange = (index: number, file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setValue(`fotos.${index}.file`, file);
        setValue(`fotos.${index}.preview`, e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para manejar la carga de archivos
    const handleArchivoChange = (index: number, file: File | null) => {
      if (file) {
        setValue(`archivos.${index}`, { file, url: "" }, { shouldValidate: true });
      } else {
        // Si limpias el input, puedes decidir dejarlo vacío
        setValue(`archivos.${index}`, { file: null, url: "" });
      }
    };

  const onSubmit = async (data: CalendarEventFormDTO) => {
    if (!user) {
      toast.error("Usuario no autenticado");
      return;
    }

    console.log("📂 Datos del formulario:", data);

    try {
      const formData = new FormData();

      // ... (otros campos de texto permanecen igual)
      formData.append("userId", user.id);
      formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);
      formData.append("fechaInicio", data.fechaInicio);
      formData.append("fechaFin", data.fechaFin);
      if (data.horaInicio) formData.append("horaInicio", data.horaInicio);
      if (data.horaFin) formData.append("horaFin", data.horaFin);
      if (data.color) formData.append("color", data.color);
      formData.append("allDay", (data.allDay ?? false).toString());
      if (data.estadoId) formData.append("estadoId", data.estadoId.toString());
      if (data.organizacion) formData.append("organizacion", data.organizacion);
      if (data.cantidadPersonas)
        formData.append("cantidadPersonas", data.cantidadPersonas.toString());
      if (data.espacioUtilizar) formData.append("espacioUtilizar", data.espacioUtilizar);
      if (data.requerimientos) formData.append("requerimientos", data.requerimientos);
      if (data.cobertura) formData.append("cobertura", data.cobertura);
      if (data.informacionUtil) formData.append("informacionUtil", data.informacionUtil);

      // 🔧 ARCHIVOS - Separar nuevos archivos de URLs existentes
      const archivosNuevos: File[] = [];
      const archivosExistentes: string[] = [];
      
      if (data.archivos && data.archivos.length > 0) {
        data.archivos.forEach(({ file, url }, idx) => {
          console.log(`➡️ Archivo ${idx + 1}:`, { file, url });
          if (file) {
            // Es un archivo nuevo
            archivosNuevos.push(file);
          } else if (url) {
            // Es una URL existente
            archivosExistentes.push(url);
          }
        });
      }

      // Enviar archivos nuevos como binarios
      archivosNuevos.forEach((file) => {
        formData.append("archivos", file);
      });

      // Enviar URLs existentes como array
      archivosExistentes.forEach((url) => {
        formData.append("archivosExistentes[]", url);
      });

      // 🔧 FOTOS - Separar nuevas fotos de URLs existentes
      const fotosNuevas: File[] = [];
      const fotosExistentes: string[] = [];
      
      if (data.fotos && data.fotos.length > 0) {
        data.fotos.forEach(({ file, preview }, idx) => {
          console.log(`🖼️ Foto ${idx + 1}:`, { file, preview });
          if (file) {
            // Es una foto nueva
            fotosNuevas.push(file);
          } else if (preview && preview.startsWith('http')) {
            // Es una URL existente (las URLs del backend empiezan con http)
            fotosExistentes.push(preview);
          }
        });
      }

      // Enviar fotos nuevas como binarios
      fotosNuevas.forEach((file) => {
        formData.append("fotos", file);
      });

      // Enviar URLs de fotos existentes como array
      fotosExistentes.forEach((url) => {
        formData.append("fotosExistentes[]", url);
      });

      // Links como array (esto permanece igual)
      if (data.links && data.links.length > 0) {
        data.links.forEach(({ url }) => {
          if (url) formData.append("links[]", url);
        });
      }

      // 🔍 Debug del FormData final
      console.log("📤 FormData enviado:");
      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      if (event) {
        await EventAPI.update(event.id, formData);
        toast.success("✅ Evento actualizado correctamente");
      } else {
        await EventAPI.create(formData);
        toast.success("✅ Evento creado correctamente");
      }

      onClose();
      onSave?.();
      reset();
    } catch (error: any) {
      console.error("Error al guardar el evento:", error);
      toast.error(
        error?.response?.data?.message || "❌ Ocurrió un error al guardar el evento"
      );
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (loadingEstados) return <div>Cargando estados...</div>;
  if (errorEstados) return <div className="text-red-500">{errorEstados}</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                valueAsNumber: true,
                required: "El estado es requerido",
              })}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={isReadOnly}
            >
              {estados.map((estado) => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))}
            </select>
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

      {/* Información Útil */}
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

      {/* NUEVA SECCIÓN: Archivos y Multimedia */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Upload className="h-5 w-5" /> Archivos y Multimedia
        </h3>

        {/* Fotos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Image className="h-4 w-4" /> Fotos
            </Label>
            {!isReadOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendFoto({ id: Date.now(), file: null, preview: null })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar Foto
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fotosFields.map((field, index) => (
              <div key={field.id} className="relative border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Foto {index + 1}</span>
                  {!isReadOnly && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFoto(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFotoChange(index, e.target.files?.[0] || null)}
                  disabled={isReadOnly}
                />
                
                {/* Mostramos la preview: puede ser URL existente o la nueva */}
                {field.preview && (
                  <div className="mt-2">
                    <img
                      src={field.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Archivos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <File className="h-4 w-4" /> Archivos
          </Label>
          {!isReadOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendArchivo({ file: null })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar Archivo
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          {archivosFields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-2 p-3 border rounded">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-gray-500" />
                <Input
                  type="file"
                  onChange={(e) => handleArchivoChange(index, e.target.files?.[0] || null)}
                  disabled={isReadOnly}
                  className="flex-1"
                />
                {!isReadOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArchivo(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Preview del archivo */}
              {(watch(`archivos.${index}.file`) || watch(`archivos.${index}.url`)) && (
                <div className="text-sm text-gray-700 mt-1 flex items-center gap-2">
                  <File className="h-4 w-4" />
                  <span>
                    {watch(`archivos.${index}.file`)?.name || (
                      <a
                        href={watch(`archivos.${index}.url`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600"
                      >
                        {watch(`archivos.${index}.url`)?.split("/").pop()}
                      </a>
                    )}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>


        {/* Links */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" /> Enlaces
            </Label>
            {!isReadOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendLink({ url: "" })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar Enlace
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            {linksFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-gray-500" />
                <Input
                  {...register(`links.${index}.url`)}
                  placeholder="https://ejemplo.com"
                  disabled={isReadOnly}
                  className="flex-1"
                />
                {!isReadOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLink(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
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