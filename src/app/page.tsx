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

// Tambahkan type untuk Profile dan Section
interface Profile {
  id: number;
  name: string;
  photo_url: string;
  bio: string;
  created_at: string;
  titles: string;
}
interface Section {
  id: number;
  type: string; // 'develop' | 'create'
  title: string;
  description: string;
  skills: string; // JSON string array
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

  // State untuk projects
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
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
        <div id="home" className="w-full flex justify-center items-center my-4 md:mt-15 text-center font-bold relative px-2 md:px-0 mx-auto">
          <BlurText
            text={profile?.name || "Muhammad Muhibuddin Mukhlish"}
            delay={100}
            animateBy="letters"
            direction="top"
            onAnimationComplete={handleAnimationComplete}
            className="font-extrabold text-3xl sm:text-4xl md:text-6xl lg:text-7xl whitespace-nowrap inline-block text-center"
          />
        </div>

        <div className="flex justify-center items-center w-full mt-4">
          {titles.length > 0 && (
            <span className="bg-transparent text-cyan-100 px-6 py-2 rounded-full text-lg font-bold shadow w-fit">
              <TrueFocus
                sentence={titles.map((t: string) => t.replaceAll(" ", "\u00A0")).join(" ")}
                manualMode={true}
                blurAmount={5}
                borderColor="cyan"
                animationDuration={0.3}
                pauseBetweenAnimations={1}
              />
            </span>
          )}
        </div>

        {/* Marquee Section Start */}
        <div className="w-full items-center mt-55 mb-9 relative h-[60px] hidden md:block space-y-2">
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

        <div id="about" className="flex-grow flex flex-row items-center justify-center w-full w-9xl mt-30 mt-10 space-x-0" style={{ scrollMarginTop: '135px' }}>
          {/* Tech Stack Section Start */}
             <div className="flex flex-col w-full max-w-lg px-4 md:px-0 mt-10 mb-20 space-y-8">
             {/* DEVELOP Card */}
             {/* custom-corner-border class is kept from previous step */}
             {/* hover:scale-105 on the card wrapper is kept */}
             <div className="relative p-6 rounded-lg transition-transform duration-300 ease-in-out hover:scale-105 custom-corner-border inline-block max-w-max">
               <h3 className="text-white font-bold md:text-2xl text-lg tracking-wide mb-3">
                 DEVELOP
               </h3>
               <p className="text-gray-400 md:text-md text-sm mt-2 leading-relaxed mb-5">
                 {developSection?.description || "Started creating mobile applications using Flutter, FlutterFlow, and Firebase and eventually switched to Web Development using NextJS, React, and Tailwind"}
               </p>
               <h4 className="text-cyan-300 font-semibold mb-3 text-base">
                 Skillset &amp; tools
               </h4>
               <div className="flex flex-wrap gap-2">
                 {devSkills.map((skill: string) => (
                   <SkillTag key={skill} skillName={skill} />
                 ))}
               </div>
             </div>

             {/* CONTENTS Card */}
             {/* custom-corner-border class is kept from previous step */}
             {/* hover:scale-105 on the card wrapper is kept */}
             <div className="relative p-6 rounded-lg transition-transform duration-300 ease-in-out hover:scale-105 custom-corner-border inline-block max-w-max">
               <h3 className="text-white font-bold md:text-2xl text:lg tracking-wide mb-3">
                 CREATE {/* Updated title based on your code */}
               </h3>
               <p className="text-gray-400 md:text-md text-sm mt-2 leading-relaxed mb-5">
                   {createSection?.description || "My content creation journey evolved from a side hustle to serving other creators, achieving an average reach of 15 million within 90 days."}
               </p>
               <h4 className="text-cyan-300 font-semibold mb-3 text-base">
                 Skillset &amp; Tools
               </h4>
               <div className="flex flex-wrap gap-2">
                 {contentSkills.map((skill: string) => (
                   <SkillTag key={skill} skillName={skill} />
                 ))}
               </div>
             </div>
           </div>
           {/* Tech Stack Section End */}


          {/* What I do Section */}
          <div className="flex flex-col">
            <BlurText
              text="What I do"
              delay={150}
              animateBy="words"
              direction="top"
              onAnimationComplete={handleAnimationComplete}
              className="md:text-7xl text-3xl font-extrabold"
            />

            <div className="hidden md:block mt-10 mb-20">
              {profile?.name ? (
              <TiltedCard
                  imageSrc={profile?.photo_url || "/photos/tiltedcard.svg"}
                altText="Yuyuhiei"
                  captionText={profile?.name}
                containerHeight="600px"
                containerWidth="500px"
                imageHeight="600px"
                imageWidth="500px"
                rotateAmplitude={10}
                scaleOnHover={1.1}
                showMobileWarning={false}
                showTooltip={false}
                displayOverlayContent={true}
                overlayContent={
                  <p className="bg-transparent px-4 py-2 border-1 border-dashed rounded-lg opacity-50 font-bold m-5 absolute top-5 left-85">
                      {profile?.bio || "Lauvigne"}
                  </p>
                }
              />
              ) : (
                <div>Loading...</div>
              )}
            </div>

            <div className="md:hidden mt-10 mb-20">
              {profile?.name ? (
              <TiltedCard
                  imageSrc={profile?.photo_url || "/photos/tiltedcard.svg"}
                altText="Yuyuhiei"
                  captionText={profile?.name}
                containerHeight="400px"
                containerWidth="300px"
                imageHeight="400px"
                imageWidth="300px"
                rotateAmplitude={10}
                scaleOnHover={1.1}
                showMobileWarning={false}
                showTooltip={false}
                displayOverlayContent={true}
                overlayContent={
                  <p className="bg-transparent px-4 py-2 border-1 border-dashed rounded-lg opacity-50 font-bold m-5 absolute">
                      {profile?.bio || "Lauvigne"}
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
        <div className="grid grid-cols-1 md:grid-cols-3 w-full max-w-[1400px] mx-auto mt-10">
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
      </main>


      {/* Footer Section - Consider moving this to layout.tsx as well for consistency */}
      <footer className="flex w-full items-center justify-center p-4 border-t border-white/[.15] text-white/50 text-sm font-light mt-20"> {/* Added margin top */}
        <p>&copy; {new Date().getFullYear()} Muhammad Muhibuddin Mukhlish. All rights reserved.</p> {/* Updated name */}
      </footer>
    </> // Closed React Fragment wrapper
    // </div> // Removed this closing tag
  );
}