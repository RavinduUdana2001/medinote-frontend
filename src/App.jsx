import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

import LandingPage from "./pages/public/LandingPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Onboarding from "./pages/auth/Onboarding";

import { getToken } from "./utils/authStorage";

function PrivateRoute({ children }) {
  const token = getToken();
  return token ? children : <Navigate to="/" replace />;
}

function PublicRoute({ children }) {
  const token = getToken();
  return token ? <Navigate to="/app" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Public landing */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />

        {/* ✅ Auth */}
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

        {/* ✅ After OTP: details page */}
        <Route
          path="/onboarding"
          element={
            <PrivateRoute>
              <Onboarding />
            </PrivateRoute>
          }
        />

        {/* ✅ App */}
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