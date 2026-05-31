import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { apiAdminGetBlogs, apiAdminDeleteBlog, apiAdminUpdateBlog, type AdminBlogPost } from "../../lib/api";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Loader2,
  Search,
  AlertCircle
} from "lucide-react";

export function AdminBlogs() {
  const [blogs, setBlogs] = useState<AdminBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const sessionRes = await supabase!.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) throw new Error("No secure session");
      
      const data = await apiAdminGetBlogs(token);
      setBlogs(data);
    } catch (err: any) {
      triggerToast(err.message || "Failed to load blogs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleDelete = async () => {
    if (!deletingSlug || isDeleting) return;
    setIsDeleting(true);
    try {
      const sessionRes = await supabase!.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) throw new Error("No secure session");

      await apiAdminDeleteBlog(token, deletingSlug);
      triggerToast("Article deleted successfully.");
      setDeletingSlug(null);
      loadBlogs();
    } catch (err: any) {
      triggerToast(err.message || "Deletion failed", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (post: AdminBlogPost) => {
    const newStatus = post.status === "published" ? "draft" : "published";
    try {
      const sessionRes = await supabase!.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) throw new Error("No secure session");

      await apiAdminUpdateBlog(token, post.slug, { status: newStatus });
      triggerToast(`Post status updated to ${newStatus}.`);
      loadBlogs();
    } catch (err: any) {
      triggerToast(err.message || "Status update failed", "error");
    }
  };

  const filteredBlogs = blogs.filter((post) => {
    const matchesTab = activeTab === "all" || post.status === activeTab;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const getCounts = (status: "all" | "published" | "draft") => {
    if (status === "all") return blogs.length;
    return blogs.filter((b) => b.status === status).length;
  };

  const formatDate = (dateStr: string) => {
    try {
      const dt = new Date(dateStr);
      return dt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return dateStr.slice(0, 10);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── HEADER & ACTIONS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Research Articles</h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            Write, review, publish, or remove quantitative research posts.
          </p>
        </div>
        
        <Link
          to="/admin/blogs/new"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-bg transition-all select-none shadow-lg shadow-amber-500/10 self-start md:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          New Article
        </Link>
      </div>

      {/* ── FILTERS & SEARCH ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2740] pb-4">
        <div className="flex flex-wrap gap-2">
          {(["all", "published", "draft"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-2 text-xs font-bold font-mono transition-all uppercase select-none border
                ${activeTab === tab
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-md"
                  : "bg-bg-elev/20 text-ink-muted border-transparent hover:text-ink hover:bg-bg-elev/40"}`}
            >
              {tab} ({getCounts(tab)})
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
          <input
            type="text"
            placeholder="Search articles by title/tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl border border-line bg-bg-card/25 text-ink focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
      </div>

      {/* ── BLOG LIST ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="card border-line/60 bg-bg-card/20 text-center py-16 space-y-4 max-w-xl mx-auto">
          <BookOpen className="h-10 w-10 text-ink-subtle mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-ink">No articles found</h3>
            <p className="text-xs text-ink-muted leading-relaxed font-sans">
              No quantitative reports matched the search criteria or category filter.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/admin/blogs/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-bg-elev border border-line px-4 py-2 text-xs font-bold text-ink hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              Create your first post
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBlogs.map((post) => (
            <div
              key={post.slug}
              className="card bg-bg-card/25 border-line/45 hover:border-line p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all"
            >
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-[9px] font-black uppercase font-mono px-2 py-0.5 rounded-full border
                    ${post.status === "published"
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                      : "bg-amber-500/10 border-amber-500/25 text-amber-400"}`}
                  >
                    {post.status}
                  </span>
                  
                  <div className="flex items-center gap-4 text-[9px] font-semibold text-ink-subtle font-mono uppercase">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(post.created_at)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.read_time}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-ink truncate group-hover:text-amber-500 transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed font-sans line-clamp-2 max-w-3xl">
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tags.map((t) => (
                    <span key={t} className="text-[8px] font-black bg-bg-elev/40 text-ink-muted border border-line/60 px-2 py-0.5 rounded-md font-mono uppercase tracking-wider">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto flex-none">
                <button
                  onClick={() => handleToggleStatus(post)}
                  className="p-2 rounded-xl bg-bg-elev/30 border border-line/50 text-ink-muted hover:text-ink hover:bg-bg-elev/60 transition-all"
                  title={post.status === "published" ? "Demote to draft" : "Publish article"}
                >
                  {post.status === "published" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <Link
                  to={`/admin/blogs/${post.slug}`}
                  className="p-2 rounded-xl bg-bg-elev/30 border border-line/50 text-ink-muted hover:text-amber-500 hover:bg-bg-elev/60 transition-all"
                  title="Edit post"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => setDeletingSlug(post.slug)}
                  className="p-2 rounded-xl bg-bg-elev/30 border border-line/50 text-red-500/85 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Delete post"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CONFIRMATION DELETION MODAL ── */}
      {deletingSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md card bg-bg-card/45 border-line/60 p-6 space-y-6 relative overflow-hidden animate-zoom-in">
            <div className="flex items-center gap-3 border-b border-[#1e2740] pb-4">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-ink">Delete Article</h3>
            </div>
            
            <p className="text-xs text-ink-muted leading-relaxed font-sans">
              Are you sure you want to permanently delete the research post <span className="text-ink font-semibold">"{deletingSlug}"</span>? This operation is permanent and cannot be undone.
            </p>
            
            <div className="flex justify-end items-center gap-3">
              <button
                onClick={() => setDeletingSlug(null)}
                disabled={isDeleting}
                className="btn-ghost py-2 px-4 text-xs font-mono border-line text-ink-muted hover:text-ink disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 hover:bg-red-600 px-4 py-2 text-xs font-bold text-bg transition-all select-none disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="h-3 w-3 animate-spin text-bg" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-fade-in-up
          ${toast.type === "error"
            ? "bg-red-500/10 border-red-500/25 text-red-400"
            : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"}`}
        >
          <span className="text-xs font-bold font-mono">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
