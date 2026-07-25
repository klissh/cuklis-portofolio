// app/page.tsx (or wherever your page file is)

"use client"

import React, { useEffect, useState } from "react"; // Removed useState
import Image from "next/image"; // Keep Image for CircularText section
import { motion } from "framer-motion"; // Import motion for smooth animations

// Import your components and blocks
// Removed GooeyNav import
import BlurText from "@/blocks/TextAnimations/BlurText/BlurText";
import TrueFocus from "@/blocks/TextAnimations/TrueFocus/TrueFocus";
import Threads from "@/blocks/Backgrounds/Threads/Threads";
import CircularText from "@/blocks/TextAnimations/CircularText/CircularText";
// ScrollReveal is imported but not used in the provided code snippet, keep if used elsewhere
// import ScrollReveal from "@/blocks/TextAnimations/ScrollReveal/ScrollReveal";
import TiltedCard from "@/blocks/Components/TiltedCard/TiltedCard";
import ExperienceTimeline from '@/components/ExperienceTimeline';
import SkillTag from '@/components/SkillTag'; // Assuming SkillTag is in components folder
import ProjectCard from '@/components/ProjectCard'; // Import the new ProjectCard component
import CertificateCard from '@/components/CertificateCard'; // Import the new CertificateCard component

// Tambahkan type untuk Profile dan Section
interface Profile {
  id: number;
  name: string;
  photo_url: string;
  bio: string;
  description?: string; // Deskripsi tambahan
  created_at: string;
  titles: string;
  cv_url?: string; // CV URL disimpan di profile
}

interface Skill {
  name: string;
  logo: string; // URL logo
}

interface Section {
  id: number;
  type: string; // 'develop' | 'create'
  title: string;
  skills: string; // JSON string array of Skill objects
  created_at: string;
}

// Tambahkan kembali type Project
interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
  created_at: string;
}

// Tambahkan type Certificate
interface Certificate {
  id: number;
  title: string;
  image: string;
  link: string;
  created_at: string;
}

const handleAnimationComplete = () => {
  console.log('Animation completed!');
};

export default function Home() {
  // State untuk profile dan sections
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const titles = profile?.titles && Array.isArray(JSON.parse(profile.titles))
    ? JSON.parse(profile.titles).map((t: string) => t.replaceAll("_", " "))
    : [];

  useEffect(() => {
    async function fetchData() {
      const [profileRes, sectionsRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/sections'),
      ]);
      const profileData = await profileRes.json();
      const sectionsData = await sectionsRes.json();
      setProfile(profileData);
      setSections(sectionsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Ambil section develop & create
  const developSection = sections.find(s => s.type === 'develop');
  const createSection = sections.find(s => s.type === 'create');
  const devSkills = developSection ? JSON.parse(developSection.skills || '[]') : [];
  const contentSkills = createSection ? JSON.parse(createSection.skills || '[]') : [];
  
  // Parse skills dari createSection dengan format baru (object dengan name dan logo)
  const skillsFromCreate = createSection ? (() => {
    try {
      const parsed = JSON.parse(createSection.skills || '[]');
      return Array.isArray(parsed) ? parsed.map(skill => {
        if (typeof skill === 'string') {
          return { name: skill, logo: `/techstack/${skill.toLowerCase()}.svg` };
        }
        return skill;
      }) : [];
    } catch (e) {
      return [];
    }
  })() : [];

  // State untuk projects
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
      });
  }, []);

  // State untuk certificates
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    fetch("/api/certificates")
      .then((res) => res.json())
      .then((data) => {
        setCertificates(data);
      });
  }, []);

  // useEffect untuk menghitung items per row berdasarkan ukuran layar
  useEffect(() => {
    const updateItemsPerRow = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth >= 1280) { // xl
          setItemsPerRow(5);
        } else if (window.innerWidth >= 1024) { // lg
          setItemsPerRow(4);
        } else if (window.innerWidth >= 768) { // md
          setItemsPerRow(3);
        } else if (window.innerWidth >= 640) { // sm
          setItemsPerRow(2);
        } else {
          setItemsPerRow(3); // mobile default
        }
      }
    };

    updateItemsPerRow();
    window.addEventListener('resize', updateItemsPerRow);
    return () => window.removeEventListener('resize', updateItemsPerRow);
  }, []);

  // State untuk show/hide projects, certificates, dan skills
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [itemsPerRow, setItemsPerRow] = useState(5);

  // Fungsi untuk menghitung jumlah baris berdasarkan jumlah item dan kolom
  const calculateRows = (itemCount: number, columns: number = 3) => {
    return Math.ceil(itemCount / columns);
  };

  // Menentukan apakah perlu menampilkan tombol show/hide
  const projectRows = calculateRows(projects.length);
  const certificateRows = calculateRows(certificates.length);
  const skillRows = calculateRows(skillsFromCreate.length, 5); // Skills menggunakan 5 kolom pada xl
  const shouldShowProjectsButton = projectRows > 3;
  const shouldShowCertificatesButton = certificateRows > 3;
  const shouldShowSkillsButton = skillRows > 3;

  // Menentukan jumlah item yang ditampilkan
  const displayedProjects = showAllProjects ? projects : projects.slice(0, 9); // 3 baris x 3 kolom = 9 item
  const displayedCertificates = showAllCertificates ? certificates : certificates.slice(0, 9);
  const displayedSkills = showAllSkills ? skillsFromCreate : skillsFromCreate.slice(0, 15); // 3 baris x 5 kolom = 15 item

  // Removed mobileMenuOpen state
  return (
    // The cursor: 'none' style is now applied globally in layout.tsx
    // Removed outer div as layout.tsx now handles the main structure
    // <div className="flex flex-col min-h-screen bg-[#101112] font-gilroy"> // Removed this line
    <> {/* Added React Fragment wrapper */}
      {/* Main content area */}
      <main className="flex-grow flex flex-col items-center h-full relative pt-20"> {/* Added padding top to account for fixed header */}
        <div style={{ width: '100%', height: '600px', position: 'absolute', top: 0, bottom: 'auto' }} className="hidden md:block">
          <Threads
            amplitude={2.5}
            distance={0}
            enableMouseInteraction={false}
          />
        </div>

        <div style={{ width: '100%', height: '600px', position: 'absolute', top: 0, bottom: 'auto' }} className="md:hidden opacity-10">
          <Threads
            amplitude={2.5}
            distance={0}
            enableMouseInteraction={false}
          />
        </div>

        {/* ... other main content elements ... */}
        <div id="home" className="w-full flex flex-col justify-center items-center my-10 md:mt-15 text-center font-bold relative px-4 md:px-0 mx-auto pt-10" style={{background: 'inherit'}}>
          <div className="w-full flex justify-center items-center">
            <BlurText
              text={profile?.name}
              delay={150}
              animateBy="letters"
              direction="top"
              onAnimationComplete={handleAnimationComplete}
              className="text-[5vw] sm:text-2xl md:text-4xl lg:text-7xl text-center font-extrabold max-w-full"
            />
          </div>
          <div className="flex justify-center items-center w-full mt-6 px-2 md:px-0 overflow-x-hidden pb-2 pt-4">
            {titles.length > 0 && (
              <span className="bg-transparent text-cyan-100 px-4 py-2 rounded-full text-base xs:text-lg sm:text-xl font-bold shadow w-fit mx-auto block text-center break-words">
                <TrueFocus
                  sentence={titles.map((t: string) => t.replaceAll(' ', '\u00A0')).join(' ')}
                  blurAmount={5}
                  borderColor="cyan"
                  animationDuration={0.3}
                  pauseBetweenAnimations={2.7}
                />
              </span>
            )}
          </div>
        </div>

        {/* Marquee Section Start */}
        <div className="w-full items-center mt-40 mb-9 relative h-[60px] hidden md:block space-y-2">
          {/* Atas: kiri ke kanan */}
          <div className="overflow-x-hidden w-full">
            <div className="flex whitespace-nowrap animate-marquee text-cyan-200 font-bold text-2xl will-change-transform">
              <span className="w-max">{'SCROLL-DOWN  • '.repeat(100000)}</span>
              <span className="w-max" aria-hidden="true">{'SCROLL-DOWN  • '.repeat(100000)}</span>
            </div>
          </div>
          {/* Bawah: kanan ke kiri */}
          <div className="overflow-x-hidden w-full">
            <div className="flex whitespace-nowrap animate-marquee-reverse text-cyan-200 font-bold text-2xl will-change-transform">
              <span className="w-max">{'SCROLL-DOWN  • '.repeat(100000)}</span>
              <span className="w-max" aria-hidden="true">{'SCROLL-DOWN  • '.repeat(100000)}</span>
            </div>
          </div>
        </div>
        {/* Marquee Section End */}

        <div id="about" className="flex flex-col md:flex-row items-center justify-center w-fit mx-auto mt-5" style={{ scrollMarginTop: '135px' }}>
          {/* What I do Section - Heading only, placed above cards on mobile */}
          <div className="block md:hidden w-fit mb-3 mx-auto">
            <BlurText
              text="What I do"
              delay={150}
              animateBy="words"
              direction="top"
              onAnimationComplete={handleAnimationComplete}
              className="text-3xl font-extrabold text-center justify-center items-center mx-auto"
            />
          </div>
          {/* Tech Stack Section Start */}
          <div className="flex flex-col w-fit px-0 mt-5 mb-10 space-y-2">
            {/* Hello, I'm Card */}
            <div className="relative p-3 md:p-4 rounded-lg transition-transform duration-300 ease-in-out hover:scale-105 custom-corner-border w-full max-w-[430px]">
              <h3 className="text-white font-bold md:text-2xl text-lg tracking-wide mb-3">
                Hello, I'm
              </h3>
              <h4 className="text-cyan-300 font-semibold mb-3 text-lg">
                {profile?.name || "Nama belum diisi"}
              </h4>
              {/* Deskripsi tambahan dari profile */}
              {profile?.description && (
                <p className="text-gray-400 md:text-md text-sm mt-2 leading-relaxed mb-5 text-justify">
                  {profile.description}
                </p>
              )}
              {/* Download CV Button */}
              {profile?.cv_url && (
                <div className="flex justify-center mt-4">
                  <a
                    href={profile.cv_url}
                    download
                    className="download-cv-button text-xs sm:text-sm md:text-base uppercase font-bold tracking-wider sm:tracking-widest md:tracking-[0.3rem] py-2 px-4 sm:px-6 md:px-8 lg:px-10"
                    style={{
                      '--main-color': 'rgb(59, 130, 246)',
                      '--main-bg-color': 'rgba(59, 130, 246, 0.36)',
                      '--pattern-color': 'rgba(59, 130, 246, 0.073)',
                      filter: 'hue-rotate(0deg)',
                      cursor: 'pointer',
                      background: `radial-gradient(circle, var(--main-bg-color) 0%, rgba(0, 0, 0, 0) 95%), linear-gradient(var(--pattern-color) 1px, transparent 1px), linear-gradient(to right, var(--pattern-color) 1px, transparent 1px)`,
                      backgroundSize: 'cover, 10px 10px, 10px 10px',
                      backgroundPosition: 'center center, center center, center center',
                      borderImage: 'radial-gradient(circle, var(--main-color) 0%, rgba(0, 0, 0, 0) 100%) 1',
                      borderWidth: '1px 0 1px 0',
                      color: 'var(--main-color)',
                      transition: 'background-size 0.2s ease-in-out',
                      textDecoration: 'none'
                    } as React.CSSProperties}
                    onMouseEnter={(e) => {
                       e.currentTarget.style.backgroundSize = 'cover, 8px 8px, 8px 8px';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.backgroundSize = 'cover, 10px 10px, 10px 10px';
                     }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.filter = 'hue-rotate(250deg)';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.filter = 'hue-rotate(0deg)';
                    }}
                  >
                    Download CV
                  </a>
                </div>
              )}
            </div>

            {/* Skills And Tools */}
            <div className="relative p-3 md:p-4 rounded-lg transition-transform duration-300 ease-in-out hover:scale-105 custom-corner-border w-full max-w-[430px]">
              <div className="flex justify-center w-fit mx-auto">
                <div className="w-fit">
                  <h3 className="text-white font-bold md:text-2xl text-lg tracking-wide mb-3 text-center">
                    Skills And Tools
                  </h3>
                </div>
              </div>
              {/* Container untuk grid dan blur effect */}
               <div className="relative overflow-hidden w-fit flex justify-center mx-auto">
                {/* Grid untuk skills dengan logo - responsif untuk mobile, desktop tetap 4 kolom */}
                <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-3 lg:gap-3 xl:gap-3 w-fit">
                   {/* Menampilkan skills dari createSection */}
                   {(skillsFromCreate.length > 0 ? skillsFromCreate : Array.from({ length: 20 }, (_, i) => ({ name: 'PHP', logo: '/techstack/php.svg' }))).map((skill: any, index: number) => {
                      // Hitung posisi baris (mulai dari 0)
                      const rowIndex = Math.floor(index / itemsPerRow);
                      const isInRow4OrBeyond = rowIndex >= 3;
                      const shouldHide = !showAllSkills && rowIndex >= 4; // Sembunyikan baris 5 dan seterusnya
                      const shouldBlur = !showAllSkills && rowIndex === 3; // Blur seluruh baris 4
                      const isVisible = showAllSkills || rowIndex < 4; // Visible jika showAll atau di baris 1-4
                     
                     return (
                       <motion.div
                         key={index}
                         initial={{ opacity: 0, y: 20, scale: 0.9, height: 0 }}
                         animate={{ 
                           opacity: isVisible ? (shouldBlur ? 0.6 : 1) : 0, 
                           y: isVisible ? 0 : 20,
                           scale: isVisible ? 1 : 0.9,
                           height: isVisible ? 'auto' : 0
                         }}
                         transition={{ 
                           duration: 0.3, 
                           ease: "easeInOut",
                           delay: isVisible ? index * 0.02 : (skillsFromCreate.length - index) * 0.02
                         }}
                         style={{ 
                           overflow: 'hidden',
                           pointerEvents: isVisible ? 'auto' : 'none'
                         }}
                       >
                         <div 
                           className={`bg-transparent border-2 border-white rounded-lg px-1 py-1 sm:px-2 sm:py-2 flex flex-col items-center justify-center text-center h-[55px] w-[55px] sm:h-[65px] sm:w-[70px] hover:bg-white/10 transition-all duration-300 hover:scale-105 shadow-lg ${shouldBlur ? 'blur-sm' : ''}`} 
                           style={{boxShadow: 'inset 0 0 0 4px transparent, 0 0 0 4px rgba(0,0,0,0.8)'}}
                         >
                           {skill.logo && (
                             <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center flex-shrink-0 mb-0.5">
                               <img 
                                 src={skill.logo} 
                                 alt={skill.name} 
                                 className="w-full h-full object-contain"
                                 onError={(e) => {
                                   e.currentTarget.style.display = 'none';
                                 }}
                               />
                             </div>
                           )}
                           <span className="text-[7px] sm:text-[9px] text-gray-300 font-medium leading-[1.1] text-center px-0.5 break-words hyphens-auto" style={{wordBreak: 'break-word', overflowWrap: 'break-word', fontSize: 'clamp(6px, 1.2vw, 9px)'}}>{skill.name}</span>
                         </div>
                       </motion.div>
                     );
                   })}
                 </div>
                 
                 {/* Overlay untuk memotong setengah baris 4 dan memberikan efek fade */}
                 {!showAllSkills && shouldShowSkillsButton && (
                   <div className="absolute bottom-0 left-0 right-0 h-[50px] bg-gradient-to-t from-[#101112] via-[#101112]/95 to-transparent pointer-events-none"></div>
                 )}
               </div>
              
              {/* Show/Hide Button untuk Skills dengan icon plus/minus */}
              {shouldShowSkillsButton && (
                <div className="flex justify-center mt-4">
                  <button 
                    className="group cursor-pointer outline-none hover:rotate-90 duration-300" 
                    title={showAllSkills ? "Hide Skills" : "Show All Skills"}
                    onClick={() => setShowAllSkills(!showAllSkills)}
                  > 
                    <svg 
                      className="stroke-teal-500 fill-none group-hover:fill-teal-800 group-active:stroke-teal-200 group-active:fill-teal-600 group-active:duration-0 duration-300" 
                      viewBox="0 0 24 24" 
                      height="50px" 
                      width="50px" 
                      xmlns="http://www.w3.org/2000/svg"
                    > 
                      <path 
                        strokeWidth="1.5" 
                        d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" 
                      ></path> 
                      <path strokeWidth="1.5" d="M8 12H16"></path> 
                      {!showAllSkills && <path strokeWidth="1.5" d="M12 16V8"></path>}
                    </svg> 
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Tech Stack Section End */}

          {/* What I do Section - Photo and overlay, heading only on desktop */}
          <div className="flex flex-col md:ml-16 w-fit items-center justify-center">
            <div className="hidden md:block mb-6 w-fit">
              <BlurText
                text="What I do"
                delay={150}
                animateBy="words"
                direction="top"
                onAnimationComplete={handleAnimationComplete}
                className="md:text-7xl text-3xl font-extrabold text-center justify-center items-center mx-auto"
              />
            </div>
            <div className="mt-10 mb-20 w-fit flex justify-center">
              {profile?.name ? (
                <TiltedCard
                  imageSrc={profile?.photo_url || "/photos/tiltedcard.svg"}
                  altText="Yuyuhiei"
                  captionText={undefined}
                  containerHeight={typeof window !== 'undefined' && window.innerWidth < 768 ? "400px" : "600px"}
                  containerWidth={typeof window !== 'undefined' && window.innerWidth < 768 ? "300px" : "500px"}
                  imageHeight={typeof window !== 'undefined' && window.innerWidth < 768 ? "400px" : "600px"}
                  imageWidth={typeof window !== 'undefined' && window.innerWidth < 768 ? "300px" : "500px"}
                  rotateAmplitude={10}
                  scaleOnHover={1.1}
                  showMobileWarning={false}
                  showTooltip={false}
                  displayOverlayContent={true}
                  overlayContent={
                    <p className="bg-transparent px-4 py-2 border-1 border-dashed rounded-lg opacity-50 font-bold m-5 absolute top-5 left-5">
                      {profile?.bio}
                    </p>
                  }
                />
              ) : (
                <div>Loading...</div>
              )}
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div id="experience" className="flex w-full items-center justify-center p-4 md:mt-25 mt-5" style={{ scrollMarginTop: '120px' }}>
          <BlurText
            text=" My Experience"
            delay={150}
            animateBy="words"
            direction="top"
            onAnimationComplete={handleAnimationComplete}
            className="md:text-7xl text-3xl font-extrabold"
          />
        </div>
        <ExperienceTimeline />

        <div id="projects" className="flex w-full items-center justify-center p-4 md:mt-25 mt-5 font-extrabold" style={{ scrollMarginTop: '120px' }}>
          <BlurText
            text=" My Projects"
            delay={150}
            animateBy="letters"
            direction="top"
            onAnimationComplete={handleAnimationComplete}
            className="md:text-7xl text-3xl font-extrabold"
          />
        </div>

        {/* Projects Section Start */}
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="grid grid-cols-3 w-full mt-4 md:mt-10 gap-2 md:gap-4 pb-4">
            {loading ? (
              <div className="col-span-3 text-center">Loading...</div>
            ) : (
              projects.map((project, index) => {
                const isVisible = showAllProjects || index < 9;
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ 
                      opacity: isVisible ? 1 : 0, 
                      y: isVisible ? 0 : 20,
                      scale: isVisible ? 1 : 0.95,
                      height: isVisible ? 'auto' : 0,
                      marginBottom: isVisible ? '0.5rem' : 0
                    }}
                    exit={{ 
                      opacity: 0, 
                      y: 20, 
                      scale: 0.95,
                      height: 0,
                      marginBottom: 0
                    }}
                    transition={{ 
                      duration: 0.5, 
                      ease: [0.4, 0.0, 0.2, 1],
                      delay: isVisible ? index * 0.03 : (projects.length - index) * 0.02,
                      height: { duration: 0.4, ease: "easeInOut" },
                      opacity: { duration: 0.3, ease: "easeOut" }
                    }}
                    style={{ 
                      pointerEvents: isVisible ? 'auto' : 'none'
                    }}
                  >
                    <ProjectCard
                      project={{
                        ...project,
                        imageSrc: project.image, // mapping ke prop ProjectCard
                        number: (index + 1).toString().padStart(2, '0'), // jika butuh nomor urut
                        techstack: [], // kosongkan atau fetch jika ada field di DB
                      }}
                      index={index}
                    />
                  </motion.div>
                );
              })
            )}
          </div>
          
          {/* Show/Hide Button untuk Projects dengan icon plus/minus */}
          {shouldShowProjectsButton && (
            <div className="flex justify-center mt-6">
              <button 
                className="group cursor-pointer outline-none hover:rotate-90 duration-300" 
                title={showAllProjects ? "Hide Projects" : "Show All Projects"}
                onClick={() => setShowAllProjects(!showAllProjects)}
              > 
                <svg 
                  className="stroke-teal-500 fill-none group-hover:fill-teal-800 group-active:stroke-teal-200 group-active:fill-teal-600 group-active:duration-0 duration-300" 
                  viewBox="0 0 24 24" 
                  height="50px" 
                  width="50px" 
                  xmlns="http://www.w3.org/2000/svg"
                > 
                  <path 
                    strokeWidth="1.5" 
                    d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" 
                  ></path> 
                  <path strokeWidth="1.5" d="M8 12H16"></path> 
                  {!showAllProjects && <path strokeWidth="1.5" d="M12 16V8"></path>}
                </svg> 
              </button>
            </div>
          )}
        </div>
        {/* Projects Section End */}

        <div id="certificates" className="flex w-full items-center justify-center p-4 mt-16 md:mt-25 font-extrabold" style={{ scrollMarginTop: '120px' }}>
          <BlurText
            text=" My Certificate"
            delay={150}
            animateBy="letters"
            direction="top"
            onAnimationComplete={handleAnimationComplete}
            className="md:text-7xl text-3xl font-extrabold"
          />
        </div>

        {/* Certificates Section Start */}
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="grid grid-cols-3 w-full mt-4 md:mt-10 gap-2 md:gap-4 pb-4">
            {loading ? (
              <div className="col-span-3 text-center">Loading...</div>
            ) : (
              certificates.map((certificate, index) => {
                const isVisible = showAllCertificates || index < 9;
                return (
                  <motion.div
                    key={certificate.id}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ 
                      opacity: isVisible ? 1 : 0, 
                      y: isVisible ? 0 : 20,
                      scale: isVisible ? 1 : 0.95,
                      height: isVisible ? 'auto' : 0,
                      marginBottom: isVisible ? '0.5rem' : 0
                    }}
                    exit={{ 
                      opacity: 0, 
                      y: 20, 
                      scale: 0.95,
                      height: 0,
                      marginBottom: 0
                    }}
                    transition={{ 
                      duration: 0.5, 
                      ease: [0.4, 0.0, 0.2, 1],
                      delay: isVisible ? index * 0.03 : (certificates.length - index) * 0.02,
                      height: { duration: 0.4, ease: "easeInOut" },
                      opacity: { duration: 0.3, ease: "easeOut" }
                    }}
                    style={{ 
                      pointerEvents: isVisible ? 'auto' : 'none'
                    }}
                  >
                    <CertificateCard
                      certificate={{
                        ...certificate,
                        imageSrc: certificate.image, // mapping ke prop CertificateCard
                        number: (index + 1).toString().padStart(2, '0'), // jika butuh nomor urut
                      }}
                      index={index}
                    />
                  </motion.div>
                );
              })
            )}
          </div>
          
          {/* Show/Hide Button untuk Certificates dengan icon plus/minus */}
          {shouldShowCertificatesButton && (
            <div className="flex justify-center mt-6">
              <button 
                className="group cursor-pointer outline-none hover:rotate-90 duration-300" 
                title={showAllCertificates ? "Hide Certificates" : "Show All Certificates"}
                onClick={() => setShowAllCertificates(!showAllCertificates)}
              > 
                <svg 
                  className="stroke-teal-500 fill-none group-hover:fill-teal-800 group-active:stroke-teal-200 group-active:fill-teal-600 group-active:duration-0 duration-300" 
                  viewBox="0 0 24 24" 
                  height="50px" 
                  width="50px" 
                  xmlns="http://www.w3.org/2000/svg"
                > 
                  <path 
                    strokeWidth="1.5" 
                    d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12 C2 17.5 6.5 22 12 22Z" 
                  ></path> 
                  <path strokeWidth="1.5" d="M8 12H16"></path> 
                  {!showAllCertificates && <path strokeWidth="1.5" d="M12 16V8"></path>}
                </svg> 
              </button>
            </div>
          )}
        </div>
        {/* Certificates Section End */}
      </main>


      {/* Footer Section - Consider moving this to layout.tsx as well for consistency */}
      <footer className="flex w-full items-center justify-center px-2 py-3 md:p-4 border-t border-white/[.15] text-white/50 text-xs sm:text-sm font-light mt-20"> {/* Added margin top */}
        <p className="text-center leading-tight">&copy; {new Date().getFullYear()} Muhammad Muhibuddin Mukhlish. All rights reserved.</p> {/* Updated name */}
      </footer>
    </> // Closed React Fragment wrapper
    // </div> // Removed this closing tag
  );
}