import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, RotateCw } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useAuth } from "../context";
import { Button } from "@/components/ui/Button";
import { EventModal } from "@/components/event-modal";
import { EventAPI } from "../lib/eventApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DateSelectArg, EventClickArg } from "@fullcalendar/core/index.js";
import type { CalendarEvent, EventResponse } from "@/types/event";
import { toast } from "sonner";
import AlertaBanner from "./alertaBanner";

export function EventCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [,setIsLoading] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState(0);


  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data: CalendarEvent[] = await EventAPI.getAll();
      console.log("Eventos desde backend:", data);

      // Ordenar por fechaInicio y horaInicio
      data.sort((a, b) => {
        const dateA = new Date(`${a.fechaInicio}T${a.horaInicio ?? "00:00"}:00`);
        const dateB = new Date(`${b.fechaInicio}T${b.horaInicio ?? "00:00"}:00`);
        return dateA.getTime() - dateB.getTime();
      });

      const formattedEvents = data.map(evt => {
        let start: Date;
        let end: Date;

        const addOneDay = (date: Date): Date => {
          const result = new Date(date);
          result.setDate(result.getDate() + 1);
          return result;
        };

        const startDate = addOneDay(new Date(evt.fechaInicio));
        const endDate = addOneDay(new Date(evt.fechaFin));

        if (evt.allDay) {
          // Evento de todo el día → usar solo fecha
          start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        } else {
          const [hInicio, mInicio] = (evt.horaInicio ?? "00:00").split(":").map(Number);
          const [hFin, mFin] = (evt.horaFin ?? "00:00").split(":").map(Number);

          start = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
            hInicio,
            mInicio
          );

          end = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate(),
            hFin,
            mFin
          );
        }

        return {
          id: evt.id,
          title: evt.title,
          start,
          end,
          allDay: evt.allDay ?? false,
          color: evt.color ?? "#3b82f6",
          extendedProps: {
            description: evt.description,
            estado: evt.estado,
            estadoId: evt.estadoId,
            userId: evt.userId,
            organizacion: evt.organizacion,
            cantidadPersonas: evt.cantidadPersonas,
            espacioUtilizar: evt.espacioUtilizar,
            requerimientos: evt.requerimientos,
            cobertura: evt.cobertura,
            fechaInicio: evt.fechaInicio,
            fechaFin: evt.fechaFin,
            horaInicio: evt.horaInicio,
            horaFin: evt.horaFin,
            informacionUtil: evt.informacionUtil,
            fotos: evt.fotos,
            archivos: evt.archivos,
            links: evt.links,
          },
        };
      });

      console.log("Eventos formateados para FullCalendar:", formattedEvents);
      setEvents(formattedEvents);
    } catch (err) {
      console.error("Error al cargar eventos:", err);
      toast.error("❌ No se pudieron cargar los eventos", { duration: 4000 });
    } finally {
      setIsLoading(false);
    }
  };


  const handleDelete = async (id: string) => {
    try {
      await EventAPI.remove(id);
      toast.success("✅ Evento eliminado correctamente", { duration: 3000 });
      setIsOpen(false);
      setRefreshKey(prev => prev + 1); // esto hará que useEffect recargue los eventos
    } catch (err) {
      console.error("Error al eliminar:", err);
      toast.error("❌ Hubo un problema de conexión al eliminar el evento", { duration: 4000 });
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedEvent(null);
    setIsOpen(true);
    selectInfo.view.calendar.unselect();
  };

  const handleEventClick = (e: EventClickArg) => {
    const props = e.event.extendedProps;

    const fullEvent: EventResponse = {
      id: e.event.id,
      title: e.event.title,
      start: e.event.start?.toISOString(),
      end: e.event.end?.toISOString(),
      allDay: e.event.allDay,
      color: e.event.backgroundColor,
      // Todos los campos personalizados
      fechaInicio: props.fechaInicio,
      fechaFin: props.fechaFin,
      horaInicio: props.horaInicio,
      horaFin: props.horaFin,
      description: props.description,
      estado: props.estado,
      estadoId: props.estadoId,
      userId: props.userId,
      organizacion: props.organizacion,
      cantidadPersonas: props.cantidadPersonas,
      espacioUtilizar: props.espacioUtilizar,
      requerimientos: props.requerimientos,
      cobertura: props.cobertura,
      informacionUtil: props.informacionUtil,
      fotos: props.fotos,
      archivos: props.archivos,
      links: props.links,
    };

    setSelectedEvent(fullEvent);
    setIsOpen(true);
  };

  useEffect(() => {
    loadEvents();
  }, [refreshKey]);

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
                Bienvenido, <span className="font-semibold text-primary">{user.email}</span>
              </p>
            )}
          </div>

          {user?.email ? (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => window.location.reload()} variant="outline" className="bg-white flex items-center gap-2 cursor-pointer">
                  <RotateCw className="h-4 w-4" />
                  Recargar
                </Button>
                <Button onClick={() => { setSelectedEvent(null); setIsOpen(true); }} className="cursor-pointer">
                  + Crear Evento
                </Button>
                <Link to="/eventos"><Button className="cursor-pointer">Ver todos los Eventos</Button></Link>
                <Link to="/estados"><Button className="cursor-pointer">+ Crear Estados</Button></Link>
                {user?.role === "ADMIN" && <Link to="/user"><Button className="cursor-pointer">Crear Usuarios</Button></Link>}
              </div>
              <Button className="cursor-pointer" onClick={logout} variant="destructive">Cerrar sesión</Button>
            </div>
          ) : (
            <Link to="/login"><Button>Iniciar sesión</Button></Link>
          )}
        </div>

        {/* <AlertaBanner /> */}

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
            buttonText={{ today: "Hoy", month: "Mes", week: "Semana", day: "Día" }}
            dayHeaderClassNames="bg-muted text-foreground font-medium"
            dayCellClassNames={(arg) =>
              arg.date.getDay() === 0 || arg.date.getDay() === 6 ? ["fc-weekend"] : []
            }
            eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
            eventOrder={(a, b) => {
              // Ordena primero por fecha de inicio
              const dateA = new Date(a.start!);
              const dateB = new Date(b.start!);
              if (dateA.getTime() !== dateB.getTime()) {
                return dateA.getTime() - dateB.getTime();
              }

              // Si es el mismo día, ordena por horaInicio de extendedProps
              const horaA = a.extendedProps.horaInicio ?? "00:00";
              const horaB = b.extendedProps.horaInicio ?? "00:00";

              const [hA, mA] = horaA.split(":").map(Number);
              const [hB, mB] = horaB.split(":").map(Number);

              return hA !== hB ? hA - hB : mA - mB;
            }}
            eventContent={(arg) => {
              const props = arg.event.extendedProps;
              const start = props.horaInicio ?? "";
              const end = props.horaFin ?? "";

              // Estilos de tarjeta
              const cardStyle = `
                padding: 2px 4px;
                border-radius: 8px;
                background-color: ${arg.event.backgroundColor || "#3b82f6"};
                color: #fff;
                font-size: 0.875rem;
                font-weight: 500;
                box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                display: flex;
                flex-direction: column;
                gap: 2px;
              `;

              const timeStyle = `
                font-size: 0.75rem;
                font-weight: 600;
                opacity: 0.85;
              `;

              return {
                html: `
                  <div style="${cardStyle}">
                    <span style="${timeStyle}">${start}${end ? " - " + end : ""}</span>
                    <span>${arg.event.title}</span>
                  </div>
                `,
              };
            }}
          />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
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
            onSave={() => setRefreshKey(prev => prev + 1)} // <-- recarga eventos automáticamente
          />
        </DialogContent>
      </Dialog>

    </div>
  );
}
