import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function CourseCard({ course }) {
  const navigate = useNavigate();

  const {
    id,
    title,
    description,
    difficulty,
    duration,
    thumbnail = "https://via.placeholder.com/400x200?text=Course+Thumbnail",
  } = course;

  const handleStart = () => {
    navigate(`/course/${id}`);
  };

  return (
    <Card className="w-full max-w-md hover:shadow-xl transition-transform transform hover:-translate-y-1 hover:scale-[1.02] duration-300 animate-fade-in border border-purple-300">
      <CardHeader className="p-0 relative group overflow-hidden rounded-t-lg">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2">
          <Badge
            variant="outline"
            className={`uppercase text-xs px-2 py-1 font-semibold border ${
              difficulty === "Beginner" ? "border-green-500 text-green-600" : "border-red-500 text-red-600"
            } bg-white/80 backdrop-blur-md shadow-sm`}
          >
            {difficulty}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 px-4 py-3">
        <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        <p className="text-xs text-gray-500">⏱ Duration: {duration}</p>
      </CardContent>

      <CardFooter className="px-4 pb-4">
        <Button onClick={handleStart} className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-md">
          Start Learning
        </Button>
      </CardFooter>
    </Card>
  );
}
