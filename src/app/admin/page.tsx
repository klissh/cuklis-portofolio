"use client";
import { useState, useEffect } from "react";
import { FaProjectDiagram, FaUserTie, FaUserCircle, FaLayerGroup, FaCertificate, FaDatabase } from "react-icons/fa";
import { MdLogout, MdEdit, MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import { uploadImage, supabase } from "@/utils/supabaseClient";
import Toast from "@/components/Toast";
import ModalForm from "@/components/ModalForm";
import SearchBar from "@/components/admin/SearchBar";
import Pagination from "@/components/admin/Pagination";

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
  date_start: string; // YYYY-MM
  date_end?: string; // YYYY-MM or null
  link?: string;
  image: string;
  created_at: string;
  order: number;
}
// Profile
interface Profile {
  id: number;
  name: string;
  photo_url: string;
  cv_url?: string;
  bio: string;
  description?: string; // Deskripsi tambahan
  titles?: string; // string JSON
  created_at: string;
}
// Section (Develop/Create)
interface Section {
  id: number;
  type: string; // 'develop' | 'create'
  skills: string; // JSON string array
  created_at: string;
}

// Form interface untuk section yang menggabungkan data profile dan section
interface SectionForm {
  id?: number;
  type?: string;
  skills?: string;
  name?: string; // Untuk nama profile
  cv_url?: string; // Untuk CV profile
}
// Certificate
interface Certificate {
  id: number;
  title: string;
  image: string;
  link: string;
  created_at: string;
}

// Skill interface
interface Skill {
  name: string;
  logo: string;
}

const TABS = [
  { key: "projects", label: "Projects", icon: <FaProjectDiagram size={22} className="mr-3" /> },
  { key: "certificates", label: "Certificates", icon: <FaCertificate size={22} className="mr-3" /> },
  { key: "experiences", label: "Experiences", icon: <FaUserTie size={22} className="mr-3" /> },
  { key: "profile", label: "Profile", icon: <FaUserCircle size={22} className="mr-3" /> },
  { key: "sections", label: "Sections", icon: <FaLayerGroup size={22} className="mr-3" /> },
  { key: "storage", label: "Storage", icon: <FaDatabase size={22} className="mr-3" /> },
];

// Jumlah baris per halaman untuk tabel Projects, Certificates, dan Skills
// (di dalam tab Sections) -- dipakai bersama komponen Pagination.
const ADMIN_PAGE_SIZE = 8;

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
  const [projectSearch, setProjectSearch] = useState("");
  const [projectPage, setProjectPage] = useState(1);

  // Experiences state
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [expForm, setExpForm] = useState<Partial<Experience>>({});
  const [editExpId, setEditExpId] = useState<number | null>(null);
  const [expLoading, setExpLoading] = useState(false);
  const [experienceSearch, setExperienceSearch] = useState("");
  const [experiencePage, setExperiencePage] = useState(1);

  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileForm, setProfileForm] = useState<Partial<Profile & { titles?: string }>>({});
  const [profileLoading, setProfileLoading] = useState(false);

  // Sections state
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionForm, setSectionForm] = useState<Partial<SectionForm>>({ type: "develop" });
  const [editSectionId, setEditSectionId] = useState<number | null>(null);
  const [sectionLoading, setSectionLoading] = useState(false);

  // Skills state
  const [skillsList, setSkillsList] = useState<Skill[]>([]);
  const [skillForm, setSkillForm] = useState<Skill>({ name: "", logo: "" });
  const [editSkillId, setEditSkillId] = useState<number | null>(null);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [skillPage, setSkillPage] = useState(1);

  // Certificates state
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificateForm, setCertificateForm] = useState<Partial<Certificate>>({});
  const [editCertificateId, setEditCertificateId] = useState<number | null>(null);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificateSearch, setCertificateSearch] = useState("");
  const [certificatePage, setCertificatePage] = useState(1);

  // Tambah state untuk file gambar
  const [projectImageFile, setProjectImageFile] = useState<File | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileCvFile, setProfileCvFile] = useState<File | null>(null);

  // Tambah state untuk file gambar di experience
  const [expImageFile, setExpImageFile] = useState<File | null>(null);

  // Tambah state untuk file gambar di certificate
  const [certificateImageFile, setCertificateImageFile] = useState<File | null>(null);

  // Tambahkan state baru:
  const [showExpForm, setShowExpForm] = useState(false);
  const [expFormMode, setExpFormMode] = useState<"add" | "edit">("add");
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
  const [notification, setNotification] = useState<{ show: boolean, message: string, type: "success" | "error" }>({ show: false, message: "", type: "success" });

  // Tambahkan di atas, setelah state Projects yang sudah ada
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectFormMode, setProjectFormMode] = useState<"add" | "edit">("add");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Tambahkan state untuk certificate form
  const [showCertificateForm, setShowCertificateForm] = useState(false);
  const [certificateFormMode, setCertificateFormMode] = useState<"add" | "edit">("add");
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // Tambahkan state untuk section form
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [sectionFormMode, setSectionFormMode] = useState<"edit">("edit");
  const [currentSectionType, setCurrentSectionType] = useState<"develop" | "create">("develop");

  // Tambah state untuk modal konfirmasi hapus experience
  const [showDeleteExpModal, setShowDeleteExpModal] = useState(false);
  const [expIdToDelete, setExpIdToDelete] = useState<number | null>(null);

  // Tambah state untuk modal konfirmasi hapus project
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
  const [projectIdToDelete, setProjectIdToDelete] = useState<number | null>(null);

  // Tambah state untuk modal konfirmasi hapus certificate
  const [showDeleteCertificateModal, setShowDeleteCertificateModal] = useState(false);
  const [certificateIdToDelete, setCertificateIdToDelete] = useState<number | null>(null);

  // Storage cleanup state
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<{ deletedCount: number; message: string } | null>(null);

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
    if (tab === "certificates") fetchCertificates();
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

  // ------------------- STORAGE CLEANUP -------------------
  const handleStorageCleanup = async (mode: 'unused' | 'old' = 'unused') => {
    try {
      setCleanupLoading(true);
      setCleanupResult(null);
      
      const res = await fetch('/api/admin/storage-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, daysOld: 30 })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const deletedCount = data.deletedCount || 0;
        let message = '';
        
        if (deletedCount > 0) {
          message = `Berhasil menghapus ${deletedCount} file yang tidak digunakan!`;
          setNotification({ show: true, message, type: 'success' });
        } else {
          message = 'Tidak ada file yang perlu dihapus. Storage sudah bersih!';
          setNotification({ show: true, message, type: 'success' });
        }
        
        setCleanupResult({ deletedCount, message });
      } else {
        setNotification({ 
          show: true, 
          message: data.error || 'Gagal membersihkan storage!', 
          type: 'error' 
        });
      }
    } catch (error) {
      setNotification({ 
        show: true, 
        message: 'Terjadi kesalahan saat membersihkan storage!', 
        type: 'error' 
      });
      console.error('Storage cleanup error:', error);
    } finally {
      setCleanupLoading(false);
    }
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

  // ------------------- CERTIFICATES CRUD -------------------
  const fetchCertificates = async () => {
    setCertificateLoading(true);
    const res = await fetch("/api/certificates");
    const data = await res.json();
    setCertificates(data);
    setCertificateLoading(false);
  };
  const handleCertificateForm = (e: any) => setCertificateForm({ ...certificateForm, [e.target.name]: e.target.value });
  const handleCertificateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCertificateImageFile(e.target.files[0]);
    }
  };
  const handleCertificateSubmit = async (e: any) => {
    e.preventDefault();
    let imageUrl = certificateForm.image || "";
    if (certificateImageFile) {
      imageUrl = await uploadImage(certificateImageFile, "certificate-images");
    }
    const payload = { ...certificateForm, image: imageUrl };
    if (editCertificateId) {
      await fetch(`/api/certificates/${editCertificateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setCertificateForm({});
    setCertificateImageFile(null);
    setEditCertificateId(null);
    setShowCertificateForm(false);
    fetchCertificates();
  };
  const handleCertificateEdit = (c: Certificate) => {
    setCertificateForm({ title: c.title, image: c.image, link: c.link });
    setEditCertificateId(c.id);
  };
  const handleCertificateDelete = async (id: number) => {
    setShowDeleteCertificateModal(true);
    setCertificateIdToDelete(id);
  };
  const confirmDeleteCertificate = async () => {
    if (certificateIdToDelete == null) return;
    await fetch(`/api/certificates/${certificateIdToDelete}`, { method: "DELETE" });
    setNotification({ show: true, message: "Certificate berhasil dihapus!", type: "error" });
    setShowDeleteCertificateModal(false);
    setCertificateIdToDelete(null);
    fetchCertificates();
  };
  const cancelDeleteCertificate = () => {
    setShowDeleteCertificateModal(false);
    setCertificateIdToDelete(null);
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
    setExpForm({ title: exp.title, company: exp.company, description: exp.description, date_start: exp.date_start, date_end: exp.date_end, link: exp.link, image: exp.image });
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
      cv_url: data.cv_url,
      bio: data.bio,
      description: data.description || "",
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
  
  const handleProfileCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileCvFile(e.target.files[0]);
    }
  };
  
  const handleProfileSubmit = async (e: any) => {
    e.preventDefault();
    let photoUrl = profileForm.photo_url || "";
    let cvUrl = profileForm.cv_url || "";
    
    if (profileImageFile) {
      photoUrl = await uploadImage(profileImageFile, "profile-images");
    }
    
    if (profileCvFile) {
      cvUrl = await uploadImage(profileCvFile, "cv-files");
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
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profileForm, photo_url: photoUrl, cv_url: cvUrl, titles }),
      });
      if (res.ok) {
        setNotification({ show: true, message: "Profile berhasil diupdate!", type: "success" });
      } else {
        const data = await res.json();
        setNotification({ show: true, message: data?.error || "Gagal update profile!", type: "error" });
      }
    } catch (err) {
      setNotification({ show: true, message: "Gagal update profile!", type: "error" });
    }
    setProfileImageFile(null);
    setProfileCvFile(null);
    fetchProfile();
  };

  // ------------------- SECTIONS CRUD -------------------
  const fetchSections = async () => {
    setSectionLoading(true);
    const res = await fetch("/api/sections");
    const data = await res.json();
    console.log("Fetched sections data:", data);
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
  
  console.log("developSection:", developSection);
  console.log("createSection:", createSection);

  const sectionRows = [
    {
      type: "develop",
      data: developSection || { title: "", skills: "[]", id: undefined }
    },
    {
      type: "create",
      data: createSection || { title: "", skills: "[]", id: undefined }
    }
  ];

  // ------------------- SKILLS CRUD -------------------
  // Load skills from createSection
  useEffect(() => {
    if (createSection?.skills) {
      try {
        const parsedSkills = JSON.parse(createSection.skills);
        if (Array.isArray(parsedSkills)) {
          // Convert old format (string array) to new format (object array)
          const skillsArray = parsedSkills.map(skill => {
            if (typeof skill === 'string') {
              // Untuk skill lama yang hanya berupa string, biarkan logo kosong
              // User harus mengisi URL logo secara manual
              return { name: skill, logo: "" };
            }
            return skill;
          });
          setSkillsList(skillsArray);
        }
      } catch (e) {
        setSkillsList([]);
      }
    } else {
      setSkillsList([]);
    }
  }, [createSection]);

  const handleSkillForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillForm({ ...skillForm, [e.target.name]: e.target.value });
  };

  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let updatedSkills = [...skillsList];
      
      if (editSkillId !== null) {
        // Edit existing skill
        updatedSkills[editSkillId] = skillForm;
      } else {
        // Add new skill
        updatedSkills.push(skillForm);
      }
      
      // Update createSection with new skills
      const skillsJson = JSON.stringify(updatedSkills);
      
      if (createSection?.id) {
        console.log('Updating existing section:', createSection.id);
        const res = await fetch(`/api/sections/${createSection.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            type: createSection.type,
            skills: skillsJson 
          }),
        });
        
        console.log('Response status:', res.status);
        const responseData = await res.text();
        console.log('Response data:', responseData);
        
        if (res.ok) {
          setNotification({ show: true, message: "Skill berhasil disimpan!", type: "success" });
          setShowSkillForm(false);
          setEditSkillId(null);
          setSkillForm({ name: "", logo: "" });
          fetchSections(); // Refresh sections data
        } else {
          console.error('Failed to update section:', res.status, responseData);
          setNotification({ show: true, message: `Gagal menyimpan skill! Status: ${res.status}`, type: "error" });
        }
      } else {
        console.log('Creating new section');
        const res = await fetch("/api/sections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "create",
            skills: skillsJson
          }),
        });
        
        console.log('Response status:', res.status);
        const responseData = await res.text();
        console.log('Response data:', responseData);
        
        if (res.ok) {
          setNotification({ show: true, message: "Skill berhasil disimpan!", type: "success" });
          setShowSkillForm(false);
          setEditSkillId(null);
          setSkillForm({ name: "", logo: "" });
          fetchSections(); // Refresh sections data
        } else {
          console.error('Failed to create section:', res.status, responseData);
          setNotification({ show: true, message: `Gagal menyimpan skill! Status: ${res.status}`, type: "error" });
        }
      }
    } catch (error) {
      console.error('Error in handleSkillSubmit:', error);
      setNotification({ show: true, message: "Terjadi error saat menyimpan skill!", type: "error" });
    }
  };

  const handleSkillDelete = async (index: number) => {
    if (!confirm("Yakin hapus skill ini?")) return;
    
    const updatedSkills = skillsList.filter((_, i) => i !== index);
    const skillsJson = JSON.stringify(updatedSkills);
    
    if (createSection?.id) {
      const res = await fetch(`/api/sections/${createSection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: createSection.type,
          skills: skillsJson 
        }),
      });
      
      if (res.ok) {
        setNotification({ show: true, message: "Skill berhasil dihapus!", type: "success" });
        fetchSections(); // Refresh sections data
      } else {
        setNotification({ show: true, message: "Gagal menghapus skill!", type: "error" });
      }
    }
  };

  // ------------------- Search & Pagination (Projects, Certificates, Skills) -------------------
  // Client-side saja: data lengkap sudah di-fetch semua dari Supabase ke
  // state React, jadi filter dan pagination cukup dihitung ulang di sini
  // setiap render tanpa perlu request tambahan ke server.

  const filteredExperiences = experiences.filter((exp) => {
    const q = experienceSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      exp.title?.toLowerCase().includes(q) ||
      exp.company?.toLowerCase().includes(q) ||
      exp.description?.toLowerCase().includes(q)
    );
  });
  const experienceTotalPages = Math.max(1, Math.ceil(filteredExperiences.length / ADMIN_PAGE_SIZE));
  const paginatedExperiences = filteredExperiences.slice(
    (experiencePage - 1) * ADMIN_PAGE_SIZE,
    experiencePage * ADMIN_PAGE_SIZE
  );

  const filteredProjects = projects.filter((p) => {
    const q = projectSearch.trim().toLowerCase();
    if (!q) return true;
    return p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
  });
  const projectTotalPages = Math.max(1, Math.ceil(filteredProjects.length / ADMIN_PAGE_SIZE));
  const paginatedProjects = filteredProjects.slice(
    (projectPage - 1) * ADMIN_PAGE_SIZE,
    projectPage * ADMIN_PAGE_SIZE
  );

  const filteredCertificates = certificates.filter((c) => {
    const q = certificateSearch.trim().toLowerCase();
    if (!q) return true;
    return c.title?.toLowerCase().includes(q);
  });
  const certificateTotalPages = Math.max(1, Math.ceil(filteredCertificates.length / ADMIN_PAGE_SIZE));
  const paginatedCertificates = filteredCertificates.slice(
    (certificatePage - 1) * ADMIN_PAGE_SIZE,
    certificatePage * ADMIN_PAGE_SIZE
  );

  // Skill disimpan sebagai array JSON di dalam satu baris "section", bukan
  // baris tersendiri di database -- editSkillId & handleSkillDelete merujuk
  // ke index di skillsList ASLI (belum difilter). Supaya edit/hapus tetap
  // menunjuk skill yang benar setelah difilter & dipaginasi, index asli
  // disimpan berbarengan dengan datanya SEBELUM proses filter berjalan.
  const filteredSkillEntries = skillsList
    .map((skill, originalIndex) => ({ skill, originalIndex }))
    .filter(({ skill }) => {
      const q = skillSearch.trim().toLowerCase();
      if (!q) return true;
      return skill.name?.toLowerCase().includes(q);
    });
  const skillTotalPages = Math.max(1, Math.ceil(filteredSkillEntries.length / ADMIN_PAGE_SIZE));
  const paginatedSkillEntries = filteredSkillEntries.slice(
    (skillPage - 1) * ADMIN_PAGE_SIZE,
    skillPage * ADMIN_PAGE_SIZE
  );

  // Jaga-jaga: kalau halaman saat ini jadi melebihi total halaman (karena
  // data dihapus, atau hasil pencarian menyusut), mundurkan ke halaman
  // terakhir yang masih valid supaya tidak menampilkan tabel kosong.
  useEffect(() => {
    if (projectPage > projectTotalPages) setProjectPage(projectTotalPages);
  }, [projectPage, projectTotalPages]);
  useEffect(() => {
    if (experiencePage > experienceTotalPages) setExperiencePage(experienceTotalPages);
  }, [experiencePage, experienceTotalPages]);
  useEffect(() => {
    if (certificatePage > certificateTotalPages) setCertificatePage(certificateTotalPages);
  }, [certificatePage, certificateTotalPages]);
  useEffect(() => {
    if (skillPage > skillTotalPages) setSkillPage(skillTotalPages);
  }, [skillPage, skillTotalPages]);

  // ------------------- UI -------------------
  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600 p-4">
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
                <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
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
                <div className="mb-4">
                  <SearchBar
                    value={projectSearch}
                    onChange={(v) => {
                      setProjectSearch(v);
                      setProjectPage(1);
                    }}
                    placeholder="Cari berdasarkan judul atau deskripsi..."
                  />
                </div>
                {projectLoading ? (
                  <div className="py-8 text-center text-blue-700 font-semibold">Loading...</div>
                ) : filteredProjects.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 font-semibold">
                    {projectSearch ? "Tidak ada project yang cocok dengan pencarian." : "Belum ada project."}
                  </div>
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
                        {paginatedProjects.map((p, i) => (
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
                <Pagination
                  currentPage={projectPage}
                  totalItems={filteredProjects.length}
                  pageSize={ADMIN_PAGE_SIZE}
                  onPageChange={setProjectPage}
                />
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
          {/* Certificates Tab */}
          {tab === "certificates" && (
            <section>
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-200">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                  <h3 className="font-bold text-blue-800 text-lg">Daftar Certificate</h3>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-bold flex items-center gap-2"
                    onClick={() => {
                      setShowCertificateForm(true);
                      setCertificateFormMode("add");
                      setSelectedCertificate(null);
                      setCertificateForm({});
                      setCertificateImageFile(null);
                    }}
                  >
                    + Tambah Certificate
                  </button>
                </div>
                <div className="mb-4">
                  <SearchBar
                    value={certificateSearch}
                    onChange={(v) => {
                      setCertificateSearch(v);
                      setCertificatePage(1);
                    }}
                    placeholder="Cari berdasarkan judul..."
                  />
                </div>
                {certificateLoading ? (
                  <div className="py-8 text-center text-blue-700 font-semibold">Loading...</div>
                ) : filteredCertificates.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 font-semibold">
                    {certificateSearch ? "Tidak ada certificate yang cocok dengan pencarian." : "Belum ada certificate."}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-base border border-blue-200 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-blue-200 text-blue-900 font-bold">
                          <th className="p-3 px-6 text-left min-w-[180px]">Title</th>
                          <th className="p-3 px-4 text-center w-32">Link</th>
                          <th className="p-3 px-4 text-center w-28">Image</th>
                          <th className="p-3 px-4 text-center w-36">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCertificates.map((c, i) => (
                          <tr
                            key={c.id}
                            className={
                              (i % 2 === 0 ? "bg-white" : "bg-blue-50") +
                              " border-b border-blue-200 hover:bg-blue-100 transition"
                            }
                          >
                            <td className="p-3 px-6 font-semibold text-blue-900 align-middle">{c.title}</td>
                            <td className="p-3 px-4 text-center align-middle">
                              <a href={c.link} className="text-cyan-700 underline" target="_blank" rel="noopener noreferrer">
                                Visit
                              </a>
                            </td>
                            <td className="p-3 px-4 text-center align-middle">
                              {c.image && (
                                <img
                                  src={c.image}
                                  alt="Certificate"
                                  className="w-12 h-12 object-cover rounded border border-blue-200 mx-auto"
                                />
                              )}
                            </td>
                            <td className="p-3 px-4 text-center align-middle">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg font-semibold text-sm gap-1"
                                  onClick={() => {
                                    setShowCertificateForm(true);
                                    setCertificateFormMode("edit");
                                    setSelectedCertificate(c);
                                    setCertificateForm({ title: c.title, image: c.image, link: c.link });
                                    setEditCertificateId(c.id);
                                    setCertificateImageFile(null);
                                  }}
                                  title="Edit"
                                >
                                  <MdEdit size={18} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold text-sm gap-1"
                                  onClick={() => handleCertificateDelete(c.id)}
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
                <Pagination
                  currentPage={certificatePage}
                  totalItems={filteredCertificates.length}
                  pageSize={ADMIN_PAGE_SIZE}
                  onPageChange={setCertificatePage}
                />
                {/* Modal Form */}
                {showCertificateForm && (
                  <ModalForm
                    title={certificateFormMode === "add" ? "Tambah Certificate" : "Edit Certificate"}
                    onClose={() => {
                      setShowCertificateForm(false);
                      setEditCertificateId(null);
                      setCertificateForm({});
                      setCertificateImageFile(null);
                    }}
                  >
                    <form
                      onSubmit={handleCertificateSubmit}
                      className="flex flex-col gap-5"
                    >
                      <div>
                        <label className="text-blue-900 font-bold mb-1 block">Title</label>
                        <input
                          type="text"
                          name="title"
                          placeholder="Title"
                          value={certificateForm.title || ""}
                          onChange={handleCertificateForm}
                          className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full"
                        />
                      </div>
                      <div>
                        <label className="text-blue-900 font-bold mb-1 block">Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCertificateFileChange}
                          className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full"
                        />
                      </div>
                      <div>
                        <label className="text-blue-900 font-bold mb-1 block">Certificate Link</label>
                        <input
                          type="text"
                          name="link"
                          placeholder="Certificate Link"
                          value={certificateForm.link || ""}
                          onChange={handleCertificateForm}
                          className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full"
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold text-lg shadow"
                        >
                          {certificateFormMode === "edit" ? "Update" : "Add"} Certificate
                        </button>
                        <button
                          type="button"
                          className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-bold text-lg shadow"
                          onClick={() => {
                            setShowCertificateForm(false);
                            setEditCertificateId(null);
                            setCertificateForm({});
                            setCertificateImageFile(null);
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
                <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
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
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
                  <SearchBar
                    value={experienceSearch}
                    onChange={(v) => {
                      setExperienceSearch(v);
                      setExperiencePage(1);
                    }}
                    placeholder="Cari berdasarkan title, company, atau deskripsi..."
                  />
                  {experienceSearch && (
                    <p className="text-xs text-gray-500 italic">
                      Tombol urutan (▲▼) dinonaktifkan sementara saat pencarian aktif -- hapus pencarian untuk mengubah urutan.
                    </p>
                  )}
                </div>
                {expLoading ? (
                  <div className="py-8 text-center text-blue-700 font-semibold">Loading...</div>
                ) : filteredExperiences.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 font-semibold">
                    {experienceSearch ? "Tidak ada experience yang cocok dengan pencarian." : "Belum ada experience."}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-blue-200 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-blue-200 text-blue-900 font-bold">
                          <th className="p-2 px-3 text-left min-w-[120px]">Title</th>
                          <th className="p-2 px-3 text-left min-w-[100px]">Company</th>
                          <th className="p-2 px-3 text-left min-w-[150px]">Description</th>
                          <th className="p-2 px-2 text-center w-20">Start</th>
                          <th className="p-2 px-2 text-center w-20">End</th>
                          <th className="p-2 px-2 text-center w-16">Link</th>
                          <th className="p-2 px-2 text-center w-16">Image</th>
                          <th className="p-2 px-2 text-center w-32">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedExperiences.map((exp) => {
                          // Tombol ▲▼ menukar 'order' dengan tetangga di data LENGKAP
                          // (experiences, sudah terurut oleh 'order' dari API), bukan
                          // dengan tetangga di tampilan yang sedang difilter/dipaginasi.
                          // Ini penting supaya urutan yang berubah tetap benar walau
                          // sedang mencari atau berada di halaman lain.
                          const trueIndex = experiences.findIndex((e) => e.id === exp.id);
                          const isFirst = trueIndex <= 0;
                          const isLast = trueIndex === experiences.length - 1;
                          const reorderDisabled = experienceSearch.trim() !== "";
                          return (
                          <tr
                            key={exp.id}
                            className="border-b border-blue-200 hover:bg-blue-100 transition odd:bg-white even:bg-blue-50"
                          >
                            <td className="p-2 px-3 font-semibold text-blue-900 align-middle text-sm">{exp.title}</td>
                            <td className="p-2 px-3 text-blue-800 align-middle text-sm">{exp.company || '-'}</td>
                            <td className="p-2 px-3 text-gray-700 align-middle text-sm">
                              <div className="max-w-[150px] truncate" title={exp.description}>
                                {exp.description}
                              </div>
                            </td>
                            <td className="p-2 px-2 text-blue-800 font-semibold text-center align-middle text-xs">{exp.date_start}</td>
                            <td className="p-2 px-2 text-blue-800 font-semibold text-center align-middle text-xs">{exp.date_end || '-'}</td>
                            <td className="p-2 px-2 text-center align-middle">
                              {exp.link && (
                                <a href={exp.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">Link</a>
                              )}
                            </td>
                            <td className="p-2 px-2 text-center align-middle">
                              {exp.image && (
                                <img
                                  src={exp.image}
                                  alt="Experience"
                                  className="w-8 h-8 object-cover rounded border border-blue-200 mx-auto"
                                />
                              )}
                            </td>
                            <td className="p-2 px-2 text-center align-middle">
                              <div className="flex items-center justify-center space-x-1">
                                {/* Tombol Naik */}
                                <button
                                  className="bg-gray-300 hover:bg-gray-400 text-blue-900 px-1 py-1 rounded text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                                  disabled={isFirst || reorderDisabled}
                                  onClick={async () => {
                                    if (isFirst || reorderDisabled) return;
                                    const above = experiences[trueIndex - 1];
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
                                  title={reorderDisabled ? "Hapus pencarian untuk mengubah urutan" : "Naik"}
                                >
                                  ▲
                                </button>
                                {/* Tombol Turun */}
                                <button
                                  className="bg-gray-300 hover:bg-gray-400 text-blue-900 px-1 py-1 rounded text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                                  disabled={isLast || reorderDisabled}
                                  onClick={async () => {
                                    if (isLast || reorderDisabled) return;
                                    const below = experiences[trueIndex + 1];
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
                                  title={reorderDisabled ? "Hapus pencarian untuk mengubah urutan" : "Turun"}
                                >
                                  ▼
                                </button>
                                <button
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                                  onClick={() => {
                                    setShowExpForm(true);
                                    setExpFormMode("edit");
                                    setSelectedExp(exp);
                                    setExpForm({ title: exp.title, company: exp.company, description: exp.description, date_start: exp.date_start, date_end: exp.date_end, link: exp.link, image: exp.image });
                                    setEditExpId(exp.id);
                                    setExpImageFile(null);
                                  }}
                                  title="Edit"
                                >
                                  <MdEdit size={14} />
                                </button>
                                <button
                                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                                  onClick={() => handleExpDelete(exp.id)}
                                  title="Delete"
                                >
                                  <MdDelete size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <Pagination
                      currentPage={experiencePage}
                      totalItems={filteredExperiences.length}
                      pageSize={ADMIN_PAGE_SIZE}
                      onPageChange={setExperiencePage}
                    />
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
                        <label className="text-blue-900 font-bold mb-1 block">Date Start</label>
                        <input
                          type="month"
                          name="date_start"
                          placeholder="Date Start"
                          value={expForm.date_start || ""}
                          onChange={handleExpForm}
                          className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full"
                        />
                      </div>
                      <div>
                        <label className="text-blue-900 font-bold mb-1 block">Date End (optional)</label>
                        <input
                          type="month"
                          name="date_end"
                          placeholder="Date End"
                          value={expForm.date_end || ""}
                          onChange={handleExpForm}
                          className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full"
                        />
                      </div>
                      <div>
                        <label className="text-blue-900 font-bold mb-1 block">Link</label>
                        <input
                          type="url"
                          name="link"
                          placeholder="https://..."
                          value={expForm.link || ""}
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
                    <label className="text-blue-900 font-bold mb-1 block">Deskripsi Tambahan</label>
                    <textarea 
                      name="description" 
                      placeholder="Deskripsi tambahan untuk bagian Hello, I'm..." 
                      value={profileForm.description || ""} 
                      onChange={handleProfileForm} 
                      rows={4}
                      className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full" 
                    />
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
                  <div>
                    <label className="text-blue-900 font-bold mb-1 block">CV File (PDF)</label>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleProfileCvChange} 
                      className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full" 
                    />
                    {profile && profile.cv_url && (
                      <div className="mt-2">
                        <a 
                          href={profile.cv_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-sm"
                        >
                          Lihat CV saat ini
                        </a>
                      </div>
                    )}
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
              {/* Skill dan Tools Section */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 mb-10 border border-blue-200">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                  <h3 className="font-bold text-blue-800 text-lg">Skill dan Tools saya</h3>
                  <button
                    className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm gap-1"
                    onClick={() => {
                      setShowSkillForm(true);
                      setSkillForm({ name: "", logo: "" });
                      setEditSkillId(null);
                    }}
                  >
                    <span>+ Tambah Skill</span>
                  </button>
                </div>
                <div className="mb-4">
                  <SearchBar
                    value={skillSearch}
                    onChange={(v) => {
                      setSkillSearch(v);
                      setSkillPage(1);
                    }}
                    placeholder="Cari nama skill..."
                  />
                </div>
                {sectionLoading ? (
                  <div className="py-8 text-center text-blue-700 font-semibold">Loading...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-base border border-blue-200 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-blue-200 text-blue-900 font-bold">
                          <th className="p-3 px-6 text-left">Nama Skill</th>
                          <th className="p-3 px-6 text-left">Logo URL</th>
                          <th className="p-3 px-4 text-center w-36">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedSkillEntries.map(({ skill, originalIndex }, i) => (
                          <tr
                            key={originalIndex}
                            className={
                              (i % 2 === 0 ? "bg-white" : "bg-blue-50") +
                              " border-b border-blue-200 hover:bg-blue-100 transition"
                            }
                          >
                            <td className="p-3 px-6 font-semibold text-blue-900 align-middle">
                              {skill.name}
                            </td>
                            <td className="p-3 px-6 text-gray-700 align-middle">
                              <div className="flex items-center gap-2">
                                <img src={skill.logo} alt={skill.name} className="w-6 h-6" onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }} />
                                <span className="text-sm text-gray-500 truncate max-w-xs">{skill.logo}</span>
                              </div>
                            </td>
                            <td className="p-3 px-4 text-center align-middle">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg font-semibold text-sm gap-1"
                                  onClick={() => {
                                    setShowSkillForm(true);
                                    setSkillForm(skill);
                                    setEditSkillId(originalIndex);
                                  }}
                                  title="Edit"
                                >
                                  <MdEdit size={18} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  className="flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-semibold text-sm gap-1"
                                  onClick={() => handleSkillDelete(originalIndex)}
                                  title="Delete"
                                >
                                  <MdDelete size={18} />
                                  <span>Hapus</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredSkillEntries.length === 0 && (
                          <tr>
                            <td colSpan={3} className="p-6 text-center text-gray-500 italic">
                              {skillSearch
                                ? "Tidak ada skill yang cocok dengan pencarian."
                                : "Belum ada skill yang ditambahkan"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <Pagination
                      currentPage={skillPage}
                      totalItems={filteredSkillEntries.length}
                      pageSize={ADMIN_PAGE_SIZE}
                      onPageChange={setSkillPage}
                    />
                  </div>
                )}
              </div>

              {/* Modal Form untuk Skill CRUD */}
              {showSkillForm && (
                <ModalForm
                  title={editSkillId !== null ? "Edit Skill" : "Tambah Skill"}
                  onClose={() => {
                    setShowSkillForm(false);
                    setEditSkillId(null);
                    setSkillForm({ name: "", logo: "" });
                  }}
                >
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSkillSubmit(e);
                    }}
                    className="flex flex-col gap-5"
                  >
                    <div>
                      <label className="text-blue-900 font-bold mb-1 block">Nama Skill</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Contoh: PHP, Python, Laravel, React..."
                        value={skillForm.name || ""}
                        onChange={handleSkillForm}
                        className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-blue-900 font-bold mb-1 block">Logo URL</label>
                      <input
                        type="url"
                        name="logo"
                        placeholder="https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/PHP-logo.svg/1067px-PHP-logo.svg.png"
                        value={skillForm.logo || ""}
                        onChange={handleSkillForm}
                        className="bg-white border border-gray-400 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-sm p-3 rounded-lg w-full"
                        required
                      />
                      <p className="text-gray-600 text-sm mt-1">
                        Gunakan URL lengkap dari internet (contoh: dari Wikimedia, Google Images, dll). Jangan gunakan path lokal.
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSkillSubmit(e);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold text-lg shadow"
                      >
                        {editSkillId !== null ? "Update" : "Tambah"}
                      </button>
                      <button
                        type="button"
                        className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-bold text-lg shadow"
                        onClick={() => {
                          setShowSkillForm(false);
                          setEditSkillId(null);
                          setSkillForm({ name: "", logo: "" });
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

          {/* Storage Tab */}
          {tab === "storage" && (
            <section className="bg-white rounded-xl shadow-lg p-8 border border-blue-200">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                <h3 className="font-bold text-blue-800 text-xl">Storage Management</h3>
                <div className="text-sm text-gray-600">
                  Kelola file-file yang tersimpan di Supabase Storage
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Cleanup Unused Files */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-800 text-lg mb-3 flex items-center gap-2">
                    <FaDatabase className="text-blue-600" />
                    Cleanup File Tidak Terpakai
                  </h4>
                  <p className="text-gray-700 mb-4 text-sm">
                    Hapus file-file di storage yang tidak lagi digunakan oleh project, certificate, atau experience manapun.
                  </p>
                  <button
                    onClick={() => handleStorageCleanup('unused')}
                    disabled={cleanupLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors"
                  >
                    {cleanupLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaDatabase />
                        Cleanup Unused Files
                      </>
                    )}
                  </button>
                </div>

                {/* Cleanup Old Files */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
                  <h4 className="font-bold text-orange-800 text-lg mb-3 flex items-center gap-2">
                    <FaDatabase className="text-orange-600" />
                    Cleanup File Lama
                  </h4>
                  <p className="text-gray-700 mb-4 text-sm">
                    Hapus file-file yang sudah lebih dari 30 hari dan tidak digunakan.
                  </p>
                  <button
                    onClick={() => handleStorageCleanup('old')}
                    disabled={cleanupLoading}
                    className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors"
                  >
                    {cleanupLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaDatabase />
                        Cleanup Old Files
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Cleanup Results */}
              {cleanupResult && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h5 className="font-bold text-green-800 mb-2">Hasil Cleanup:</h5>
                  <p className="text-green-700">
                    <strong>{cleanupResult.deletedCount}</strong> file berhasil dihapus
                  </p>
                  <p className="text-green-600 text-sm mt-1">{cleanupResult.message}</p>
                </div>
              )}

              {/* Storage Info */}
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h5 className="font-bold text-gray-800 mb-2">Informasi Storage:</h5>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• File yang tidak digunakan akan dihapus secara otomatis setelah menghapus project/certificate/experience</li>
                  <li>• Cleanup manual dapat dilakukan kapan saja melalui tombol di atas</li>
                  <li>• File yang dihapus tidak dapat dikembalikan</li>
                  <li>• Proses cleanup berjalan di background dan mungkin membutuhkan beberapa detik</li>
                </ul>
              </div>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
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
        {showDeleteCertificateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full flex flex-col items-center">
              <h3 className="text-xl font-bold mb-4 text-blue-900">Konfirmasi Hapus</h3>
              <p className="mb-6 text-gray-700 text-center">Yakin ingin menghapus certificate ini?</p>
              <div className="flex gap-4">
                <button onClick={confirmDeleteCertificate} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold">Ya, Hapus</button>
                <button onClick={cancelDeleteCertificate} className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-bold">Batal</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}