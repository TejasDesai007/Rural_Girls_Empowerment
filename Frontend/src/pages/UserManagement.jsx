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

  const fetchUsers = async (currentFilter = filter) => {
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
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-purple-700">User Management</h1>

      {/* Search */}
      <div className="flex justify-between items-center gap-4">
        <Input
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Filter Tabs */}
      <Tabs defaultValue="all" onValueChange={setFilter}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="mentor">Mentors</TabsTrigger>
          <TabsTrigger value="user">Learners</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Users List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      className="bg-blue-500 text-white"
                      onClick={() => setSelectedUser(user)}
                    >
                      Update
                    </Button>
                    <Button
                      onClick={(e) => handleDeleteUser(e, user.id)}
                      className="bg-red-500 text-white"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Update User Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-2">
              <Input
                placeholder="Name"
                value={selectedUser.name}
                onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
              />
              <Input
                placeholder="Email"
                value={selectedUser.email}
                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
              />
              <Select
                value={selectedUser.role}
                onValueChange={(val) => setSelectedUser({ ...selectedUser, role: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter className="mt-4 flex justify-between">
            <Button onClick={handleUpdateUser} className="bg-purple-600 text-white">
              Save Changes
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
