// src/App.js
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import Services from "./components/Services";
import AboutUs from "./components/AboutUs";
import UserTrackPickup from "./pages/UserTrackPickup";
import PickupTrackUser from "./pages/PickupTrackUser";
import Contact from "./components/Contact";
import ChatBot from "./components/ChatBot";
import PickupOTPVerify from "./components/PickupOTPVerify";
import UserSupport from "./components/UserSupport";
import Schedule from './components/Schedule';
import Analytics from './components/Analytics';
import PickupProfile from "./components/PickupProfile";
import PickupPersonSupport from './components/PickupPersonSupport';
import Footer from "./components/Footer";
import ProtectedRoute from "./ProtectedRoute";
import CopyrightBar from "./components/CopyrightBar";
import AdminRoute from "./AdminRoute";
import "./css/App.css";

// Lazy loaded components
const PickupDashboard = lazy(() => import("./components/PickupDashboard"));
const PickupRequestManagement = lazy(() => import("./components/PickupRequestManagement"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const Home = lazy(() => import("./components/Home"));
const Login = lazy(() => import("./components/Login"));
const Register = lazy(() => import("./components/Register"));
const UserDashboard = lazy(() => import("./components/UserDashboard"));
const Profile = lazy(() => import("./components/Profile"));
const CertificateGenerator = lazy(() => import("./components/CertificateGenerator"));
const EditProfile = lazy(() => import("./components/EditProfile"));
const RequestForm = lazy(() => import("./components/RequestForm"));
const RequestHistory = lazy(() => import("./components/RequestHistory"));
const UserReport = lazy(() => import("./components/UserReport"));
const Admin = lazy(() => import("./components/Admin"));
const NotFound = lazy(() => import("./components/NotFound"));

function ConditionalFooter() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  return isHomePage ? <Footer /> : null;
}

export default function App() {
  return (
    <div className="app-container">
      <Router>
        <NavBar />
        <ChatBot />

        <main className="main-content">
          <Suspense
            fallback={
              <div style={{ textAlign: "center", marginTop: "50px", fontSize: "18px", color: "#0b8457" }}>
                🌱 Loading EcoSaathi...
              </div>
            }
          >
            <Routes>
              <Route path="/pickup/support/:id" element={<PickupPersonSupport />} />

               {/* Schedule Route */}
        <Route path="/pickup/schedule/:id" element={<Schedule />} />
        
        {/* Analytics Route */}
        <Route path="/pickup/analytics/:id" element={<Analytics />} />

            <Route path="/support/:id" element={<ProtectedRoute><UserSupport /></ProtectedRoute>} />
            
              {/* PICKUP PERSON ROUTES */}
              <Route path="/pickup-dashboard/:id" element={<ProtectedRoute><PickupDashboard /></ProtectedRoute>} />
              <Route path="/pickup-profile/:id" element={<ProtectedRoute><PickupProfile /></ProtectedRoute>} />

              {/* Request Management (TABLE PAGE) */}
              <Route path="/pickup/requests/:id" element={<ProtectedRoute><PickupRequestManagement /></ProtectedRoute>} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
<Route path="/pickup/verify-otp/:requestId" element={<PickupOTPVerify />} />


              {/* USER ROUTES */}
              <Route path="/dashboard/:id" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
              <Route path="/request/submit/:id" element={<ProtectedRoute><RequestForm /></ProtectedRoute>} />
              <Route path="/profile/:id/history" element={<ProtectedRoute><RequestHistory /></ProtectedRoute>} />
              <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/certificate/:id" element={<ProtectedRoute><CertificateGenerator /></ProtectedRoute>} />
              <Route path="/profile/:id/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/report/:id" element={<ProtectedRoute><UserReport /></ProtectedRoute>} />

              {/* ADMIN */}
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

              {/* TRACKING ROUTES */}
              <Route path="/track/pickup/:requestId" element={<ProtectedRoute><UserTrackPickup /></ProtectedRoute>} />
              <Route path="/track/user/:requestId" element={<ProtectedRoute><PickupTrackUser /></ProtectedRoute>} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </Suspense>
        </main>

        <ConditionalFooter />
        <CopyrightBar />
      </Router>
    </div>
  );
}
