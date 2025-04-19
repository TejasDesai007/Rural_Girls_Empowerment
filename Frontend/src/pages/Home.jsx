// src/pages/Home.jsx
import React, { lazy, Suspense, useState, useEffect } from "react";
import { cn } from '../lib/utils';
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map, UserCheck, Code2, Sparkles, MousePointerClick, 
  ChevronLeft, ChevronRight, ArrowRight
} from "lucide-react";

// Lazy-loaded components
const BentoGrid = lazy(() => import("../components/ui/bento-grid").then(module => ({
  default: module.BentoGrid
})));
const BentoGridItem = lazy(() => import("../components/ui/bento-grid").then(module => ({
  default: module.BentoGridItem
})));
const AnimatedTestimonials = lazy(() => import("../components/ui/animated-testimonials").then(module => ({
  default: module.AnimatedTestimonials
})));

// Loading placeholders
const LoadingBento = () => (
  <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className={`${i === 3 || i === 6 ? "md:col-span-2" : ""} bg-gray-100 animate-pulse rounded-xl h-64`}></div>
    ))}
  </div>
);

const LoadingTestimonials = () => (
  <div className="w-full max-w-5xl mx-auto h-96 bg-gray-100 animate-pulse rounded-xl"></div>
);

const Home = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <HeroSection />
      <Suspense fallback={<LoadingBento />}>
        <FeaturesSection />
      </Suspense>
      <Suspense fallback={<LoadingTestimonials />}>
        <TestimonialsSection />
      </Suspense>
      <CallToActionSection />
    </div>
  );
};

const HeroSection = () => {
  // Extract words outside of render for better performance
  const titleWords = "Empower Rural Girls Through Digital Learning".split(" ");
  
  // Image carousel implementation
  const carouselImages = [
    "/assets/image1.png",
    "/assets/image2.jpg", 
    "/assets/image3.jpg",
    "/assets/image4.jpg"
  ];
  
  const [currentImage, setCurrentImage] = useState(0);
  
  useEffect(() => {
    // Auto-advance carousel
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % carouselImages.length);
  };
  
  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };
  
  return (
    <section className="w-full px-6 py-20 text-center relative overflow-hidden">
      {/* Background carousel */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full"
          >
            <div 
              className="w-full h-full bg-cover bg-center" 
              style={{ 
                backgroundImage: `url(${carouselImages[currentImage]})`,
                filter: "brightness(0.3)"
              }}
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/70 to-purple-800/70 mix-blend-multiply" />
      </div>
      
      {/* Carousel controls
      <button 
        onClick={prevImage} 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full z-20 hover:bg-white/30 transition-colors"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button 
        onClick={nextImage} 
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full z-20 hover:bg-white/30 transition-colors"
        aria-label="Next image"
      >
        <ChevronRight className="h-6 w-6" />
      </button> */}
      
      {/* Carousel indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentImage === index ? "bg-white w-6" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      <div className="relative mx-auto max-w-7xl flex flex-col items-center justify-center z-10">
        <div className="px-4 py-10 md:py-20">
          <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-white md:text-4xl lg:text-7xl">
            {titleWords.map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-white/90"
          >
            Unlock opportunities with mentorship, courses, toolkits, and an AI assistant—all in your language.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1 }}
            className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/register">
              <button className="w-60 transform rounded-lg bg-pink-600 px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-pink-700 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                Register
              </button>
            </Link>
            <Link to="/about">
              <button className="w-60 transform rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20 dark:border-gray-700 dark:bg-black/50 dark:text-white dark:hover:bg-gray-900/70">
                Learn More
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  // Extract words outside of render
  const titleWords = "What do we offer?".split(" ");
  
  return (
    <section className="px-6 py-16 bg-white">
      <h1 className="relative z-10 mx-auto mb-5 max-w-4xl text-center text-xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
        {titleWords.map((word, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
              ease: "easeInOut",
            }}
            viewport={{ once: true, amount: 0.6 }}
            className="mr-4 inline-block"
          >
            {word}{" "}
          </motion.span>
        ))}
      </h1>

      <BentoGrid className="max-w-4xl mx-auto">
        {items.map((item, i) => (
          <a href={item.link} key={i} className="contents">
            <BentoGridItem
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
              className={i === 3 || i === 6 ? "md:col-span-2" : ""}
            />
          </a>
        ))}
      </BentoGrid>
    </section>
  );
};

const TestimonialsSection = () => (
  <div className='mb-0'>
    <AnimatedTestimonialsDemo />
  </div>
);

const CallToActionSection = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative px-6 py-24 overflow-hidden">
      {/* Background with gradient animation */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-pink-500 via-pink-400 to-purple-500"
        animate={{
          background: [
            "linear-gradient(to bottom right, #ec4899, #d946ef)",
            "linear-gradient(to bottom right, #d946ef, #8b5cf6)",
            "linear-gradient(to bottom right, #8b5cf6, #ec4899)",
            "linear-gradient(to bottom right, #ec4899, #d946ef)"
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10 backdrop-blur-sm"
            style={{
              width: Math.random() * 200 + 50,
              height: Math.random() * 200 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.h2 
          className="text-4xl font-bold mb-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Ready to Empower Yourself?
        </motion.h2>
        
        <motion.p 
          className="mb-8 text-white/90 text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Join thousands of girls transforming their futures with digital tools and knowledge.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <Button
              className="group relative overflow-hidden bg-white text-pink-600 hover:text-pink-700 hover:bg-white/90 px-8 py-6 text-lg font-medium"
              onClick={() => navigate("/login")}
            >
              <span className="relative z-10 flex items-center group-hover:translate-x-2 transition-transform duration-300">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <motion.span
                className="absolute inset-0 bg-pink-100"
                initial={{ x: "-100%" }}
                animate={isHovered ? { x: "0%" } : { x: "-100%" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              className="border-2 bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8 py-6 text-lg font-medium backdrop-blur-sm"
              onClick={() => navigate("/about")}
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Floating stats */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { number: "5,000+", label: "Girls Empowered" },
            { number: "200+", label: "Communities Reached" },
            { number: "98%", label: "Satisfaction Rate" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
            >
              <motion.h3 
                className="text-3xl font-bold text-white"
                whileInView={{ scale: [0.9, 1.1, 1] }}
                transition={{ duration: 0.8, delay: 0.8 + index * 0.2 }}
                viewport={{ once: true }}
              >
                {stat.number}
              </motion.h3>
              <p className="text-white/80">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Home;

// ---------------------BENTO------------------------
const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>
);

// Pre-defined items array with optimized image loading
const items = [
  {
    title: "E-learning",
    description: "Access curated learning modules anytime.",
    link: "/courses",
    header: (
      <div className="relative flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden items-center justify-center bg-white dark:bg-black">
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
            "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
          )}
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 opacity-80 pointer-events-none"
          style={{
            WebkitMaskImage:
              "radial-gradient(circle at bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0) 90%)",
            maskImage:
              "radial-gradient(circle at bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0) 90%)",
          }}
        />
        <img loading="lazy" src="/assets/elearning.png" alt="Feature" className="relative z-10 h-40 w-40 object-contain" />
      </div>
    ),
    icon: <Map className="h-4 w-4" />,
  },
  {
    title: "Mentorship",
    description: "Connect with experienced mentors.",
    link: "/mentor-match",
    header: (
      <div className="relative flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden items-center justify-center bg-white dark:bg-black">
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
            "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
          )}
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-yellow-400 dark:from-yellow-800 dark:to-yellow-600 opacity-80 pointer-events-none"
          style={{
            WebkitMaskImage:
              "radial-gradient(circle at bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0) 90%)",
            maskImage:
              "radial-gradient(circle at bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0) 90%)",
          }}
        />
        <img loading="lazy" src="/assets/mentor.png" alt="Driver" className="relative z-10 h-50 w-50 object-contain" />
      </div>
    ),
    icon: <UserCheck className="h-4 w-4" />,
  },
  {
    title: "Toolkits",
    description: "Download resources to start your journey.",
    link: "/toolkit",
    header: (
      <div className="relative flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden items-center justify-center bg-white dark:bg-black">
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
            "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
          )}
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-sky-300 to-sky-500 dark:from-sky-800 dark:to-sky-600 opacity-80 pointer-events-none"
          style={{
            WebkitMaskImage:
              "radial-gradient(circle at bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0) 90%)",
            maskImage:
              "radial-gradient(circle at bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0) 90%)",
          }}
        />
        <img loading="lazy" src="/assets/toolkits.png" alt="Tech" className="relative z-10 h-30 w-30 object-contain" />
      </div>
    ),
    icon: <Code2 className="h-4 w-4" />,
  },
  {
    title: "Entrepreneur Tools",
    description: "We're adding tools for restaurants and customers soon.",
    link: "/entrepreneur-toolkit",
    header: (
      <div className="relative flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden items-center justify-center bg-white dark:bg-black">
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
            "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
          )}
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-purple-300 to-purple-500 dark:from-purple-800 dark:to-purple-600 opacity-80 pointer-events-none"
          style={{
            WebkitMaskImage:
              "radial-gradient(circle at bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0) 90%)",
            maskImage:
              "radial-gradient(circle at bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0) 90%)",
          }}
        />
        <img loading="lazy" src="/assets/enter.png" alt="Upcoming" className="relative z-10 h-50 w-50 object-contain" />
      </div>
    ),
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    title: "AI Assistant",
    description: "Ask questions, get help—instantly.",
    link: "/chat-assistant",
    header: (
      <div className="relative flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden items-center justify-center bg-white dark:bg-black">
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:40px_40px]",
            "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
            "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
          )}
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-pink-200 to-pink-400 dark:from-pink-800 dark:to-pink-600 opacity-80 pointer-events-none"
          style={{
            WebkitMaskImage:
              "radial-gradient(circle at bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0) 90%)",
            maskImage:
              "radial-gradient(circle at bottom left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0) 90%)",
          }}
        />
        <img loading="lazy" src="/assets/robot.png" alt="UX" className="relative z-10 h-30 w-30 object-contain" />
      </div>
    ),
    icon: <MousePointerClick className="h-4 w-4" />,
  },
];

// Testimonials Demo with optimized image loading
function AnimatedTestimonialsDemo() {
  const testimonials = [
    {
      quote:
        "This platform changed my life! I learned tailoring and started my own small business.",
      name: "Lakshmi",
      designation: "Uttar Pradesh",
      src: "/assets/lakshmi.jpg",
    },
    {
      quote:
        "Mentorship helped me choose the right career path. Grateful for this community!",
      name: "Kalyani",
      designation: "Rajasthan",
      src: "/assets/kalyani.jpg",
    },
    {
      quote:
        "I never thought online learning could be this accessible. The toolkit resources are super useful.",
      name: "Savita",
      designation: "Bihar",
      src: "/assets/savita.jpg",
    },
    {
      quote:
        "The AI assistant feature is amazing! I got answers to my doubts instantly, without waiting.",
      name: "Jayshree",
      designation: "Maharashtra",
      src: "/assets/jayashree.jpg",
    },
    {
      quote:
        "Connecting with mentors helped me improve my confidence and communication. Highly recommended!",
      name: "Madhavi",
      designation: "Karnataka",
      src: "/assets/madhavi.jpg",
    },
    {
      quote:
        "As a working mother, flexible learning made all the difference. I could study whenever I had time.",
      name: "Chandramukhi",
      designation: "Madhya Pradesh",
      src: "/assets/chandramukhi.jpg",
    },
  ];

  return <AnimatedTestimonials testimonials={testimonials} />;
}