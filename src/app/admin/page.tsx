"use client";
import { useState, useEffect } from "react";
import { FaProjectDiagram, FaUserTie, FaUserCircle, FaLayerGroup } from "react-icons/fa";
import { MdLogout, MdEdit, MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import { uploadImage, supabase } from "@/utils/supabaseClient";
import Toast from "@/components/Toast";
import ModalForm from "@/components/ModalForm";

// Type definitions
// Project
interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
  created_at: string;
}
// Experience
interface Experience {
  id: number;
  title: string;
  company?: string;
  description: string;
  year: string;
  image: string;
  created_at: string;
  order: number;
}
// Profile
interface Profile {
  id: number;
  name: string;
  photo_url: string;
  bio: string;
  titles?: string; // string JSON
  created_at: string;
}
// Section (Develop/Create)
interface Section {
  id: number;
  type: string; // 'develop' | 'create'
  title: string;
  description: string;
  skills: string; // JSON string array
  created_at: string;
}

const TABS = [
  { key: "projects", label: "Projects", icon: <FaProjectDiagram size={22} className="mr-3" /> },
  { key: "experiences", label: "Experiences", icon: <FaUserTie size={22} className="mr-3" /> },
  { key: "profile", label: "Profile", icon: <FaUserCircle size={22} className="mr-3" /> },
  { key: "sections", label: "Sections", icon: <FaLayerGroup size={22} className="mr-3" /> },
];

export default function AdminPage() {
  // Login state
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Tab state
  const [tab, setTab] = useState("projects");

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectForm, setProjectForm] = useState<Partial<Project>>({});
  const [editProjectId, setEditProjectId] = useState<number | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);

  // Experiences state
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [expForm, setExpForm] = useState<Partial<Experience>>({});
  const [editExpId, setEditExpId] = useState<number | null>(null);
  const [expLoading, setExpLoading] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileForm, setProfileForm] = useState<Partial<Profile & { titles?: string }>>({});
  const [profileLoading, setProfileLoading] = useState(false);

  // Sections state
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionForm, setSectionForm] = useState<Partial<Section>>({ type: "develop" });
  const [editSectionId, setEditSectionId] = useState<number | null>(null);
  const [sectionLoading, setSectionLoading] = useState(false);

  // Tambah state untuk file gambar
  const [projectImageFile, setProjectImageFile] = useState<File | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  // Tambah state untuk file gambar di experience
  const [expImageFile, setExpImageFile] = useState<File | null>(null);

  // Tambahkan state baru:
  const [showExpForm, setShowExpForm] = useState(false);
  const [expFormMode, setExpFormMode] = useState<"add" | "edit">("add");
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
  const [notification, setNotification] = useState<{ show: boolean, message: string, type: "success" | "error" }>({ show: false, message: "", type: "success" });

  // Tambahkan di atas, setelah state Projects yang sudah ada
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectFormMode, setProjectFormMode] = useState<"add" | "edit">("add");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Tambahkan di atas, setelah state Sections yang sudah ada
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [sectionFormMode, setSectionFormMode] = useState<"edit">("edit");
  const [currentSectionType, setCurrentSectionType] = useState<"develop" | "create">("develop");

  // Tambah state untuk modal konfirmasi hapus experience
  const [showDeleteExpModal, setShowDeleteExpModal] = useState(false);
  const [expIdToDelete, setExpIdToDelete] = useState<number | null>(null);

  // Tambah state untuk modal konfirmasi hapus project
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
  const [projectIdToDelete, setProjectIdToDelete] = useState<number | null>(null);

  const router = useRouter();

  // Proteksi halaman admin: cek session
  useEffect(() => {
    fetch('/api/admin-session')
      .then(res => {
        if (res.status === 401) {
          setLoggedIn(false);
          router.push('/admin');
        }
      })
      .catch(() => {
        setLoggedIn(false);
        router.push('/admin');
      });
  }, []);

  // Fetch data on login/tab change
  useEffect(() => {
    if (!loggedIn) return;
    if (tab === "projects") fetchProjects();
    if (tab === "experiences") fetchExperiences();
    if (tab === "profile") fetchProfile();
    if (tab === "sections") fetchSections();
    // eslint-disable-next-line
  }, [loggedIn, tab]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        setLoggedIn(true);
        setLoginError("");
      } else {
        setLoginError("Username/password salah!");
      }
    } catch (err) {
      setLoginError("Terjadi kesalahan jaringan.");
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await fetch('/api/admin-logout', { method: 'POST' });
    setLoggedIn(false);
    router.push("/");
  };

  // ------------------- PROJECTS CRUD -------------------
  const fetchProjects = async () => {
    setProjectLoading(true);
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data);
    setProjectLoading(false);
  };
  const handleProjectForm = (e: any) => setProjectForm({ ...projectForm, [e.target.name]: e.target.value });
  const handleProjectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProjectImageFile(e.target.files[0]);
    }
  };
  const handleProjectSubmit = async (e: any) => {
    e.preventDefault();
    let imageUrl = projectForm.image || "";
    if (projectImageFile) {
      imageUrl = await uploadImage(projectImageFile, "project-images");
    }
    const payload = { ...projectForm, image: imageUrl };
    if (editProjectId) {
      await fetch(`/api/projects/${editProjectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setProjectForm({});
    setProjectImageFile(null);
    setEditProjectId(null);
    fetchProjects();
  };
  const handleProjectEdit = (p: Project) => {
    setProjectForm({ title: p.title, description: p.description, image: p.image, link: p.link });
    setEditProjectId(p.id);
  };
  const handleProjectDelete = async (id: number) => {
    setShowDeleteProjectModal(true);
    setProjectIdToDelete(id);
  };
  const confirmDeleteProject = async () => {
    if (projectIdToDelete == null) return;
    await fetch(`/api/projects/${projectIdToDelete}`, { method: "DELETE" });
    setNotification({ show: true, message: "Project berhasil dihapus!", type: "error" });
    setShowDeleteProjectModal(false);
    setProjectIdToDelete(null);
    fetchProjects();
  };
  const cancelDeleteProject = () => {
    setShowDeleteProjectModal(false);
    setProjectIdToDelete(null);
  };

  // ------------------- EXPERIENCES CRUD -------------------
  const fetchExperiences = async () => {
    setExpLoading(true);
    const res = await fetch("/api/experiences");
    let data = await res.json();
    if (!Array.isArray(data)) data = [];
    setExperiences(data);
    setExpLoading(false);
  };
  const handleExpForm = (e: any) => setExpForm({ ...expForm, [e.target.name]: e.target.value });
  const handleExpFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setExpImageFile(e.target.files[0]);
    }
  };
  const handleExpSubmit = async (e: any) => {
    e.preventDefault();
    let imageUrl = expForm.image || "";
    if (expImageFile) {
      imageUrl = await uploadImage(expImageFile, "experience-images");
    }
    let order = expForm.order;
    if (order === undefined || order === null) {
      const maxOrder = experiences.length > 0 ? Math.max(...experiences.map(exp => exp.order ?? 0)) : 0;
      order = maxOrder + 1;
    }
    const payload = { ...expForm, image: imageUrl, order };
    let res, data;
    if (expFormMode === "edit" && editExpId) {
      res = await fetch(`/api/experiences/${editExpId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      data = await res.json();
      if (res.ok) {
        setNotification({ show: true, message: "Berhasil mengedit experience!", type: "success" });
      } else {
        setNotification({ show: true, message: data?.error || "Gagal mengedit experience!", type: "error" });
        return;
      }
    } else {
      res = await fetch("/api/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      data = await res.json();
      if (res.ok) {
        setNotification({ show: true, message: "Berhasil menambah experience!", type: "success" });
      } else {
        setNotification({ show: true, message: data?.error || "Gagal menambah experience!", type: "error" });
        return;
      }
    }
    setShowExpForm(false);
    setEditExpId(null);
    setExpForm({});
    setExpImageFile(null);
    fetchExperiences();
  };
  const handleExpEdit = (exp: Experience) => {
    setExpForm({ title: exp.title, company: exp.company, description: exp.description, year: exp.year, image: exp.image });
    setEditExpId(exp.id);
  };
  const handleExpDelete = async (id: number) => {
    setShowDeleteExpModal(true);
    setExpIdToDelete(id);
  };
  const confirmDeleteExp = async () => {
    if (expIdToDelete == null) return;
    await fetch(`/api/experiences/${expIdToDelete}`, { method: "DELETE" });
    setNotification({ show: true, message: "Experience berhasil dihapus!", type: "error" });
    setShowDeleteExpModal(false);
    setExpIdToDelete(null);
    fetchExperiences();
  };
  const cancelDeleteExp = () => {
    setShowDeleteExpModal(false);
    setExpIdToDelete(null);
  };

  // ------------------- PROFILE CRUD -------------------
  const fetchProfile = async () => {
    setProfileLoading(true);
    const res = await fetch("/api/profile");
    const data = await res.json();
    setProfile(data);
    setProfileForm({
      name: data.name,
      photo_url: data.photo_url,
      bio: data.bio,
      titles: data.titles ? (Array.isArray(data.titles) ? data.titles.join(", ") : JSON.parse(data.titles).join(", ")) : "",
    });
    setProfileLoading(false);
  };
  const handleProfileForm = (e: any) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImageFile(e.target.files[0]);
    }
  };
  const handleProfileSubmit = async (e: any) => {
    e.preventDefault();
    let photoUrl = profileForm.photo_url || "";
    if (profileImageFile) {
      photoUrl = await uploadImage(profileImageFile, "profile-images");
    }
    let titles = profileForm.titles;
    if (typeof titles === "string" && !titles.startsWith("[")) {
      titles = JSON.stringify(
        titles
          .split(",")
          .map((t: string) => t.trim())
          .filter((t: string) => t.length > 0)
      );
    }
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profileForm, photo_url: photoUrl, titles }),
    });
    setProfileImageFile(null);
    fetchProfile();
  };

  // ------------------- SECTIONS CRUD -------------------
  const fetchSections = async () => {
    setSectionLoading(true);
    const res = await fetch("/api/sections");
    const data = await res.json();
    setSections(data);
    setSectionLoading(false);
  };
  const handleSectionForm = (e: any) => setSectionForm({ ...sectionForm, [e.target.name]: e.target.value });
  const handleSectionSkills = (e: any) => setSectionForm({ ...sectionForm, skills: e.target.value });
  const handleSectionSubmit = async (e: any) => {
    e.preventDefault();
    // skills harus string array JSON
    let skills = sectionForm.skills;
    if (typeof skills === "string" && !skills.startsWith("[")) {
      skills = JSON.stringify(skills.split(",").map((s: string) => s.trim()));
    }
    let res, data;
    if (editSectionId) {
      res = await fetch(`/api/sections/${editSectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sectionForm, skills }),
      });
      data = await res.json();
      if (res.ok) {
        setNotification({ show: true, message: "Section berhasil disimpan!", type: "success" });
        setShowSectionForm(false);
        setEditSectionId(null);
        setSectionForm({ type: "develop" });
      } else {
        setNotification({ show: true, message: data?.error || "Gagal menyimpan section!", type: "error" });
        return;
      }
    } else {
      res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sectionForm, skills }),
      });
      data = await res.json();
      if (res.ok) {
        setNotification({ show: true, message: "Section berhasil disimpan!", type: "success" });
        setShowSectionForm(false);
        setEditSectionId(null);
        setSectionForm({ type: "develop" });
      } else {
        setNotification({ show: true, message: data?.error || "Gagal menyimpan section!", type: "error" });
        return;
      }
    }
    fetchSections();
  };
  const handleSectionEdit = (s: Section) => {
    setSectionForm({
      type: s.type,
      description: s.description,
      skills: Array.isArray(s.skills) ? s.skills.join(", ") : (JSON.parse(s.skills || "[]").join(", ")),
    });
    setEditSectionId(s.id);
  };
  const handleSectionDelete = async (id: number) => {
    if (!confirm("Yakin hapus section ini?")) return;
    await fetch(`/api/sections/${id}`, { method: "DELETE" });
    fetchSections();
  };

  // Filter agar hanya satu develop dan satu create
  const developSection = sections.find(s => s.type === "develop");
  const createSection = sections.find(s => s.type === "create");

  const sectionRows = [
    {
      type: "develop",
      data: developSection || { title: "", description: "", skills: "[]", id: undefined }
    },
    {
      type: "create",
      data: createSection || { title: "", description: "", skills: "[]", id: undefined }
    }
  ];

  // ------------------- UI -------------------
  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600">
        <div className="max-w-sm w-full p-8 bg-white rounded-2xl shadow-2xl border border-blue-300">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-800 tracking-wide">Admin Login</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="text-blue-900 font-bold mb-1 block">Username</label>
              <input type="text" name="username" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full" />
            </div>
            <div>
              <label className="text-blue-900 font-bold mb-1 block">Password</label>
              <input type="password" name="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full" />
            </div>
            {loginError && <div className="text-red-500 text-sm">{loginError}</div>}
            <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-lg font-bold mt-2 transition">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 bg-blue-900 text-white shadow-2xl z-20">
        <div className="flex items-center h-20 px-8 border-b border-blue-800">
          <div className="bg-white text-blue-900 rounded-full w-12 h-12 flex items-center justify-center text-3xl font-bold mr-3">A</div>
          <span className="text-2xl font-bold tracking-wide">Admin</span>
        </div>
        <nav className="flex-1 flex flex-col py-8 px-2 gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`flex items-center w-full px-6 py-3 mb-1 rounded-lg transition font-semibold text-lg ${tab === t.key ? "bg-blue-700 shadow-lg border-l-8 border-cyan-400" : "hover:bg-blue-800/80"}`}
              onClick={() => setTab(t.key)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto px-8 pb-8">
          <button onClick={handleLogout} className="flex items-center text-gray-200 hover:text-red-400 text-base font-semibold"><MdLogout className="mr-2" size={20} />Logout</button>
        </div>
      </aside>
      {/* Mobile Sidebar */}
      <aside className="md:hidden fixed top-0 left-0 w-full bg-blue-900 text-white flex items-center justify-between px-4 h-16 z-30 shadow-lg">
        <div className="flex items-center">
          <div className="bg-white text-blue-900 rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold mr-2">A</div>
          <span className="text-xl font-bold tracking-wide">Admin</span>
        </div>
        <select value={tab} onChange={e => setTab(e.target.value)} className="bg-blue-800 text-white rounded px-2 py-1">
          {TABS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
      </aside>
      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-20 md:pt-10 px-2 md:px-10 pb-10 min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
        <div className="w-full max-w-5xl mx-auto">
          {/* Section Title */}
          <h2 className="text-3xl font-extrabold text-blue-900 mb-8 border-b-4 border-cyan-400 pb-2 tracking-wide flex items-center gap-3">
            {TABS.find(t => t.key === tab)?.icon}
            {TABS.find(t => t.key === tab)?.label}
          </h2>
          {/* Projects Tab */}
          {tab === "projects" && (
            <section>
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-blue-800 text-lg">Daftar Project</h3>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-bold flex items-center gap-2"
                    onClick={() => {
                      setShowProjectForm(true);
                      setProjectFormMode("add");
                      setSelectedProject(null);
                      setProjectForm({});
                      setProjectImageFile && setProjectImageFile(null);
                    }}
                  >
                    + Tambah Project
                  </button>
                </div>
                {projectLoading ? (
                  <div className="py-8 text-center text-blue-700 font-semibold">Loading...</div>
                ) : projects.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 font-semibold">Belum ada project.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-base border border-blue-200 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-blue-200 text-blue-900 font-bold">
                          <th className="p-3 px-6 text-left min-w-[180px]">Title</th>
                          <th className="p-3 px-6 text-left min-w-[220px]">Description</th>
                          <th className="p-3 px-4 text-center w-32">Link</th>
                          <th className="p-3 px-4 text-center w-28">Image</th>
                          <th className="p-3 px-4 text-center w-36">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((p, i) => (
                          <tr
                            key={p.id}
                            className={
                              (i % 2 === 0 ? "bg-white" : "bg-blue-50") +
                              " border-b border-blue-200 hover:bg-blue-100 transition"
                            }
                          >
                            <td className="p-3 px-6 font-semibold text-blue-900 align-middle">{p.title}</td>
                            <td className="p-3 px-6 text-gray-700 align-middle">{p.description}</td>
                            <td className="p-3 px-4 text-center align-middle">
                              <a href={p.link} className="text-cyan-700 underline" target="_blank" rel="noopener noreferrer">
                                Visit
                              </a>
                            </td>
                            <td className="p-3 px-4 text-center align-middle">
                              {p.image && (
                                <img
                                  src={p.image}
                                  alt="Project"
                                  className="w-12 h-12 object-cover rounded border border-blue-200 mx-auto"
                                />
                              )}
                            </td>
                            <td className="p-3 px-4 text-center align-middle">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg font-semibold text-sm gap-1"
                                  onClick={() => {
                                    setShowProjectForm(true);
                                    setProjectFormMode("edit");
                                    setSelectedProject(p);
                                    setProjectForm({ title: p.title, description: p.description, image: p.image, link: p.link });
                                    setEditProjectId(p.id);
                                    setProjectImageFile && setProjectImageFile(null);
                                  }}
                                  title="Edit"
                                >
                                  <MdEdit size={18} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold text-sm gap-1"
                                  onClick={() => handleProjectDelete(p.id)}
                                  title="Delete"
                                >
                                  <MdDelete size={18} />
                                  <span>Hapus</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {/* Modal Form */}
                {showProjectForm && (
                  <ModalForm
                    title={projectFormMode === "add" ? "Tambah Project" : "Edit Project"}
                    onClose={() => {
                      setShowProjectForm(false);
                      setEditProjectId(null);
                      setProjectForm({});
                      setProjectImageFile && setProjectImageFile(null);
                    }}
                  >
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        let imageUrl = projectForm.image || "";
                        if (projectImageFile) {
                          imageUrl = await uploadImage(projectImageFile, "project-images");
                        }
                        const payload = { ...projectForm, image: imageUrl };
                        if (projectFormMode === "edit" && editProjectId) {
                          await fetch(`/api/projects/${editProjectId}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                          });
                          setNotification({ show: true, message: "Berhasil mengedit project!", type: "success" });
                        } else {
                          await fetch("/api/projects", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                          });
                          setNotification({ show: true, message: "Berhasil menambah project!", type: "success" });
                        }
                        setShowProjectForm(false);
                        setEditProjectId(null);
                        setProjectForm({});
                        setProjectImageFile && setProjectImageFile(null);
                        fetchProjects();
                      }}
                      className="flex flex-col gap-5"
                    >
                      <div>
                        <label className="text-blue-900 font-bold mb-1 block">Title</label>
                        <input
                          type="text"
                          name="title"
                          placeholder="Title"
                          value={projectForm.title || ""}
                          onChange={handleProjectForm}
                          className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full"
                        />
                      </div>
                      <div>
                        <label className="text-blue-900 font-bold mb-1 block">Description</label>
                        <textarea
                          name="description"
                          placeholder="Description"
                          value={projectForm.description || ""}
                          onChange={handleProjectForm}
                          className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full"
                        />
                      </div>
                      <div>
                        <label className="text-blue-900 font-bold mb-1 block">Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setProjectImageFile && setProjectImageFile(e.target.files[0]);
                            }
                          }}
                          className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full"
                        />
                      </div>
                      <div>
                        <label className="text-blue-900 font-bold mb-1 block">Project Link</label>
                        <input
                          type="text"
                          name="link"
                          placeholder="Project Link"
                          value={projectForm.link || ""}
                          onChange={handleProjectForm}
                          className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full"
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold text-lg shadow"
                        >
                          {projectFormMode === "edit" ? "Update" : "Add"} Project
                        </button>
                        <button
                          type="button"
                          className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-bold text-lg shadow"
                          onClick={() => {
                            setShowProjectForm(false);
                            setEditProjectId(null);
                            setProjectForm({});
                            setProjectImageFile && setProjectImageFile(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </ModalForm>
                )}
              </div>
            </section>
          )}
          {/* Experiences Tab */}
          {tab === "experiences" && (
            <section>
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-blue-800 text-lg">Daftar Experience</h3>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-bold flex items-center gap-2"
                    onClick={() => {
                      setShowExpForm(true);
                      setExpFormMode("add");
                      setSelectedExp(null);
                      setExpForm({});
                      setExpImageFile(null);
                    }}
                  >
                    + Tambah Experience
                  </button>
                </div>
                {expLoading ? (
                  <div className="py-8 text-center text-blue-700 font-semibold">Loading...</div>
                ) : experiences.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 font-semibold">Belum ada experience.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-base border border-blue-200 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-blue-200 text-blue-900 font-bold">
                          <th className="p-3 px-6 text-left min-w-[180px]">Title</th>
                          <th className="p-3 px-6 text-left min-w-[140px]">Company</th>
                          <th className="p-3 px-6 text-left min-w-[220px]">Description</th>
                          <th className="p-3 px-4 text-center w-24">Year</th>
                          <th className="p-3 px-4 text-center w-28">Image</th>
                          <th className="p-3 px-4 text-center w-28">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {experiences.map((exp, i) => (
                          <tr
                            key={exp.id}
                            className={
                              (i % 2 === 0 ? "bg-white" : "bg-blue-50") +
                              " border-b border-blue-200 hover:bg-blue-100 transition"
                            }
                          >
                            <td className="p-3 px-6 font-semibold text-blue-900 align-middle">{exp.title}</td>
                            <td className="p-3 px-6 text-blue-800 align-middle">{exp.company || '-'}</td>
                            <td className="p-3 px-6 text-gray-700 align-middle">{exp.description}</td>
                            <td className="p-3 px-4 text-blue-800 font-semibold text-center align-middle">{exp.year}</td>
                            <td className="p-3 px-4 text-center align-middle">
                              {exp.image && (
                                <img
                                  src={exp.image}
                                  alt="Experience"
                                  className="w-12 h-12 object-cover rounded border border-blue-200 mx-auto"
                                />
                              )}
                            </td>
                            <td className="p-3 px-4 text-center align-middle">
                              <div className="flex items-center justify-center space-x-2">
                                {/* Tombol Naik */}
                                <button
                                  className="flex items-center bg-gray-300 hover:bg-gray-400 text-blue-900 px-2 py-1 rounded font-bold text-xs"
                                  disabled={i === 0}
                                  onClick={async () => {
                                    if (i === 0) return;
                                    const above = experiences[i - 1];
                                    // Tukar order
                                    await fetch(`/api/experiences/${exp.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ ...exp, order: above.order }),
                                    });
                                    await fetch(`/api/experiences/${above.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ ...above, order: exp.order }),
                                    });
                                    fetchExperiences();
                                  }}
                                  title="Naik"
                                >
                                  ▲
                                </button>
                                {/* Tombol Turun */}
                                <button
                                  className="flex items-center bg-gray-300 hover:bg-gray-400 text-blue-900 px-2 py-1 rounded font-bold text-xs"
                                  disabled={i === experiences.length - 1}
                                  onClick={async () => {
                                    if (i === experiences.length - 1) return;
                                    const below = experiences[i + 1];
                                    // Tukar order
                                    await fetch(`/api/experiences/${exp.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ ...exp, order: below.order }),
                                    });
                                    await fetch(`/api/experiences/${below.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ ...below, order: exp.order }),
                                    });
                                    fetchExperiences();
                                  }}
                                  title="Turun"
                                >
                                  ▼
                                </button>
                                <button
                                  className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg font-semibold text-sm gap-1"
                                  onClick={() => {
                                    setShowExpForm(true);
                                    setExpFormMode("edit");
                                    setSelectedExp(exp);
                                    setExpForm({ title: exp.title, company: exp.company, description: exp.description, year: exp.year, image: exp.image });
                                    setEditExpId(exp.id);
                                    setExpImageFile(null);
                                  }}
                                  title="Edit"
                                >
                                  <MdEdit size={18} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold text-sm gap-1"
                                  onClick={() => handleExpDelete(exp.id)}
                                  title="Delete"
                                >
                                  <MdDelete size={18} />
                                  <span>Hapus</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Modal Form */}
                {showExpForm && (
                  <ModalForm
                    title={expFormMode === "add" ? "Tambah Experience" : "Edit Experience"}
                    onClose={() => {
                      setShowExpForm(false);
                      setEditExpId(null);
                      setExpForm({});
                      setExpImageFile(null);
                    }}
                  >
                    <form
                      onSubmit={handleExpSubmit}
                      className="flex flex-col gap-5"
                    >
                      <div>
                        <label className="text-blue-900 font-bold mb-1 block">Title</label>
                        <input
                          type="text"
                          name="title"
                          placeholder="Title"
                          value={expForm.title || ""}
                          onChange={handleExpForm}
                          className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full"
                        />
                      </div>
                      <div>
                        <label className="text-blue-900 font-bold mb-1 block">Company</label>
                        <input
                          type="text"
                          name="company"
                          placeholder="Company"
                          value={expForm.company || ""}
                          onChange={handleExpForm}
                          className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full"
                        />
                      </div>
                      <div>
                        <label className="text-blue-900 font-bold mb-1 block">Description</label>
                        <textarea
                          name="description"
                          placeholder="Description"
                          value={expForm.description || ""}
                          onChange={handleExpForm}
                          className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full"
                        />
                      </div>
                      <div>
                        <label className="text-blue-900 font-bold mb-1 block">Year</label>
                        <input
                          type="text"
                          name="year"
                          placeholder="Year"
                          value={expForm.year || ""}
                          onChange={handleExpForm}
                          className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full"
                        />
                      </div>
                      <div>
                        <label className="text-blue-900 font-bold mb-1 block">Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleExpFileChange}
                          className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full"
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold text-lg shadow"
                        >
                          {expFormMode === "edit" ? "Update" : "Add"} Experience
                        </button>
                        <button
                          type="button"
                          className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-bold text-lg shadow"
                          onClick={() => {
                            setShowExpForm(false);
                            setEditExpId(null);
                            setExpForm({});
                            setExpImageFile(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </ModalForm>
                )}
              </div>
            </section>
          )}
          {/* Profile Tab */}
          {tab === "profile" && (
            <section>
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-200 flex flex-col md:flex-row gap-10 items-center">
                <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5 flex-1">
                  <div>
                    <label className="text-blue-900 font-bold mb-1 block">Name</label>
                    <input type="text" name="name" placeholder="Name" value={profileForm.name || ""} onChange={handleProfileForm} className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full" />
                  </div>
                  <div>
                    <label className="text-blue-900 font-bold mb-1 block">Photo</label>
                    <input type="file" accept="image/*" onChange={handleProfileFileChange} className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full" />
                  </div>
                  <div>
                    <label className="text-blue-900 font-bold mb-1 block">Bio</label>
                    <textarea name="bio" placeholder="Bio" value={profileForm.bio || ""} onChange={handleProfileForm} className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full" />
                  </div>
                  <div>
                    <label className="text-blue-900 font-bold mb-1 block">Titles (boleh lebih dari satu, pisahkan dengan koma)</label>
                    <input
                      type="text"
                      name="titles"
                      placeholder="Web Developer, Content Creator"
                      value={profileForm.titles || ""}
                      onChange={e => setProfileForm({ ...profileForm, titles: e.target.value })}
                      className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full"
                    />
                  </div>
                  <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-bold text-lg shadow mt-2">Update Profile</button>
                </form>
                {profile && profile.photo_url && (
                  <img src={profile.photo_url} alt="Profile" className="w-48 h-48 rounded-full object-cover border-4 border-cyan-300 shadow-xl" />
                )}
              </div>
            </section>
          )}
          {/* Sections Tab */}
          {tab === "sections" && (
            <section>
              <div className="bg-white rounded-2xl shadow-2xl p-8 mb-10 border border-blue-200">
                <h3 className="font-bold mb-4 text-blue-800 text-lg">Daftar Section</h3>
                {sectionLoading ? (
                  <div className="py-8 text-center text-blue-700 font-semibold">Loading...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-base border border-blue-200 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-blue-200 text-blue-900 font-bold">
                          <th className="p-3 px-6 text-left min-w-[120px]">Type</th>
                          <th className="p-3 px-6 text-left min-w-[220px]">Description</th>
                          <th className="p-3 px-6 text-left min-w-[180px]">Skills</th>
                          <th className="p-3 px-4 text-center w-36">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sectionRows.map((row, i) => (
                          <tr
                            key={row.type}
                            className={
                              (i % 2 === 0 ? "bg-white" : "bg-blue-50") +
                              " border-b border-blue-200 hover:bg-blue-100 transition"
                            }
                          >
                            <td className="p-3 px-6 font-semibold text-blue-900 align-middle capitalize">{row.type}</td>
                            <td className="p-3 px-6 text-gray-700 align-middle">{row.data.description || <span className="text-gray-400 italic">Belum diisi</span>}</td>
                            <td className="p-3 px-6 text-gray-700 align-middle">
                              {(row.data.skills && JSON.parse(row.data.skills).length > 0)
                                ? JSON.parse(row.data.skills).join(', ')
                                : <span className="text-gray-400 italic">Belum diisi</span>
                              }
                            </td>
                            <td className="p-3 px-4 text-center align-middle">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg font-semibold text-sm gap-1"
                                  onClick={() => {
                                    setShowSectionForm(true);
                                    setSectionForm({
                                      type: row.type,
                                      description: row.data.description || "",
                                      skills: JSON.parse(row.data.skills || "[]").join(", "),
                                      id: row.data.id,
                                    });
                                    setEditSectionId(row.data.id !== undefined ? row.data.id : null);
                                  }}
                                  title="Edit"
                                >
                                  <MdEdit size={18} />
                                  <span>Edit</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {showSectionForm && (
                <ModalForm
                  title={`Edit Section ${sectionForm.type ? sectionForm.type.charAt(0).toUpperCase() + sectionForm.type.slice(1) : ""}`}
                  onClose={() => {
                    setShowSectionForm(false);
                    setEditSectionId(null);
                    setSectionForm({});
                  }}
                >
                  <form
                    onSubmit={handleSectionSubmit}
                    className="flex flex-col gap-5"
                  >
                    <div>
                      <label className="text-blue-900 font-bold mb-1 block">Description</label>
                      <textarea
                        name="description"
                        placeholder="Description"
                        value={sectionForm.description || ""}
                        onChange={handleSectionForm}
                        className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full"
                      />
                    </div>
                    <div>
                      <label className="text-blue-900 font-bold mb-1 block">Skills (pisahkan dengan koma)</label>
                      <input
                        type="text"
                        name="skills"
                        placeholder="Skill1, Skill2, ..."
                        value={sectionForm.skills || ""}
                        onChange={handleSectionSkills}
                        className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full"
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold text-lg shadow"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-bold text-lg shadow"
                        onClick={() => {
                          setShowSectionForm(false);
                          setEditSectionId(null);
                          setSectionForm({});
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </ModalForm>
              )}
            </section>
          )}
        </div>
        {notification.show && (
          <Toast
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ ...notification, show: false })}
          />
        )}
        {showDeleteExpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full flex flex-col items-center">
              <h3 className="text-xl font-bold mb-4 text-blue-900">Konfirmasi Hapus</h3>
              <p className="mb-6 text-gray-700 text-center">Yakin ingin menghapus experience ini?</p>
              <div className="flex gap-4">
                <button onClick={confirmDeleteExp} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold">Ya, Hapus</button>
                <button onClick={cancelDeleteExp} className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-bold">Batal</button>
              </div>
            </div>
          </div>
        )}
        {showDeleteProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full flex flex-col items-center">
              <h3 className="text-xl font-bold mb-4 text-blue-900">Konfirmasi Hapus</h3>
              <p className="mb-6 text-gray-700 text-center">Yakin ingin menghapus project ini?</p>
              <div className="flex gap-4">
                <button onClick={confirmDeleteProject} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold">Ya, Hapus</button>
                <button onClick={cancelDeleteProject} className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-bold">Batal</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 