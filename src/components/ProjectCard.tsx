import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  project: {
    id: number;
    number: string;
    title: string;
    description: string;
    techstack: string[];
    imageSrc: string; 
    link: string; 
  };
  index: number; 
}

// --- Optimization 1: Use React.memo ---
// Wrap the component with React.memo. This prevents the component from re-rendering
// if its props (project and index) have not shallowly changed.
const ProjectCard: React.FC<ProjectCardProps> = React.memo(({ project, index }) => {
  // Determine the layout pattern based on the index (0, 1, 2, 3 repeats)
  const pattern = index % 4;

  // Define classes for text alignment of the content block
  let contentAlignmentClasses = '';
  // Define order classes for the image and text blocks
  let imageOrderClass = '';
  let textOrderClass = '';

  switch (pattern) {
    case 0: // Pattern 1: Text Center, Image Below Text
      contentAlignmentClasses = 'text-center items-center'; // Align text to center
      textOrderClass = 'order-1'; // Text comes first
      imageOrderClass = 'order-2'; // Image comes second
      break;
    case 1: // Pattern 2: Text Center, Image Above Text
      contentAlignmentClasses = 'text-center items-center'; // Align text to center
      textOrderClass = 'order-2'; // Text comes second
      imageOrderClass = 'order-1'; // Image comes first
      break;
    case 2: // Pattern 3: Text Center, Image Below Text
      contentAlignmentClasses = 'text-center items-center'; // Align text to center
      textOrderClass = 'order-1'; // Text comes first
      imageOrderClass = 'order-2'; // Image comes second
      break;
    case 3: // Pattern 4: Text Center, Image Above Text
      contentAlignmentClasses = 'text-center items-center'; // Align text to center
      textOrderClass = 'order-2'; // Text comes second
      imageOrderClass = 'order-1'; // Image comes first
      break;
  }

  // Handle click to redirect
  const handleImageClick = () => {
    if (project.link) {
      window.open(project.link, '_blank'); // Open link in a new tab
    }
  };

  return (
    // Use motion.div for potential future animations (like fade-in on scroll)
    // Add a thin white border and transparent background
    // Use flex-col to stack content vertically, justify-between to space text and image
    // Removed aspect-square to allow height to be determined by content
    <motion.div
      className="relative flex flex-col justify-between py-3 md:py-6 px-2 md:px-15 md:m-0 m-1 border border-white border-opacity-20 bg-transparent h-full"
      // Optional: Add Framer Motion initial/animate/whileHover props here (for the whole card)
      // For example: initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
    >
      {/* Content Area (Text Block and Image Block) */}
      <div className="flex flex-col justify-between h-full">

        {/* Text Content Block (Title, Category, Description) */}
        <div className={`flex flex-col ${contentAlignmentClasses} ${textOrderClass} z-10 p-2 md:p-6`}>
            {/* Title and Category */}
            <div>
              <h3 
                className="md:text-xl text-sm font-semibold text-white leading-tight break-words hyphens-auto"
                style={{ 
                  wordBreak: 'break-word', 
                  overflowWrap: 'break-word',
                  fontSize: 'clamp(10px, 2vw, 20px)'
                }}
              >
                {project.title}
              </h3>
              <p 
                className="md:text-sm text-xs text-gray-400 leading-tight break-words hyphens-auto mt-1"
                style={{ 
                  wordBreak: 'break-word', 
                  overflowWrap: 'break-word',
                  fontSize: 'clamp(8px, 1.5vw, 14px)'
                }}
              >
                {project.description}
              </p>
            </div>
            {/* Description */}
            <div className="mt-1 md:mt-2">
              {/* make the techstack mapped as images */}
              <div className="flex space-x-1 md:space-x-2 justify-center">
                {project.techstack.map((icon, index) => (
                  <Image key={index} src={icon} alt={`Tech stack icon ${index}`} width={16} height={16} className="md:w-6 md:h-6" />
                ))}
              </div>
            </div>
        </div>

        {/* Project Image Block - Clean image display without background or padding */}
        <motion.div
            className={`relative w-full flex-grow rounded-xl overflow-hidden z-10 ${imageOrderClass} flex items-center justify-center`}
            initial={{ opacity: 0.7 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            onClick={handleImageClick}
        >
            <div className="relative w-full">
              <Image
                src={project.imageSrc}
                alt={`${project.title} image`}
                width={400}
                height={300}
                className="object-contain w-full h-auto rounded-lg"
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{ maxHeight: '300px' }}
              />
            </div>
        </motion.div>

      </div> {/* End Content Area */}
    </motion.div>
  );
}); // End of React.memo wrap

ProjectCard.displayName = 'ProjectCard'; // Add a display name for better debugging

export default ProjectCard;