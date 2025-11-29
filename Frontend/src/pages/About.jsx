import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

// Aceternity
const TextReveal = ({ children, className }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px"
  });

  // Debug logging
  useEffect(() => {
    console.log('TextReveal isInView:', isInView);
  }, [isInView]);

  return (
    <div ref={ref} className={cn("overflow-hidden relative", className)}>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        onAnimationComplete={() => console.log('Animation completed')}
      >
        {children}
      </motion.div>
    </div>
  );
};

const GradientText = ({ children, className }) => {
  return (
    <span className={cn("bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600", className)}>
      {children}
    </span>
  );
};

const AnimatedCard = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="backdrop-blur-sm bg-white/80 rounded-xl shadow-lg border border-gray-200 p-6 h-full"
    >
      {children}
    </motion.div>
  );
};

const SparklesBackground = ({ children }) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      {children}
    </div>
  );
};

// Main Component
export default function About() {
  const staticAdmins = [
    {
      name: "Tejas Desai",
      linkedin: "https://www.linkedin.com/in/tejas-desai-072a77218/",
      image: "https://media.licdn.com/dms/image/v2/D4D03AQHR6FSld--xhg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1688110371217?e=1758758400&v=beta&t=Khr62Iti3BgETOsDQrND28ZqvQrCBXG-MpN7N1-2YEE",
      role: "Backend Developer",
      connections: "300+"
    },
    {
      name: "Darshan Bhere",
      linkedin: "https://www.linkedin.com/in/darshan-bhere-b69a14260/",
      image: "https://media.licdn.com/dms/image/v2/D5603AQH6PSAo8pHEAA/profile-displayphoto-shrink_800_800/B56ZZPC1kyHoAc-/0/1745082866629?e=1758758400&v=beta&t=h2CRtAsSvYkxAn8QXt4SmYEBwR7B0omO6BseS01FwQM",
      role: "Full Stack Developer",
      connections: "400+"
    },
    {
      name: "Shivam Darekar",
      linkedin: "https://www.linkedin.com/in/shivamdarekar2206/",
      image: "https://avatars.githubusercontent.com/u/99381315?s=400&u=796bb86e7bbea9225c095d00aa04dfddafc316a9&v=4",
      role: "Full Stack Dev + UI/UX Designer",
      connections: "500+"
    },
    {
      name: "Kiran Bayas",
      linkedin: "https://www.linkedin.com/in/kiran-bayas-72b56b334/",
      image: "https://media.licdn.com/dms/image/v2/D4E03AQE3nrwsqpQ1Hg/profile-displayphoto-shrink_800_800/B4EZU9ziMBHMAk-/0/1740498675824?e=1758758400&v=beta&t=T0offFkUzu7xbifciJ0MlJ3MmwDSqQ0szOCuf93kXAQ",
      role: "Backend Developer",
      connections: "500+"
    },
  ];

  // Parallax effect for hero section
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <SparklesBackground>
      <div className="max-w-6xl mx-auto p-6 pt-16 space-y-24 relative z-10">
        {/* Hero Section with Parallax */}
        <motion.div
          style={{ y }}
          className="relative z-10 text-center flex flex-col items-center"
        >
          <div className="absolute -z-10 inset-0 h-64 w-full bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl blur-3xl opacity-30 transform -translate-y-1/2"></div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-6"
          >
            <span className="relative inline-block">
              <span className="absolute inset-y-4 w-full bg-pink-100 rounded-xl -z-10"></span>
              <h1 className="text-sm sm:text-base font-medium tracking-widest text-purple-600 uppercase relative z-10">
                Our Story
              </h1>
            </span>
          </motion.div>

          <TextReveal>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              About <GradientText>Unnati - Rise of Her</GradientText>
            </h1>
          </TextReveal>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              <GradientText><b>Unnati - Rise of Her</b></GradientText> is a digital platform designed to uplift and digitally empower rural girls by offering free access to coding education, mentorship opportunities, entrepreneurial toolkits, and AI-powered assistance. Our mission is to bridge the digital divide and promote innovation, creativity, and inclusion through technology.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.div
              className="flex items-center justify-center gap-3 mt-6 px-6 py-3 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 cursor-pointer"
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(147, 51, 234, 0.1)",
                borderColor: "rgba(147, 51, 234, 0.3)",
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="relative"
                whileHover="hover"
                initial="initial"
              >
                {/* Enhanced glow effect */}
                <motion.div
                  className="absolute inset-0 h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-md opacity-75"
                  variants={{
                    initial: { scale: 1, opacity: 0.75 },
                    hover: { scale: 1.3, opacity: 0.9 }
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Main logo with better contrast */}
                <motion.div
                  className="relative h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 flex items-center justify-center shadow-lg overflow-hidden"
                  variants={{
                    initial: { scale: 1 },
                    hover: { scale: 1.1 }
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Static sparkle icon */}
                  <motion.div
                    className="w-5 h-5 text-white relative z-10"
                    variants={{
                      initial: { rotate: 0, scale: 1 },
                      hover: { rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    ✨
                  </motion.div>

                  {/* Sparkle particles on hover */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    variants={{
                      initial: { opacity: 0 },
                      hover: { opacity: 1 }
                    }}
                  >
                    {/* Sparkle particle 1 */}
                    <motion.div
                      className="absolute w-1 h-1 bg-white rounded-full"
                      variants={{
                        initial: { scale: 0, x: 0, y: 0 },
                        hover: {
                          scale: [0, 1, 0],
                          x: [-15, -20, -25],
                          y: [-10, -15, -20],
                          opacity: [0, 1, 0]
                        }
                      }}
                      transition={{ duration: 1, delay: 0.1 }}
                    />

                    {/* Sparkle particle 2 */}
                    <motion.div
                      className="absolute w-1 h-1 bg-white rounded-full"
                      variants={{
                        initial: { scale: 0, x: 0, y: 0 },
                        hover: {
                          scale: [0, 1, 0],
                          x: [15, 20, 25],
                          y: [-8, -12, -16],
                          opacity: [0, 1, 0]
                        }
                      }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />

                    {/* Sparkle particle 3 */}
                    <motion.div
                      className="absolute w-1 h-1 bg-white rounded-full"
                      variants={{
                        initial: { scale: 0, x: 0, y: 0 },
                        hover: {
                          scale: [0, 1, 0],
                          x: [0, 0, 0],
                          y: [-18, -22, -26],
                          opacity: [0, 1, 0]
                        }
                      }}
                      transition={{ duration: 1, delay: 0.15 }}
                    />

                    {/* Sparkle particle 4 */}
                    <motion.div
                      className="absolute w-1 h-1 bg-white rounded-full"
                      variants={{
                        initial: { scale: 0, x: 0, y: 0 },
                        hover: {
                          scale: [0, 1, 0],
                          x: [-8, -10, -12],
                          y: [15, 18, 22],
                          opacity: [0, 1, 0]
                        }
                      }}
                      transition={{ duration: 1, delay: 0.25 }}
                    />

                    {/* Sparkle particle 5 */}
                    <motion.div
                      className="absolute w-1 h-1 bg-white rounded-full"
                      variants={{
                        initial: { scale: 0, x: 0, y: 0 },
                        hover: {
                          scale: [0, 1, 0],
                          x: [12, 15, 18],
                          y: [12, 15, 18],
                          opacity: [0, 1, 0]
                        }
                      }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.span
                className="font-semibold text-purple-800 text-sm"
                variants={{
                  initial: { color: "#6B46C1" },
                  hover: { color: "#7C3AED" }
                }}
              >
                Empowering the next generation of tech leaders
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Vision Section with Enhanced Animations - Fixed */}
        <section className="relative">
          {/* Animated background with floating elements */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl transform rotate-1 scale-105"
            animate={{
              rotate: [1, 1.5, 1],
              scale: [1.05, 1.06, 1.05]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Floating decorative elements */}
          <motion.div
            className="absolute top-4 right-8 w-3 h-3 bg-purple-300 rounded-full opacity-60"
            animate={{
              y: [0, -20, 0],
              opacity: [0.6, 0.3, 0.6]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-8 left-6 w-2 h-2 bg-pink-400 rounded-full opacity-50"
            animate={{
              y: [0, -15, 0],
              x: [0, 10, 0],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex flex-col items-center text-center">
              {/* Enhanced Icon Section */}
              <motion.div
                className="relative w-20 h-20 rounded-full mb-6 cursor-pointer group"
                whileHover="hover"
                initial="initial"
                whileTap={{ scale: 0.95 }}
              >
                {/* Outer glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-md opacity-0"
                  variants={{
                    initial: { opacity: 0, scale: 1 },
                    hover: { opacity: 0.4, scale: 1.2 }
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Main icon container */}
                <motion.div
                  className="relative w-full h-full rounded-full bg-gradient-to-br from-pink-100 via-purple-50 to-pink-100 flex items-center justify-center border-2 border-transparent"
                  variants={{
                    initial: {
                      borderColor: "transparent",
                      background: "linear-gradient(135deg, #fce7f3, #f3e8ff, #fce7f3)"
                    },
                    hover: {
                      borderColor: "#ec4899",
                      background: "linear-gradient(135deg, #f9a8d4, #ddd6fe, #f9a8d4)",
                      scale: 1.05
                    }
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Plus icon with enhanced styling */}
                  <motion.svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    variants={{
                      initial: {
                        scale: 1,
                        rotate: 0
                      },
                      hover: {
                        scale: 1.2,
                        rotate: 90
                      }
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <motion.path
                      d="M12 4V20M20 12H4"
                      stroke="#E11D48"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      variants={{
                        initial: { pathLength: 1, stroke: "#E11D48" },
                        hover: { pathLength: 1, stroke: "#BE185D" }
                      }}
                    />
                  </motion.svg>

                  {/* Sparkle effects on hover */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    variants={{
                      initial: { opacity: 0 },
                      hover: { opacity: 1 }
                    }}
                  >
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-pink-500 rounded-full"
                        variants={{
                          initial: { scale: 0, x: 0, y: 0 },
                          hover: {
                            scale: [0, 1, 0],
                            x: [0, (Math.cos(i * 60 * Math.PI / 180) * 30)],
                            y: [0, (Math.sin(i * 60 * Math.PI / 180) * 30)],
                            opacity: [0, 1, 0]
                          }
                        }}
                        transition={{
                          duration: 1,
                          delay: i * 0.1,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.h2
                className="text-2xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Our <GradientText>Vision</GradientText>
              </motion.h2>

              <motion.p
                className="text-gray-700 max-w-4xl mx-auto text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                We envision a future where every girl, no matter where she lives, has the confidence and tools to become a creator, innovator, and changemaker. By integrating fun learning modules, interactive dashboards, and real-world toolkits, EmpowerHer transforms curiosity into capability.
              </motion.p>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {[
                  { name: "Education", icon: "🎓", description: "Interactive learning modules" },
                  { name: "Mentorship", icon: "🤝", description: "Guidance from industry experts" },
                  { name: "Innovation", icon: "💡", description: "Creative problem-solving tools" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1), duration: 0.5 }}
                    whileHover={{
                      y: -5,
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl cursor-pointer border border-purple-100 hover:border-purple-200 transition-all duration-300"
                  >
                    {/* Hover gradient overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-pink-100/50 opacity-0"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Content */}
                    <div className="relative z-10 text-center">
                      <motion.div
                        className="text-2xl mb-2"
                        whileHover={{
                          scale: 1.2,
                          rotate: [0, -10, 10, 0]
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {item.icon}
                      </motion.div>

                      <motion.h3
                        className="font-semibold text-purple-800 text-lg mb-1"
                        whileHover={{ color: "#7C3AED" }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.name}
                      </motion.h3>

                      <motion.p
                        className="text-sm text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={{ y: 10 }}
                        whileHover={{ y: 0 }}
                      >
                        {item.description}
                      </motion.p>
                    </div>

                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0"
                      whileHover={{
                        x: ["-100%", "100%"],
                        opacity: [0, 1, 0]
                      }}
                      transition={{ duration: 0.6 }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Team Section with 3D Card Effect */}
        <section>
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="relative inline-block">
                <span className="absolute inset-y-3 w-full bg-purple-100 rounded-xl -z-10"></span>
                <h2 className="text-sm font-medium tracking-widest text-purple-600 uppercase relative z-10">
                  Our Team
                </h2>
              </span>
            </div>
            <TextReveal>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <GradientText>Connect with Our Team</GradientText>
              </h2>
            </TextReveal>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet the talented individuals behind EmpowerHer who are passionate about creating impact through technology.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {staticAdmins.map((admin, idx) => (
              <AnimatedCard key={idx} delay={idx * 0.1}>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="relative mb-6 group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-300"></div>
                    <img
                      src={admin.image}
                      alt={admin.name}
                      className="relative h-28 w-28 rounded-full object-cover border-4 border-white"
                    />
                  </div>

                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {admin.name}
                  </h3>

                  <p className="text-purple-600 font-medium mb-4">{admin.role}</p>

                  <div className="mt-auto pt-4 border-t border-gray-100 w-full">
                    <div className="flex items-center justify-center gap-1 text-gray-500 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-sm">{admin.connections} Connections</span>
                    </div>

                    <p className="text-gray-500 text-sm mb-4">🌍 Based in Mumbai, India</p>

                    <motion.a
                      href={admin.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      Connect
                    </motion.a>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </section>

        {/* Enhanced Call to Action Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-50px" }}
          className="relative overflow-hidden text-center p-6 sm:p-12 lg:p-16 rounded-3xl bg-gradient-to-r from-purple-50 via-white to-pink-50 border border-gray-100"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            {/* Floating gradient orbs */}
            <motion.div
              className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-20 blur-xl"
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-20 -right-20 w-32 h-32 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full opacity-20 blur-xl"
              animate={{
                x: [0, -25, 0],
                y: [0, 15, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />

            {/* Sparkle particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 40}%`
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  y: [0, -20, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Content Container */}
          <div className="relative z-10">
            {/* Icon/Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border border-purple-200"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="text-purple-600"
              >
                🌟
              </motion.div>
              <span className="text-sm font-medium text-purple-700">Join the Movement</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Join Us in <GradientText>Making a Difference</GradientText>
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-gray-700 max-w-2xl mx-auto mb-8 sm:mb-10 text-base sm:text-lg leading-relaxed px-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Help us bridge the digital divide and empower rural girls with the skills they need to thrive in the digital age.
            </motion.p>

            {/* Enhanced Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              {/* Primary CTA Button */}
              <motion.a
                href="/register"
                className="group relative overflow-hidden px-8 py-3 sm:px-10 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                whileHover={{
                  scale: 1.05,
                  y: -2
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {/* Button shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />

                <span className="relative z-10 flex items-center justify-center gap-2">
                  Get Involved
                  <motion.svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </motion.svg>
                </span>
              </motion.a>

              {/* Secondary Button */}
              <motion.a
                href="#"
                className="group relative overflow-hidden px-8 py-3 sm:px-10 sm:py-4 border-2 border-purple-200 text-purple-700 font-semibold rounded-xl hover:border-purple-300 transition-all duration-300 w-full sm:w-auto"
                whileHover={{
                  scale: 1.05,
                  y: -2,
                  backgroundColor: "rgba(147, 51, 234, 0.05)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {/* Subtle gradient overlay on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />

                <span className="relative z-10 flex items-center justify-center gap-2">
                  Learn More
                  <motion.svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:rotate-45 transition-transform duration-300"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </motion.svg>
                </span>
              </motion.a>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-gray-600"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
                <span>Free to Join</span>
              </div>

              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 text-purple-500"
                >
                  ⚡
                </motion.div>
                <span>Instant Access</span>
              </div>

              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-4 h-4 text-pink-500"
                >
                  🚀
                </motion.div>
                <span>Make Impact Today</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom decorative border */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            viewport={{ once: true }}
            style={{ transformOrigin: "center" }}
          />
        </motion.section>
      </div>
    </SparklesBackground>
  );
}