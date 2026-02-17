import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import SectionWrapper from './SectionWrapper';

const testimonials = [
  {
    id: 1,
    name: 'Wybe Fashion',
    role: 'E-Commerce & Retail Operations Team',
    content: 'Managed wybe.lk operations and platform reliability.',
    image: 'https://greencoding.b-cdn.net/wybe.lk/front-end-assets/og.jpg',
    rating: 5
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Founder of StartUp Inc',
    content: 'I was blown away by the 3D interactions Sahan built for our landing page. It completely transformed our brand image. Highly recommended!',
    image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    rating: 5
  },
  {
    id: 3,
    name: 'Emily Davis',
    role: 'Creative Director at Studio X',
    content: 'Professional, communicative, and incredibly talented. Sahan took our complex requirements and turned them into a seamless, beautiful interface.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    rating: 5
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => (prev + newDirection + testimonials.length) % testimonials.length);
  };

  return (
    <SectionWrapper id="testimonials" className="relative overflow-hidden py-24">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10"></div>

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="flex items-center justify-center text-2xl md:text-3xl font-bold text-text mb-4 font-display gradient-text">
            <span className="text-accent font-mono text-xl mr-2">04.</span> Client Stories
          </h2>
          <p className="text-text-muted max-w-lg mx-auto">
            Don't just take my word for it. Here's what people say about working with me.
          </p>
        </div>

        <div
          className="relative max-w-4xl mx-auto min-h-[420px] flex items-center justify-center perspective-1000"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') paginate(-1);
            if (e.key === 'ArrowRight') paginate(1);
          }}
          aria-label="Testimonials carousel"
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 }
              }}
              drag={prefersReducedMotion ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);

                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="absolute w-full px-4"
              style={{ width: '100%', maxWidth: '800px' }}
            >
              <div className="relative">
                {/* Large Quote Mark */}
                <div className="absolute -top-6 -left-2 md:-top-8 md:-left-8 bg-secondary p-4 rounded-full border border-accent/20 shadow-lg z-20">
                  <Quote size={32} className="text-accent fill-accent/20" />
                </div>

                <div className="glass-card p-8 md:p-12 rounded-2xl border border-white/10 relative shadow-2xl bg-secondary/80 backdrop-blur-md z-10">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    {/* Image Column */}
                    <div className="flex-shrink-0">
                      <div className="relative w-24 h-24 md:w-32 md:h-32">
                        <div className="absolute inset-0 bg-accent rounded-full blur-md opacity-50 animate-pulse"></div>
                        <img 
                          src={testimonials[currentIndex].image} 
                          alt={testimonials[currentIndex].name}
                          loading="lazy"
                          decoding="async"
                          fetchPriority="low"
                          className="w-full h-full object-cover rounded-full border-2 border-accent/50 relative z-10 shadow-xl"
                        />
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className="flex-grow text-center md:text-left">
                      <div className="flex justify-center md:justify-start gap-1 mb-4">
                        {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                          <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                      
                      <p className="text-lg md:text-xl text-text leading-relaxed mb-6 italic">
                        "{testimonials[currentIndex].content}"
                      </p>
                      
                      <div>
                        <h4 className="text-xl font-bold text-text">
                          {testimonials[currentIndex].name}
                        </h4>
                        <p className="text-accent font-mono text-sm">
                          {testimonials[currentIndex].role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls - Moved outside relative container to avoid overlap issues */}
          <div className="absolute -bottom-4 left-0 right-0 flex justify-center items-center gap-6 z-30">
            <button
              onClick={() => paginate(-1)}
              className="p-3 rounded-full bg-secondary border border-accent/20 text-text hover:bg-accent hover:text-white transition-all duration-300 shadow-lg hover:shadow-accent/25 hover:scale-110 active:scale-95"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-accent w-8' : 'bg-text-muted/30 hover:bg-accent/50 w-2'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-pressed={index === currentIndex}
                />
              ))}
            </div>

            <button
              onClick={() => paginate(1)}
              className="p-3 rounded-full bg-secondary border border-accent/20 text-text hover:bg-accent hover:text-white transition-all duration-300 shadow-lg hover:shadow-accent/25 hover:scale-110 active:scale-95"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default Testimonials;
