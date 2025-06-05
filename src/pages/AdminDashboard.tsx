
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAccessControl } from '@/hooks/useAccessControl';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import BannersManagement from '@/components/admin/BannersManagement';
import ProfileVerifications from '@/components/admin/ProfileVerifications';
import AppSettings from '@/components/admin/AppSettings';
import AdminTeam from '@/components/admin/AdminTeam';
import SupportTickets from '@/components/admin/SupportTickets';
import AdminOverview from '@/components/admin/AdminOverview';

const AdminDashboard = () => {
  const { hasAccess, loading } = useAccessControl({ requiredUserType: 'helladmin' });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/banners" element={<BannersManagement />} />
            <Route path="/verifications" element={<ProfileVerifications />} />
            <Route path="/settings" element={<AppSettings />} />
            <Route path="/team" element={<AdminTeam />} />
            <Route path="/support" element={<SupportTickets />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
