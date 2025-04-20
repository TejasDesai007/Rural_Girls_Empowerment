import React, { useState, useEffect, useRef } from "react";
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Loader2,
  Trash,
  Eye,
  AlertTriangle,
  PlusCircle,
  BookOpen,
  Briefcase,
  Edit,
  Save,
  X,
  Plus,
  Pencil,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userCourses, setUserCourses] = useState([]);
  const [userToolkits, setUserToolkits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ id: null, type: null });
  
  // Show more/less state
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [showAllToolkits, setShowAllToolkits] = useState(false);
  const initialDisplayCount = 1; // Number of items to show initially

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    skills: [],
  });
  const [newSkill, setNewSkill] = useState("");
  const nameInputRef = useRef(null);

  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await Promise.all([
          fetchUserData(currentUser.uid),
          fetchUserCourses(currentUser.uid),
          fetchUserToolkits(currentUser.uid),
        ]);
        setFormData((prev) => ({
          ...prev,
          name: currentUser.displayName || "",
          email: currentUser.email || "",
        }));
      } else {
        setUser(null);
        setUserData(null);
        setUserCourses([]);
        setUserToolkits([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);
        setFormData((prev) => ({
          ...prev,
          bio: data.bio || "",
          skills: data.skills || [],
        }));
      } else {
        toast.error("User not found in Firestore");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching user data");
    }
  };

  const fetchUserCourses = async (uid) => {
    try {
      const q = query(collection(db, "courses"), where("instructorId", "==", uid));
      const querySnapshot = await getDocs(q);
      setUserCourses(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
      toast.error("Error fetching courses");
    }
  };

  const fetchUserToolkits = async (uid) => {
    try {
      const q = query(collection(db, "toolkits"), where("CreatedBy", "==", uid));
      const querySnapshot = await getDocs(q);
      setUserToolkits(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
      toast.error("Error fetching toolkits");
    }
  };

  const handleDeleteConfirmation = (id, type) => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    const { id, type } = itemToDelete;
    try {
      const ref = doc(db, type === "course" ? "courses" : "toolkits", id);
      await deleteDoc(ref);

      if (type === "course") {
        setUserCourses((prev) => prev.filter((item) => item.id !== id));
      } else {
        setUserToolkits((prev) => prev.filter((item) => item.id !== id));
      }

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted`);
    } catch (err) {
      toast.error("Failed to delete item");
      console.error(err);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete({ id: null, type: null });
    }
  };

  const handleViewItem = (id, type) => {
    navigate(`/${type === "course" ? "courses" : "toolkit"}/${id}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSkill = () => {
    const skill = newSkill.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setEditing(true);
      if (formData.name !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName: formData.name });
      }

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name: formData.name,
        bio: formData.bio,
        skills: formData.skills,
      });

      await fetchUserData(user.uid);
      toast.success("Profile updated!");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setEditing(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    return {
      admin: "bg-red-100 text-red-800",
      mentor: "bg-green-100 text-green-800",
    }[role] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (timestamp) => {
    return timestamp?.seconds
      ? new Date(timestamp.seconds * 1000).toLocaleDateString()
      : "N/A";
  };

  // Get the courses to display based on showAllCourses state
  const displayedCourses = showAllCourses 
    ? userCourses 
    : userCourses.slice(0, initialDisplayCount);

  // Get the toolkits to display based on showAllToolkits state
  const displayedToolkits = showAllToolkits 
    ? userToolkits 
    : userToolkits.slice(0, initialDisplayCount);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
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

              {/* Role Badge */}
              {userData?.role && (
                <div className="mt-2">
                  <span className={`text-xs px-3 py-1 rounded-full capitalize font-medium ${getRoleBadgeColor(userData.role)}`}>
                    {userData.role}
                  </span>
                </div>
              )}
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
                  <Button className="w-full flex items-center justify-center gap-2">
                    <Pencil size={16} />
                    Edit Profile
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Edit size={18} />
                      Edit Profile
                    </DialogTitle>
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
                          className="flex items-center gap-1"
                        >
                          <Plus size={16} />
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
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" className="flex items-center gap-1">
                        <X size={16} />
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={editing}
                      className="flex items-center gap-1"
                    >
                      {editing ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={16} />}
                      {editing ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Right Section for Courses and Toolkits */}
        {(userData?.role === "mentor" || userData?.role === "admin") && (
          <div className="md:w-2/3 space-y-6">
            {/* Courses Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={20} className="text-blue-600" />
                  <div>
                    <CardTitle>Your Courses</CardTitle>
                    <CardDescription>
                      {userCourses.length} courses created
                    </CardDescription>
                  </div>
                </div>
                <Button onClick={() => navigate("/addcourse")} className="flex items-center gap-1">
                  <PlusCircle size={16} />
                  Add Course
                </Button>
              </CardHeader>
              <CardContent>
                {userCourses.length > 0 ? (
                  <div className="space-y-4">
                    {displayedCourses.map(course => (
                      <div key={course.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <h3 className="font-medium">
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
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewItem(course.id, 'course')}
                              className="flex items-center gap-1"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteConfirmation(course.id, 'course')}
                              className="flex items-center gap-1"
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show More/Less Button for Courses */}
                    {userCourses.length > initialDisplayCount && (
                      <div className="flex justify-center mt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowAllCourses(!showAllCourses)}
                          className="flex items-center gap-2"
                        >
                          {showAllCourses ? (
                            <>
                              <ChevronUp size={16} />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} />
                              Show More ({userCourses.length - initialDisplayCount} more)
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You haven't created any courses yet</p>
                    <Button className="mt-4 flex items-center gap-2" onClick={() => navigate("/addcourse")}>
                      <PlusCircle size={16} />
                      Create Your First Course
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Toolkits Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase size={20} className="text-purple-600" />
                  <div>
                    <CardTitle>Your Toolkits</CardTitle>
                    <CardDescription>
                      {userToolkits.length} toolkits created
                    </CardDescription>
                  </div>
                </div>
                <Button onClick={() => navigate("/add-toolkit")} className="flex items-center gap-1">
                  <PlusCircle size={16} />
                  Add Toolkit
                </Button>
              </CardHeader>
              <CardContent>
                {userToolkits.length > 0 ? (
                  <div className="space-y-4">
                    {displayedToolkits.map(toolkit => (
                      <div key={toolkit.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <h3 className="font-medium">
                          <Link to={`/toolkit/${toolkit.id}`} className="text-blue-600 hover:underline">
                            {toolkit.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{toolkit.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            Created: {new Date(toolkit.createdAt?.seconds * 1000).toLocaleDateString()}
                          </span>
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                            {toolkit.category}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewItem(toolkit.id, 'toolkit')}
                              className="flex items-center gap-1"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteConfirmation(toolkit.id, 'toolkit')}
                              className="flex items-center gap-1"
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show More/Less Button for Toolkits */}
                    {userToolkits.length > initialDisplayCount && (
                      <div className="flex justify-center mt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowAllToolkits(!showAllToolkits)}
                          className="flex items-center gap-2"
                        >
                          {showAllToolkits ? (
                            <>
                              <ChevronUp size={16} />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} />
                              Show More ({userToolkits.length - initialDisplayCount} more)
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You haven't created any toolkits yet</p>
                    <Button className="mt-4 flex items-center gap-2" onClick={() => navigate("/add-toolkit")}>
                      <PlusCircle size={16} />
                      Create Your First Toolkit
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {itemToDelete.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 py-3">
            <DialogClose asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <X size={16} />
                Cancel
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} className="flex items-center gap-1">
              <Trash size={16} />
              Delete {itemToDelete.type === 'course' ? 'Course' : 'Toolkit'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}