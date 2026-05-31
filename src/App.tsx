import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppLayout } from "./components/AppLayout";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { StrategyLab } from "./pages/StrategyLab";
import { Signals } from "./pages/Signals";
import { Blog } from "./pages/Blog";
import { Disclosures } from "./pages/Disclosures";
import { AdminLayout } from "./components/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminBlogs } from "./pages/admin/AdminBlogs";
import { AdminBlogEditor } from "./pages/admin/AdminBlogEditor";
import { AdminWaitlist } from "./pages/admin/AdminWaitlist";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminSettings } from "./pages/admin/AdminSettings";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/disclosures" element={<Disclosures />} />

          {/* Authenticated Application routes (AppLayout wrapped) */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lab" element={<StrategyLab />} />
            <Route path="/signals" element={<Signals />} />
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
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
