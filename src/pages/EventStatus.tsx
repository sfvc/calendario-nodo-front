import api from "@/lib/api";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import Loading from "@/components/loading";
import { Link } from "react-router-dom";

type EstadoEvento = {
  id: number;
  nombre: string;
};

const EstadosEventosPage: React.FC = () => {
  const [estados, setEstados] = useState<EstadoEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "editar">("create");
  const [currentEstado, setCurrentEstado] = useState<EstadoEvento | null>(null);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const res = await api.get("/evento-estado");
        setEstados(res.data);
      } catch (err) {
        setError("Error cargando estados.");
        toast.error("Error cargando estados.");
      } finally {
        setLoading(false);
      }
    };
    fetchEstados();
  }, []);

  const openCreateModal = () => {
    setCurrentEstado({ id: 0, nombre: "" });
    setModalMode("create");
    setModalOpen(true);
  };

  const openEditModal = (estado: EstadoEvento) => {
    setCurrentEstado(estado);
    setModalMode("editar");
    setModalOpen(true);
  };

  const createEstado = async (estado: Omit<EstadoEvento, "id">) => {
    const res = await api.post("/evento-estado", { nombre: estado.nombre });
    return res.data;
  };

  const updateEstado = async (estado: EstadoEvento) => {
    const res = await api.put(`/evento-estado/${estado.id}`, {
      nombre: estado.nombre,
    });
    return res.data;
  };

  const handleSubmit = async () => {
    if (!currentEstado) return;

    if (modalMode === "create") {
      try {
        const nuevoEstado = await createEstado({ nombre: currentEstado.nombre });
        setEstados([...estados, nuevoEstado]);
        toast.success("Estado creado exitosamente!");
        setModalOpen(false);
      } catch {
        toast.error("Error creando estado");
      }
    } else {
      try {
        const actualizado = await updateEstado(currentEstado);
        setEstados(
          estados.map((e) => (e.id === actualizado.id ? actualizado : e))
        );
        toast.success("Estado actualizado exitosamente!");
        setModalOpen(false);
      } catch {
        toast.error("Error actualizando estado");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentEstado) return;
    setCurrentEstado({ ...currentEstado, [e.target.name]: e.target.value });
  };

  if (loading) return <div><Loading/></div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-8">
      <div className="estadospage-header flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Estados para Eventos</h1>
        <div className="flex justify-end items-center gap-4">
          <Button className="cursor-pointer" onClick={openCreateModal}>Crear Estado</Button>
          <Button
            asChild
            variant="outline"
            className="bg-green-600 text-white hover:bg-green-700 hover:text-white transition-colors duration-200 cursor-pointer"
          >
            <Link to="/">Volver a Inicio</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table className="bg-white rounded-md">
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {estados.length > 0 ? (
              estados.map((estado) => (
                <TableRow key={estado.id}>
                  <TableCell>{estado.nombre}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      className="bg-white cursor-pointer"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(estado)}
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No hay estados registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Crear/Editar */}
      <Dialog  open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-lg shadow-lg">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <DialogHeader>
              <DialogTitle>
                {modalMode === "create" ? "Crear Estado" : "Editar Estado"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={currentEstado?.nombre || ""}
                  onChange={handleChange}
                  className="col-span-3 bg-white"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                className="cursor-pointer"
                type="submit"
                disabled={!currentEstado?.nombre.trim()}
              >
                {modalMode === "create" ? "Crear" : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EstadosEventosPage;