import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import Loading from "@/components/loading";
import type { EventResponse } from "@/types/event";

const EventList: React.FC = () => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [eventStates, setEventStates] = useState<{ id: number; nombre: string }[]>([]);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // 🔹 Cargar estados de evento
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const res = await api.get<{ id: number; nombre: string }[]>("/evento-estado");
        setEventStates(res.data);
      } catch (error) {
        console.error("Error cargando estados:", error);
      }
    };
    fetchEstados();
  }, []);

  // 🔹 Cargar eventos
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get<EventResponse[]>("/events");
        console.log("Eventos recibidos:", res.data); // <-- Aquí ves cómo llegan los datos
        setEvents(res.data);
      } catch (error) {
        console.error("Error cargando eventos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // 🔹 Filtrar eventos
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase());
    const matchesState = filterState === "all" || event.estado === filterState;

    const eventDate = new Date(event.fechaInicio).setHours(0, 0, 0, 0);
    const startFilter = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const endFilter = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

    const matchesDate =
      (!startFilter || eventDate >= startFilter) &&
      (!endFilter || eventDate <= endFilter);

    return matchesSearch && matchesState && matchesDate;
  });

  return (
    <div className="container m-0 m-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Lista de Eventos</h1>

      {/* Filtros */}
      <div className="flex gap-4 mb-6 flex-wrap items-center justify-between">
        <Input
          placeholder="Buscar evento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs bg-white"
        />
        <Input
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-white w-48"
        />
        <Input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-white w-48"
        />
        <Select 
          value={filterState}
          onValueChange={(value) => setFilterState(value)}
        >
          <SelectTrigger className="w-48 bg-white">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {eventStates.map((estado) => (
              <SelectItem key={estado.id} value={estado.nombre}>
                {estado.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          className="bg-white"
          variant="outline"
          onClick={() => {
            setSearch("");
            setFilterState("all");
            setStartDate("");
            setEndDate("");
          }}
        >
          Limpiar filtros
        </Button>

        <Button
          asChild
          variant="outline"
          className="bg-green-600 text-white hover:bg-green-700 hover:text-white transition-colors duration-200 cursor-pointer"
        >
          <Link to="/">Volver a Inicio</Link>
        </Button>
      </div>

      {/* Tabla de eventos */}
      {loading ? (
        <Loading />
      ) : filteredEvents.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg border">
          <table className="w-full text-left">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2">Título</th>
                <th className="px-4 py-2">Organización</th>
                <th className="px-4 py-2">Fecha Inicio</th>
                <th className="px-4 py-2">Hora Inicio</th>
                <th className="px-4 py-2">Fecha Fin</th>
                <th className="px-4 py-2">Hora Fin</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr
                  key={event.id}
                  className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="px-4 py-2 font-semibold">{event.title}</td>
                  <td className="px-4 py-2 font-semibold">{event.organizacion}</td>
                  <td className="px-4 py-2">{new Date(event.fechaInicio).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{event.horaInicio ?? "--"}</td>
                  <td className="px-4 py-2">{new Date(event.fechaFin).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{event.horaFin ?? "--"}</td>
                  <td className="px-4 py-2">{event.estado}</td>
                  <td className="px-4 py-2">
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-white" variant="outline" size="sm">
                          Ver
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg bg-white rounded-xl shadow-lg p-6">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold">{event.title}</DialogTitle>
                          <DialogDescription className="text-gray-500">
                            Detalles del evento
                          </DialogDescription>
                        </DialogHeader>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-gray-700">
                          <div>
                            <span className="font-semibold">Descripción:</span> {event.description}
                          </div>
                          <div>
                            <span className="font-semibold">Fecha inicio:</span>{" "}
                            {new Date(event.fechaInicio).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-semibold">Hora inicio:</span>{" "}
                            {event.horaInicio ?? "--"}
                          </div>
                          <div>
                            <span className="font-semibold">Fecha fin:</span>{" "}
                            {new Date(event.fechaFin).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-semibold">Hora fin:</span>{" "}
                            {event.horaFin ?? "--"}
                          </div>
                          <div>
                            <span className="font-semibold">Estado:</span> {event.estadoId}
                          </div>
                          <div>
                            <span className="font-semibold">Organización:</span> {event.organizacion}
                          </div>
                          {event.cantidadPersonas !== undefined && (
                            <div>
                              <span className="font-semibold">Cantidad de personas:</span>{" "}
                              {event.cantidadPersonas}
                            </div>
                          )}
                          {event.espacioUtilizar && (
                            <div>
                              <span className="font-semibold">Espacio a utilizar:</span>{" "}
                              {event.espacioUtilizar}
                            </div>
                          )}
                          {event.requerimientos && (
                            <div>
                              <span className="font-semibold">Requerimientos:</span>{" "}
                              {event.requerimientos}
                            </div>
                          )}
                          {event.cobertura && (
                            <div>
                              <span className="font-semibold">Cobertura:</span> {event.cobertura}
                            </div>
                          )}
                          {event.color && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">Color:</span>
                              <span
                                className="w-5 h-5 rounded"
                                style={{ backgroundColor: event.color }}
                              ></span>
                            </div>
                          )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                          <Button variant="destructive" onClick={() => setIsOpen(false)}>
                            Cerrar
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No se encontraron eventos.</p>
      )}
    </div>
  );
};

export default EventList;
