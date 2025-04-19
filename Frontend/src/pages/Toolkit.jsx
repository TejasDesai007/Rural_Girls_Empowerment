import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllToolkits } from "../services/toolkitService";
import { Download } from "lucide-react";
import axios from "axios";
import { HoverEffect } from "../components/ui/card-hover-effect";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 md:px-12 py-12 bg-gradient-to-br from-pink-50 to-purple-50">
      {/* 🧰 ToolkitIntro */}
      <section className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          Empowerment Toolkits
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Download practical guides and resources to kickstart your journey in
          entrepreneurship, health, education, and beyond.
        </p>
      </section>

      {/* 🔍 SearchAndTags */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <Input
            type="text"
            placeholder="Search toolkits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2"
          />
          <div className="flex flex-wrap gap-2">
            {uniqueTags.map((tag) => (
              <Button
                key={tag}
                size="sm"
                variant={activeTag === tag ? "default" : "outline"}
                onClick={() => setActiveTag(tag)}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* 📦 ToolkitGrid with HoverEffect */}
      <section>
        {filteredToolkits.length > 0 ? (
          <HoverEffect items={formattedToolkits} render={(toolkit) => (
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {toolkit.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {toolkit.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {toolkit.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-blue-100 text-pink-500 rounded-full"
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
                        <li key={index} className="truncate">
                          • {file.originalName || file.fileName}
                        </li>
                      ))}
                      {toolkit.files.length > 3 && (
                        <li>• ...and {toolkit.files.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              
              <Button 
                className="w-full mt-4"
                onClick={toolkit.downloadHandler}
                disabled={toolkit.isDownloading}
              >
                {toolkit.isDownloading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Downloading...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Download className="h-4 w-4 mr-2" />
                    Download Files
                  </span>
                )}
              </Button>
            </div>
          )} />
        ) : (
          <p className="text-center text-gray-500 col-span-3">
            No toolkits found.
          </p>
        )}
      </section>

      {/* 💡 RecommendationBanner */}
      <section className="mt-12 text-center bg-purple-100 p-6 rounded-2xl shadow-sm">
        <h3 className="text-xl font-semibold text-purple-900 mb-2">
          Need Help Finding the Right Toolkit?
        </h3>
        <p className="text-gray-700 mb-4">
          Ask our AI Assistant for personalized suggestions.
        </p>
        <a href="/chat-assistant">
          <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
            Ask the Assistant
          </Button>
        </a>
      </section>
    </div>
  );
};

export default Toolkit;