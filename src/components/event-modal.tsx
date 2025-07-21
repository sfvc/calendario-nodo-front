 
import { useAuth } from '../context';

import { EventForm } from './forms/event-form';
import type { EventResponse } from '../types/event';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (eventId: string) => void;
  event: EventResponse | null;
}

export function EventModal({
  onClose,
  onDelete,
  event,
}: EventModalProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isUser = user?.role === "USER";
  const canEdit = isUser || isAdmin;
  const isReadOnly = !!event && !canEdit;
  const isEditing = !!event;

  const handleDelete = () => {
    if (event && onDelete && canEdit) {
      onDelete(event.id);
      onClose();
    }
  };

  return (
    <EventForm
      event={event}
      canEdit={canEdit}
      isEditing={isEditing}
      isReadOnly={isReadOnly}
      handleDelete={handleDelete}
      onClose={onClose}
    />
  );
}