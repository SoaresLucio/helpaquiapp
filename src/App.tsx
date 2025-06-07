
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import NewPassword from './pages/NewPassword';
import Index from './pages/Index';
import FreelancerPlans from './pages/FreelancerPlans';
import SolicitantePlans from './pages/SolicitantePlans';
import Jobs from './pages/Jobs';
import Chat from './pages/Chat';
import AIChat from './pages/AIChat';
import Notes from './pages/Notes';
import UserProfilePage from './pages/UserProfilePage';
import PaymentPage from './pages/PaymentPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import AdminSync from './pages/AdminSync';

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/freelancer-plans" element={<ProtectedRoute requiredUserType="freelancer"><FreelancerPlans /></ProtectedRoute>} />
        <Route path="/solicitante-plans" element={<ProtectedRoute requiredUserType="solicitante"><SolicitantePlans /></ProtectedRoute>} />
        <Route path="/admin-sync" element={<ProtectedRoute><AdminSync /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
