
import { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import geminiService from "../Services/geminiService";

export default function AIChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const text = message.trim();
    if (!text || loading) return;

    const updatedMessages = [...messages, { role: "user", text }];

    setMessages(updatedMessages);
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const history = messages.map((item) => ({
        role: item.role,
        text: item.text,
      }));

      const response = await geminiService.chat(text, history);

      setMessages([
        ...updatedMessages,
        {
          role: "model",
          text: response.reply,
        },
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to connect to AI. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR AI ASSISTANT</p>
          <h1>CollabSphere AI</h1>
          <p>Ask questions, plan projects and brainstorm ideas.</p>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <Bot size={38} />
              <h2>How can I help you today?</h2>
              <p>Ask me about projects, coding, teamwork or productivity.</p>
            </div>
          )}

          {messages.map((item, index) => (
            <div
              className={`chat-message ${item.role === "user" ? "user-message" : "ai-message"}`}
              key={index}
            >
              {item.role === "user" ? <User size={18} /> : <Bot size={18} />}
              <p>{item.text}</p>
            </div>
          ))}

          {loading && <p className="chat-loading">AI is thinking...</p>}
          {error && <p className="error-message">{error}</p>}
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Message CollabSphere AI..."
            aria-label="Your message"
            disabled={loading}
          />

          <button
            type="submit"
            aria-label="Send message"
            disabled={loading || !message.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </section>
  );
}
