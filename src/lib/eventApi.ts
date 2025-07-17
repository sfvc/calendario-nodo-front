/* eslint-disable @typescript-eslint/no-explicit-any */

import type { CalendarEvent } from "@/types/event";
import api from "./api";
import { formattedEvent } from "./formattedEvent";
const BASE_PATH = '/events';

export const EventAPI = {
  getAll: async (): Promise<CalendarEvent[]> => {
    const response = await api.get(BASE_PATH);

    const formatted = formattedEvent(response?.data)
    return formatted
  },

  create: async (data: any): Promise<CalendarEvent> => {
    return api.post(BASE_PATH, data);
  },

  update: async (id: string, data: any): Promise<CalendarEvent> => {
    return api.patch(`${BASE_PATH}/${id}`, data);
  },

  remove: async (id: string) => {
    return api.delete(`${BASE_PATH}/${id}`);
  },

  getById: async (id: string): Promise<CalendarEvent[]> => {
    return api.get(`${BASE_PATH}/${id}`);
  },
};