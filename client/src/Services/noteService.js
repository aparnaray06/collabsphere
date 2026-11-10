
import api from "./api";

const noteService = {
  getAll: async () => (await api.get("/notes")).data,
  create: async (note) => (await api.post("/notes", note)).data,
  update: async (id, note) => (await api.put(`/notes/${id}`, note)).data,
  remove: async (id) => (await api.delete(`/notes/${id}`)).data,
};

export default noteService;
