import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, MapPin, Shield, Users } from 'lucide-react';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context';
import { eventFormSchema } from "./event-schema";
import { EventStatus } from "@/types/event.enum";
import { colorOptions } from "@/constants/colors-options";
import type { EventFormData, EventResponse } from "@/types/event";
import { EventAPI } from '@/lib/eventApi';
import { toast } from "sonner"

interface Props {
	event: EventResponse | null
	canEdit: boolean
	isReadOnly: boolean
	isEditing: boolean
	handleDelete: () => void
	onClose: () => void
}

export const EventForm = (
{
	event,
	canEdit,
	isReadOnly,
	isEditing,
	handleDelete,
	onClose
}: Props) => {

	const { user } = useAuth()

	const form = useForm<EventFormData>({
		resolver: zodResolver(eventFormSchema),
		defaultValues: {
			title: event?.title ?? "",
			start: event?.start ?? "",
			end: event?.end ?? "",
			description: event?.description ?? "",
			color: event?.color ?? "#3b82f6",
			allDay: event?.allDay ?? false,
			status: event?.status ?? EventStatus.ESPERANDO_RTA,
			organizacion: event?.organizacion ?? "",
			dia_y_horario: event?.dia_y_horario ?? "",
			cantidadPersonas: event?.cantidadPersonas ?? 0,
			espacioUtilizar: event?.espacioUtilizar ?? "",
			requerimientos: event?.requerimientos ?? "",
			cobertura: event?.cobertura ?? "",
			userId: event?.userId ?? user?.id
		}
	});

	const onSubmit = async (form: EventFormData) => {
	if (!user) return

	const data = {
		...form,
		start: new Date(form.start).toISOString(),
		end: new Date(form.end).toISOString(),
	}

	try {
		if (event) {
		await EventAPI.update(event.id, data)
		toast.success("✅ Evento actualizado correctamente")
		} else {
		await EventAPI.create(data)
		toast.success("✅ Evento creado correctamente")
		}

		handleClose() // 👉 Cierra el modal al finalizar exitosamente
	} catch (error) {
		console.error("Error al guardar el evento:", error)
		toast.error("❌ Ocurrió un error al guardar el evento")
	}
	}

	const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
			{/* Información básica */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold">Información Básica</h3>
				
				<div className="space-y-2">
					<Label htmlFor="title">Título del Evento *</Label>
					<Input
						id="title"
						{...form.register('title')}
						placeholder="Ingresa el título del evento"
						disabled={isReadOnly}
					/>
					{form.formState.errors.title && (
						<p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="description">Descripción</Label>
					<textarea
						id="description"
						{...form.register('description')}
						placeholder="Describe el evento..."
						className="w-full rounded-md border px-3 py-2 min-h-[100px] resize-none"
						disabled={isReadOnly}
					/>
					{form.formState.errors.description && (
						<p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="organizacion">Organización *</Label>
					<Input
						id="organizacion"
						{...form.register('organizacion')}
						placeholder="Nombre de la organización"
						disabled={isReadOnly}
					/>
					{form.formState.errors.organizacion && (
						<p className="text-red-500 text-sm mt-1">{form.formState.errors.organizacion.message}</p>
					)}
				</div>
			</div>

			{/* Fecha y hora */}
			<div className="space-y-4">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="start">Fecha de Inicio *</Label>
						<Input
							id="start"
							type="date"
							{...form.register('start')}
							disabled={isReadOnly}
						/>
						{form.formState.errors.start && (
							<p className="text-red-500 text-sm mt-1">{form.formState.errors.start.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="end">Fecha de Fin *</Label>
						<Input
							id="end"
							type="date"
							{...form.register('end')}
							disabled={isReadOnly}
						/>
						{form.formState.errors.end && (
							<p className="text-red-500 text-sm mt-1">{form.formState.errors.end.message}</p>
						)}
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="dia_y_horario">Día y Horario *</Label>
					<Input
						id="dia_y_horario"
						{...form.register('dia_y_horario')}
						placeholder="Ej: Lunes 14:00 - 16:00"
						disabled={isReadOnly}
					/>
					{form.formState.errors.dia_y_horario && (
						<p className="text-red-500 text-sm mt-1">{form.formState.errors.dia_y_horario.message}</p>
					)}
				</div>
			</div>

			{/* Detalles del evento */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold flex items-center gap-2">
					<Users className="h-5 w-5" />
					Detalles del Evento
				</h3>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="cantidadPersonas">Cantidad de Personas *</Label>
						<Input
							id="cantidadPersonas"
							type="number"
							{...form.register('cantidadPersonas', { valueAsNumber: true })}
							disabled={isReadOnly}
						/>
						{form.formState.errors.cantidadPersonas && (
							<p className="text-red-500 text-sm mt-1">{form.formState.errors.cantidadPersonas.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="status">Estado</Label>
						<select
							id="status"
							{...form.register('status')}
							className="w-full rounded-md border px-3 py-2"
							disabled={isReadOnly}
						>
							{Object.values(EventStatus).map((status) => (
								<option key={status} value={status}>
									{status === EventStatus.ESPERANDO_RTA ? 'Esperando Respuesta' :
										status === EventStatus.FIN_DE_SEMANA ? 'Fín de Semana' :
										status === EventStatus.CANCELADO ? 'Cancelado' :
										status === EventStatus.INFO_SOLICITADA ? 'Información solicitada' :
										status === EventStatus.INTERNO_NODO ? 'Interno del Nodo' : status}
								</option>
							))}
						</select>
						{form.formState.errors.status && (
							<p className="text-red-500 text-sm mt-1">{form.formState.errors.status.message}</p>
						)}
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="espacioUtilizar" className="flex items-center gap-2">
						<MapPin className="h-4 w-4" />
						Espacio a Utilizar *
					</Label>
					<Input
						id="espacioUtilizar"
						{...form.register('espacioUtilizar')}
						placeholder="Ej: Salón principal, Auditorio, etc."
						disabled={isReadOnly}
					/>
					{form.formState.errors.espacioUtilizar && (
						<p className="text-red-500 text-sm mt-1">{form.formState.errors.espacioUtilizar.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="requerimientos" className="flex items-center gap-2">
						<FileText className="h-4 w-4" />
						Requerimientos
					</Label>
					<textarea
						id="requerimientos"
						{...form.register('requerimientos')}
						placeholder="Describe los requerimientos técnicos, equipos, etc."
						className="w-full rounded-md border px-3 py-2 min-h-[60px] resize-none"
						disabled={isReadOnly}
					/>
					{form.formState.errors.requerimientos && (
						<p className="text-red-500 text-sm mt-1">{form.formState.errors.requerimientos.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="cobertura" className="flex items-center gap-2">
						<Shield className="h-4 w-4" />
						Cobertura
					</Label>
					<textarea
						id="cobertura"
						{...form.register('cobertura')}
						placeholder="Información sobre cobertura, seguros, etc."
						className="w-full rounded-md border px-3 py-2 min-h-[60px] resize-none"
						disabled={isReadOnly}
					/>
					{form.formState.errors.cobertura && (
						<p className="text-red-500 text-sm mt-1">{form.formState.errors.cobertura.message}</p>
					)}
				</div>
			</div>

			{/* Apariencia */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold">Apariencia</h3>
				
				<div className="space-y-2">
					<Label>Color del Evento</Label>
					<div className="flex gap-2 flex-wrap mt-2">
						{colorOptions.map((color) => (
							<button
								key={color.value}
								type="button"
								className={`w-8 h-8 rounded-full border-2 ${
									form.watch('color') === color.value 
										? 'border-gray-800 scale-110' 
										: 'border-gray-300'
								} transition-all`}
								style={{ backgroundColor: color.value }}
								onClick={() => form.setValue('color', color.value)}
								title={color.label}
								disabled={isReadOnly}
							/>
						))}
					</div>
					{form.formState.errors.color && (
						<p className="text-red-500 text-sm mt-1">{form.formState.errors.color.message}</p>
					)}
				</div>
			</div>

			{/* Botones */}
			<div className="flex justify-between pt-4">
				{canEdit && (
					<div className="space-x-2">
						<Button
							type="submit"
							className="bg-blue-600 hover:bg-blue-700 text-white"
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting ? 'Guardando...' : 
								(isEditing ? 'Actualizar' : 'Crear')} Evento
						</Button>

						<Button
							type="button"
							onClick={handleDelete}
							className="bg-red-600 hover:bg-red-700 text-white"
						>
							Eliminar
						</Button>
					</div>
				)}
				<Button type="button" variant="outline" onClick={handleClose}>
					{canEdit ? "Cancelar" : "Cerrar"}
				</Button>
			</div>
		</form>
  )
}
