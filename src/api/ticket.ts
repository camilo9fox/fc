import apiClient from "./client";

export interface TicketCategory {
  id: string;
  name: string;
  description: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  category_id: string;
  category?: TicketCategory;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketPayload {
  categoryId: string;
  subject: string;
  message: string;
}

export interface UpdateTicketPayload {
  subject?: string;
  message?: string;
}

export const ticketsApi = {
  getCategories: (): Promise<{ categories: TicketCategory[] }> =>
    apiClient.get("/support-tickets/categories").then((r) => r.data),

  create: (data: CreateTicketPayload): Promise<Ticket> =>
    apiClient.post("/support-tickets", data).then((r) => r.data),

  getByUser: (params?: {
    limit?: number;
    offset?: number;
    categoryId?: string;
  }): Promise<{ tickets: Ticket[]; pagination: { limit: number; offset: number } }> =>
    apiClient.get("/support-tickets", { params }).then((r) => r.data),

  getById: (id: string): Promise<Ticket> =>
    apiClient.get(`/support-tickets/${id}`).then((r) => r.data),

  update: (id: string, data: UpdateTicketPayload): Promise<Ticket> =>
    apiClient.patch(`/support-tickets/${id}`, data).then((r) => r.data),

  delete: (id: string): Promise<{ message: string }> =>
    apiClient.delete(`/support-tickets/${id}`).then((r) => r.data),
};
