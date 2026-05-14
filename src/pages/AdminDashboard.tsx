import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminDashboardTab from '@/components/admin/AdminDashboardTab';
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import AdminCategoriesTab from '@/components/admin/AdminCategoriesTab';
import AdminPlansTab from '@/components/admin/AdminPlansTab';
import AdminBannersTab from '@/components/admin/AdminBannersTab';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useState } from 'react';

const AdminDashboard: React.FC = () => {
  const { isAdmin, loading } = useAdminAccess();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="dashboard" className="mt-0">
              <AdminDashboardTab />
            </TabsContent>
            <TabsContent value="users" className="mt-0">
              <AdminUsersTab />
            </TabsContent>
            <TabsContent value="categories" className="mt-0">
              <AdminCategoriesTab />
            </TabsContent>
            <TabsContent value="plans" className="mt-0">
              <AdminPlansTab />
            </TabsContent>
            <TabsContent value="banners" className="mt-0">
              <AdminBannersTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
