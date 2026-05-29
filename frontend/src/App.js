import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './component/common/Navbar';
import FooterComponent from './component/common/Footer';
import { ProtectedRoute, AdminRoute } from './service/guard';
import ChatSupport from './component/common/ChatSupport';

const LoginPage             = lazy(() => import('./component/auth/LoginPage'));
const RegisterPage          = lazy(() => import('./component/auth/RegisterPage'));
const ForgotPasswordPage    = lazy(() => import('./component/auth/ForgotPasswordPage'));
const ResetPasswordPage     = lazy(() => import('./component/auth/ResetPasswordPage'));
const HomePage              = lazy(() => import('./component/home/HomePage'));
const AllRoomsPage          = lazy(() => import('./component/booking_rooms/AllRoomsPage'));
const RoomDetailsBookingPage = lazy(() => import('./component/booking_rooms/RoomDetailsPage'));
const FindBookingPage       = lazy(() => import('./component/booking_rooms/FindBookingPage'));
const AdminPage             = lazy(() => import('./component/admin/AdminPage'));
const ManageRoomPage        = lazy(() => import('./component/admin/ManageRoomPage'));
const EditRoomPage          = lazy(() => import('./component/admin/EditRoomPage'));
const AddRoomPage           = lazy(() => import('./component/admin/AddRoomPage'));
const ManageBookingsPage    = lazy(() => import('./component/admin/ManageBookingsPage'));
const EditBookingPage       = lazy(() => import('./component/admin/EditBookingPage'));
const ProfilePage           = lazy(() => import('./component/profile/ProfilePage'));
const EditProfilePage       = lazy(() => import('./component/profile/EditProfilePage'));
const VNPayReturnPage       = lazy(() => import('./component/payment/VNPayReturnPage'));
const ServicePage           = lazy(() => import('./component/service/ServicePage'));
const ManageChat            = lazy(() => import('./component/admin/ManageChat'));

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <div className="content">
          <Suspense fallback={<div className="page-loading"><div className="page-loading-spinner" /></div>}>
            <Routes>
              {/* Public Routes */}
              <Route exact path="/home" element={<HomePage />} />
              <Route exact path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/rooms" element={<AllRoomsPage />} />
              <Route path="/find-booking" element={<FindBookingPage />} />
              <Route path="/services" element={<ServicePage />} />

              {/* Protected Routes */}
              <Route path="/vnpay-return" element={<VNPayReturnPage />} />
              <Route path="/room-details-book/:roomId"
                element={<RoomDetailsBookingPage />}
              />
              <Route path="/profile"
                element={<ProtectedRoute element={<ProfilePage />} />}
              />
              <Route path="/edit-profile"
                element={<ProtectedRoute element={<EditProfilePage />} />}
              />
              {/* Admin Routes */}
              <Route path="/admin"
                element={<AdminRoute element={<AdminPage />} />}
              />
              <Route path="/admin/manage-rooms"
                element={<AdminRoute element={<ManageRoomPage />} />}
              />
              <Route path="/admin/edit-room/:roomId"
                element={<AdminRoute element={<EditRoomPage />} />}
              />
              <Route path="/admin/add-room"
                element={<AdminRoute element={<AddRoomPage />} />}
              />
              <Route path="/admin/manage-bookings"
                element={<AdminRoute element={<ManageBookingsPage />} />}
              />
              <Route path="/admin/edit-booking/:bookingCode"
                element={<AdminRoute element={<EditBookingPage />} />}
              />
              <Route path="/admin/chat" element={<ManageChat />} />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/home" />} />
            </Routes>
          </Suspense>
        </div>

        <ChatSupport />

        <FooterComponent />
      </div>
    </BrowserRouter>
  );
}

export default App;
