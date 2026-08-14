import { api } from "./client";

export const phbCasesApi = {
  getAll: async () => {
    console.log("Full URL:" + api.defaults.baseURL + "/phb_cases");
    const response = await api.get("/phb_cases");
    console.log("Full URL:", response.config.baseURL + response.config.url);
    return response.data.Data;
  },
};
