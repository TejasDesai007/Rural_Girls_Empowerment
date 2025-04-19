import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const initialJobs = [
  { id: 1, title: "Frontend Intern", company: "CodeSpark", location: "Delhi", salary: "0-3 LPA", type: "Internship" },
  { id: 2, title: "Marketing Intern", company: "BrandBoost", location: "Mumbai", salary: "0-3 LPA", type: "Internship" },
  { id: 3, title: "Web Developer", company: "StartupHub", location: "Bengaluru", salary: "3-6 LPA", type: "Full-time" },
  { id: 4, title: "UI/UX Designer", company: "DesignLab", location: "Hyderabad", salary: "3-6 LPA", type: "Full-time" },
  { id: 5, title: "Operations Intern", company: "AgroWomen", location: "Rural Maharashtra", salary: "0-3 LPA", type: "Internship" },
];

const locations = ["Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Rural Maharashtra"];
const salaryRanges = ["0-3 LPA", "3-6 LPA", "6-10 LPA"];
const jobTypes = ["Internship", "Full-time"];

const CareerPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [type, setType] = useState("");
  const [jobs, setJobs] = useState(initialJobs);
  const [showForm, setShowForm] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    type: "",
  });

  const [application, setApplication] = useState({
    name: "",
    email: "",
    resume: "",
  });

  const handleAddJob = (e) => {
    e.preventDefault();
    const newJob = { ...formData, id: Date.now() };
    setJobs([newJob, ...jobs]);
    setFormData({ title: "", company: "", location: "", salary: "", type: "" });
    setShowForm(false);
  };

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowApplyDialog(true);
  };

  const submitApplication = (e) => {
    e.preventDefault();
    console.log("Application submitted:", application);
    setApplication({ name: "", email: "", resume: "" });
    setShowApplyDialog(false);
    alert("Application submitted successfully! ✅");
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = location ? job.location === location : true;
    const matchesSalary = salary ? job.salary === salary : true;
    const matchesType = type ? job.type === type : true;
    return matchesSearch && matchesLocation && matchesSalary && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-pink-600">Career Opportunities</h1>
        <Button onClick={() => setShowForm(!showForm)} className="bg-pink-600 text-white">
          {showForm ? "Close Form" : "Add Job (Mentors)"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleAddJob} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-pink-50 rounded-lg">
          <Input
            placeholder="Job Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Input
            placeholder="Company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            required
          />
          <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
            <SelectTrigger><SelectValue placeholder="Select Location" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {locations.map((loc) => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={formData.salary} onValueChange={(value) => setFormData({ ...formData, salary: value })}>
            <SelectTrigger><SelectValue placeholder="Select Salary" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {salaryRanges.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger><SelectValue placeholder="Select Job Type" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {jobTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button type="submit" className="bg-pink-600 text-white col-span-1 md:col-span-3">Submit Job</Button>
        </form>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search job titles or companies"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger><SelectValue placeholder="Filter by location" /></SelectTrigger>
          <SelectContent><SelectGroup>{locations.map((loc) => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
        <Select value={salary} onValueChange={setSalary}>
          <SelectTrigger><SelectValue placeholder="Filter by salary" /></SelectTrigger>
          <SelectContent><SelectGroup>{salaryRanges.map((range) => <SelectItem key={range} value={range}>{range}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger><SelectValue placeholder="Filter by type" /></SelectTrigger>
          <SelectContent><SelectGroup>{jobTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectGroup></SelectContent>
        </Select>
      </div>

      {/* Job Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-4 space-y-2">
                <h2 className="text-xl font-semibold text-pink-700">{job.title}</h2>
                <p className="text-gray-700">{job.company}</p>
                <p className="text-sm text-gray-500">{job.location}</p>
                <p className="text-sm text-gray-500">{job.salary} | {job.type}</p>
                <Button variant="outline" className="mt-2 w-full" onClick={() => handleApply(job)}>Apply Now</Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-600">No jobs found. Try adjusting filters.</p>
        )}
      </div>

      {/* Apply Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-pink-600">Apply for {selectedJob?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitApplication} className="space-y-4">
            <Input
              placeholder="Your Name"
              value={application.name}
              onChange={(e) => setApplication({ ...application, name: e.target.value })}
              required
            />
            <Input
              placeholder="Your Email"
              type="email"
              value={application.email}
              onChange={(e) => setApplication({ ...application, email: e.target.value })}
              required
            />
            <Input
              placeholder="Link to Resume (Drive/GitHub/etc.)"
              value={application.resume}
              onChange={(e) => setApplication({ ...application, resume: e.target.value })}
              required
            />
            <Button type="submit" className="bg-pink-600 text-white w-full">Submit Application</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CareerPage;
