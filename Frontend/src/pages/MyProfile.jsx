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
  User,
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
import { motion } from "framer-motion";

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
  const initialDisplayCount = 2; // Number of items to show initially

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
      admin: "bg-pink-100 text-pink-800",
      mentor: "bg-purple-100 text-purple-800",
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-purple-800 animate-pulse">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-8 bg-white rounded-xl shadow-lg text-center max-w-md"
        >
          <User size={64} className="mx-auto text-purple-400 mb-4" />
          <h2 className="text-2xl font-bold text-purple-800 mb-3">Not Logged In</h2>
          <p className="text-gray-600 mb-6">Please log in to view your profile</p>
          <Button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Log In
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 py-12 max-w-6xl mx-auto bg-gradient-to-br from-purple-50 to-pink-50">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col md:flex-row gap-8"
      >
        {/* Profile Section */}
        <motion.div
          variants={itemVariants}
          className="md:w-1/3"
        >
          <Card className="border-none shadow-xl bg-white backdrop-blur-lg bg-opacity-90 rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-col items-center relative bg-gradient-to-r from-purple-600 to-pink-500 text-white py-8">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Avatar className="h-20 w-20 mb-4 ring-4 shadow-[0_4px_20px_rgba(0,0,0,0.15)]" >
                  <AvatarImage src={userData?.photoURL || user.photoURL || ""} />
                  <AvatarFallback className="bg-purple-100 text-purple-800 text-2xl font-bold">
                    {userData?.name?.charAt(0) || user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <CardTitle className="text-2xl font-bold">{userData?.name || user.displayName || "User"}</CardTitle>
              <CardDescription className="text-purple-100">{user.email}</CardDescription>

              {/* Role Badge */}
              {userData?.role && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-2"
                >
                  <span className={`text-xs px-4 py-1 rounded-full capitalize font-medium ${getRoleBadgeColor(userData.role)}`}>
                    {userData.role}
                  </span>
                </motion.div>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-700 mb-6 italic"
              >
                {userData?.bio || "No bio provided"}
              </motion.p>

              {userData?.skills?.length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mb-6"
                >
                  <h3 className="text-sm font-bold uppercase tracking-wide text-purple-700 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {userData.skills.map((skill, index) => (
                      <motion.span
                        key={index}
                        className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 + (index * 0.1) }}
                        whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl py-5 shadow-md hover:shadow-lg transition-all duration-200">
                      <Pencil size={16} />
                      Edit Profile
                    </Button>
                  </motion.div>
                </DialogTrigger>

                <DialogContent className="bg-white rounded-2xl border-none shadow-2xl max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-purple-800">
                      <Edit size={20} className="text-pink-500" />
                      Edit Profile
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                      Update your profile information
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-purple-800">Name</label>
                      <input
                        name="name"
                        type="text"
                        className="w-full rounded-lg border border-purple-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all duration-200"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-purple-800">Email</label>
                      <input
                        name="email"
                        type="email"
                        className="w-full rounded-lg border border-purple-200 px-3 py-2.5 text-sm bg-purple-50"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-purple-800">Bio</label>
                      <textarea
                        name="bio"
                        className="w-full rounded-lg border border-purple-200 px-3 py-2.5 text-sm min-h-[120px] focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all duration-200"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-purple-800">Skills</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          className="flex-1 rounded-lg border border-purple-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all duration-200"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add a skill"
                        />
                        <Button
                          type="button"
                          onClick={handleAddSkill}
                          disabled={!newSkill.trim()}
                          className="flex items-center gap-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-200"
                        >
                          <Plus size={16} />
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.skills.map((skill, index) => (
                          <div key={index} className="flex items-center bg-purple-100 px-3 py-1.5 rounded-full text-sm text-purple-800">
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="ml-2 text-purple-500 hover:text-pink-600 transition-colors"
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
                      <Button variant="outline" className="flex items-center gap-1 border-purple-200 text-purple-700 hover:bg-purple-50">
                        <X size={16} />
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={editing}
                      className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      {editing ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={16} />}
                      {editing ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Section for Courses and Toolkits */}
        {(userData?.role === "mentor" || userData?.role === "admin") && (
          <motion.div
            variants={itemVariants}
            className="md:w-2/3 space-y-6"
          >
            {/* Courses Section */}
            <Card className="border-none shadow-xl bg-white backdrop-blur-lg bg-opacity-90 rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-purple-500 to-purple-400 text-white p-6">
                <div className="flex items-center gap-3">
                  <BookOpen size={24} className="text-white" />
                  <div>
                    <CardTitle className="text-xl">Your Courses</CardTitle>
                    <CardDescription className="text-purple-100">
                      {userCourses.length} courses created
                    </CardDescription>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => navigate("/addcourse")}
                    className="flex items-center gap-2 bg-white text-purple-600 hover:bg-purple-50 rounded-xl shadow-md"
                  >
                    <PlusCircle size={16} />
                    Add Course
                  </Button>
                </motion.div>
              </CardHeader>
              <CardContent className="p-6">
                {userCourses.length > 0 ? (
                  <motion.div
                    className="space-y-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                      }
                    }}
                  >
                    {displayedCourses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        variants={{
                          hidden: { y: 20, opacity: 0 },
                          visible: { y: 0, opacity: 1 }
                        }}
                        className="border border-purple-100 rounded-xl p-5 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <h3 className="font-bold text-lg text-purple-800">
                          <Link to={`/courses/${course.id}`} className="text-purple-700 hover:text-pink-600 transition-colors hover:underline">
                            {course.title}
                          </Link>
                        </h3>
                        <p className="text-gray-600 line-clamp-2 mt-2">{course.description}</p>
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-xs text-gray-500 flex items-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-purple-400 mr-2"></span>
                            Created: {new Date(course.createdAt?.seconds * 1000).toLocaleDateString()}
                          </span>
                          <span className="text-xs px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full font-medium">
                            {course.category}
                          </span>
                          <div className="flex gap-2">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewItem(course.id, 'course')}
                                className="flex items-center gap-1 border-purple-200 text-purple-700 hover:bg-purple-50 rounded-full h-9 w-9 p-0 flex items-center justify-center"
                              >
                                <Eye size={16} />
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteConfirmation(course.id, 'course')}
                                className="flex items-center gap-1 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-full h-9 w-9 p-0 flex items-center justify-center"
                              >
                                <Trash size={16} />
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Show More/Less Button for Courses */}
                    {userCourses.length > initialDisplayCount && (
                      <motion.div
                        className="flex justify-center mt-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => setShowAllCourses(!showAllCourses)}
                          className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 rounded-full px-6 transition-all duration-300"
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
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-purple-100">
                      <BookOpen size={32} className="text-purple-500" />
                    </div>
                    <p className="text-gray-500 mb-6">You haven't created any courses yet</p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center gap-2 px-6 py-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                        onClick={() => navigate("/addcourse")}
                      >
                        <PlusCircle size={16} />
                        Create Your First Course
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Toolkits Section */}
            <Card className="border-none shadow-xl bg-white backdrop-blur-lg bg-opacity-90 rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6">
                <div className="flex items-center gap-3">
                  <Briefcase size={24} className="text-white" />
                  <div>
                    <CardTitle className="text-xl">Your Toolkits</CardTitle>
                    <CardDescription className="text-pink-100">
                      {userToolkits.length} toolkits created
                    </CardDescription>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => navigate("/add-toolkit")}
                    className="flex items-center gap-2 bg-white text-pink-600 hover:bg-pink-50 rounded-xl shadow-md"
                  >
                    <PlusCircle size={16} />
                    Add Toolkit
                  </Button>
                </motion.div>
              </CardHeader>
              <CardContent className="p-6">
                {userToolkits.length > 0 ? (
                  <motion.div
                    className="space-y-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
                      }
                    }}
                  >
                    {displayedToolkits.map((toolkit, index) => (
                      <motion.div
                        key={toolkit.id}
                        variants={{
                          hidden: { y: 20, opacity: 0 },
                          visible: { y: 0, opacity: 1 }
                        }}
                        className="border border-pink-100 rounded-xl p-5 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <h3 className="font-bold text-lg text-pink-800">
                          <Link to={`/toolkit/${toolkit.id}`} className="text-pink-700 hover:text-purple-600 transition-colors hover:underline">
                            {toolkit.title}
                          </Link>
                        </h3>
                        <p className="text-gray-600 line-clamp-2 mt-2">{toolkit.description}</p>
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-xs text-gray-500 flex items-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-pink-400 mr-2"></span>
                            Created: {new Date(toolkit.createdAt?.seconds * 1000).toLocaleDateString()}
                          </span>
                          <span className="text-xs px-3 py-1.5 bg-pink-100 text-pink-800 rounded-full font-medium">
                            {toolkit.category}
                          </span>
                          <div className="flex gap-2">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewItem(toolkit.id, 'toolkit')}
                                className="flex items-center gap-1 border-pink-200 text-pink-700 hover:bg-pink-50 rounded-full h-9 w-9 p-0 flex items-center justify-center"
                              >
                                <Eye size={16} />
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteConfirmation(toolkit.id, 'toolkit')}
                                className="flex items-center gap-1 border-pink-200 text-pink-600 hover:bg-pink-50 rounded-full h-9 w-9 p-0 flex items-center justify-center"
                              >
                                <Trash size={16} />
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Show More/Less Button for Toolkits */}
                    {userToolkits.length > initialDisplayCount && (
                      <motion.div
                        className="flex justify-center mt-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => setShowAllToolkits(!showAllToolkits)}
                          className="flex items-center gap-2 border-pink-200 text-pink-700 hover:bg-pink-50 rounded-full px-6 transition-all duration-300"
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
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-pink-100">
                      <Briefcase size={32} className="text-pink-500" />
                    </div>
                    <p className="text-gray-500 mb-6">You haven't created any toolkits yet</p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white flex items-center gap-2 px-6 py-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                        onClick={() => navigate("/add-toolkit")}
                      >
                        <PlusCircle size={16} />
                        Create Your First Toolkit
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-red-600">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this {itemToDelete.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 py-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="flex items-center gap-1 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <X size={16} />
                Cancel
              </Button>
            </DialogClose>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Trash size={16} />
                Delete {itemToDelete.type === 'course' ? 'Course' : 'Toolkit'}
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast for success and error messages */}
      <style jsx global>{`
        .toast-success {
          background: linear-gradient(to right, #8b5cf6, #ec4899);
          color: white;
          border-radius: 10px;
          box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.2);
          padding: 16px;
          animation: slideIn 0.3s ease-out;
        }
        
        .toast-error {
          background: linear-gradient(to right, #ef4444, #f43f5e);
          color: white;
          border-radius: 10px;
          box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.2);
          padding: 16px;
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}