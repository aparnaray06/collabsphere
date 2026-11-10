
import api from "./api";

const projectService = {
  getAll: async () => (await api.get("/projects")).data,
  getById: async (id) => (await api.get(`/projects/${id}`)).data,
  create: async (project) => (await api.post("/projects", project)).data,
  update: async (id, project) =>
    (await api.put(`/projects/${id}`, project)).data,
  remove: async (id) => (await api.delete(`/projects/${id}`)).data,
};

export default projectService;
