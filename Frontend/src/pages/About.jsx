import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

// Aceternity-inspired components
const TextReveal = ({ children, className }) => {
  return (
    <div className={cn("overflow-hidden relative", className)}>
      <motion.div
        initial={{ y: 100 }}
        whileInView={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        viewport={{ once: true }}
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
      image: "https://media.licdn.com/dms/image/v2/D4D03AQHR6FSld--xhg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1688110371217?e=1750291200&v=beta&t=qPYcQC7G2jg5xFN7H19CAFpIwfwC8Ep9cHvCqm92FiE",
      role: "Backend Developer",
      connections: "300+"
    },
    {
      name: "Darshan Bhere",
      linkedin: "https://www.linkedin.com/in/darshan-bhere-b69a14260/",
      image: "https://media.licdn.com/dms/image/v2/D5603AQFd7Hx7roxWCQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1729445580253?e=1750291200&v=beta&t=WWYK0jd_GitGXSS20C-PByEf349lP9X4P2xQwOreD6g",
      role: "Full Stack Developer",
      connections: "400+"
    },
    {
      name: "Shivam Darekar",
      linkedin: "https://www.linkedin.com/in/shivamdarekar2206/",
      image: "https://media.licdn.com/dms/image/v2/D4D03AQGaq9IESohB1w/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1709142089037?e=1750291200&v=beta&t=DgQkE6La8GqrOlsnpdyj-lo0kIZtEDHSyLl9ZX-XUKM",
      role: "Frontend Developer",
      connections: "400+"
    },
    {
      name: "Kiran Bayas",
      linkedin: "https://www.linkedin.com/in/kiran-bayas-72b56b334/",
      image: "https://media.licdn.com/dms/image/v2/D4E03AQE3nrwsqpQ1Hg/profile-displayphoto-shrink_400_400/B4EZU9ziMBHMAo-/0/1740498675824?e=1750291200&v=beta&t=RPaGuJuNy2wydBDITXqpteo39ZWrWmMwcEyzEg1iwdg",
      role: "API Engineer",
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
              About <GradientText>EmpowerHer</GradientText>
            </h1>
          </TextReveal>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              EmpowerHer is a digital platform designed to uplift and digitally empower rural girls by offering free access to coding education, mentorship opportunities, entrepreneurial toolkits, and AI-powered assistance. Our mission is to bridge the digital divide and promote innovation, creativity, and inclusion through technology.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
              <span>Empowering the next generation of tech leaders</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Vision Section with Animated Border */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl transform rotate-1 scale-105"></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4V20M20 12H4" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold mb-4">
                Our <GradientText>Vision</GradientText>
              </h2>
              
              <p className="text-gray-700 max-w-4xl mx-auto text-lg leading-relaxed">
                We envision a future where every girl, no matter where she lives, has the confidence and tools to become a creator, innovator, and changemaker. By integrating fun learning modules, interactive dashboards, and real-world toolkits, EmpowerHer transforms curiosity into capability.
              </p>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {["Education", "Mentorship", "Innovation"].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl"
                  >
                    <h3 className="font-medium text-purple-800">{item}</h3>
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
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6 group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-300"></div>
                    <img
                      src={admin.image}
                      alt={admin.name}
                      className="relative h-28 w-28 rounded-full object-cover border-4 border-white"
                    />
                  </div>
                  
                  <a
                    href={admin.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl font-medium text-gray-800 hover:text-purple-600 transition-colors duration-300"
                  >
                    {admin.name}
                  </a>
                  
                  <p className="text-purple-600 font-medium mt-1">{admin.role}</p>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                    <div className="flex items-center justify-center gap-1 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-sm">{admin.connections} Connections</span>
                    </div>
                    
                    <p className="text-gray-500 text-sm mt-2">🌍 Based in India</p>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center p-8 sm:p-16 rounded-3xl bg-gradient-to-r from-purple-50 via-white to-pink-50 border border-gray-100"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Join Us in <GradientText>Making a Difference</GradientText>
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto mb-8">
            Help us bridge the digital divide and empower rural girls with the skills they need to thrive in the digital age.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity">
              Get Involved
            </a>
            <a href="#" className="px-8 py-3 border border-purple-200 text-purple-700 font-medium rounded-lg hover:bg-purple-50 transition-colors">
              Learn More
            </a>
          </div>
        </motion.section>
      </div>
    </SparklesBackground>
  );
}