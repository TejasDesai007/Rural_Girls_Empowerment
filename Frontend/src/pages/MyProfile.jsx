import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
function DeleteAccountWarningBox({ onDelete, showModal, setShowModal }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-red-600">Warning: Delete Account</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-red-600">
          This action is irreversible. Once deleted, your account will be permanently removed from the platform.
        </p>
        <Button onClick={() => setShowModal(true)} className="bg-red-600 hover:bg-red-700">
          Delete Account
        </Button>

        {showModal && (
          <div className="fixed inset-0 z-50 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-lg max-w-sm w-full">
              <h2 className="text-xl font-semibold">Confirm Deletion</h2>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete your account? This action is permanent and cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <Button onClick={() => setShowModal(false)} className="bg-gray-300 hover:bg-gray-400">Cancel</Button>
                <Button onClick={onDelete} className="bg-red-600 hover:bg-red-700">Yes, Delete Account</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MyProfile({ user }) {
  const [userInfo, setUserInfo] = useState(user);
  const [showModal, setShowModal] = useState(false);

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
      <DeleteAccountWarningBox
        onDelete={handleDeleteAccount}
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </div>
  );
}
