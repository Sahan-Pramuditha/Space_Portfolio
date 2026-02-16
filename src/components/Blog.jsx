import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ExternalLink, Calendar, Clock, ArrowRight } from 'lucide-react';
import SectionWrapper from './SectionWrapper';

// Set to empty array to disable blog section, or add your blog posts
const blogPosts = [
  // Example structure - uncomment and add your posts:
  // {
  //   title: 'Building Scalable React Applications',
  //   excerpt: 'Learn how to structure React applications for scale, covering patterns like compound components, custom hooks, and state management strategies.',
  //   date: '2024-01-15',
  //   readTime: '5 min read',
  //   category: 'React',
  //   link: 'https://yourblog.com/post-1',
  //   featured: true
  // },
  // {
  //   title: 'Understanding Modern CSS Grid',
  //   excerpt: 'A deep dive into CSS Grid layout system and how to use it effectively for responsive designs.',
  //   date: '2024-02-01',
  //   readTime: '8 min read',
  //   category: 'CSS',
  //   link: 'https://yourblog.com/post-2',
  //   featured: false
  // }
];

const BlogCard = ({ post, index }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card p-6 rounded-xl border border-secondary/50 hover:border-accent/50 transition-all duration-300 group bg-secondary/20 hover:bg-secondary/30 h-full flex flex-col"
    >
      {post.featured && (
        <span className="inline-block px-2 py-1 bg-accent/20 text-accent text-xs font-mono rounded mb-3 w-fit">
          Featured
        </span>
      )}
      
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-accent/20 rounded-lg group-hover:bg-accent/30 transition-colors">
          <BookOpen className="text-accent" size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-text mb-2 group-hover:text-accent transition-colors">
            {post.title}
          </h3>
          <p className="text-text-muted text-sm leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs text-text-muted mt-auto">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{post.readTime}</span>
        </div>
        {post.category && (
          <span className="px-2 py-1 bg-primary/50 text-accent rounded text-xs font-mono border border-accent/20">
            {post.category}
          </span>
        )}
      </div>

      <a
        href={post.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-accent hover:text-text transition-colors text-sm font-mono group/link"
      >
        Read Article
        <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
      </a>
    </motion.article>
  );
};

const Blog = () => {
  // Hide section if no blog posts
  if (!blogPosts || blogPosts.length === 0) {
    return null;
  }

  const featuredPosts = blogPosts.filter(p => p.featured);
  const regularPosts = blogPosts.filter(p => !p.featured);

  return (
    <SectionWrapper id="blog">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative">
        <h2 className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold text-text mb-8 sm:mb-12 md:mb-16 font-display gradient-text">
          <span className="text-accent font-mono text-lg sm:text-xl mr-0 sm:mr-2">06.</span>
          <span className="flex-grow min-w-0">Latest Articles</span>
          <span className="h-px bg-secondary flex-grow min-w-[60px] ml-0 sm:ml-4 opacity-50 w-full sm:w-auto order-3 sm:order-none"></span>
        </h2>

        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-bold text-text mb-6 font-mono text-accent">Featured</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredPosts.map((post, index) => (
                <BlogCard key={index} post={post} index={index} />
              ))}
            </div>
          </div>
        )}

        {regularPosts.length > 0 && (
          <div>
            {featuredPosts.length > 0 && (
              <h3 className="text-lg font-bold text-text mb-6 font-mono text-accent">More Articles</h3>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post, index) => (
                <BlogCard key={index} post={post} index={index + featuredPosts.length} />
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};

export default Blog;
