import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import KitchenDashboard from "./pages/KitchenDashboard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ManageStalls from "./pages/ManageStalls";
import ManageTables from "./pages/ManageTables";
import Menu from "./pages/Menu";
import Order from "./pages/Order";
import OrderTracking from "./pages/OrderTracking";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

function RoleDashboard() {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === "kitchen") {
    return <Navigate to="/kitchen" replace />;
  }

  return <Navigate to="/customer" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Role Redirect */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleDashboard />
              </ProtectedRoute>
            }
          />

          {/* Customer Routes */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute roles={["customer"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu"
            element={
              <ProtectedRoute roles={["customer"]}>
                <Menu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order"
            element={
              <ProtectedRoute roles={["customer"]}>
                <Order />
              </ProtectedRoute>
            }
          />
          <Route
            path="/track"
            element={
              <ProtectedRoute roles={["customer"]}>
                <OrderTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-tracking"
            element={
              <ProtectedRoute roles={["customer"]}>
                <OrderTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={["customer"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Kitchen Routes */}
          <Route
            path="/kitchen"
            element={
              <ProtectedRoute roles={["kitchen", "admin"]}>
                <KitchenDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stalls"
            element={
              <ProtectedRoute roles={["admin"]}>
                <ManageStalls />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tables"
            element={
              <ProtectedRoute roles={["admin"]}>
                <ManageTables />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
