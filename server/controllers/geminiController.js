
import { GoogleGenAI } from "@google/genai";

// Create Gemini client
function getAIClient() {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error("Gemini API key is not configured");
    error.status = 503;
    throw error;
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

// Reusable function to generate AI content
async function generateAIText(prompt) {
  const ai = getAIClient();

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
  });

  return response.text || "Unable to generate content.";
}

// Existing chat endpoint
export async function chatWithGemini(req, res, next) {
  try {
    const { message, history = [] } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        message: "Please enter a message",
      });
    }

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

    const ai = getAIClient();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction:
          "You are CollabSphere AI, a helpful assistant for projects, teamwork, planning, notes, and productivity. Give clear, practical answers.",
      },
    });

    return res.json({
      reply: response.text || "I could not generate a response.",
    });
  } catch (error) {
    next(error);
  }
}

// 1. Explain code, notes, or other content
export async function explainContent(req, res, next) {
  try {
    const { content } = req.body;

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        message: "Please provide content to explain",
      });
    }

    const explanation = await generateAIText(`
      You are CollabSphere AI, a helpful programming assistant.

      Explain the following content in simple language.
      If it is code, explain:
      1. What the code does
      2. How it works
      3. Important functions or concepts
      4. A simple example if useful

      Content:
      ${content.slice(0, 12000)}
    `);

    return res.json({ explanation });
  } catch (error) {
    next(error);
  }
}

// 2. Generate project documentation
export async function generateDocs(req, res, next) {
  try {
    const {
      projectName,
      description,
      techStack,
      content,
    } = req.body;

    if (
      ![projectName, description, techStack, content].some(
        (value) => typeof value === "string" && value.trim()
      )
    ) {
      return res.status(400).json({
        message: "Please provide project details or content",
      });
    }

    const documentation = await generateAIText(`
      You are a technical documentation writer.

      Generate clear and well-structured project documentation
      in Markdown format.

      Project name: ${projectName || "Not provided"}
      Description: ${description || "Not provided"}
      Tech stack: ${techStack || "Not provided"}
      Additional project content:
      ${(content || "Not provided").slice(0, 12000)}

      Include:
      - Project overview
      - Main features
      - Technologies used
      - Project structure, if information is available
      - How the project works
      - Setup instructions, if information is available

      Do not invent project details that were not provided.
    `);

    return res.json({ documentation });
  } catch (error) {
    next(error);
  }
}

// 3. Generate README.md content
export async function generateReadme(req, res, next) {
  try {
    const {
      projectName,
      description,
      techStack,
      content,
    } = req.body;

    if (
      ![projectName, description, techStack, content].some(
        (value) => typeof value === "string" && value.trim()
      )
    ) {
      return res.status(400).json({
        message: "Please provide project details or content",
      });
    }

    const readme = await generateAIText(`
      You are a professional README.md writer.

      Create a complete README file in Markdown format.

      Project name: ${projectName || "Not provided"}
      Description: ${description || "Not provided"}
      Tech stack: ${techStack || "Not provided"}
      Additional project content:
      ${(content || "Not provided").slice(0, 12000)}

      Include these sections where information is available:
      - Project title and overview
      - Features
      - Tech stack
      - Installation and setup
      - Environment variables (use placeholders, never invent secrets)
      - How to run the project
      - Folder structure, if available
      - Future improvements

      Do not invent commands, links, or project features.
    `);

    return res.json({ readme });
  } catch (error) {
    next(error);
  }
}


export async function suggestImprovements(req, res, next) {
  try {
    const { content } = req.body;

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        message: "Please provide note content",
      });
    }

    const reply = await generateAIText(`
      You are CollabSphere AI.

      Review the following project note and suggest improvements.

      Include:
      1. What is already good
      2. What can be improved
      3. Missing important points
      4. Practical suggestions

      Keep your suggestions simple and actionable.

      Note content:
      ${content.slice(0, 12000)}
    `);

    return res.json({ reply });
  } catch (error) {
    next(error);
  }
}
