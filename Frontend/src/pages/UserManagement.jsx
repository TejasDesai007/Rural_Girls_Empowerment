import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function UserManagement() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async (currentFilter = filter) => {
    setIsLoading(true);
    const usersRef = collection(db, "users");
    let q;

    if (currentFilter === "all") {
      q = query(usersRef);
    } else {
      q = query(usersRef, where("role", "==", currentFilter));
    }

    const querySnapshot = await getDocs(q);
    const userList = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setUsers(userList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleUpdateUser = async () => {
    if (selectedUser) {
      const userDocRef = doc(db, "users", selectedUser.id);
      try {
        await updateDoc(userDocRef, {
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role,
        });
        setSelectedUser(null);
        fetchUsers("all");
        setFilter("all");
      } catch (error) {
        console.error("Error updating user:", error);
      }
    }
  };

  const handleDeleteUser = async (e, userId) => {
    e.stopPropagation();
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "users", userId));
      fetchUsers("all");
      setFilter("all");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-rose-100 via-purple-100 to-teal-100">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-6 py-12 space-y-8 backdrop-blur-sm bg-white/60 rounded-2xl shadow-2xl border border-white/20"
      >
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600 text-center mb-8"
        >
          User Management
        </motion.h1>

        {/* Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center gap-4 mb-8"
        >
          <div className="relative w-96 group">
            <Input
              placeholder="Search users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-2 border-purple-300 rounded-full p-6 pl-5 text-lg bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition-all duration-300 shadow-md"
            />
            <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Tabs defaultValue="all" onValueChange={setFilter} className="mb-8">
            <TabsList className="bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-md border border-purple-100 w-full max-w-md mx-auto">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-full px-6 py-2 transition-all duration-300 font-medium text-gray-600 flex-1"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="mentor"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-full px-6 py-2 transition-all duration-300 font-medium text-gray-600 flex-1"
              >
                Mentors
              </TabsTrigger>
              <TabsTrigger
                value="user"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-full px-6 py-2 transition-all duration-300 font-medium text-gray-600 flex-1"
              >
                Learners
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-full px-6 py-2 transition-all duration-300 font-medium text-gray-600 flex-1"
              >
                Admins
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="backdrop-blur-sm bg-white/70 border border-white/20 shadow-xl overflow-hidden rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-b border-pink-100">
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                <span className="bg-gradient-to-r from-fuchsia-600 to-pink-600 h-6 w-1 rounded-full mr-3"></span>
                Users List
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center p-12">
                  <div className="w-12 h-12 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-pink-500 border-l-transparent animate-spin"></div>
                </div>
              ) : (
                <Table className="w-full">
                  <TableHeader className="bg-gradient-to-r from-pink-100 to-purple-100">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-700">Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Email</TableHead>
                      <TableHead className="font-semibold text-gray-700">Role</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group border-b border-pink-100 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-colors duration-300"
                      >
                        <TableCell className="font-medium py-4">{user.name}</TableCell>
                        <TableCell className="text-gray-600">{user.email}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                            user.role === 'mentor' ? 'bg-pink-100 text-pink-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            onClick={() => setSelectedUser(user)}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg rounded-full px-4 py-1 text-sm"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={(e) => handleDeleteUser(e, user.id)}
                            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg rounded-full px-4 py-1 text-sm"
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                    {filteredUsers.length === 0 && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500 italic">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Update User Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md backdrop-blur-md bg-white/80 border border-white/30 shadow-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-pink-600">
              Edit User Details
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <motion.div 
              initial="hidden"
              animate="show"
              variants={container}
              className="space-y-4 py-4"
            >
              <motion.div variants={item}>
                <label className="text-xs font-medium text-gray-500 ml-2 mb-1 block">Name</label>
                <Input
                  placeholder="Name"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  className="w-full border-2 border-purple-200 rounded-full p-5 text-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition-all duration-300"
                />
              </motion.div>
              <motion.div variants={item}>
                <label className="text-xs font-medium text-gray-500 ml-2 mb-1 block">Email</label>
                <Input
                  placeholder="Email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  className="w-full border-2 border-purple-200 rounded-full p-5 text-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition-all duration-300"
                />
              </motion.div>
              <motion.div variants={item}>
                <label className="text-xs font-medium text-gray-500 ml-2 mb-1 block">Role</label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(val) => setSelectedUser({ ...selectedUser, role: val })}
                >
                  <SelectTrigger className="w-full border-2 border-purple-200 rounded-full p-5 text-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition-all duration-300">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/90 backdrop-blur-md border border-purple-100">
                    <SelectItem value="user" className="focus:bg-pink-50">User</SelectItem>
                    <SelectItem value="mentor" className="focus:bg-pink-50">Mentor</SelectItem>
                    <SelectItem value="admin" className="focus:bg-pink-50">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            </motion.div>
          )}
          <DialogFooter className="mt-6 flex gap-3">
            <DialogClose asChild>
              <Button 
                variant="outline" 
                className="flex-1 rounded-full border-2 border-gray-200 text-gray-600 hover:bg-gray-100 transition-all duration-300"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleUpdateUser}
              className="flex-1 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white rounded-full hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-xl"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}