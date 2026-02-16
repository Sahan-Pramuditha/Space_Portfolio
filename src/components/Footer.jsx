import React from 'react';
import { Github, Linkedin, Mail, Twitter, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: 'https://github.com/SahanPramuditha-Dev', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com/in/sahanpramuditha', label: 'LinkedIn' },
    { icon: Twitter, href: 'https://twitter.com/sahanpramuditha', label: 'Twitter' },
    { icon: Mail, href: 'mailto:contact@sahanpramuditha.com', label: 'Email' },
  ];

  return (
    <footer className="relative z-10 bg-primary/90 backdrop-blur-md border-t border-secondary pt-12 pb-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
          
          {/* Brand & Tagline */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-text mb-2">
              S<span className="text-accent">ahan.</span>
            </h3>
            <p className="text-text-muted text-sm max-w-xs">
              Building digital experiences with pixel-perfect precision and interactive magic.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex gap-6">
            {socialLinks.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-text-muted hover:text-accent transition-colors p-2 rounded-full hover:bg-secondary/50"
                whileHover={{ y: -3, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={link.label}
              >
                <link.icon size={20} />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-secondary w-full mb-8 opacity-50" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-text-muted gap-4">
          <p className="flex items-center gap-1">
            © {currentYear} Sahan Pramuditha. All rights reserved.
          </p>
          
          <p className="flex items-center gap-2">
            Made with <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" /> using React & Three.js
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
