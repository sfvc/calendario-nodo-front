import React, { useEffect, useState } from "react"
import FullCalendar, { DateSelectArg, EventClickArg } from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import { EventAPI } from "../lib/eventApi"
import { Button } from "./ui/Button"
import { EventModal } from "./event-modal"
import type { CalendarEvent } from "../types/event"
import { useAuth } from "../context/AuthContext"
import { EventStatus } from "../types/event.enum"

export function EventCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | undefined>()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { userId, userEmail, userRole, logout } = useAuth()

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsAuthenticated(!!token)
  }, [])

  useEffect(() => {
    console.log("🔐 Auth data:", { userEmail, userRole, userId });
  }, [userEmail, userRole]);

  // Cargar eventos cuando cambia la autenticación
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await EventAPI.getAll()
        const formatted = data.map((e: any) => ({
          id: e.id,
          title: e.title,
          start: e.start,
          end: e.end,
          description: e.description || "",
          color: e.color || "#3b82f6",
          allDay: e.allDay ?? true,
          status: e.status,
          type: e.type,
          userId: e.userId,
        }))
        setEvents(formatted)
      } catch (error) {
        console.error("Error cargando eventos:", error)
        alert("Error al cargar los eventos")
      }
    }

    loadEvents()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false)
    logout()
    window.location.reload()
  }

  // 🔄 Guardar o actualizar evento
  const handleSave = async (event: CalendarEvent) => {
    try {
      if (!event.title) {
        alert("El título del evento es requerido");
        return;
      }

      const startDate = new Date(event.start);
      const endDate = new Date(event.end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Fechas inválidas');
      }

      const payload = {
        title: event.title,
        description: event.description || "",
        start: selectedDate ? `${selectedDate}T00:00:00` : startDate.toISOString(),
        end: selectedDate ? `${selectedDate}T23:59:59` : endDate.toISOString(),   
        color: event.color || "#3b82f6",
        allDay: event.allDay ?? false,
        status: event.status || EventStatus.ESPERANDO_RTA,
        userId: userEmail,
      };

      console.log("Enviando payload:", payload);

      let saved;
      if (event.id && events.some(e => e.id === event.id)) {
        // Actualizar evento existente
        saved = await EventAPI.update(event.id, payload);
      } else {
        // Crear nuevo evento
        saved = await EventAPI.create(payload);
      }

      console.log('Respuesta del servidor:', saved); // Verifica que recibes datos aquí

      const newEvent: CalendarEvent = {
        id: saved.id,
        title: saved.title,
        start: saved.start,
        end: saved.end,
        description: saved.description,
        color: saved.color || "#3b82f6",
        allDay: saved.allDay ?? true,
        status: saved.status,
        type: saved.type,
        userId: saved.userId,
      };

      setEvents(prev => 
        event.id 
          ? prev.map(e => e.id === event.id ? newEvent : e) 
          : [...prev, newEvent]
      );
      
      return saved; // ← Esto es crucial para que el modal reciba la respuesta
    } catch (err) {
      console.error("Error al guardar:", err);
      throw err; // Propaga el error para que el modal lo maneje
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (window.confirm("¿Estás seguro de eliminar este evento?")) {
        await EventAPI.remove(id)
        setEvents(prev => prev.filter(e => e.id !== id))
        setModalOpen(false)
      }
    } catch (err) {
      console.error("Error al eliminar:", err)
      alert("Error al eliminar el evento")
    }
  }

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedDate(selectInfo.startStr)
    setSelectedEvent(null)
    setModalOpen(true)
    selectInfo.view.calendar.unselect()
  }

  const handleEventClick = (clickInfo: EventClickArg) => {
    const e = events.find(ev => ev.id === clickInfo.event.id)
    if (e) {
      setSelectedEvent(e)
      setModalOpen(true)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="w-[100%]">
          <h1 className="text-2xl font-bold">Calendario de Eventos</h1>
            {userEmail ? (
              <div className="w-[100%] pt-4">
                <p className="text-gray-600 mt-1">
                  Bienvenido, <span className="font-semibold">{userEmail}</span>
                </p>

                <div className="flex items-center justify-between pt-4 mb-4">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow"
                    onClick={() => {
                      setSelectedDate(new Date().toISOString().split("T")[0]);
                      setSelectedEvent(null);
                      setModalOpen(true);
                    }}
                  >
                    Crear Evento
                  </Button>

                  {userRole === "ADMIN" && (
                    <a
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
                      href="/user"
                    >
                      Crear Usuario
                    </a>
                  )}

                  <Button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
                  >
                    Cerrar sesión
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end pt-4 mb-4">
                <a
                  href="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
                >
                  Iniciar sesión
                </a>
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

      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={selectedEvent ? handleDelete : undefined}
        event={selectedEvent}
        selectedDate={selectedDate}
      />
    </div>
  )
}