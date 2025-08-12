import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, RotateCw } from "lucide-react"; // Added RotateCw icon
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useAuth } from "../context";
import { Button } from "@/components/ui/Button"; // Corrected import path for shadcn button
import { EventModal } from "@/components/event-modal";
import { EventAPI } from "../lib/eventApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Corrected import path for shadcn dialog components
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core/index.js";
import type { CalendarEvent, EventResponse } from "@/types/event";
import { toast } from "sonner";

export function EventCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(
    null
  );
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await EventAPI.getAll();

      const adjustedEvents = data.map((event) => {
        let startDate = new Date(event.start);
        let endDate = event.end ? new Date(event.end) : null;

        const isAllDay = event.allDay ?? !event.start.includes("T");

        const isStartMidnight =
          startDate.getUTCHours() === 0 &&
          startDate.getUTCMinutes() === 0 &&
          startDate.getUTCSeconds() === 0;

        const isEndMidnight =
          endDate &&
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
          display: "auto",
        };
      });

      adjustedEvents.sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
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
      await EventAPI.remove(id);
      toast.success("✅ Evento eliminado correctamente", { duration: 3000 });
      setIsOpen(false);
    } catch (err) {
      console.error("Error al eliminar:", err);
      toast.error(
        "❌ Hubo un problema de conexión al eliminar el evento",
        { duration: 4000 }
      );
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedEvent(null);
    setIsOpen(true);
    selectInfo.view.calendar.unselect();
  };

  function toLocalDateString(date: Date | undefined | null) {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const handleEventClick = (e: EventClickArg) => {
    const fullEvent = {
      id: e.event.id,
      title: e.event.title,
      start: toLocalDateString(e.event.start),
      end: toLocalDateString(e.event.end),
      allDay: e.event.allDay,
      color: e.event.backgroundColor,
      ...e.event.extendedProps,
    } as EventResponse;

    setSelectedEvent(fullEvent);
    setIsOpen(true);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="h-8 w-8 text-primary" />
              Calendario de Eventos
            </h1>
            {user?.email && (
              <p className="text-muted-foreground mt-2">
                Bienvenido,{" "}
                <span className="font-semibold text-primary">
                  {user.email}
                </span>
              </p>
            )}
          </div>
          {user?.email ? (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="bg-white flex items-center gap-2 cursor-pointer"
                >
                  <RotateCw className="h-4 w-4" />
                  Recargar
                </Button>
                <Button
                  onClick={() => {
                    setSelectedEvent(null);
                    setIsOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  + Crear Evento
                </Button>

                <Link to="/estados">
                  <Button
                    className="cursor-pointer"
                  >+ Crear Estados</Button>
                </Link>

                {user?.role === "ADMIN" && (
                  <Link to="/user">
                    <Button
                      className="cursor-pointer"
                    >
                      Crear Usuarios
                    </Button>
                  </Link>
                )}
              </div>

              <Button className="cursor-pointer" onClick={logout} variant="destructive">
                Cerrar sesión
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button>Iniciar sesión</Button>
            </Link>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
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
              day: "Día",
            }}
            dayHeaderClassNames="bg-muted text-foreground font-medium"
            dayCellClassNames="hover:bg-accent transition-colors"
            eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
          />
        </div>
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            loadEvents(); // 🔄 Refrescar eventos al cerrar modal
          }
        }}
      >
        <DialogContent className="sm:max-w-[625px] lg:max-w-[900px] max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-semibold text-gray-800">
              <Calendar className="h-6 w-6 text-primary" />
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
  );
}