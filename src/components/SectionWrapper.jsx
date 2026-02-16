import React from 'react';
import { motion } from 'framer-motion';

const SectionWrapper = ({ children, id, className }) => {
  return (
    <motion.section
      id={id}
      className={`py-12 md:py-24 relative z-10 ${className || ''}`}
      style={{ position: 'relative', contentVisibility: 'auto', contain: 'layout paint', willChange: 'opacity, transform' }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
};

export default SectionWrapper;
