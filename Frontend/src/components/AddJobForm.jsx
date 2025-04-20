import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from "@/components/ui/select";
import { db, auth } from "../firebase"; // Correct Firestore and auth import
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth"; // To manage user state

const AddJobForm = () => {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [type, setType] = useState("");
  
  // Firebase auth state
  const [user, loading, error] = useAuthState(auth);

  const handleSubmit = async () => {
    if (!user) {
      alert("You must be logged in as a mentor to post a job.");
      return;
    }

    try {
      const jobRef = collection(db, "jobOpenings"); // Reference to Firestore collection

      await addDoc(jobRef, {
        title,
        company,
        location,
        salary,
        type,
        postedBy: user.uid,
        timestamp: serverTimestamp(),
      });

      alert("Job posted successfully!");
      // Reset form
      setTitle("");
      setCompany("");
      setLocation("");
      setSalary("");
      setType("");
    } catch (error) {
      console.error("Error adding job:", error);
      alert("Failed to post job.");
    }
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold">Post a New Job</h2>
      <Input placeholder="Job Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Input placeholder="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} />
      
      <Select value={location} onValueChange={setLocation}>
        <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Location</SelectLabel>
            <SelectItem value="Delhi">Delhi</SelectItem>
            <SelectItem value="Mumbai">Mumbai</SelectItem>
            <SelectItem value="Bengaluru">Bengaluru</SelectItem>
            {/* Add more locations */}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={salary} onValueChange={setSalary}>
        <SelectTrigger><SelectValue placeholder="Salary Range" /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Salary</SelectLabel>
            <SelectItem value="0-3 LPA">0-3 LPA</SelectItem>
            <SelectItem value="3-6 LPA">3-6 LPA</SelectItem>
            {/* Add more salary ranges */}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={type} onValueChange={setType}>
        <SelectTrigger><SelectValue placeholder="Job Type" /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Job Type</SelectLabel>
            <SelectItem value="Internship">Internship</SelectItem>
            <SelectItem value="Full-time">Full-time</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Button onClick={handleSubmit}>Post Job</Button>
    </div>
  );
};

export default AddJobForm;
