// app/page.tsx (or wherever your page file is)

"use client"

import React, { useEffect, useState } from "react"; // Removed useState
import Image from "next/image"; // Keep Image for CircularText section

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
  description: string;
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
                  manualMode={true}
                  blurAmount={5}
                  borderColor="cyan"
                  animationDuration={0.3}
                  pauseBetweenAnimations={1}
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

        <div id="about" className="flex-grow flex flex-col md:flex-row items-center justify-center w-full w-9xl mt-30 mt-10 space-x-0" style={{ scrollMarginTop: '135px' }}>
          {/* What I do Section - Heading only, placed above cards on mobile */}
          <div className="block md:hidden w-full mb-6">
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
          <div className="flex flex-col w-full max-w-lg px-4 md:px-0 mt-10 mb-20 space-y-8">
            {/* Hello, I'm Card */}
            <div className="relative p-6 rounded-lg transition-transform duration-300 ease-in-out hover:scale-105 custom-corner-border inline-block max-w-max">
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
                    className="relative bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:from-blue-400 hover:to-cyan-400 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.6),0_0_40px_rgba(6,182,212,0.4)] shadow-[0_0_10px_rgba(59,130,246,0.3)] border border-blue-400/30 backdrop-blur-sm"
                    style={{
                      textShadow: '0 0 10px rgba(59,130,246,0.8)',
                      boxShadow: '0 0 15px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}
                  >
                    <span className="relative z-10">Download CV</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-lg blur-sm"></div>
                  </a>
                </div>
              )}
            </div>

            {/* Skill dan Tools saya Card */}
            <div className="relative p-4 md:p-6 rounded-lg transition-transform duration-300 ease-in-out hover:scale-105 custom-corner-border w-full lg:flex-1 lg:max-w-2xl">
              <h3 className="text-white font-bold text-xl md:text-2xl tracking-wide mb-4">
                Skill dan Tools saya
              </h3>
              {/* Grid untuk skills dengan logo - responsif untuk mobile, desktop tetap 4 kolom */}
              <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                {/* Menampilkan skills dari createSection */}
                {skillsFromCreate.map((skill: any, index: number) => (
                  <div key={index} className="bg-transparent border-2 border-white rounded-lg px-4 py-5 flex flex-col items-center justify-center text-center h-[110px] w-[110px] sm:h-[100px] sm:w-[100px] md:h-[95px] md:w-[95px] lg:h-[90px] lg:w-[90px] xl:h-[85px] xl:w-[85px] hover:bg-white/10 transition-all duration-300 hover:scale-105 shadow-lg mx-auto" style={{boxShadow: 'inset 0 0 0 4px transparent, 0 0 0 4px rgba(0,0,0,0.8)'}}>
                    {skill.logo && (
                      <div className="w-8 h-8 sm:w-7 sm:h-7 md:w-6 md:h-6 lg:w-6 lg:h-6 xl:w-5 xl:h-5 mb-3 sm:mb-2 flex items-center justify-center flex-shrink-0">
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
                    <span className="text-sm sm:text-xs md:text-xs lg:text-xs xl:text-xs text-gray-300 font-medium line-clamp-2 leading-tight text-center px-1">{skill.name}</span>
                  </div>
                ))}
                {/* Jika tidak ada skills, tampilkan placeholder */}
                {skillsFromCreate.length === 0 && (
                  <>
                    {Array.from({ length: 8 }, (_, i) => (
                      <div key={i} className="bg-transparent border-2 border-white rounded-lg px-4 py-5 flex flex-col items-center justify-center text-center h-[110px] w-[110px] sm:h-[100px] sm:w-[100px] md:h-[95px] md:w-[95px] lg:h-[90px] lg:w-[90px] xl:h-[85px] xl:w-[85px] hover:bg-white/10 transition-all duration-300 hover:scale-105 shadow-lg mx-auto" style={{boxShadow: 'inset 0 0 0 4px transparent, 0 0 0 4px rgba(0,0,0,0.8)'}}>
                        <div className="w-8 h-8 sm:w-7 sm:h-7 md:w-6 md:h-6 lg:w-6 lg:h-6 xl:w-5 xl:h-5 mb-3 sm:mb-2 flex items-center justify-center flex-shrink-0">
                          <img 
                            src={`/techstack/php.svg`} 
                            alt="placeholder" 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <span className="text-sm sm:text-xs md:text-xs lg:text-xs xl:text-xs text-gray-300 font-medium line-clamp-2 leading-tight text-center px-1">PHP</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Tech Stack Section End */}

          {/* What I do Section - Photo and overlay, heading only on desktop */}
          <div className="flex flex-col md:ml-16 w-full md:w-auto items-center justify-center">
            <div className="hidden md:block mb-6 w-full">
              <BlurText
                text="What I do"
                delay={150}
                animateBy="words"
                direction="top"
                onAnimationComplete={handleAnimationComplete}
                className="md:text-7xl text-3xl font-extrabold text-center justify-center items-center mx-auto"
              />
            </div>
            <div className="mt-10 mb-20 w-full flex justify-center">
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
        <div className="grid grid-cols-1 md:grid-cols-3 w-full max-w-[1400px] mx-auto mt-4 md:mt-10">
          {loading ? (
            <div className="col-span-3 text-center">Loading...</div>
          ) : (
            projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={{
                  ...project,
                  imageSrc: project.image, // mapping ke prop ProjectCard
                  number: (index + 1).toString().padStart(2, '0'), // jika butuh nomor urut
                  techstack: [], // kosongkan atau fetch jika ada field di DB
                }}
                index={index}
              />
            ))
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
        <div className="grid grid-cols-1 md:grid-cols-3 w-full max-w-[1400px] mx-auto mt-4 md:mt-10">
          {loading ? (
            <div className="col-span-3 text-center">Loading...</div>
          ) : (
            certificates.map((certificate, index) => (
              <CertificateCard
                key={certificate.id}
                certificate={{
                  ...certificate,
                  imageSrc: certificate.image, // mapping ke prop CertificateCard
                  number: (index + 1).toString().padStart(2, '0'), // jika butuh nomor urut
                }}
                index={index}
              />
            ))
          )}
           </div>
        {/* Certificates Section End */}
      </main>


      {/* Footer Section - Consider moving this to layout.tsx as well for consistency */}
      <footer className="flex w-full items-center justify-center p-4 border-t border-white/[.15] text-white/50 text-sm font-light mt-20"> {/* Added margin top */}
        <p>&copy; {new Date().getFullYear()} Muhammad Muhibuddin Mukhlish. All rights reserved.</p> {/* Updated name */}
      </footer>
    </> // Closed React Fragment wrapper
    // </div> // Removed this closing tag
  );
}