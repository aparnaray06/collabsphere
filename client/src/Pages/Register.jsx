
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { ArrowRight, Layers3, ShieldCheck, Users } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account");
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
          <span className="auth-tag">START SOMETHING GREAT</span>
          <h1>
            Great ideas
            <br />
            <span>start together.</span>
          </h1>
          <p>
            Create your workspace, invite your team and turn
            your ideas into meaningful projects.
          </p>

          <div className="auth-feature-list">
            <div>
              <Users size={19} />
              <span>Work together with your team</span>
            </div>
            <div>
              <Layers3 size={19} />
              <span>Manage everything in one place</span>
            </div>
            <div>
              <ShieldCheck size={19} />
              <span>Your workspace, your control</span>
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
            <span className="auth-welcome">GET STARTED</span>
            <h2>Create your account</h2>
            <p>Fill in your details to create your workspace account.</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />

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

            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
