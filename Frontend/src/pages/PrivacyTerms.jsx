import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  BookText,
  Users,
  RefreshCcw,
  Mail,
} from "lucide-react";
import { Fragment } from "react";

const sections = [
  {
    icon: <ShieldCheck className="w-6 h-6 text-pink-600" />,
    title: "1. Introduction",
    content: (
      <p>
        Welcome to our Rural Girls' Digital Empowerment Platform. We are
        dedicated to providing a safe, respectful, and enriching learning
        environment for young girls to explore coding, digital skills, and
        entrepreneurship.
      </p>
    ),
  },
  {
    icon: <BookText className="w-6 h-6 text-pink-600" />,
    title: "2. Privacy Policy",
    content: (
      <ul className="list-disc list-inside space-y-2">
        <li>
          We collect minimal personal information only to enhance the learning
          experience.
        </li>
        <li>Your data is never sold or shared with third-party vendors.</li>
        <li>
          Preferences and progress are securely stored using browser
          localStorage or Firebase Auth.
        </li>
        <li>
          You have the right to delete your account and associated data
          anytime.
        </li>
      </ul>
    ),
  },
  {
    icon: <Users className="w-6 h-6 text-pink-600" />,
    title: "3. Terms of Service",
    content: (
      <ul className="list-disc list-inside space-y-2">
        <li>Be respectful toward mentors, peers, and platform content.</li>
        <li>
          Toolkit and educational content is for personal, non-commercial use
          only.
        </li>
        <li>
          Admins can remove any inappropriate or harmful content.
        </li>
        <li>
          This platform is exclusively for educational and empowerment purposes.
        </li>
      </ul>
    ),
  },
  {
    icon: <RefreshCcw className="w-6 h-6 text-pink-600" />,
    title: "4. Changes to Policy",
    content: (
      <p>
        We may update our policies from time to time. Significant changes will
        be communicated through the platform.
      </p>
    ),
  },
  {
    icon: <Mail className="w-6 h-6 text-pink-600" />,
    title: "5. Contact Us",
    content: (
      <p>
        If you have any questions or concerns, please email us at:
        <br />
        <span className="text-pink-700 font-semibold">
          shivamdarekar22@gmail.com
        </span>
      </p>
    ),
  },
];

export default function PrivacyTerms() {
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-white py-10 px-4 md:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div
        className="text-center mb-10"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h1 className="text-4xl font-extrabold text-pink-600 drop-shadow-lg">
          Privacy Policy & Terms
        </h1>
        <p className="mt-3 text-pink-700 max-w-xl mx-auto text-sm md:text-base">
          Empowering rural girls with knowledge, security, and trust. Read our
          policies below.
        </p>
      </motion.div>

      {/* Sections */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <motion.div
            key={index}
            className="bg-white/60 backdrop-blur-xl border border-pink-200 rounded-2xl p-6 shadow-xl hover:shadow-pink-200 transition-all duration-300"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + index * 0.15, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              {section.icon}
              <h2 className="text-xl font-semibold text-pink-800">
                {section.title}
              </h2>
            </div>
            <div className="text-pink-900 text-sm md:text-base leading-relaxed">
              <Fragment>{section.content}</Fragment>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <motion.div
        className="mt-16 text-center text-sm text-pink-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        © 2025 Rural Girls’ Digital Empowerment Platform. All rights reserved.
      </motion.div>
    </motion.div>
  );
}
