// components/AvailableMentorsList.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const AvailableMentorsList = ({ onMentorSelect }) => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const mentorList = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.role === "mentor"); // Fixed typo from "mentor" to "mentor"
        setMentors(mentorList);
      } catch (error) {
        console.error("Error fetching mentors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const handleRequestSession = (mentor) => {
    if (!auth.currentUser) {
      navigate("/login", {
        state: {
          from: "/mentor-match",
          mentorId: mentor.id
        }
      });
      return;
    }
    onMentorSelect(mentor);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>No mentors available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-6">Available Mentors</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
          <Card key={mentor.id}>
            <CardHeader>
              <CardTitle>{mentor.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{mentor.field}</p>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{mentor.bio}</p>

              {mentor.skills && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-1">Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(mentor.skills) ? mentor.skills : mentor.skills.split(',')).map((skill, index) => (
                      <span
                        key={index}
                        className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Button
                className="mt-2 w-full"
                onClick={() => handleRequestSession(mentor)}
              >
                Request Session
              </Button>

            </CardContent>
          </Card>
        ))
        }
      </div >
    </div >
  );
};

export default AvailableMentorsList;