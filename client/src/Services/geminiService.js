
import api from "./api";

const geminiService = {
  chat: async (message, history = []) => {
    const response = await api.post("/gemini/chat", {
      message,
      history,
    });
    return response.data;
  },

  explain: async (content) => {
    const response = await api.post("/gemini/explain", {
      content,
    });
    return response.data;
  },

  generateDocs: async (projectDetails) => {
    const response = await api.post("/gemini/docs", projectDetails);
    return response.data;
  },

  generateReadme: async (projectDetails) => {
    const response = await api.post("/gemini/readme", projectDetails);
    return response.data;
  },

  suggestImprovements: async (content) => {
    const response = await api.post(
      "/gemini/suggest-improvements",
      { content }
    );
    return response.data;
  },
};

export default geminiService;
