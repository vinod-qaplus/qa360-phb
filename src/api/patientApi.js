import { api } from "./client";

export const patientApi = {
  getAll: async () => {
    const response = await api.get("/patients");
    console.log("Full URL:", response.config.baseURL + response.config.url);
    return response.data.Data;
  },

  /**
   * Create a patient
   * @param {{ [key: string]: any }} data - patient payload
   */
  create: async (data) => {
    const response = await api.post("/patients", data);
    return response.data.Data;
  },

  /**
   * Update a patient
   * @param {string|number} id - patient id
   * @param {{ [key: string]: any }} data - updated fields
   */
  update: async (id, data) => {
    const response = await api.put(`/patients/${id}`, data);
    return response.data.Data;
  },
};
