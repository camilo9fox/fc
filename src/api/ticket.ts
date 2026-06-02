import apiClient from "./client";

interface ITicketCategory {
  id: string;
  name: string;
  description: string;
}

export const ticketsApi = {
  getTicketCategories: (): Promise<{ categories: ITicketCategory[] }> =>
    apiClient.get("/tickets/categories").then((r) => r.data),
  submitTicket: (data: {
    categoryId: string;
    subject: string;
    description: string;
  }): Promise<void> => apiClient.post("/tickets", data).then((r) => r.data),
};
