import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Upload, X, Plus, FileType } from "lucide-react";
import axios from "axios";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

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
  const [uploadStatus, setUploadStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && isMounted) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === "mentor" || userData.role === "admin") {
            setIsAuthorized(true);
            setUser(user);
          } else {
            setIsAuthorized(false);
            navigate("/unauthorized");
          }
        } else {
          setIsAuthorized(false);
          navigate("/unauthorized");
        }
      } else {
        setIsAuthorized(false);
        navigate("/login");
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

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

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setErrorMessage("");
      setUploadStatus(null);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("category", JSON.stringify(form.category));
        formData.append("createdBy", user.uid); // ADD createdBy field here

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
    },
    [form, user]
  );

  if (!isAuthorized) return null;


  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-pink-200 opacity-20 blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div
          className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-purple-300 opacity-20 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div
          className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-blue-200 opacity-20 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>

      <div className="p-6 md:p-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Add New Toolkit
                </CardTitle>
              </motion.div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {uploadStatus === "success" && (
                  <motion.div
                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-3 text-green-700"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Toolkit successfully uploaded!</span>
                  </motion.div>
                )}

                {uploadStatus === "error" && (
                  <motion.div
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3 text-red-700"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Label htmlFor="title" className="text-pink-700 font-medium">Toolkit Title *</Label>
                  <Input
                    name="title"
                    id="title"
                    placeholder="Enter toolkit title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="mt-1 border-pink-200 focus:border-pink-500 focus:ring-pink-500"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Label htmlFor="description" className="text-pink-700 font-medium">Description *</Label>
                  <Textarea
                    name="description"
                    id="description"
                    placeholder="Short description of the toolkit"
                    value={form.description}
                    onChange={handleChange}
                    required
                    className="min-h-[120px] mt-1 border-pink-200 focus:border-pink-500 focus:ring-pink-500"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Label className="text-pink-700 font-medium">Categories *</Label>
                  <div className="flex gap-2 mb-2 mt-1">
                    <Input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Add a category"
                      className="flex-1 border-pink-200 focus:border-pink-500 focus:ring-pink-500"
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
                      variant="outline"
                      className="border-pink-500 text-pink-600 hover:bg-pink-50 hover:text-pink-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {form.category.length > 0 ? (
                    <motion.div
                      className="flex flex-wrap gap-2"
                      layout
                    >
                      {form.category.map((category) => (
                        <motion.div
                          key={category}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          layout
                          className="flex items-center bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 px-3 py-1 rounded-full text-sm shadow-sm"
                        >
                          {category}
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(category)}
                            className="ml-2 text-pink-500 hover:text-pink-700"
                            aria-label={`Remove ${category}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <p className="text-sm text-gray-500">No categories added yet</p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="p-6 border-2 border-dashed border-pink-200 rounded-lg bg-pink-50/50 hover:bg-pink-50 transition-colors"
                >
                  <Label htmlFor="files" className="text-pink-700 font-medium block mb-2">Files *</Label>
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FileType className="h-12 w-12 text-pink-400" />
                    <p className="text-sm text-gray-600 text-center">
                      Drag files here or click to browse<br />
                      <span className="text-xs text-gray-500">
                        Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX
                      </span>
                    </p>
                    <Input
                      name="files"
                      id="files"
                      type="file"
                      multiple
                      onChange={handleChange}
                      required
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2 border-pink-300 text-pink-600 hover:bg-pink-100"
                      onClick={() => document.getElementById('files').click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select Files
                    </Button>
                  </div>
                  {form.files.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex flex-wrap gap-2"
                    >
                      <p className="text-sm font-medium text-pink-700 w-full">
                        Selected: {form.files.length} file(s)
                      </p>
                      {Array.from(form.files).map((file, index) => (
                        <div
                          key={index}
                          className="text-xs bg-white px-2 py-1 rounded border border-pink-200 text-gray-600"
                        >
                          {file.name}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>

                {uploading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full"
                  >
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      Uploading... {uploadProgress}%
                    </p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-6"
                    disabled={uploading}
                    aria-busy={uploading}
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Uploading...
                      </span>
                    ) : (
                      "Add Toolkit"
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}