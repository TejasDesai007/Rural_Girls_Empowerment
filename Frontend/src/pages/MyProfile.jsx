import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalFooter, ModalBody } from "@/components/ui/modal";
import { toast } from "sonner"; // For notifications
import { db, auth } from "@/firebase";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

// Profile Header
function ProfileHeaderCard({ user }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <img
          src={user?.photoURL || "/default-avatar.png"}
          alt="Profile"
          className="w-32 h-32 rounded-full mx-auto"
        />
        <h2 className="text-2xl font-semibold">{user?.displayName}</h2>
        <p className="text-sm text-gray-600">{user?.role || "User"}</p>
        <p className="text-sm text-gray-600">{user?.bio || "No bio available."}</p>
      </CardContent>
    </Card>
  );
}

// Account Details Form
function AccountDetailsForm({ user, onUpdate }) {
  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
      });

      // If password update is included
      if (password) {
        // Call Firebase password update logic here
      }

      toast.success("Profile updated successfully.");
      onUpdate({ name });
    } catch (error) {
      toast.error("Error updating profile.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={email} disabled />
          </div>
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a new password"
            />
          </div>
          <Button type="submit">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Role Permissions Info
function RolePermissionsInfo({ user }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role and Permissions</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">
          Role: <strong>{user?.role || "User"}</strong>
        </p>
        <p className="text-gray-700">
          Accessible Areas: <strong>{user?.role === "Admin" ? "Admin Panel, Courses, Mentorship, etc." : "Courses, Profile"}</strong>
        </p>
      </CardContent>
    </Card>
  );
}

// Delete Account Warning Box
function DeleteAccountWarningBox({ onDelete }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-red-600">Warning: Delete Account</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-red-600">
          This action is irreversible. Once deleted, your account will be permanently removed from the platform.
        </p>
        <Modal>
          <ModalTrigger>
            <Button className="bg-red-600 hover:bg-red-700">Delete Account</Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader>Confirm Deletion</ModalHeader>
            <ModalBody>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete your account? This action is permanent and cannot be undone.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => onDelete()} className="bg-red-600 hover:bg-red-700">
                Yes, Delete Account
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </CardContent>
    </Card>
  );
}

export default function MyProfile({ user }) {
  const [userInfo, setUserInfo] = useState(user);

  const handleDeleteAccount = async () => {
    try {
      // Call Firebase deletion logic
      await updateDoc(doc(db, "users", userInfo?.uid), { deleted: true });
      await auth.currentUser.delete(); // Delete from Firebase Auth
      toast.success("Account deleted successfully.");
    } catch (error) {
      toast.error("Error deleting account.");
    }
  };

  const handleProfileUpdate = (updatedInfo) => {
    setUserInfo((prev) => ({ ...prev, ...updatedInfo }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <ProfileHeaderCard user={userInfo} />
      <AccountDetailsForm user={userInfo} onUpdate={handleProfileUpdate} />
      <RolePermissionsInfo user={userInfo} />
      <DeleteAccountWarningBox onDelete={handleDeleteAccount} />
    </div>
  );
}
