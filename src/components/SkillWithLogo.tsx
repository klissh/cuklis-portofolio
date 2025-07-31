import React from 'react';
import { motion } from 'framer-motion';

interface Skill {
  name: string;
  logo: string; // URL logo
}

interface SkillWithLogoProps {
  skill: Skill;
}

const SkillWithLogo: React.FC<SkillWithLogoProps> = ({ skill }) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center bg-transparent border border-gray-600 rounded-lg p-3 min-w-[80px] min-h-[80px] hover:border-cyan-400 transition-colors duration-200"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <div className="w-8 h-8 mb-2 flex items-center justify-center">
        <img 
          src={skill.logo} 
          alt={skill.name}
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback jika gambar tidak bisa dimuat
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <span className="text-gray-300 text-xs text-center font-medium hover:text-cyan-400 transition-colors duration-200">
        {skill.name}
      </span>
    </motion.div>
  );
};

export default SkillWithLogo;