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

export function EventCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null)
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState<boolean>(false)

  // Cargar eventos cuando cambia la autenticación
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await EventAPI.getAll()
        setEvents(data)
      } catch (error) {
        console.error("Error cargando eventos:", error)
      }
    }

    loadEvents()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      if (window.confirm("¿Estás seguro de eliminar este evento?")) {
        await EventAPI.remove(id)
        setEvents(prev => prev.filter(e => e.id !== id))
        setIsOpen(false)
      }
    } catch (err) {
      console.error("Error al eliminar:", err)
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="w-full">
          <h1 className="text-2xl font-bold">Calendario de Eventos</h1>
            {user?.email ? (
              <div className="w-full pt-4">
                <p className="text-gray-600 mt-1">
                  Bienvenido, <span className="font-semibold">{user.email}</span>
                </p>

                <div className="flex items-center justify-between pt-4 mb-4">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow"
                    onClick={() => {
                      setSelectedEvent(null);
                      setIsOpen(true);
                    }}
                  >
                    Crear Evento
                  </Button>

                  {user?.role === "ADMIN" && (
                    <a
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
                      href="/user"
                    >
                      Crear Usuario
                    </a>
                  )}

                  <Button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
                  >
                    Cerrar sesión
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end pt-4 mb-4">
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
                >
                  Iniciar sesión
                </Link>
              </div>
            )}
        </div>
      </div>

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
      />

      <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
        <DialogContent className="lg:min-w-[900px] max-h-5/6 overflow-y-scroll">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5" /> 
              {selectedEvent ? "Editar Evento" : "Crear Evento"}
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