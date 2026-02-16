import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, Folder, ArrowRight } from 'lucide-react';
import ProjectModal from './ProjectModal';
import SectionWrapper from './SectionWrapper';
import { trackProjectView } from '../utils/analytics';

const projects = [
  {
    missionCode: 'MIS-01',
    year: 2024,
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce platform built with Next.js, Stripe, and Sanity CMS. Features real-time inventory management, secure payments, and a custom admin dashboard.',
    tech: ['Next.js', 'Stripe', 'Sanity CMS', 'Tailwind'],
    category: 'Full-Stack',
    github: 'https://github.com',
    external: 'https://demo.com',
    thumbnail: null, // Add image path here when available, e.g., '/images/ecommerce-thumb.jpg'
    screenshots: [], // Add array of screenshot paths when available
    problem: 'Client needed a scalable, custom e-commerce solution that could handle complex product variants and real-time stock updates, which Shopify plugins were struggling to manage effectively.',
    solution: 'Architected a headless commerce solution using Next.js for the frontend and Sanity for flexible content management. Integrated Stripe for secure payment processing and webhooks for real-time order updates.',
    role: 'Full-Stack Developer',
    challenges: 'Synchronizing cart state across devices and handling high-concurrency stock updates during flash sales.',
    outcomes: 'Achieved a 99.9% uptime during launch week and improved page load speeds by 40% compared to the previous solution.'
  },
  {
    missionCode: 'MIS-02',
    year: 2023,
    title: 'Data Visualization Dashboard',
    description: 'An interactive analytics dashboard for visualizing complex datasets using React and D3.js. Enables users to filter, sort, and export data in real-time.',
    tech: ['React', 'D3.js', 'Firebase', 'Material UI'],
    category: 'Frontend',
    github: 'https://github.com',
    external: 'https://demo.com',
    thumbnail: null,
    screenshots: [],
    problem: 'Users were overwhelmed by raw CSV data and struggled to extract actionable insights quickly.',
    solution: 'Developed a client-side dashboard that parses and visualizes data instantly. Implemented cross-filtering to allow users to explore relationships between different data points.',
    role: 'Frontend Engineer',
    challenges: 'Optimizing D3.js rendering performance for datasets exceeding 50,000 records.',
    outcomes: 'Reduced data analysis time from hours to minutes for the core user base.'
  },
  {
    missionCode: 'MIS-03',
    year: 2023,
    title: 'AI Content Generator',
    description: 'A SaaS application that uses OpenAI API to help marketers generate blog posts and social media captions. Includes a rich text editor and SEO optimization tools.',
    tech: ['React', 'Node.js', 'OpenAI API', 'MongoDB'],
    category: 'Full-Stack',
    github: 'https://github.com',
    external: 'https://demo.com',
    thumbnail: null,
    screenshots: [],
    problem: 'Marketing teams were spending too much time on first drafts and facing writer\'s block.',
    solution: 'Built a streamlined interface wrapping GPT-4 to generate structured content based on minimal prompts. Added a custom editor to refine and format the output.',
    role: 'Lead Developer',
    challenges: 'Managing API rate limits and ensuring response streaming for a better user experience.',
    outcomes: 'Adoption by 500+ users in the first month and generated over 10,000 articles.'
  },
];

const categories = ['All', ...new Set(projects.map(p => p.category))];

const ProjectCard = ({ project, index, onOpenModal }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-96 w-full cursor-pointer perspective-1000 group"
      onClick={() => {
        trackProjectView(project.title);
        onOpenModal(project);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          trackProjectView(project.title);
          onOpenModal(project);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open details for ${project.title}`}
    >
      <div className="relative w-full h-full">
        <div className="w-full h-full relative flip-wrapper preserve-3d">
          {/* Front of Card */}
          <div className="absolute inset-0 backface-hidden">
            <div className="glass-card p-8 rounded-lg flex flex-col justify-between h-full z-20 bg-secondary/80 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden">
              {/* Thumbnail Image */}
              {project.thumbnail ? (
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                  <img 
                    src={project.thumbnail} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/20 opacity-50"></div>
              )}
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <Folder size={40} className="text-accent" />
                    {project.missionCode && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-accent/40 bg-accent/10 text-[0.7rem] font-mono uppercase tracking-[0.14em] text-accent">
                        {project.missionCode}
                        {project.year && (
                          <span className="text-xs text-text-muted/80 ml-1">{project.year}</span>
                        )}
                      </span>
                    )}
                  </div>
                  {project.category && (
                    <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-mono rounded border border-accent/30">
                      {project.category}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-text mb-2">{project.title}</h3>
                <p className="text-text-muted line-clamp-3">
                  {project.description}
                </p>
              </div>
              <div className="text-accent flex items-center gap-2 text-sm font-mono relative z-10">
                Mission Briefing <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
          
          {/* Back of Card / Detail View */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <div className="glass-card p-8 rounded-lg flex flex-col justify-between h-full bg-secondary z-30 border border-accent/20 shadow-xl">
              <div>
                <div className="flex justify-end gap-4 mb-6">
                  <a 
                    href={project.github} 
                    className="text-text-muted hover:text-accent transition-colors z-20 relative" 
                    title="GitHub"
                    onClick={(e) => e.stopPropagation()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github size={24} />
                  </a>
                  <a 
                    href={project.external} 
                    className="text-text-muted hover:text-accent transition-colors z-20 relative" 
                    title="Live Demo"
                    onClick={(e) => e.stopPropagation()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink size={24} />
                  </a>
                </div>
                <h3 className="text-xl font-bold text-accent mb-4">Tech Stack</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tech.map((t) => (
                    <span key={t} className="px-3 py-1 bg-primary/50 text-accent rounded-full text-sm font-mono border border-accent/20">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-text-muted text-sm">
                  {project.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  return (
    <SectionWrapper id="projects">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative">
        <h2 className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold text-text mb-6 sm:mb-8 md:mb-12 font-display gradient-text">
          <span className="text-accent font-mono text-lg sm:text-xl mr-0 sm:mr-2">03.</span>
          <span className="flex-grow min-w-0">Some Things I've Built</span>
          <span className="h-px bg-secondary flex-grow min-w-[60px] ml-0 sm:ml-4 opacity-50 w-full sm:w-auto order-3 sm:order-none"></span>
        </h2>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-12 justify-center md:justify-start">
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg font-mono text-sm transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-accent text-primary font-bold shadow-lg shadow-accent/30'
                  : 'bg-secondary/50 text-text-muted hover:bg-secondary hover:text-text border border-secondary/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Filter projects by ${category}`}
            >
              {category}
            </motion.button>
          ))}
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg">No projects found in this category.</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredProjects.map((project, index) => (
              <ProjectCard 
                key={`${project.title}-${index}`} 
                project={project} 
                index={index} 
                onOpenModal={setSelectedProject}
              />
            ))}
          </motion.div>
        )}
      </div>

      <ProjectModal 
        project={selectedProject} 
        isOpen={!!selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </SectionWrapper>
  );
};

export default Projects;
