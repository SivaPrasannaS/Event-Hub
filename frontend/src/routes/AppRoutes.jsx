import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import ProtectedRoute from '../components/rbac/ProtectedRoute';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import EventListPage from '../features/events/EventListPage';
import EventDetailPage from '../features/events/EventDetailPage';
import EventFormPage from '../features/events/EventFormPage';
import VenueListPage from '../features/venues/VenueListPage';
import VenueFormPage from '../features/venues/VenueFormPage';
import MediaLibraryPage from '../features/media/MediaLibraryPage';
import CategoryManagerPage from '../features/categories/CategoryManagerPage';
import UserManagementPage from '../features/users/UserManagementPage';
import AnalyticsDashboard from '../features/analytics/AnalyticsDashboard';

function AppLayout() {
  return (
    <>
      <Navbar />
      <div className="container-fluid px-3 px-lg-4 py-4 eventhub-page">
        <div className="row g-4">
          <div className="col-lg-3 col-xl-2 d-none d-lg-block">
            <Sidebar />
          </div>
          <div className="col-12 col-lg-9 col-xl-10">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

function UnauthorizedPage() {
  return (
    <div className="container py-5 eventhub-auth-wrap">
      <div className="row justify-content-center w-100">
        <div className="col-lg-5">
          <div className="eventhub-card eventhub-auth-card p-4 text-center page-enter">
            <h1 className="h3 mb-3">Access Restricted</h1>
            <p className="eventhub-page-lead mx-auto">You are not authorized to view this page with the current account permissions.</p>
            <div className="alert alert-warning mb-0">Request elevated access or return to a permitted section.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/events" replace />} />
        <Route path="events" element={<EventListPage />} />
        <Route path="events/new" element={<ProtectedRoute permission="event:create"><EventFormPage /></ProtectedRoute>} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="events/:id/edit" element={<ProtectedRoute><EventFormPage /></ProtectedRoute>} />
        <Route path="venues" element={<ProtectedRoute><VenueListPage /></ProtectedRoute>} />
        <Route path="venues/new" element={<ProtectedRoute permission="venue:manage"><VenueFormPage /></ProtectedRoute>} />
        <Route path="media" element={<ProtectedRoute><MediaLibraryPage /></ProtectedRoute>} />
        <Route path="categories" element={<ProtectedRoute permission="category:manage"><CategoryManagerPage /></ProtectedRoute>} />
        <Route path="analytics" element={<ProtectedRoute permission="analytics:view"><AnalyticsDashboard /></ProtectedRoute>} />
        <Route path="admin/users" element={<ProtectedRoute permission="user:manage"><UserManagementPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/events" replace />} />
    </Routes>
  );
}

export default AppRoutes;
