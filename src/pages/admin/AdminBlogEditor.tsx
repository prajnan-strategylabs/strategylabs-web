import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { supabase } from "../../lib/supabase";
import {
  apiAdminCreateBlog,
  apiAdminUpdateBlog,
  apiAdminGetBlogs,
  apiAdminUploadImage
} from "../../lib/api";
import {
  ArrowLeft,
  Save,
  Bold,
  Italic,
  Heading,
  Link as LinkIcon,
  Code,
  List,
  Upload,
  Loader2,
  X
} from "lucide-react";

// Branded renderers for the preview pane
const markdownComponents = {
  h1: (p: any) => <h1 className="text-xl font-bold text-ink mt-4 mb-2" {...p} />,
  h2: (p: any) => <h2 className="text-lg font-bold text-ink mt-4 mb-2" {...p} />,
  h3: (p: any) => <h3 className="text-sm font-bold text-ink mt-3 mb-1" {...p} />,
  p:  (p: any) => <p className="leading-relaxed text-ink-muted mb-3" {...p} />,
  strong: (p: any) => <strong className="font-semibold text-ink" {...p} />,
  em: (p: any) => <em className="italic text-ink" {...p} />,
  ul: (p: any) => <ul className="list-disc pl-5 space-y-1 text-ink-muted mb-3" {...p} />,
  ol: (p: any) => <ol className="list-decimal pl-5 space-y-1 text-ink-muted mb-3" {...p} />,
  li: (p: any) => <li className="leading-relaxed text-xs md:text-sm" {...p} />,
  a:  (p: any) => <a className="text-accent hover:underline" target="_blank" rel="noreferrer noopener" {...p} />,
  blockquote: (p: any) => (
    <blockquote className="border-l-2 border-accent/40 pl-4 italic text-ink-muted my-2" {...p} />
  ),
  code: ({ inline, ...props }: any) =>
    inline ? (
      <code className="rounded bg-bg-elev/70 px-1.5 py-0.5 text-[0.85em] font-mono text-accent" {...props} />
    ) : (
      <code className="block rounded-lg bg-bg-elev/60 p-3 text-xs font-mono text-ink overflow-x-auto my-2" {...props} />
    ),
  pre: (p: any) => <pre className="my-2" {...p} />,
  hr: () => <hr className="my-4 border-line" />,
  table: (p: any) => (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-[11px] border-collapse" {...p} />
    </div>
  ),
  thead: (p: any) => <thead className="border-b border-line" {...p} />,
  tbody: (p: any) => <tbody {...p} />,
  tr: (p: any) => <tr className="border-b border-line/40 even:bg-bg-elev/20" {...p} />,
  th: (p: any) => <th className="px-2 py-1 text-left font-semibold text-ink" {...p} />,
  td: (p: any) => <td className="px-2 py-1 text-ink-muted" {...p} />,
};

export function AdminBlogEditor() {
  const navigate = useNavigate();
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const isEditMode = !!routeSlug;

  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Core fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverGradient, setCoverGradient] = useState("from-[#22d3aa]/30 via-[#3b6af1]/25 to-bg-card");
  const [readTime, setReadTime] = useState("5 min read");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("published");

  // Telemetries
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewMode, setPreviewMode] = useState<"split" | "edit" | "preview">("split");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditMode && title) {
      const generated = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s-]+/g, "-");
      setSlug(generated);
    }
  }, [title, isEditMode]);

  // Load existing blog for editing
  useEffect(() => {
    if (!isEditMode) return;

    async function fetchBlog() {
      try {
        const sessionRes = await supabase!.auth.getSession();
        const token = sessionRes.data.session?.access_token;
        if (!token) throw new Error("No secure session");

        const blogs = await apiAdminGetBlogs(token);
        const match = blogs.find((b) => b.slug === routeSlug);
        if (!match) throw new Error("Article not found");

        setTitle(match.title);
        setSlug(match.slug);
        setExcerpt(match.excerpt);
        setContent(match.content);
        setCoverImage(match.cover_image || null);
        setCoverGradient(match.cover_gradient);
        setReadTime(match.read_time);
        setTags(match.tags);
        setStatus(match.status);
      } catch (err: any) {
        triggerToast(err.message || "Failed to load article", "error");
        navigate("/admin/blogs");
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [routeSlug, isEditMode, navigate]);

  // Markdown editor helpers
  const handleMarkdownHelper = (type: "bold" | "italic" | "heading" | "link" | "code" | "list") => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = content.substring(start, end);

    let replacement = "";
    switch (type) {
      case "bold":
        replacement = `**${selection || "bold text"}**`;
        break;
      case "italic":
        replacement = `*${selection || "italic text"}*`;
        break;
      case "heading":
        replacement = `### ${selection || "Heading"}`;
        break;
      case "link":
        replacement = `[${selection || "link text"}](https://example.com)`;
        break;
      case "code":
        replacement = selection.includes("\n")
          ? `\`\`\`\n${selection || "code block"}\n\`\`\``
          : `\`${selection || "code snippet"}\``;
        break;
      case "list":
        replacement = selection
          ? selection
              .split("\n")
              .map((line) => (line.startsWith("- ") ? line : `- ${line}`))
              .join("\n")
          : "- list item";
        break;
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    // Refocus & select the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + replacement.length);
    }, 10);
  };

  // Tag inputs
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = tagInput.trim().toUpperCase();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput("");
      }
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((tag) => tag !== t));
  };

  // Image Upload helper
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const sessionRes = await supabase!.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) throw new Error("No secure session");

      const res = await apiAdminUploadImage(token, file);
      setCoverImage(res.url);
      triggerToast("Cover image uploaded successfully.");
    } catch (err: any) {
      triggerToast(err.message || "Image upload failed", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  // Save changes
  const handleSave = async (saveStatus?: "draft" | "published") => {
    if (saving) return;
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      triggerToast("Please fill in the title, excerpt, and content.", "error");
      return;
    }

    const currentStatus = saveStatus || status;
    setSaving(true);

    const body = {
      title,
      slug,
      excerpt,
      content,
      cover_image: coverImage,
      cover_gradient: coverGradient,
      read_time: readTime,
      tags,
      status: currentStatus
    };

    try {
      const sessionRes = await supabase!.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) throw new Error("No secure session");

      if (isEditMode && routeSlug) {
        await apiAdminUpdateBlog(token, routeSlug, body);
        triggerToast("Research article updated successfully.");
      } else {
        await apiAdminCreateBlog(token, body);
        triggerToast("Research article published successfully.");
      }
      
      setTimeout(() => navigate("/admin/blogs"), 1000);
    } catch (err: any) {
      triggerToast(err.message || "Failed to save article", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // Predefined cool gradient classes for selector
  const gradients = [
    "from-[#22d3aa]/30 via-[#3b6af1]/25 to-bg-card",
    "from-amber-500/25 via-red-500/20 to-bg-card",
    "from-purple-500/30 via-pink-500/25 to-bg-card",
    "from-cyan-500/25 via-blue-600/20 to-bg-card",
    "from-emerald-500/30 via-[#22d3aa]/20 to-bg-card"
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ── HEADER & ACTIONS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2740] pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/blogs"
            className="p-2 rounded-xl bg-bg-elev/30 border border-line/50 text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              {isEditMode ? "Edit Research Article" : "Write Research Article"}
            </h1>
            <p className="text-xs text-ink-muted leading-relaxed font-sans mt-0.5">
              Draft or publish mathematical backtest research to public feed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="btn-ghost py-2 px-4 text-xs font-mono border-line text-ink hover:text-white disabled:opacity-50"
          >
            Save Draft
          </button>
          
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-bg transition-all select-none disabled:opacity-50 shadow-lg shadow-amber-500/10"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-bg" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Publish Report
          </button>
        </div>
      </div>

      {/* ── SPLIT VIEW BUTTONS ── */}
      <div className="hidden md:flex justify-end gap-1 border-b border-[#1e2740]/60 pb-3">
        {(["edit", "split", "preview"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setPreviewMode(mode)}
            className={`rounded-lg px-3 py-1.5 text-[10px] font-bold font-mono transition-all uppercase select-none border
              ${previewMode === mode
                ? "bg-amber-500/15 text-amber-500 border-amber-500/30 shadow-sm"
                : "bg-transparent text-ink-subtle border-transparent hover:text-ink"}`}
          >
            {mode === "split" ? "Split Screen" : mode === "edit" ? "Editor Only" : "Preview Only"}
          </button>
        ))}
      </div>

      {/* ── FORM & COMPOSITION ── */}
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* LEFT COLUMN: Editor Form */}
        <div className={`space-y-5 ${previewMode === "preview" ? "hidden" : ""}`}>
          <div className="card bg-bg-card/25 border-line/45 p-6 space-y-4">
            {/* Title & Slug */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider font-mono">
                  Report Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inside V22 Strategy"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-line bg-bg-card/30 text-ink focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider font-mono">
                  Slug (Auto-generated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. inside-v22-strategy"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-line bg-bg-card/30 text-ink focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider font-mono">
                Short Excerpt / TL;DR
              </label>
              <textarea
                placeholder="Brief summary of the report to display on grids (maximum 2-3 lines)..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-line bg-bg-card/30 text-ink focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
              />
            </div>

            {/* Cover image & Gradients */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider font-mono">
                  Cover Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://..."
                    value={coverImage || ""}
                    onChange={(e) => setCoverImage(e.target.value || null)}
                    className="flex-1 px-4 py-2.5 text-xs font-mono rounded-xl border border-line bg-bg-card/30 text-ink focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                  
                  <label className="cursor-pointer inline-flex items-center justify-center p-3 rounded-xl border border-line bg-bg-elev/40 hover:bg-bg-elev/80 text-ink hover:text-amber-500 transition-all select-none">
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider font-mono">
                  Fallback Visual Gradient
                </label>
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {gradients.map((grad) => (
                    <button
                      key={grad}
                      onClick={() => setCoverGradient(grad)}
                      className={`w-7 h-7 rounded-full bg-gradient-to-tr ${grad} border-2
                        ${coverGradient === grad ? "border-amber-500 shadow-md" : "border-line"}`}
                      title={grad}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Read Time & Tags */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider font-mono">
                  Estimated Read Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5 min read"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-line bg-bg-card/30 text-ink focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider font-mono">
                  Add Tags (Press Enter)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BACKTESTING"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-line bg-bg-card/30 text-ink focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Tag List */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    onClick={() => removeTag(t)}
                    className="group inline-flex items-center gap-1 text-[9px] font-extrabold bg-bg-elev/40 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider cursor-pointer hover:border-red-500/35 hover:text-red-400 transition-colors"
                  >
                    {t}
                    <X className="h-2 w-2 text-ink-subtle group-hover:text-red-400 transition-colors" />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Markdown Content Composition */}
          <div className="card bg-bg-card/25 border-line/45 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2740] pb-3">
              <label className="text-[10px] font-bold text-ink-subtle uppercase tracking-wider font-mono">
                Report Markdown content
              </label>

              {/* Toolbar */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMarkdownHelper("bold")}
                  className="p-1.5 rounded-lg border border-line/40 bg-bg-elev/20 text-ink-muted hover:text-ink hover:bg-bg-elev/50 transition-all"
                  title="Bold text"
                >
                  <Bold className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkdownHelper("italic")}
                  className="p-1.5 rounded-lg border border-line/40 bg-bg-elev/20 text-ink-muted hover:text-ink hover:bg-bg-elev/50 transition-all"
                  title="Italic text"
                >
                  <Italic className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkdownHelper("heading")}
                  className="p-1.5 rounded-lg border border-line/40 bg-bg-elev/20 text-ink-muted hover:text-ink hover:bg-bg-elev/50 transition-all"
                  title="Heading 3"
                >
                  <Heading className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkdownHelper("link")}
                  className="p-1.5 rounded-lg border border-line/40 bg-bg-elev/20 text-ink-muted hover:text-ink hover:bg-bg-elev/50 transition-all"
                  title="Hyperlink"
                >
                  <LinkIcon className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkdownHelper("code")}
                  className="p-1.5 rounded-lg border border-line/40 bg-bg-elev/20 text-ink-muted hover:text-ink hover:bg-bg-elev/50 transition-all"
                  title="Code snippet/block"
                >
                  <Code className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkdownHelper("list")}
                  className="p-1.5 rounded-lg border border-line/40 bg-bg-elev/20 text-ink-muted hover:text-ink hover:bg-bg-elev/50 transition-all"
                  title="Unordered list item"
                >
                  <List className="h-3 w-3" />
                </button>
              </div>
            </div>

            <textarea
              ref={contentTextareaRef}
              placeholder="# Writing quantitative research breakdown...
Write your beautiful markdown report here. Supports GFM (GitHub Flavored Markdown), latex math equations $\int_a^b f(x) dx$, tables, code blocks, etc.
"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={22}
              className="w-full px-4 py-4 text-xs font-mono rounded-xl border border-line bg-bg-card/30 text-ink focus:outline-none focus:border-amber-500/50 transition-colors scrollbar-thin"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Preview */}
        <div className={`space-y-5 lg:sticky lg:top-4 ${previewMode === "edit" ? "hidden" : ""}`}>
          <div className="card bg-bg-card/25 border-line/45 p-6 space-y-4 h-[780px] flex flex-col overflow-hidden">
            <h3 className="text-xs font-bold text-ink-subtle uppercase tracking-wider font-mono border-b border-[#1e2740] pb-3">
              Telemetry Live Preview
            </h3>

            <div className="flex-1 overflow-y-auto px-1 py-1 space-y-6 scrollbar-thin">
              {/* Cover Card Preview */}
              <div className="card border-line/65 bg-bg-card/45 backdrop-blur-sm p-0 overflow-hidden select-none max-w-sm mx-auto">
                {coverImage ? (
                  <div className="h-32 overflow-hidden relative">
                    <img src={coverImage} alt={title || "Preview"} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-card/85 to-transparent" />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                      {tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[7px] font-extrabold bg-bg/70 text-accent border border-accent/20 px-1.5 py-0.5 rounded-full font-mono uppercase">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={`h-32 bg-gradient-to-tr ${coverGradient} border-b border-line/50 p-4 flex flex-col justify-between relative`}>
                    <div className="flex flex-wrap gap-1">
                      {tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[7px] font-extrabold bg-bg/70 text-accent border border-accent/20 px-1.5 py-0.5 rounded-full font-mono uppercase">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="p-4 space-y-2">
                  <span className="text-[8px] font-bold text-ink-subtle uppercase font-mono tracking-wider flex items-center gap-2">
                    {readTime || "5 min read"}
                  </span>
                  <h4 className="text-sm font-extrabold text-ink line-clamp-2 leading-snug">
                    {title || "Untitled Research Article"}
                  </h4>
                  <p className="text-[11px] text-ink-muted leading-relaxed line-clamp-3 font-sans">
                    {excerpt || "Excerpt and short breakdown will render here..."}
                  </p>
                </div>
              </div>

              {/* Reader Overlay Preview */}
              <div className="border border-line/50 rounded-2xl bg-bg-card/20 p-6 space-y-6">
                {/* Header Gradient */}
                {coverImage ? (
                  <div className="rounded-xl overflow-hidden border border-line/45 relative h-36">
                    <img src={coverImage} alt={title || "Preview"} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {tags.map((t) => (
                          <span key={t} className="text-[7px] font-extrabold bg-bg/80 text-accent border border-accent/20 px-1.5 py-0.5 rounded-full font-mono uppercase">
                            {t}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-base font-bold text-ink leading-tight">
                        {title || "Untitled Research Article"}
                      </h3>
                    </div>
                  </div>
                ) : (
                  <div className={`p-6 rounded-xl bg-gradient-to-tr ${coverGradient} border border-line/45 flex flex-col justify-end space-y-2`}>
                    <div className="flex flex-wrap gap-1">
                      {tags.map((t) => (
                        <span key={t} className="text-[7px] font-extrabold bg-bg/80 text-accent border border-accent/20 px-1.5 py-0.5 rounded-full font-mono uppercase">
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-base font-bold text-ink leading-tight">
                      {title || "Untitled Research Article"}
                    </h3>
                  </div>
                )}

                {/* Rendered post Markdown content */}
                <div className="text-[11px] md:text-xs leading-relaxed space-y-3 font-sans select-text border-t border-line/40 pt-4">
                  {content.trim() ? (
                    <ReactMarkdown
                      components={markdownComponents}
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {content.trim()}
                    </ReactMarkdown>
                  ) : (
                    <p className="italic text-ink-subtle text-center py-6 font-mono">
                      No report content composed yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
