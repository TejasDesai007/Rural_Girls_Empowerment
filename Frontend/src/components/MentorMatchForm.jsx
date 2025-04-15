import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { motion } from "framer-motion";

export default function MentorMatchForm() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    language: "",
    topic: "",
  });

  const [errors, setErrors] = useState({});

  const topics = ["Frontend Development", "Backend APIs", "UI/UX", "AI & ML", "App Development", "Cybersecurity"];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.language) newErrors.language = "Preferred language is required";
    if (!formData.topic) newErrors.topic = "Please select a topic of interest";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // ✅ Call mentorService.js here (dummy for now)
    console.log("Form submitted:", formData);
  };

  return (
    <motion.div
      className="max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mt-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold text-purple-700 mb-4">Find Your Perfect Mentor</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="age">Age <span className="text-gray-400">(optional)</span></Label>
          <Input
            id="age"
            type="number"
            placeholder="Enter your age"
            value={formData.age}
            onChange={(e) => handleChange("age", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="language">Preferred Language</Label>
          <Input
            id="language"
            placeholder="e.g., English, Hindi"
            value={formData.language}
            onChange={(e) => handleChange("language", e.target.value)}
          />
          {errors.language && <p className="text-sm text-red-500 mt-1">{errors.language}</p>}
        </div>

        <div>
          <Label htmlFor="topic">Topics of Interest</Label>
          <Select onValueChange={(value) => handleChange("topic", value)}>
            <SelectTrigger id="topic">
              <SelectValue placeholder="Choose a topic" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.topic && <p className="text-sm text-red-500 mt-1">{errors.topic}</p>}
        </div>

        <Button type="submit" className="w-full mt-4 bg-purple-600 hover:bg-purple-700 transition-colors">
          Find Mentors
        </Button>
      </form>
    </motion.div>
  );
}
