import { useState } from "react";
import { submitApplication } from "@/services/applicationService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const JobApplicationForm = ({ jobId }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    resumeLink: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await submitApplication(jobId, form);
      alert("Application submitted!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="space-y-4">
      <Input name="name" placeholder="Your Name" onChange={handleChange} />
      <Input name="email" placeholder="Email" onChange={handleChange} />
      <Input name="resumeLink" placeholder="Resume Link (Google Drive or others)" onChange={handleChange} />
      <Button onClick={handleSubmit}>Apply</Button>
    </div>
  );
};

export default JobApplicationForm;
