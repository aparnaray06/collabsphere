
import api from "./api";

const authService = {
  register: async (data) => (await api.post("/auth/register", data)).data,
  login: async (data) => (await api.post("/auth/login", data)).data,
  getMe: async () => (await api.get("/auth/me")).data,
  updateProfile: async (data) =>
    (await api.put("/auth/profile", data)).data,
};

export default authService;
