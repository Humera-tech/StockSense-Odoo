import { Navigate, Route, Routes } from 'react-router-dom'

import AppLayout from '../components/layout/AppLayout'
import Landing from '../pages/Landing'
import Login from '../pages/auth/Login'
import Signup from '../pages/auth/Signup'
import ForgotPassword from '../pages/auth/ForgotPassword'
import VerifyOTP from '../pages/auth/VerifyOTP'
import Dashboard from '../pages/Dashboard'
import Receipts from '../pages/operations/Receipts'
import Deliveries from '../pages/operations/Deliveries'
import OperationPage from '../pages/operations/OperationPage'
import Products from '../pages/products/Products'
import Warehouse from '../pages/settings/Warehouse'
import Locations from '../pages/settings/Locations'
import ProtectedRoute from './ProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />

      {/* Protected application */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Operations */}
        <Route path="/receipts" element={<Receipts />} />
        <Route path="/receipts/new" element={<OperationPage type="IN" />} />

        <Route path="/deliveries" element={<Deliveries />} />
        <Route path="/deliveries/new" element={<OperationPage type="OUT" />} />

        <Route path="/operations/:id" element={<OperationPage />} />

        {/* Stock */}
        <Route path="/stock" element={<Products />} />

        {/* Settings */}
        <Route path="/settings/warehouses" element={<Warehouse />} />
        <Route path="/settings/locations" element={<Locations />} />
      </Route>

      {/* Unknown URL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes