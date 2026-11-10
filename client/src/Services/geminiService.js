
import api from "./api";

const geminiService = {
  chat: async (message, history = []) => {
    const response = await api.post("/gemini/chat", {
      message,
      history,
    });

    return response.data;
  },
};

export default geminiService;
