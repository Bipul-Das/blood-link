import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";

// Page Imports
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contribute from "./pages/Contribute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import DonorDashboard from "./pages/DonorDashboard";
import WorkDashboardWrapper from "./pages/WorkDashboardWrapper";
import CreateRequest from "./pages/CreateRequest";
import CollectorDashboard from "./pages/CollectorDashboard";
import Community from "./pages/Community";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contribute" element={<Contribute />} />
        <Route path="/community" element={<Community />} />

        {/* AUTH ROUTES */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* PROTECTED ROUTES */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/donor"
          element={
            <ProtectedRoute>
              <DonorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/work"
          element={
            <ProtectedRoute>
              <WorkDashboardWrapper />
            </ProtectedRoute>
          }
        />

        {/* EMERGENCY REQUEST ROUTE */}
        <Route
          path="/create-request"
          element={
            <ProtectedRoute>
              <CreateRequest />
            </ProtectedRoute>
          }
        />

        {/* Collector Route - Restricts access to 'collector' role only */}
        <Route
          path="/collector-dashboard"
          element={
            <ProtectedRoute role="collector">
              <CollectorDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
