import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./Components/ProtectedRoute";
import MinLayout from "./Layouts/MinLayout";
import { useAuth } from "./Context/AuthContext";

import PublicProject from "./Pages/PublicProjects";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";
import Projects from "./Pages/Projects";
import ProjectDetails from "./Pages/ProjectDetails";
import Notes from "./Pages/Notes";
import Files from "./Pages/Files";
import AIChat from "./Pages/AIChat";
import Profile from "./Pages/Profile";
import NotFound from "./Pages/NotFound";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/login"}
            replace
          />
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/public/projects/:token"
        element={<PublicProject />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<MinLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/files" element={<Files />} />
          <Route path="/ai-chat" element={<AIChat />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
