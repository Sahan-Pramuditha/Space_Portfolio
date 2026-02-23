import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Send, CheckCircle, Loader2, FileText, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import SectionWrapper from './SectionWrapper';
import { trackContactSubmit, trackDownload } from '../utils/analytics';
const Contact3D = React.lazy(() => import('./Contact3D'));

const Contact = () => {
  const [formState, setFormState] = useState('idle'); // idle, submitting, success
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const prefersReducedMotion = useReducedMotion();

  const triggerConfetti = () => {
    if (prefersReducedMotion) return;
    const end = Date.now() + 1000;

    const colors = ['#0ea5e9', '#38bdf8'];

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || formData.name.length < 2) {
      setErrorMessage('Please enter your name (at least 2 characters).');
      return;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!formData.message || formData.message.length < 10) {
      setErrorMessage('Your message should be at least 10 characters long.');
      return;
    }
    
    setErrorMessage('');
    setFormState('submitting');
    try {
      const endpoint =
        import.meta.env.VITE_CONTACT_ENDPOINT ||
        (import.meta.env.VITE_FORMSPREE_ID
          ? `https://formspree.io/f/${import.meta.env.VITE_FORMSPREE_ID}`
          : null);
      
      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            message: formData.message,
            _subject: 'New message from portfolio contact form'
          })
        });
        if (!res.ok) throw new Error('Failed to submit');
      } else {
        const mailto = `mailto:contact@sahanpramuditha.com?subject=${encodeURIComponent(
          'Portfolio Contact'
        )}&body=${encodeURIComponent(
          `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
        )}`;
        window.location.href = mailto;
      }
      setFormState('success');
      setFormData({ name: '', email: '', message: '' });
      triggerConfetti();
      trackContactSubmit(true);
    } catch (err) {
      setFormState('idle');
      setErrorMessage('Something went wrong while sending your message. Please try again in a moment or email me directly at contact@sahanpramuditha.com.');
      trackContactSubmit(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
  };

  return (
    <SectionWrapper id="contact" className="min-h-[80vh] flex items-center">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-accent font-mono text-lg mb-4">05. What's Next?</h2>
          <h2 className="text-4xl md:text-5xl font-bold text-text mb-6 gradient-text">Get In Touch</h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto mb-6">
            Although I'm not currently looking for any new opportunities, my inbox is always open. Whether you have a question or just want to say hi, I'll try my best to get back to you!
          </p>
          {/* Resume Download Link */}
          <motion.a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            download
            onClick={() => trackDownload('resume')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent/10 border border-accent text-accent rounded-lg hover:bg-accent hover:text-primary transition-all duration-300 font-mono text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download size={18} />
            Download Resume
          </motion.a>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Form Side */}
          <div className="max-w-xl w-full mx-auto glass-card p-8 rounded-2xl relative overflow-hidden order-2 lg:order-1">
            <AnimatePresence mode="wait">
              {formState === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-500">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-text mb-2">Message Sent!</h3>
                  <p className="text-text-muted mb-8">Thanks for reaching out. I'll get back to you soon.</p>
                  <motion.button
                    onClick={() => setFormState('idle')}
                    className="px-6 py-2 bg-secondary text-text rounded-lg hover:bg-accent hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Send another message
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  noValidate
                  aria-busy={formState === 'submitting'}
                  className="space-y-6"
                >
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="text-xs md:text-sm text-red-400 bg-red-950/40 border border-red-500/40 rounded-lg px-4 py-2 font-mono"
                      role="alert"
                    >
                      {errorMessage}
                    </motion.div>
                  )}
                  <div className="relative group">
                    <motion.input
                      variants={inputVariants}
                      whileFocus="focus"
                      type="text"
                      name="name"
                      required
                      minLength={2}
                      maxLength={100}
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-primary/50 border border-secondary rounded-lg px-4 py-3 text-text outline-none focus:border-accent transition-colors peer placeholder:text-white invalid:border-red-500/50"
                      placeholder=" "
                      aria-describedby="name-error"
                      aria-invalid={formData.name && formData.name.length < 2}
                    />
                    <label className="absolute left-4 top-3 text-white transition-all duration-300 pointer-events-none peer-focus:-top-6 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-xs">
                      Your Name <span className="text-red-400">*</span>
                    </label>
                    {formData.name && formData.name.length < 2 && (
                      <p id="name-error" className="text-xs text-red-400 mt-1 ml-4" role="alert">
                        Name must be at least 2 characters
                      </p>
                    )}
                  </div>

                  <div className="relative group">
                    <motion.input
                      variants={inputVariants}
                      whileFocus="focus"
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-primary/50 border border-secondary rounded-lg px-4 py-3 text-text outline-none focus:border-accent transition-colors peer placeholder:text-white invalid:border-red-500/50"
                      placeholder=" "
                      aria-describedby="email-error"
                      aria-invalid={formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)}
                    />
                    <label className="absolute left-4 top-3 text-white transition-all duration-300 pointer-events-none peer-focus:-top-6 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-xs">
                      Your Email <span className="text-red-400">*</span>
                    </label>
                    {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                      <p id="email-error" className="text-xs text-red-400 mt-1 ml-4" role="alert">
                        Please enter a valid email address
                      </p>
                    )}
                  </div>

                  <div className="relative group">
                    <motion.textarea
                      variants={inputVariants}
                      whileFocus="focus"
                      name="message"
                      required
                      rows="4"
                      minLength={10}
                      maxLength={1000}
                      autoComplete="off"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full bg-primary/50 border border-secondary rounded-lg px-4 py-3 text-text outline-none focus:border-accent transition-colors peer resize-none placeholder:text-white invalid:border-red-500/50"
                      placeholder=" "
                      aria-describedby="message-error"
                      aria-invalid={formData.message && formData.message.length < 10}
                    ></motion.textarea>
                    <label className="absolute left-4 top-3 text-white transition-all duration-300 pointer-events-none peer-focus:-top-6 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-xs">
                      Message <span className="text-red-400">*</span>
                    </label>
                    {formData.message && formData.message.length < 10 && (
                      <p id="message-error" className="text-xs text-red-400 mt-1 ml-4" role="alert">
                        Message must be at least 10 characters ({formData.message.length}/10)
                      </p>
                    )}
                    {formData.message && formData.message.length >= 10 && (
                      <p className="text-xs text-text-muted mt-1 ml-4">
                        {formData.message.length}/1000 characters
                      </p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={formState === 'submitting'}
                    aria-disabled={formState === 'submitting'}
                    className="w-full bg-accent/10 border border-accent text-accent font-bold py-4 rounded-lg hover:bg-accent hover:text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {formState === 'submitting' ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* 3D Side */}
          <motion.div 
            className="h-[400px] w-full order-1 lg:order-2"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Suspense fallback={<div className="w-full h-full rounded-2xl bg-gradient-to-br from-accent/20 via-secondary to-primary" />}>
              <Contact3D />
            </Suspense>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default Contact;
