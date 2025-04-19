import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllToolkits } from "../services/toolkitService";
import { Download, Sparkles, Heart } from "lucide-react";
import axios from "axios";
import { HoverEffect } from "../components/ui/card-hover-effect";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:5000/api"; // Replace with your actual API URL

const Toolkit = () => {
  const [toolkits, setToolkits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    document.title = "Toolkits | Rural Empowerment";
    fetchToolkits();
  }, []);

  const fetchToolkits = async () => {
    setLoading(true);
    try {
      const data = await getAllToolkits();
      const normalizedData = data.map(toolkit => ({
        ...toolkit,
        // Convert category array to tags if needed
        tags: toolkit.category || toolkit.tags || [],
      }));
      setToolkits(normalizedData);
    } catch (error) {
      console.error("Error fetching toolkits:", error);
      setToolkits([]);
    }
    setLoading(false);
  };

  const handleDownload = async (toolkit) => {
    try {
      setDownloading(toolkit.id);
      
      // Request the toolkit files as a zip archive
      const response = await axios({
        url: `${API_URL}/toolkit/${toolkit.id}/download`,
        method: 'GET',
        responseType: 'blob', // Important for file downloads
      });
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] 
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${toolkit.title.replace(/\s+/g, '-')}-toolkit.zip`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading toolkit:", error);
      alert("Failed to download the toolkit. Please try again later.");
    } finally {
      setDownloading(null);
    }
  };

  const filteredToolkits = toolkits.filter((item) => {
    const title = item.title?.toLowerCase() || "";
    const description = item.description?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    const matchSearch = title.includes(search) || description.includes(search);

    const tagsArray = item.tags || [];
    const matchTag =
      activeTag === "all" || tagsArray.map(tag => tag.toLowerCase()).includes(activeTag.toLowerCase());

    return matchSearch && matchTag;
  });

  // Get unique tags from all toolkits
  const uniqueTags = ["all", ...new Set(toolkits.flatMap(toolkit => toolkit.tags || []))];

  // Format toolkits for HoverEffect component
  const formattedToolkits = filteredToolkits.map(toolkit => ({
    title: toolkit.title,
    description: toolkit.description || "No description available",
    link: "#", // Placeholder link
    tags: toolkit.tags || [],
    files: toolkit.files || [],
    id: toolkit.id,
    // We'll handle the download button separately
    downloadHandler: () => handleDownload(toolkit),
    isDownloading: downloading === toolkit.id
  }));

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-purple-50 to-blue-100">
        <div className="text-center">
          <div className="inline-block relative w-20 h-20">
            <div className="absolute top-0 w-full h-full rounded-full border-4 border-t-pink-400 border-r-purple-400 border-b-violet-500 border-l-blue-400 animate-spin"></div>
            <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-pink-500" />
            </div>
          </div>
          <p className="mt-4 font-medium text-pink-600 animate-pulse">Loading your toolkits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-100 via-purple-50 to-blue-100">
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute top-60 left-1/3 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
      
      <div className="relative z-10 px-6 md:px-12 py-12 max-w-7xl mx-auto">
        {/* 🧰 ToolkitIntro */}
        <motion.section 
          className="mb-10 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative inline-block mb-3">
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 mb-1">
              Empowerment Toolkits
            </h2>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-pink-300 to-violet-300 rounded-full transform scale-x-90"></div>
          </div>
          <motion.p 
            className="text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Download practical guides and resources to kickstart your journey in
            entrepreneurship, health, education, and beyond.
          </motion.p>
        </motion.section>

        {/* 🔍 SearchAndTags */}
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-1/2 group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-300 to-purple-300 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <Input
                type="text"
                placeholder="Search toolkits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="relative bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-shadow duration-300 z-10"
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {uniqueTags.map((tag) => (
                <Button
                  key={tag}
                  size="sm"
                  variant={activeTag === tag ? "default" : "outline"}
                  onClick={() => setActiveTag(tag)}
                  className={activeTag === tag ? 
                    "bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 border-0 shadow-md hover:shadow-lg transition-all duration-300" : 
                    "border-pink-200 text-purple-600 hover:text-pink-500 hover:bg-pink-50 hover:border-pink-300 transition-all duration-300"
                  }
                >
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 📦 ToolkitGrid with HoverEffect */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredToolkits.length > 0 ? (
            <HoverEffect items={formattedToolkits} customClasses="group p-4 md:p-6 bg-white/80 backdrop-blur-sm border border-transparent transition-all duration-300 hover:border-pink-200 shadow-sm hover:shadow-md rounded-xl" render={(toolkit) => (
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600 mb-2">
                    {toolkit.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {toolkit.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {toolkit.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 rounded-full border border-pink-200 shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {toolkit.files && toolkit.files.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Files ({toolkit.files.length}):</p>
                      <ul className="text-xs text-gray-600">
                        {toolkit.files.slice(0, 3).map((file, index) => (
                          <li key={index} className="truncate flex items-center gap-1">
                            <span className="text-pink-400">•</span> {file.originalName || file.fileName}
                          </li>
                        ))}
                        {toolkit.files.length > 3 && (
                          <li className="flex items-center gap-1"><span className="text-pink-400">•</span> ...and {toolkit.files.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                
                <Button 
                  className="w-full mt-4 group relative overflow-hidden bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 border-0"
                  onClick={toolkit.downloadHandler}
                  disabled={toolkit.isDownloading}
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  {toolkit.isDownloading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Downloading...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Download className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                      Download Files
                    </span>
                  )}
                </Button>
              </div>
            )} />
          ) : (
            <motion.div
              variants={itemVariants}
              className="text-center py-12"
            >
              <div className="inline-block p-4 bg-white/80 backdrop-blur-sm rounded-full mb-4">
                <Heart className="h-8 w-8 text-pink-400" />
              </div>
              <p className="text-center text-gray-500">
                No toolkits found matching your search.
              </p>
            </motion.div>
          )}
        </motion.section>

        {/* 💡 RecommendationBanner */}
        <motion.section 
          className="mt-12 text-center overflow-hidden relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-200 via-purple-200 to-violet-200 rounded-2xl blur opacity-30"></div>
          <div className="relative bg-white/50 backdrop-blur-sm p-8 rounded-2xl border border-pink-100 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-300 to-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            
            <Sparkles className="h-8 w-8 text-pink-500 mx-auto mb-3" />
            <h3 className="text-2xl font-semibold text-purple-900 mb-2">
              Need Help Finding the Right Toolkit?
            </h3>
            <p className="text-gray-700 mb-6 max-w-xl mx-auto">
              Ask our AI Assistant for personalized suggestions tailored to your unique needs.
            </p>
            <a href="/chat-assistant" className="inline-block group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg blur group-hover:blur-md opacity-80 group-hover:opacity-100 transition-all duration-300 scale-105"></div>
                <Button variant="default" className="relative bg-transparent hover:bg-transparent border-0 text-white font-medium px-6">
                  Ask the Assistant <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Button>
              </div>
            </a>
          </div>
        </motion.section>
      </div>
      
      {/* Add CSS for custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: scale(1) translate(0px, 0px); }
          33% { transform: scale(1.1) translate(30px, -50px); }
          66% { transform: scale(0.9) translate(-20px, 20px); }
          100% { transform: scale(1) translate(0px, 0px); }
        }
        .animate-blob {
          animation: blob 7s infinite alternate;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Toolkit;