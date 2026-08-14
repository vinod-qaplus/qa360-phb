import { api } from "./client";

export const userApi = {
  login: async (payload) => {
    const response = await api.post("/users/auth/login", payload);
    return response.data;
  },
};
