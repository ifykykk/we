import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SigninPage from "./pages/SigninPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import GolivePage from "./pages/GolivePage";
import PrivateRoute from "./PrivateRoute";
import Dashboard from './Dashboard';
import Profile from "./pages/Profile";
// ...existing code...
import White from "./components/Whiteboard";
import ChatBot from "./components/ChatBot";
import SoulStation from './components/SoulStation';

// Booking Components
import BookingForm from './components/booking/BookingForm';
import MyBookings from './components/booking/MyBookings';
import AppointmentsPage from './components/AppointmentsPage';

// Accessibility
import { ThemeProvider } from "./contexts/ThemeContext";

// Admin Components
import AdminLogin from "./admin/pages/AdminLogin";
import AdminDashboardLayout from "./admin/pages/AdminDashboardLayout";
import AdminOverview from "./admin/pages/AdminOverview";
import FlaggedCases from "./admin/pages/FlaggedCases";
import Analytics from "./admin/pages/Analytics";

// Admin Booking Components
import CounsellorPendingBookings from './admin/pages/booking/CounsellorPendingBookings';
import CounsellorMyAppointments from './admin/pages/booking/CounsellorMyAppointments';
import CounsellorProfileSetup from './admin/pages/booking/CounsellorProfileSetup';

function App() {
  const [adminAuth, setAdminAuth] = useState<{token: string; admin: any} | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (token && adminData) {
      setAdminAuth({
        token,
        admin: JSON.parse(adminData)
      });
    }
  }, []);

  const handleAdminLogin = (token: string, admin: any) => {
    setAdminAuth({ token, admin });
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setAdminAuth(null);
  };
  
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Student Routes */}
          <Route path="/" element={<HomePage/>} />
          <Route path='/profileCreation' element={<Profile/>}/>
          <Route path="/sign-in" element={<SigninPage/>}/>
          <Route path="/sign-up" element={<SignupPage/>}/>

          <Route path="/dashboard" element={<PrivateRoute/>}>
            <Route path='chat' element={<ChatBot/>}/>
            <Route path="" element={<Dashboard />} />
            <Route path="profile" element={<ProfilePage/>}/>
            <Route path="golive" element={<GolivePage/>}/>
            <Route path="whiteboard" element={<White />}/>
            <Route path="SoulStation" element={<SoulStation />} />
            <Route path="book-appointment" element={<BookingForm />} />
            <Route path="my-appointments" element={<MyBookings />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route 
            path="/admin-login" 
            element={
              adminAuth ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <AdminLogin onLogin={handleAdminLogin} />
              )
            } 
          />
          
          <Route 
            path="/admin/dashboard" 
            element={
              adminAuth ? (
                <AdminDashboardLayout 
                  admin={adminAuth.admin} 
                  onLogout={handleAdminLogout} 
                />
              ) : (
                <Navigate to="/admin-login" replace />
              )
            }
          >
            <Route path="" element={<AdminOverview />} />
            <Route path="flagged-cases" element={<FlaggedCases />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="pending-bookings" element={<CounsellorPendingBookings />} />
            <Route path="my-appointments" element={<CounsellorMyAppointments />} />
            <Route path="counsellor-profile" element={<CounsellorProfileSetup />} />
            <Route path="all-bookings" element={<div>All Bookings Management (Coming Soon)</div>} />
            <Route path="counsellors" element={<div>Counsellors Management (Coming Soon)</div>} />
            <Route path="resources" element={<div>Resources Management (Coming Soon)</div>} />
            <Route path="peer-support" element={<div>Peer Support Oversight (Coming Soon)</div>} />
            <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<h1>Page Not Found</h1>}/>
        </Routes>

      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App;
