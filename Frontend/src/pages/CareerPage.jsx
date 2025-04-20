import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

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
  const [animateGradient, setAnimateGradient] = useState(false);

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

  useEffect(() => {
    // Start the gradient animation after component mounts
    setAnimateGradient(true);
  }, []);

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

  const clearFilters = () => {
    setSearchTerm("");
    setLocation("");
    setSalary("");
    setType("");
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
    <div className={`min-h-screen p-8 transition-all duration-1000 ${animateGradient ? 'bg-gradient-to-r from-rose-300 via-fuchsia-300 to-indigo-300 bg-animate-pulse' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-center mb-10"
        >
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-pink-600">
              Find Your Dream Career
            </h1>
            <p className="mt-2 text-lg text-gray-700">Opportunities that empower and inspire</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)} 
            className={`bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white rounded-full px-6 py-2 transform transition-all hover:scale-105 hover:shadow-lg ${showForm ? 'bg-opacity-90' : ''}`}
          >
            {showForm ? "✕ Close Form" : "✨ Add New Job"}
          </Button>
        </motion.div>

        {/* Add Job Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleAddJob} className="mb-10 p-6 bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200">
              <h2 className="text-2xl font-bold text-pink-600 mb-6 text-center">Create New Job Listing</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  placeholder="Job Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="rounded-lg border-pink-200 focus:border-pink-400 focus:ring focus:ring-pink-200 transition-all"
                />
                <Input
                  placeholder="Company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                  className="rounded-lg border-pink-200 focus:border-pink-400 focus:ring focus:ring-pink-200 transition-all"
                />
                <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                  <SelectTrigger className="rounded-lg border-pink-200">
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {locations.map((loc) => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select value={formData.salary} onValueChange={(value) => setFormData({ ...formData, salary: value })}>
                  <SelectTrigger className="rounded-lg border-pink-200">
                    <SelectValue placeholder="Select Salary" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {salaryRanges.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="rounded-lg border-pink-200">
                    <SelectValue placeholder="Select Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {jobTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                className="w-full mt-6 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white rounded-lg hover:shadow-lg hover:opacity-90 transition-all"
              >
                Submit Job Listing
              </Button>
            </form>
          </motion.div>
        )}

        {/* Filters Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10"
        >
          <div className="bg-white bg-opacity-70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-purple-100">
            <h2 className="text-xl font-semibold text-purple-700 mb-4">Find Your Perfect Role</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search job titles or companies"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg border-purple-200 focus:border-purple-400 focus:ring focus:ring-purple-200 transition-all"
              />
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="rounded-lg border-purple-200">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {locations.map((loc) => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select value={salary} onValueChange={setSalary}>
                <SelectTrigger className="rounded-lg border-purple-200">
                  <SelectValue placeholder="Filter by salary" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {salaryRanges.map((range) => <SelectItem key={range} value={range}>{range}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="rounded-lg border-purple-200">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {jobTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {(searchTerm || location || salary || type) && (
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={clearFilters} 
                  variant="outline" 
                  className="text-purple-600 border-purple-300 hover:bg-purple-50 text-sm"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6 text-center">
          <p className="text-lg text-gray-700">
            Found <span className="font-bold text-pink-600">{filteredJobs.length}</span> opportunities for you
          </p>
        </div>

        {/* Job Cards */}
        {filteredJobs.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden bg-white bg-opacity-90 backdrop-blur-sm border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px]">
                  <div className="h-2 bg-gradient-to-r from-pink-400 to-purple-400"></div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-xl font-bold text-gray-800">{job.title}</h2>
                      <Badge variant="outline" className={`${
                        job.type === 'Internship' 
                          ? 'border-pink-300 text-pink-600 bg-pink-50' 
                          : 'border-purple-300 text-purple-600 bg-purple-50'
                      }`}>
                        {job.type}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <p className="text-gray-700 font-medium">{job.company}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {job.salary}
                      </div>
                      <Button 
                        variant="default" 
                        className="w-full mt-4 bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:opacity-90 transform transition-all duration-200 hover:shadow-md rounded-lg"
                        onClick={() => handleApply(job)}
                      >
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center p-12 bg-white bg-opacity-70 backdrop-blur-sm rounded-2xl">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No jobs found</h3>
            <p className="text-gray-500">Try adjusting your search filters</p>
            <Button 
              onClick={clearFilters} 
              className="mt-4 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white rounded-lg hover:opacity-90"
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Apply Dialog */}
        <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl">
            <div className="h-2 bg-gradient-to-r from-pink-400 to-purple-400"></div>
            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-pink-600">Apply for {selectedJob?.title}</DialogTitle>
                <p className="text-gray-500 mt-1">{selectedJob?.company} • {selectedJob?.location}</p>
              </DialogHeader>
              <form onSubmit={submitApplication} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <Input
                    placeholder="Enter your full name"
                    value={application.name}
                    onChange={(e) => setApplication({ ...application, name: e.target.value })}
                    required
                    className="rounded-lg border-pink-200 focus:border-pink-400 focus:ring focus:ring-pink-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <Input
                    placeholder="your@email.com"
                    type="email"
                    value={application.email}
                    onChange={(e) => setApplication({ ...application, email: e.target.value })}
                    required
                    className="rounded-lg border-pink-200 focus:border-pink-400 focus:ring focus:ring-pink-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Resume Link</label>
                  <Input
                    placeholder="https://drive.google.com/..."
                    value={application.resume}
                    onChange={(e) => setApplication({ ...application, resume: e.target.value })}
                    required
                    className="rounded-lg border-pink-200 focus:border-pink-400 focus:ring focus:ring-pink-200"
                  />
                  <p className="text-xs text-gray-500">Link to your resume on Drive, Dropbox, etc.</p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full mt-6 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white hover:opacity-90 transition-all py-2 rounded-lg"
                >
                  Submit Application
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default CareerPage;