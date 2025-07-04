import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "../components/AdminDashboard";
import UsersPage from "../pages/UsersPage";
import TripsPage from "../pages/TripsPage";
import ChartsPage from "../pages/ChartsPage";
import DestinationsPage from "../pages/DestinationsPage";

export default function AdminRoutes() {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="trips" element={<TripsPage />} />
      <Route path="charts" element={<ChartsPage />} />
      <Route path="destinations" element={<DestinationsPage />} />
    </Routes>
  );
}
