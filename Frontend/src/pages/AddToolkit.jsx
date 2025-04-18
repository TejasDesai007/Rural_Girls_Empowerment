import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function AddToolkit() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    type: "file", // either "file" or "link"
    file: null,
    link: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.description || !form.category) {
      toast.error("Please fill in all the fields.");
      return;
    }

    if (form.type === "file" && !form.file) {
      toast.error("Please upload a file.");
      return;
    }

    if (form.type === "link" && !form.link) {
      toast.error("Please provide a valid link.");
      return;
    }

    // Simulate submission
    toast.success("Toolkit added successfully!");
    setForm({
      title: "",
      description: "",
      category: "",
      type: "file",
      file: null,
      link: "",
    });
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
              />
            </div>

            <div className="space-y-2">
              <Label>Toolkit Type</Label>
              <RadioGroup
                defaultValue="file"
                className="flex gap-4"
                value={form.type}
                onValueChange={(val) => setForm({ ...form, type: val })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="file" id="file" />
                  <Label htmlFor="file">Upload File</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="link" id="link" />
                  <Label htmlFor="link">Provide Link</Label>
                </div>
              </RadioGroup>
            </div>

            {form.type === "file" && (
              <div>
                <Label htmlFor="file">Upload File (PDF/DOC)</Label>
                <Input
                  name="file"
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleChange}
                />
              </div>
            )}

            {form.type === "link" && (
              <div>
                <Label htmlFor="link">Enter Link</Label>
                <Input
                  name="link"
                  id="link"
                  placeholder="https://example.com/toolkit"
                  value={form.link}
                  onChange={handleChange}
                />
              </div>
            )}

            <Button type="submit" className="w-full">
              Add Toolkit
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
