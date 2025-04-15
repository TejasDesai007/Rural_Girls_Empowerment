import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { getAllToolkits } from "../services/toolkitService";

const Toolkit = () => {
  const [toolkits, setToolkits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState("all");

  useEffect(() => {
    document.title = "Toolkits | Rural Empowerment";
    fetchToolkits();
  }, []);

  const fetchToolkits = async () => {
    const data = await getAllToolkits();
    setToolkits(data);
  };

  const filteredToolkits = toolkits.filter((item) => {
    const matchTag = activeTag === "all" || item.tags.includes(activeTag);
    const matchSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTag && matchSearch;
  });

  const tags = ["all", "business", "health", "education", "tech"];

  return (
    <div className="min-h-screen px-6 md:px-12 py-12 bg-gradient-to-br from-blue-50 to-purple-50">
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
            {tags.map((tag) => (
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

      {/* 📦 ToolkitGrid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredToolkits.length > 0 ? (
          filteredToolkits.map((toolkit) => (
            <div
              key={toolkit.id}
              className="bg-white shadow-md rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
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
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <a
                href={toolkit.downloadURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full">Download</Button>
              </a>
            </div>
          ))
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
