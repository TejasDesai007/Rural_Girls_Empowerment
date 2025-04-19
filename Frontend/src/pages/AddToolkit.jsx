import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { auth, db } from "../firebase"; // Assuming you're using Firestore for roles
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const API_URL = "http://localhost:5000/api";

const initialFormState = {
  title: "",
  description: "",
  category: [],
  files: [],
};

export default function AddToolkit() {
  const [form, setForm] = useState(initialFormState);
  const [newCategory, setNewCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null); // "success", "error", null
  const [errorMessage, setErrorMessage] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false); // Track if user has mentor role
  const [user, setUser] = useState(null); // Store user details

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && isMounted) {
        // Fetch the user's role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid)); // Assuming 'users' collection
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === "mentor") {
            setIsAuthorized(true);
            setUser(user);
          } else {
            setIsAuthorized(false);
            navigate("/unauthorized"); // Redirect to unauthorized page
          }
        } else {
          setIsAuthorized(false);
          navigate("/unauthorized"); // Redirect if no user data exists
        }
      } else {
        setIsAuthorized(false);
        navigate("/login"); // Redirect to login page if not authenticated
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "files" ? Array.from(files) : value,
    }));
  }, []);

  const handleAddCategory = useCallback(() => {
    const trimmedCategory = newCategory.trim();
    if (trimmedCategory && !form.category.includes(trimmedCategory)) {
      setForm((prev) => ({
        ...prev,
        category: [...prev.category, trimmedCategory],
      }));
      setNewCategory("");
    }
  }, [newCategory, form.category]);

  const handleRemoveCategory = useCallback((categoryToRemove) => {
    setForm((prev) => ({
      ...prev,
      category: prev.category.filter((category) => category !== categoryToRemove),
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", JSON.stringify(form.category));

      Array.from(form.files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await axios.post(`${API_URL}/toolkit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      console.log("Toolkit created:", response.data);
      setUploadStatus("success");
      setForm(initialFormState);
      setNewCategory("");
      document.getElementById("files").value = "";
    } catch (error) {
      console.error("Error:", error);
      setUploadStatus("error");
      setErrorMessage(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [form]);

  if (!isAuthorized) {
    return null; // Return nothing or a loading state until the role is confirmed
  }

  return (
    <motion.div
      className="p-6 md:p-10 bg-pink-50 min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-pink-500 text-3xl font-bold">
            Add New Toolkit
          </CardTitle>
        </CardHeader>
        <CardContent>
          {uploadStatus === "success" && (
            <motion.div
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-3 text-green-700"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>Toolkit successfully uploaded!</span>
            </motion.div>
          )}

          {uploadStatus === "error" && (
            <motion.div
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3 text-red-700"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle className="h-5 w-5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Toolkit Title *</Label>
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
              <Label htmlFor="description">Description *</Label>
              <Textarea
                name="description"
                id="description"
                placeholder="Short description of the toolkit"
                value={form.description}
                onChange={handleChange}
                required
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label>Categories *</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add a category"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={!newCategory.trim()}
                  variant="secondary"
                >
                  Add
                </Button>
              </div>
              {form.category.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {form.category.map((category) => (
                    <div
                      key={category}
                      className="flex items-center bg-pink-100 text-oranpinkge-800 px-3 py-1 rounded-full text-sm"
                    >
                      {category}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(category)}
                        className="ml-2 text-pink-500 hover:text-pink-700"
                        aria-label={`Remove ${category}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No categories added yet</p>
              )}
            </div>

            <div>
              <Label htmlFor="files">Files *</Label>
              <Input
                name="files"
                id="files"
                type="file"
                multiple
                onChange={handleChange}
                required
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              />
              {form.files.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Selected: {form.files.length} file(s)
                </p>
              )}
            </div>

            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-pink-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
                <p className="text-sm text-gray-500 mt-1 text-center">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={uploading}
              aria-busy={uploading}
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Uploading...
                </span>
              ) : (
                "Add Toolkit"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
