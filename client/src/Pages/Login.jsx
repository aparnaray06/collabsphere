
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { ArrowRight, Layers3, ShieldCheck, Users } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to log in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <Link to="/" className="auth-logo">
          <Layers3 size={27} />
          <span>CollabSphere</span>
        </Link>

        <div className="auth-showcase-content">
          <span className="auth-tag">YOUR TEAM. ONE WORKSPACE.</span>
          <h1>
            Build together.
            <br />
            <span>Achieve more.</span>
          </h1>
          <p>
            Bring your projects, ideas and team collaboration
            into one simple workspace.
          </p>

          <div className="auth-feature-list">
            <div>
              <Users size={19} />
              <span>Collaborate with your team</span>
            </div>
            <div>
              <Layers3 size={19} />
              <span>Organize projects and notes</span>
            </div>
            <div>
              <ShieldCheck size={19} />
              <span>Keep your work organized</span>
            </div>
          </div>
        </div>

        <div className="auth-showcase-bottom">
          <span>Made for people who build together.</span>
          <span>© 2026 CollabSphere</span>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-wrapper">
          <div className="auth-mobile-logo">
            <Layers3 size={25} />
            <span>CollabSphere</span>
          </div>

          <div className="auth-heading">
            <span className="auth-welcome">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your details to access your workspace.</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              autoComplete="email"
              required
            />

            <div className="auth-password-label">
              <label htmlFor="password">Password</label>
            </div>

            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
