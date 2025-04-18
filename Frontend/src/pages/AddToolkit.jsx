import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import axios from "axios";  // Make sure axios is installed.
import { db } from "../firebase"; // Adjust path based on your structure
import { collection, addDoc, serverTimestamp } from "firebase/firestore";


export default function AddToolkit() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    files: [],
    skills: [] // Added skills array to form state
  });

  const [newSkill, setNewSkill] = useState(""); // State for new skill input
  const [uploading, setUploading] = useState(false); // To track upload progress

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "files") {
      setForm((prev) => ({
        ...prev,
        files: Array.from(files),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Function to add a new skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  // Function to remove a skill
  const handleRemoveSkill = (skillToRemove) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  // Handle Cloudinary file upload
  const handleFileUpload = async () => {
    const formData = new FormData();
    const fileUrls = [];

    setUploading(true);

    // Loop over files to upload them one by one
    for (let i = 0; i < form.files.length; i++) {
      formData.append("file", form.files[i]);
      formData.append("upload_preset", "ruralEmpowerment"); // Replace with your Cloudinary preset
      formData.append("cloud_name", "dczpxrdq1"); // Replace with your Cloudinary cloud name

      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/dczpxrdq1/upload`, // Use your Cloudinary upload URL
          formData
        );
        fileUrls.push(response.data.secure_url); // Push the uploaded file URL
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("File upload failed.");
      }
    }

    return fileUrls;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.description || !form.category) {
      toast.error("Please fill in all the fields.");
      return;
    }

    if (form.files.length === 0) {
      toast.error("Please upload at least one file.");
      return;
    }

    try {
      setUploading(true);

      // Upload files to Cloudinary
      const uploadedFiles = await handleFileUpload();

      // Prepare toolkit data
      const toolkitData = {
        title: form.title,
        description: form.description,
        category: form.category,
        skills: form.skills,
        files: uploadedFiles,
        createdAt: serverTimestamp(),
      };

      // Save to Firestore
      await addDoc(collection(db, "toolkits"), toolkitData);

      toast.success("Toolkit added successfully!");

      // Reset form
      setForm({
        title: "",
        description: "",
        category: "",
        files: [],
        skills: [],
      });
      setNewSkill("");
      document.getElementById("files").value = "";
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error while submitting the form.");
    } finally {
      setUploading(false);
    }
  };
  return (
    <motion.div
      className="p-6 md:p-10 bg-orange-50 min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-orange-600 text-3xl font-bold">
            Add New Toolkit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Toolkit Title</Label>
              <Input
                name="title"
                id="title"
                placeholder="Enter toolkit title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                name="description"
                id="description"
                placeholder="Short description of the toolkit"
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                name="category"
                id="category"
                placeholder="e.g., Inventory, Marketing, Finance"
                value={form.category}
                onChange={handleChange}
                required
              />
            </div>

            {/* Skills Section */}
            <div>
              <Label>Related Skills</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a relevant skill"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={!newSkill.trim()}
                  variant="secondary"
                >
                  Add Skill
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 text-orange-500 hover:text-orange-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="files">Upload Files</Label>
              <Input
                name="files"
                id="files"
                type="file"
                multiple
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={uploading}>
              {uploading ? "Uploading..." : "Add Toolkit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
