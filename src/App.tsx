import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppLayout } from "./components/AppLayout";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { SplashScreen } from "./components/SplashScreen";
import { BackButtonHandler } from "./components/BackButtonHandler";
import { Toaster } from "./components/Toaster";

const Dashboard = lazy(() => import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const StrategyLab = lazy(() => import("./pages/StrategyLab").then((m) => ({ default: m.StrategyLab })));
const Signals = lazy(() => import("./pages/Signals").then((m) => ({ default: m.Signals })));
const Notifications = lazy(() => import("./pages/Notifications").then((m) => ({ default: m.Notifications })));
const Blog = lazy(() => import("./pages/Blog").then((m) => ({ default: m.Blog })));
const Disclosures = lazy(() => import("./pages/Disclosures").then((m) => ({ default: m.Disclosures })));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy").then((m) => ({ default: m.PrivacyPolicy })));
const AdminLayout = lazy(() => import("./components/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const AdminBlogs = lazy(() => import("./pages/admin/AdminBlogs").then((m) => ({ default: m.AdminBlogs })));
const AdminBlogEditor = lazy(() => import("./pages/admin/AdminBlogEditor").then((m) => ({ default: m.AdminBlogEditor })));
const AdminWaitlist = lazy(() => import("./pages/admin/AdminWaitlist").then((m) => ({ default: m.AdminWaitlist })));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers").then((m) => ({ default: m.AdminUsers })));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings").then((m) => ({ default: m.AdminSettings })));
const AdminStrategyTracker = lazy(() => import("./pages/admin/AdminStrategyTracker").then((m) => ({ default: m.AdminStrategyTracker })));

function RouteFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="h-6 w-6 rounded-full border-2 border-line border-t-[var(--accent)] animate-spin" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SplashScreen />
      <Toaster />
      <BrowserRouter>
        <BackButtonHandler />
        <Suspense fallback={<RouteFallback />}>
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
