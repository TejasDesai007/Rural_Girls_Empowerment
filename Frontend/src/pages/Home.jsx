// src/pages/Home.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Home = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CallToActionSection />
      <Footer />
    </div>
  );
};

const HeroSection = () => (
  <section className="w-full px-6 py-20 text-center bg-gradient-to-br from-pink-100 to-pink-200">
    <h1 className="text-4xl md:text-5xl font-bold mb-4">
      Empower Rural Girls Through Digital Learning
    </h1>
    <p className="text-lg max-w-2xl mx-auto mb-6">
      Unlock opportunities with mentorship, courses, toolkits, and an AI assistant—all in your language.
    </p>
    <div className="flex justify-center gap-4">
      <Link to="/register">
        <Button className="text-white bg-pink-600 hover:bg-pink-700">Register</Button>
      </Link>
      <Link to="/about">
        <Button variant="outline">Learn More</Button>
      </Link>
    </div>
  </section>
);

const FeaturesSection = () => {
  const features = [
    { title: "E-learning", desc: "Access curated learning modules anytime.", emoji: "📚", to: "/courses" },
    { title: "Mentorship", desc: "Connect with experienced mentors.", emoji: "🧑‍🏫", to: "/mentor-match" },
    { title: "Toolkits", desc: "Download resources to start your journey.", emoji: "🧰", to: "/toolkit" },
    { title: "AI Assistant", desc: "Ask questions, get help—instantly.", emoji: "🤖", to: "/chat-assistant" },
  ];

  return (
    <section className="px-6 py-16 bg-white">
      <h2 className="text-3xl font-semibold text-center mb-10">Platform Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {features.map((feature, idx) => (
          <Link to={feature.to} key={idx} className="block hover:shadow-lg transition-shadow">
            <Card className="h-full cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <span>{feature.emoji}</span> {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

const TestimonialsSection = () => (
  <section className="px-6 py-16 bg-gray-50">
    <h2 className="text-3xl font-semibold text-center mb-10">What Our Learners Say</h2>
    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-700 italic">
            “This platform changed my life! I learned tailoring and started my own small business.”
          </p>
          <p className="mt-4 font-semibold text-right">– Priya, Uttar Pradesh</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-700 italic">
            “Mentorship helped me choose the right career path. Grateful for this community!”
          </p>
          <p className="mt-4 font-semibold text-right">– Anjali, Rajasthan</p>
        </CardContent>
      </Card>
    </div>
  </section>
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

const Footer = () => (
  <footer className="px-6 py-8 bg-white border-t text-center text-sm text-gray-500">
    <div className="flex justify-center gap-6 mb-2">
      <a href="/about" className="hover:underline">About</a>
      <a href="/privacy-terms" className="hover:underline">Privacy Policy</a>
    </div>

    <div className="mt-4 flex justify-center">
      <select className="border text-sm rounded px-2 py-1">
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
      </select>
    </div>

    <p className="mt-4 text-xs">Built in collaboration with Google by Team DevRangers</p>
    <p className="mt-1">© 2025 Rural Empower. All rights reserved.</p>
  </footer>
);

export default Home;
