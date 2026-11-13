
import api from "./api";

const fileService = {
  getAll: async () => (await api.get("/files")).data,

  upload: async (file, project) => {
    const formData = new FormData();

    formData.append("file", file);

    if (project) {
      formData.append("project", project);
    }

    return (
      await api.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    ).data;
  },

  preview: async (id) =>
    (await api.get(`/files/${id}/preview`)).data,

  explain: async (id) =>
    (await api.post(`/files/${id}/explain`)).data,

  remove: async (id) =>
    (await api.delete(`/files/${id}`)).data,
};

export default fileService;
