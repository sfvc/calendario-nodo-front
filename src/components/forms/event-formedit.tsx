const loadEvents = async () => {
  setIsLoading(true);

  try {
    const data: EventResponse[] = await EventAPI.getAll();
    console.log("Eventos crudos:", data);

    // Ordenar por fechaInicio y horaInicio
    data.sort((a, b) => {
      const dateA = new Date(`${a.fechaInicio}T${a.horaInicio ?? "00:00"}:00`);
      const dateB = new Date(`${b.fechaInicio}T${b.horaInicio ?? "00:00"}:00`);
      return dateA.getTime() - dateB.getTime();
    });

    const formattedEvents = data.map(evt => {
      // Convertimos strings UTC a Date
      const startUTC = new Date(evt.fechaInicio);
      const endUTC = new Date(evt.fechaFin);

      let start: Date;
      let end: Date;

      if (evt.allDay) {
        // Evento de todo el día → usamos fechas locales sin hora
        start = new Date(startUTC.getFullYear(), startUTC.getMonth(), startUTC.getDate());
        end = new Date(endUTC.getFullYear(), endUTC.getMonth(), endUTC.getDate());
      } else {
        // Evento con hora → combinamos fecha y hora locales
        const [hInicio, mInicio] = (evt.horaInicio ?? "00:00").split(":").map(Number);
        const [hFin, mFin] = (evt.horaFin ?? "00:00").split(":").map(Number);

        start = new Date(
          startUTC.getFullYear(),
          startUTC.getMonth(),
          startUTC.getDate(),
          hInicio,
          mInicio
        );

        end = new Date(
          endUTC.getFullYear(),
          endUTC.getMonth(),
          endUTC.getDate(),
          hFin,
          mFin
        );
      }

      return {
        id: evt.id,
        title: evt.title,
        start,
        end,
        allDay: evt.allDay,
        backgroundColor: evt.color ?? "#3b82f6", // FullCalendar usa backgroundColor
        extendedProps: { ...evt }, // Todos los demás campos
      };
    });

    setEvents(formattedEvents);
  } catch (err) {
    console.error("Error al cargar eventos:", err);
    toast.error("❌ No se pudieron cargar los eventos", { duration: 4000 });
  } finally {
    setIsLoading(false);
  }
};