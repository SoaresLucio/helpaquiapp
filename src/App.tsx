
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import NewPassword from './pages/NewPassword';
import UserTypeSelection from './pages/UserTypeSelection';
import Index from './pages/Index';
import FreelancerPlans from './pages/FreelancerPlans';
import SolicitantePlans from './pages/SolicitantePlans';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import AdminSync from './pages/AdminSync';
import { SecurityProvider } from '@/components/SecurityProvider';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SecurityProvider>
          <Toaster />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/new-password" element={<NewPassword />} />
            <Route path="/user-type-selection" element={<UserTypeSelection />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/freelancer-plans" element={<ProtectedRoute requiredUserType="freelancer"><FreelancerPlans /></ProtectedRoute>} />
            <Route path="/solicitante-plans" element={<ProtectedRoute requiredUserType="solicitante"><SolicitantePlans /></ProtectedRoute>} />
            <Route path="/admin-sync" element={<ProtectedRoute><AdminSync /></ProtectedRoute>} />
          </Routes>
        </SecurityProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
