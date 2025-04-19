// src/pages/Home.jsx
import React, { lazy, Suspense } from "react";
import { cn } from '../lib/utils';
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Map, UserCheck, Code2, Sparkles, MousePointerClick
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
  
  return (
    <section className="w-full px-6 py-20 text-center bg-gradient-to-br from-pink-100 to-pink-200">
      <div className="relative mx-auto max-w-7xl flex flex-col items-center justify-center">
        <div className="px-4 py-10 md:py-20">
          <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
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
            className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
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
              <button className="w-60 transform rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-white dark:hover:bg-gray-900">
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

  return (
    <section className="px-6 py-20 bg-pink-50 text-center">
      <h2 className="text-3xl font-bold mb-4">Ready to Empower Yourself?</h2>
      <p className="mb-6 text-gray-700">
        Join thousands of girls transforming their futures with digital tools and knowledge.
      </p>
      <Button
        className="bg-pink-600 text-white hover:bg-pink-700"
        onClick={() => navigate("/login")}
      >
        Get Started
      </Button>
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
      src: "https://images.unsplash.com/photo-1441307811206-a12c74889338?q=80&w=600&auto=format&fit=crop",
    },
    {
      quote:
        "Mentorship helped me choose the right career path. Grateful for this community!",
      name: "Savita",
      designation: "Rajasthan",
      src: "https://images.unsplash.com/photo-1699873728107-9ce97c8f78eb?q=80&w=600&auto=format&fit=crop",
    },
    {
      quote:
        "I never thought online learning could be this accessible. The toolkit resources are super useful.",
      name: "Kalyani",
      designation: "Bihar",
      src: "https://images.unsplash.com/photo-1518131296958-df44106fd0ae?q=80&w=600&auto=format&fit=crop",
    },
    {
      quote:
        "The AI assistant feature is amazing! I got answers to my doubts instantly, without waiting.",
      name: "Jayshree",
      designation: "Maharashtra",
      src: "https://images.unsplash.com/photo-1604998268070-8d9b57c181ec?q=80&w=600&auto=format&fit=crop",
    },
    {
      quote:
        "Connecting with mentors helped me improve my confidence and communication. Highly recommended!",
      name: "Madhavi",
      designation: "Karnataka",
      src: "https://images.unsplash.com/photo-1668258848213-c1967ba6fb01?q=80&w=600&auto=format&fit=crop",
    },
    {
      quote:
        "As a working mother, flexible learning made all the difference. I could study whenever I had time.",
      name: "Chandramukhi",
      designation: "Madhya Pradesh",
      src: "https://images.unsplash.com/photo-1609252285522-ed0ebdd43551?q=80&w=600&auto=format&fit=crop",
    },
  ];

  return <AnimatedTestimonials testimonials={testimonials} />;
}