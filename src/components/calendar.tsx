import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Calendar } from "lucide-react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import { useAuth } from "../context"
import { Button } from "@/components/ui/Button"
import { EventModal } from "@/components/event-modal"
import { EventAPI } from "../lib/eventApi"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core/index.js"
import type { CalendarEvent, EventResponse } from "@/types/event"
import { toast } from "sonner"

export function EventCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null)
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const loadEvents = async () => {
    try {
      const data = await EventAPI.getAll()
      setEvents(data)
    } catch (error) {
      console.error("Error cargando eventos:", error)
      toast.error("❌ No se pudieron cargar los eventos")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await EventAPI.remove(id)
      toast.success("✅ Evento eliminado correctamente", { duration: 3000 })
      setIsOpen(false)
    } catch (err) {
      console.error("Error al eliminar:", err)
      toast.error("❌ Hubo un problema de conexión al eliminar el evento", { duration: 4000 })
    }
  }

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedEvent(null)
    setIsOpen(true)
    selectInfo.view.calendar.unselect()
  }

  const handleEventClick = (e: EventClickArg) => {
    const fullEvent = {
      id: e.event.id,
      title: e.event.title,
      start: e.event.start?.toISOString().slice(0, 10),
      end: e.event.end?.toISOString().slice(0, 10),
      allDay: e.event.allDay,
      color: e.event.backgroundColor,
      ...e.event.extendedProps,
    } as EventResponse

    setSelectedEvent(fullEvent)
    setIsOpen(true)
  }

  useEffect(() => {
    loadEvents()
  }, [])

  return (
    <div className="">
      {/* Contenedor principal centrado */}
      <div className="bg-white min-h-screen max-w-7xl mx-auto p-4 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              Calendario de Eventos
            </h1>
            {user?.email && (
              <p className="text-gray-600 mt-2">
                Bienvenido, <span className="font-semibold text-blue-600">{user.email}</span>
              </p>
            )}
          </div>

          {/* Auth Actions */}
          {user?.email ? (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    setSelectedEvent(null)
                    setIsOpen(true)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm hover:shadow-md cursor-pointer"
                >
                  + Crear Evento
                </Button>

                {user?.role === "ADMIN" && (
                  <Link
                    to="/user"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm py-2 px-4 rounded-lg transition-colors shadow-sm hover:shadow-md text-center"
                  >
                    Crear Usuarios
                  </Link>
                )}
              </div>

              <Button
                onClick={logout}
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50 font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
              >
                Cerrar sesión
              </Button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              Iniciar sesión
            </Link>
          )}
        </div>

        {/* Calendar Container - Ahora con fondo blanco completo */}
        <div className="bg-white">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            selectable
            select={handleDateSelect}
            eventClick={handleEventClick}
            dayMaxEventRows={4}
            locale="es"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek,dayGridDay",
            }}
            height="auto"
            timeZone="local"
            buttonText={{
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día"
            }}
            dayHeaderClassNames="bg-gray-100 text-gray-700 font-medium"
            dayCellClassNames="hover:bg-gray-50 transition-colors"
            eventClassNames="cursor-pointer hover:opacity-90 transition-opacity"
          />
        </div>
      </div>

      {/* Event Modal */}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) {
            loadEvents() // 🔄 Refrescar eventos al cerrar modal
          }
        }}
      >
        <DialogContent className="sm:max-w-[625px] lg:max-w-[900px] max-h-[90vh] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-semibold text-gray-800">
              <Calendar className="h-6 w-6 text-blue-600" />
              {selectedEvent ? "Editar Evento" : "Nuevo Evento"}
            </DialogTitle>
          </DialogHeader>

          <EventModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onDelete={selectedEvent ? handleDelete : undefined}
            event={selectedEvent}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}