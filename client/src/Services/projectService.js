
import api from "./api";

const projectService = {
  getAll: async () => (await api.get("/projects")).data,

  getById: async (id) => (await api.get(`/projects/${id}`)).data,

  create: async (project) => (await api.post("/projects", project)).data,

  update: async (id, project) =>
    (await api.put(`/projects/${id}`, project)).data,

  remove: async (id) => (await api.delete(`/projects/${id}`)).data,

  addMember: async (id, email) =>
    (await api.post(`/projects/${id}/members`, { email })).data,

  getAnalytics: async (id) =>
    (await api.get(`/projects/${id}/analytics`)).data,


  getPublicProject: async (token) =>
    (await api.get(`/projects/public/${token}`)).data,

  updateVisibility: async (id, isPublic) =>
    (await api.patch(`/projects/${id}/visibility`, { isPublic })).data,

};

export default projectService;
