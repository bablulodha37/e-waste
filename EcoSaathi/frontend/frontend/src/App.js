// src/App.js
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import "./css/App.css";

// Lazy load components
const Home = lazy(() => import("./components/Home"));
const Login = lazy(() => import("./components/Login"));
const Register = lazy(() => import("./components/Register"));

// Lazy load UserDashboard
const UserDashboard = lazy(() => import("./components/UserDashboard")); 

const Profile = lazy(() => import("./components/Profile"));
const EditProfile = lazy(() => import("./components/EditProfile"));
// Lazy load RequestForm and RequestHistory for dedicated pages
const RequestForm = lazy(() => import("./components/RequestForm"));
const RequestHistory = lazy(() => import("./components/RequestHistory"));

const Admin = lazy(() => import("./components/Admin"));
const NotFound = lazy(() => import("./components/NotFound")); // 404 page

export default function App() {
  return (
    <div className="app-container"> 
      <Router>
        <NavBar />

        <main className="main-content"> 
          <Suspense
            fallback={
              <div
                style={{
                  textAlign: "center",
                  marginTop: "50px", 
                  fontSize: "18px",
                  color: "#0b8457",
                }}
              >
                🌱 Loading EcoSaathi...
              </div>
            }
          >
            <Routes>
              {/* === 🌍 Public Routes === */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/services" element={<Home />} />
              <Route path="/about" element={<Home />} />
              <Route path="/contact" element={<Home />} />

              {/* === 🔒 User Protected Routes === */}
              
              {/* 1. User Dashboard */}
              <Route
                path="/dashboard/:id"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />

              {/* 2. Dedicated Route for submitting a Request */}
              <Route
                path="/request/submit/:id"
                element={
                  <ProtectedRoute>
                    <RequestForm />
                  </ProtectedRoute>
                }
              />
              
              {/* 3. ✅ FIX HERE: Dedicated Route for Request History */}
              <Route path="/profile/:id/history" element={
                  <ProtectedRoute>
                    <RequestHistory />
                  </ProtectedRoute>
                }
              />

              {/* 4. Profile Details */}
              <Route
                path="/profile/:id"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                }
              />

              {/* === 🛠️ Admin Protected Route === */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />

              {/* === ❌ 404 Not Found === */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </Router>
    </div>
  );
}