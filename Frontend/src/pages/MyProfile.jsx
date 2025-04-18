import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import { toast } from "react-hot-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userCourses, setUserCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    skills: []
  });
  const [newSkill, setNewSkill] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser.uid);
        await fetchUserCourses(currentUser.uid);
        console.log(currentUser.uid);
        // Initialize form data with current user info
        setFormData({
          name: currentUser.displayName || "",
          email: currentUser.email || "",
          bio: "",
          skills: []
        });
      } else {
        setUser(null);
        setUserData(null);
        setUserCourses([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData(data);
        console.log(data);
        // Update form data with bio from Firestore
        setFormData(prev => ({
          ...prev,
          bio: data.bio || "",
          skills: data.skills || []
        }));
      } else {
        toast.error("User not found in Firestore");
      }
    } catch (error) {
      console.error("Error fetching user details from Firestore:", error);
      toast.error("Failed to fetch user details");
    }
  };

  const fetchUserCourses = async (userId) => {
    try {
      const coursesRef = collection(db, "courses");
      const q = query(coursesRef, where("createdBy", "==", userId));
      const querySnapshot = await getDocs(q);

      const courses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setUserCourses(courses);
    } catch (error) {
      console.error("Error fetching user courses from Firestore:", error);
      toast.error("Failed to fetch user courses");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await deleteDoc(doc(db, "courses", courseId));
      setUserCourses(userCourses.filter(course => course.id !== courseId));
      toast.success("Course deleted successfully!");
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setEditing(true);

      // Update Firebase Auth profile (name)
      if (formData.name !== user.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: formData.name
        });
      }

      // Update Firestore user document
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name: formData.name,
        bio: formData.bio,
        skills: formData.skills
      });

      // Refresh user data
      await fetchUserData(user.uid);

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message);
    } finally {
      setEditing(false);
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Section */}
        <div className="md:w-1/3">
          <Card>
            <CardHeader className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={userData?.photoURL || user.photoURL || ""} />
                <AvatarFallback>
                  {userData?.name?.charAt(0) || user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-center">{userData?.name || user.displayName || "User"}</CardTitle>
              <CardDescription className="text-center">{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {userData?.bio || "No bio provided"}
              </p>

              {userData?.skills?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {userData.skills.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">Edit Profile</Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your profile information
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        name="name"
                        type="text"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        name="email"
                        type="email"
                        className="w-full rounded-md border px-3 py-2 text-sm bg-gray-100"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Bio</label>
                      <textarea
                        name="bio"
                        className="w-full rounded-md border px-3 py-2 text-sm min-h-[100px]"
                        value={formData.bio}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Skills</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          className="flex-1 rounded-md border px-3 py-2 text-sm"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add a skill"
                        />
                        <Button
                          type="button"
                          onClick={handleAddSkill}
                          disabled={!newSkill.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="ml-2 text-gray-500 hover:text-red-500"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={editing}
                    >
                      {editing ? <Loader2 className="animate-spin" /> : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Courses Section */}
        {(userData?.role === "mentor" || userData?.role === "admin") && (
          <div className="md:w-2/3">
            <Card>
              <CardHeader>
                <CardTitle>Your Courses</CardTitle>
                <CardDescription>
                  {userCourses.length} courses created
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userCourses.length > 0 ? (
                  <div className="space-y-4">
                    {userCourses.map(course => (
                      <div key={course.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <h3 className="font-medium cursor-pointer">
                          <Link to={`/courses/${course.id}`} className="text-blue-600 hover:underline">
                            {course.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            Created: {new Date(course.createdAt?.seconds * 1000).toLocaleDateString()}
                          </span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {course.category}
                          </span>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            Delete Course
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You haven't created any courses yet</p>
                    <Button className="mt-4" onClick={() => navigate("/addcourse")}>
                      Create Your First Course
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}