import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import axios from "axios";

export default function About() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/admins")
      .then((res) => {
        setEmails(res.data.map(admin => admin.email));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching admin emails:", err);
        setLoading(false);
      });
  }, []);

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
  

  return (
    <div className="max-w-6xl mx-auto p-6 mt-6 space-y-12">
      {/* 💜 About Organization */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-purple-700 mb-4">About EmpowerHer</h1>
        <p className="text-gray-700 max-w-3xl mx-auto text-lg leading-relaxed">
          EmpowerHer is a digital platform designed to uplift and digitally empower rural girls by offering free access to coding education, mentorship opportunities, entrepreneurial toolkits, and AI-powered assistance. Our mission is to bridge the digital divide and promote innovation, creativity, and inclusion through technology.
        </p>
      </motion.div>

      {/* 📧 Admin Emails */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-2xl font-semibold text-purple-600 mb-2">Our Admins</h2>
        <p className="text-gray-600">Reach out to us:</p>
        {loading ? (
          <div className="flex flex-col items-center space-y-2 mt-4">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-52" />
          </div>
        ) : (
          <ul className="mt-3 space-y-1 text-sm text-gray-700">
            {emails.map((email, idx) => (
              <li key={idx}>{email}</li>
            ))}
          </ul>
        )}
      </motion.div>

      {/* 🔗 Static LinkedIn Cards */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <h2 className="text-2xl font-semibold text-purple-600 mb-4 text-center">Connect with Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {staticAdmins.map((admin, idx) => (
            <Card key={idx} className="hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <img
                  src={admin.image}
                  alt={admin.name}
                  className="h-24 w-24 rounded-full object-cover mb-3 border-4 border-purple-300"
                />
                <a
                  href={admin.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-medium text-purple-700 hover:underline"
                >
                  {admin.name}
                </a>
                <div className="mt-4 space-y-1 text-xs text-gray-600">
                  <p>👥 {admin.connections} Connections</p>
                  <p>🌍 Based in India</p>
                  <p>💼 Role: {admin.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
