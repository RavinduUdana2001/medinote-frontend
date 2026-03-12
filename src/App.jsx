import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";

import LandingPage from "./pages/public/LandingPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Onboarding from "./pages/auth/Onboarding";

import { getToken, getUser } from "./utils/authStorage";

function PrivateRoute({ children }) {
  const token = getToken();
  const user = getUser();
  const location = useLocation();

  if (!token) return <Navigate to="/" replace />;

  if (!user?.onboarding_completed && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const token = getToken();
  const user = getUser();

  if (!token) return children;
  if (user && !user.onboarding_completed) return <Navigate to="/onboarding" replace />;
  return <Navigate to="/app" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* âœ… Public landing */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />

        {/* âœ… Auth */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/verify"
          element={
            <PublicRoute>
              <VerifyEmail />
            </PublicRoute>
          }
        />

        {/* âœ… After OTP: details page */}
        <Route
          path="/onboarding"
          element={
            <PrivateRoute>
              <Onboarding />
            </PrivateRoute>
          }
        />

        {/* âœ… App */}
        <Route
          path="/app/*"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

