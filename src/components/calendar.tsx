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
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await EventAPI.getAll();

      const adjustedEvents = data.map(event => {
        let startDate = new Date(event.start);
        let endDate = event.end ? new Date(event.end) : null;

        const isAllDay = event.allDay ?? !event.start.includes("T");

        const isStartMidnight = startDate.getUTCHours() === 0 &&
          startDate.getUTCMinutes() === 0 &&
          startDate.getUTCSeconds() === 0;

        const isEndMidnight = endDate &&
          endDate.getUTCHours() === 0 &&
          endDate.getUTCMinutes() === 0 &&
          endDate.getUTCSeconds() === 0;

        // Si el start es medianoche UTC, sumamos horas para corregir visualización en zona local
        if (isStartMidnight) {
          startDate.setUTCHours(startDate.getUTCHours() + 3); // Ajusta según tu zona horaria
        }

        // Si el evento NO es allDay pero termina a medianoche exacta, le sumamos 1 día
        if (!isAllDay && endDate && isEndMidnight) {
          endDate.setUTCDate(endDate.getUTCDate() + 1);
        }

        return {
          ...event,
          start: startDate.toISOString(),
          end: endDate ? endDate.toISOString() : undefined,
          allDay: isAllDay,
          display: 'auto',
        };
      });

      adjustedEvents.sort((a, b) =>
        new Date(a.start).getTime() - new Date(b.start).getTime()
      );

      setEvents(adjustedEvents);
    } catch (error) {
      console.error("Error cargando eventos:", error);
      toast.error("No se pudieron cargar los eventos");
    } finally {
      setIsLoading(false);
    }
  };

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
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="bg-white-600 hover:bg-gray-200 text-gray font-medium py-2 px-4 rounded-lg transition-colors shadow-sm hover:shadow-md cursor-pointer"
                >
                <svg fill="#000000" width="64px" height="64px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15.977 0c-7.994 0-14.498 6.504-14.498 14.498 0 7.514 5.79 13.798 13.236 14.44l-2.87 1.455c-0.354 0.195-0.566 0.632-0.355 0.977l0.101 0.262c0.211 0.346 0.668 0.468 1.021 0.274l4.791-2.453c0.006-0.004 0.012-0.003 0.019-0.007l0.322-0.176c0.177-0.098 0.295-0.257 0.342-0.434 0.049-0.177 0.027-0.375-0.079-0.547l-0.191-0.313c-0.003-0.006-0.009-0.010-0.012-0.015l-2.959-4.624c-0.21-0.346-0.666-0.468-1.021-0.274l-0.232 0.162c-0.354 0.194-0.378 0.694-0.168 1.038l1.746 2.709c-0.009-0-0.018-0.004-0.027-0.005-6.54-0.429-11.662-5.907-11.662-12.47 0-6.891 5.607-12.498 12.498-12.498 6.892 0 12.53 5.606 12.53 12.498 0 3.968-1.823 7.613-5 9.999-0.442 0.332-0.53 0.959-0.199 1.401 0.332 0.442 0.959 0.531 1.401 0.199 3.686-2.768 5.799-6.996 5.799-11.598-0-7.994-6.536-14.498-14.53-14.498z"></path> </g></svg>
                  Recargar
                </Button>
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