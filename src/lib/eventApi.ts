/* eslint-disable @typescript-eslint/no-explicit-any */
import type { EventResponse } from "@/types/event";
import api from "./api";

const BASE_PATH = '/events';

export const EventAPI = {
  getAll: async (): Promise<EventResponse[]> => {
    const response = await api.get(BASE_PATH);
    console.log('respuesta de getAll', response.data);
    return response.data; // <-- devuelvo tal cual, sin formatear
  },

  create: async (data: any): Promise<EventResponse> => {
    const response = await api.post(BASE_PATH, data);
    return response.data;
  },

  update: async (id: string, data: any): Promise<EventResponse> => {
    const response = await api.patch(`${BASE_PATH}/${id}`, data);
    return response.data;
  },

  remove: async (id: string) => {
    return api.delete(`${BASE_PATH}/${id}`);
  },

  getById: async (id: string): Promise<EventResponse> => {
    const response = await api.get(`${BASE_PATH}/${id}`);
    return response.data; // <-- mantengo EventResponse sin formatear
  },
};
