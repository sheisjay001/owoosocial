import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import CreatePost from './pages/CreatePost';
import Inbox from './pages/Inbox';
import BrandSetup from './pages/BrandSetup';
import Brands from './pages/Brands';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Domains from './pages/Domains';
import Newsletters from './pages/Newsletters';
import Podcasts from './pages/Podcasts';
import Reports from './pages/Reports';
import Billing from './pages/Billing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="create" element={<CreatePost />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="brands" element={<Brands />} />
            <Route path="brands/new" element={<BrandSetup />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="newsletters" element={<Newsletters />} />
            <Route path="podcasts" element={<Podcasts />} />
            <Route path="reports" element={<Reports />} />
            <Route path="billing" element={<Billing />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="domains" element={<Domains />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
