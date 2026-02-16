import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import SectionWrapper from './SectionWrapper';
const Contact3D = React.lazy(() => import('./Contact3D'));

const Contact = () => {
  const [formState, setFormState] = useState('idle'); // idle, submitting, success
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
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
    if (!formData.name || !formData.email || !formData.message) return;
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
    } catch (err) {
      setFormState('idle');
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
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-accent font-mono text-lg mb-4">05. What's Next?</h2>
          <h2 className="text-4xl md:text-5xl font-bold text-text mb-6 gradient-text">Get In Touch</h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Although I'm not currently looking for any new opportunities, my inbox is always open. Whether you have a question or just want to say hi, I'll try my best to get back to you!
          </p>
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
                  <div className="relative group">
                    <motion.input
                      variants={inputVariants}
                      whileFocus="focus"
                      type="text"
                      name="name"
                      required
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-primary/50 border border-secondary rounded-lg px-4 py-3 text-text outline-none focus:border-accent transition-colors peer"
                      placeholder=" "
                    />
                    <label className="absolute left-4 top-3 text-text-muted transition-all duration-300 pointer-events-none peer-focus:-top-6 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-xs">
                      Your Name
                    </label>
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
                      className="w-full bg-primary/50 border border-secondary rounded-lg px-4 py-3 text-text outline-none focus:border-accent transition-colors peer"
                      placeholder=" "
                    />
                    <label className="absolute left-4 top-3 text-text-muted transition-all duration-300 pointer-events-none peer-focus:-top-6 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-xs">
                      Your Email
                    </label>
                  </div>

                  <div className="relative group">
                    <motion.textarea
                      variants={inputVariants}
                      whileFocus="focus"
                      name="message"
                      required
                      rows="4"
                      minLength={10}
                      autoComplete="off"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full bg-primary/50 border border-secondary rounded-lg px-4 py-3 text-text outline-none focus:border-accent transition-colors peer resize-none"
                      placeholder=" "
                    ></motion.textarea>
                    <label className="absolute left-4 top-3 text-text-muted transition-all duration-300 pointer-events-none peer-focus:-top-6 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-xs">
                      Message
                    </label>
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
