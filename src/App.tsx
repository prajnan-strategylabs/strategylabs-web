import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppLayout } from "./components/AppLayout";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { StrategyLab } from "./pages/StrategyLab";
import { Signals } from "./pages/Signals";
import { Notifications } from "./pages/Notifications";
import { Blog } from "./pages/Blog";
import { Disclosures } from "./pages/Disclosures";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { AdminLayout } from "./components/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminBlogs } from "./pages/admin/AdminBlogs";
import { AdminBlogEditor } from "./pages/admin/AdminBlogEditor";
import { AdminWaitlist } from "./pages/admin/AdminWaitlist";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { AdminStrategyTracker } from "./pages/admin/AdminStrategyTracker";
import { SplashScreen } from "./components/SplashScreen";
import { BackButtonHandler } from "./components/BackButtonHandler";

function App() {
  return (
    <AuthProvider>
      <SplashScreen />
      <BrowserRouter>
        <BackButtonHandler />
        <Routes>
          {/* Public Landing & Auth routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/disclosures" element={<Disclosures />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Authenticated Application routes (AppLayout wrapped) */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lab" element={<StrategyLab />} />
            <Route path="/signals" element={<Signals />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Admin panel routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="blogs/new" element={<AdminBlogEditor />} />
            <Route path="blogs/:slug" element={<AdminBlogEditor />} />
            <Route path="waitlist" element={<AdminWaitlist />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="tracker" element={<AdminStrategyTracker />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
