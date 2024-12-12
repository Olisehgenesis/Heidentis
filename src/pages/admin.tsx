// src/pages/admin.tsx
import { AdminProvider, AdminLogin, useAdmin } from '../components/AdminAuth';
import InstitutionManagement from '../components/InstitutionManagement';

export default function AdminPage() {
  return (
    <AdminProvider>
      <AdminContent />
    </AdminProvider>
  );
}

const AdminContent = () => {
  const { isAdmin } = useAdmin();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Institution Management System
      </h1>
      {isAdmin ? <InstitutionManagement /> : <AdminLogin />}
    </div>
  );
};