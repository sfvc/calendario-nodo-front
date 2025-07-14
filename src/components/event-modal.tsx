import type React from "react"
import { useState, useEffect } from "react"
import type { CalendarEvent, EventFormData } from "../types/event"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card"
import { Label } from "./ui/Label"
import { Input } from "./ui/Input"
import { Button } from "./ui/Button"
import { EventStatus } from "../types/event.enum"
import { useAuth } from "../context/AuthContext"

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  onDelete?: (eventId: string) => void
  event?: CalendarEvent | null
  selectedDate?: string
}

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  selectedDate,
}: EventModalProps) {
  const { userId, userRole } = useAuth()
  const isOwner = event?.userId === userId
  const canEdit = isOwner || userRole === "ADMIN"
  const isReadOnly = !!event && !canEdit

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    start: "",
    end: "",
    description: "",
    color: "#3b82f6",
    allDay: false,
    status: EventStatus.ESPERANDO_RTA,
    userId: userId ?? "", // <-- debe ser el UUID
    organizacion: "",
    dia_y_horario: "",
    cantidadPersonas: 0,
    espacioUtilizar: "",
    requerimientos: "",
    cobertura: "",
  })

  useEffect(() => {
    console.log("UUID del usuario cargado:", userId)
  }, [userId])

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        start: new Date(event.start).toISOString().split("T")[0],
        end: new Date(event.end).toISOString().split("T")[0],
        description: event.description ?? "",
        color: event.color ?? "#3b82f6",
        allDay: event.allDay ?? false,
        status: event.status,
        type: event.type,
        userId: event.userId,
        organizacion: event.organizacion ?? "",
        dia_y_horario: event.dia_y_horario ?? "",
        cantidadPersonas: event.cantidadPersonas ?? 0,
        espacioUtilizar: event.espacioUtilizar ?? "",
        requerimientos: event.requerimientos ?? "",
        cobertura: event.cobertura ?? "",
      })
    } else if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        start: selectedDate,
        end: selectedDate,
        userId: userId ?? "",
      }))
    }
  }, [event, selectedDate, userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isReadOnly) return

    const startDate = new Date(formData.start)
    const endDate = new Date(formData.end)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      alert("Por favor ingrese fechas válidas")
      return
    }

    const newEvent: CalendarEvent = {
      id: event?.id || Date.now().toString(),
      title: formData.title,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      description: formData.description,
      color: formData.color,
      allDay: formData.allDay,
      status: formData.status,
      type: formData.type,
      userId: formData.userId, // ✅ asegurate que sea UUID
      organizacion: formData.organizacion,
      dia_y_horario: formData.dia_y_horario,
      cantidadPersonas: formData.cantidadPersonas,
      espacioUtilizar: formData.espacioUtilizar,
      requerimientos: formData.requerimientos,
      cobertura: formData.cobertura,
    }

    try {
      await onSave(newEvent)
      onClose()
    } catch (error: any) {
      console.error("Error al guardar:", error)
      alert("Error al guardar: " + (error?.response?.data?.message || error.message))
    }
  }

  const handleDelete = () => {
    if (event && onDelete && canEdit) {
      onDelete(event.id)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle>
            {event
              ? isReadOnly
                ? "Detalle del Evento"
                : "Editar Evento"
              : "Crear Nuevo Evento"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { id: "title", label: "Título", type: "text" },
              { id: "start", label: "Fecha de Inicio", type: "date" },
              { id: "end", label: "Fecha de Fin", type: "date" },
              { id: "organizacion", label: "Organización", type: "text" },
              { id: "dia_y_horario", label: "Día y Horario", type: "text" },
              { id: "cantidadPersonas", label: "Cantidad de Personas", type: "number" },
              { id: "espacioUtilizar", label: "Espacio a Utilizar", type: "text" },
              { id: "requerimientos", label: "Requerimientos", type: "text" },
              { id: "cobertura", label: "Cobertura", type: "text" },
            ].map(({ id, label, type }) => (
              <div key={id}>
                <Label htmlFor={id}>{label}</Label>
                <Input
                  id={id}
                  type={type}
                  value={(formData as any)[id] ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [id]:
                        type === "number"
                          ? parseInt(e.target.value || "0", 10)
                          : e.target.value,
                    })
                  }
                  disabled={isReadOnly}
                  required={["title", "start", "end"].includes(id)}
                />
              </div>
            ))}

            <div>
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as EventStatus })
                }
                className="w-full rounded-md border px-2 py-1"
                disabled={isReadOnly}
              >
                {Object.values(EventStatus).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between pt-4">
              {canEdit && (
                <div className="space-x-2">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {event ? "Actualizar" : "Crear"} Evento
                  </Button>
                  {event && onDelete && (
                    <Button
                      type="button"
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              )}
              <Button type="button" variant="outline" onClick={onClose}>
                {canEdit ? "Cancelar" : "Cerrar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
