import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './component/common/Navbar';
import FooterComponent from './component/common/Footer';
import { ProtectedRoute, AdminRoute } from './service/guard';
import ApiService from './service/ApiService';
import ChatSupport from './component/common/ChatSupport';
import ScrollToTopBtn from './component/common/ScrollToTopBtn';
import CompareBar from './component/common/CompareBar';
import { ToastProvider } from './component/common/Toast';
import { CompareProvider } from './component/common/CompareContext';

// Public pages — eager loaded
import HomePage              from './component/home/HomePage';
import AllRoomsPage          from './component/booking_rooms/AllRoomsPage';
import ServicePage           from './component/service/ServicePage';
import FindBookingPage       from './component/booking_rooms/FindBookingPage';
import PromoPage             from './component/promo/PromoPage';
import GalleryPage           from './component/gallery/GalleryPage';
import ContactPage           from './component/contact/ContactPage';
import NotFoundPage          from './component/common/NotFoundPage';

// Auth / user — lazy
const LoginPage              = lazy(() => import('./component/auth/LoginPage'));
const RegisterPage           = lazy(() => import('./component/auth/RegisterPage'));
const ForgotPasswordPage     = lazy(() => import('./component/auth/ForgotPasswordPage'));
const ResetPasswordPage      = lazy(() => import('./component/auth/ResetPasswordPage'));
const RoomDetailsBookingPage = lazy(() => import('./component/booking_rooms/RoomDetailsPage'));
const ProfilePage            = lazy(() => import('./component/profile/ProfilePage'));
const EditProfilePage        = lazy(() => import('./component/profile/EditProfilePage'));
const VNPayReturnPage        = lazy(() => import('./component/payment/VNPayReturnPage'));

// Staff — lazy
const StaffLayout            = lazy(() => import('./component/staff/StaffLayout'));

// Admin — lazy
const AdminLayout            = lazy(() => import('./component/admin/AdminLayout'));
const AdminPage              = lazy(() => import('./component/admin/AdminPage'));
const ManageRoomPage         = lazy(() => import('./component/admin/ManageRoomPage'));
const EditRoomPage           = lazy(() => import('./component/admin/EditRoomPage'));
const AddRoomPage            = lazy(() => import('./component/admin/AddRoomPage'));
const ManageBookingsPage     = lazy(() => import('./component/admin/ManageBookingsPage'));
const EditBookingPage        = lazy(() => import('./component/admin/EditBookingPage'));
const ManageReviewsPage      = lazy(() => import('./component/admin/ManageReviewsPage'));
const ManageUsersPage        = lazy(() => import('./component/admin/ManageUsersPage'));
const RevenuePage            = lazy(() => import('./component/admin/RevenuePage'));
const ManageServicesPage     = lazy(() => import('./component/admin/ManageServicesPage'));
const ManageStaffPage        = lazy(() => import('./component/admin/ManageStaffPage'));
const TransactionHistoryPage = lazy(() => import('./component/admin/TransactionHistoryPage'));

const LOADING = <div className="page-loading"><div className="page-loading-spinner" /></div>;

// Staff site — limited portal
function StaffSite() {
  return (
    <Suspense fallback={LOADING}>
      <Routes>
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<AdminPage />} />
          <Route path="bookings" element={<ManageBookingsPage />} />
          <Route path="edit-booking/:bookingCode" element={<EditBookingPage />} />
          <Route path="customers" element={<ManageUsersPage />} />
          <Route path="transactions" element={<TransactionHistoryPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

// Admin site — own layout, no public Navbar/Footer
function AdminSite() {
  return (
    <Suspense fallback={LOADING}>
      <Routes>
        <Route path="/admin" element={<AdminRoute element={<AdminLayout />} />}>
          <Route index element={<AdminPage />} />
          <Route path="manage-rooms" element={<ManageRoomPage />} />
          <Route path="edit-room/:roomId" element={<EditRoomPage />} />
          <Route path="add-room" element={<AddRoomPage />} />
          <Route path="manage-bookings" element={<ManageBookingsPage />} />
          <Route path="edit-booking/:bookingCode" element={<EditBookingPage />} />
          <Route path="manage-reviews" element={<ManageReviewsPage />} />
          <Route path="manage-users" element={<ManageUsersPage />} />
          <Route path="revenue" element={<RevenuePage />} />
          <Route path="manage-services" element={<ManageServicesPage />} />
          <Route path="manage-staff" element={<ManageStaffPage />} />
          <Route path="transactions" element={<TransactionHistoryPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

// Public / user site — with Navbar, Footer, chat
function PublicSite() {
  return (
    <div className="App">
      <Navbar />
      <div className="content">
        <Suspense fallback={LOADING}>
          <Routes>
            <Route exact path="/home" element={<HomePage />} />
            <Route exact path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/rooms" element={<AllRoomsPage />} />
            <Route path="/find-booking" element={<FindBookingPage />} />
            <Route path="/services" element={<ServicePage />} />
            <Route path="/promotions" element={<PromoPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/vnpay-return" element={<VNPayReturnPage />} />
            <Route path="/room-details-book/:roomId" element={<RoomDetailsBookingPage />} />
            <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
            <Route path="/edit-profile" element={<ProtectedRoute element={<EditProfilePage />} />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
      <ChatSupport />
      <ScrollToTopBtn />
      <CompareBar />
      <FooterComponent />
    </div>
  );
}

// Route splitter — must be inside BrowserRouter to use useLocation
function AppShell() {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return <AdminSite />;
  if (location.pathname.startsWith("/staff")) return <StaffSite />;
  if (ApiService.isAdmin()) return <Navigate to="/admin" replace />;
  if (ApiService.isStaff()) return <Navigate to="/staff" replace />;
  return <PublicSite />;
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CompareProvider>
          <AppShell />
        </CompareProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
