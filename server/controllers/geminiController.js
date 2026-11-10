
import { GoogleGenAI } from "@google/genai";

export async function chatWithGemini(req, res, next) {
  try {
    const { message, history = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        message: "Please enter a message",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        message: "Gemini API key is not configured",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              ["user", "model"].includes(item.role) &&
              typeof item.text === "string"
          )
          .slice(-10)
      : [];

    const contents = [
      ...safeHistory.map((item) => ({
        role: item.role,
        parts: [{ text: item.text.slice(0, 4000) }],
      })),
      {
        role: "user",
        parts: [{ text: message.trim().slice(0, 8000) }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction:
          "You are CollabSphere AI, a helpful assistant for projects, teamwork, planning, notes, and productivity. Give clear, practical answers.",
      },
    });

    res.json({
      reply: response.text || "I could not generate a response.",
    });
  } catch (error) {
    next(error);
  }
}
