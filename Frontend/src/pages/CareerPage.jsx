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
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MapPin, CreditCard, Briefcase } from "lucide-react";

const initialJobs = [
  { id: 1, title: "Digital Literacy Trainer", company: "TechSakhi", location: "Rural Rajasthan", salary: "0-3 LPA", type: "Internship" },
  { id: 2, title: "Community Health Worker", company: "WomenWell", location: "Rural Bihar", salary: "0-3 LPA", type: "Full-time" },
  { id: 3, title: "Microfinance Assistant", company: "RuralRise", location: "Rural Maharashtra", salary: "3-6 LPA", type: "Full-time" },
  { id: 4, title: "Handicraft Skills Instructor", company: "ArtisanHer", location: "Rural Uttar Pradesh", salary: "3-6 LPA", type: "Full-time" },
  { id: 5, title: "Sustainable Agriculture Intern", company: "AgroWomen", location: "Rural Karnataka", salary: "0-3 LPA", type: "Internship" },
  { id: 6, title: "Women's Rights Advocate", company: "EmpowerRural", location: "Rural Gujarat", salary: "3-6 LPA", type: "Full-time" },
  { id: 7, title: "Eco-Tourism Guide", company: "GreenTourHer", location: "Rural Himachal Pradesh", salary: "3-6 LPA", type: "Part-time" },
  { id: 8, title: "Rural Education Coordinator", company: "ShikshaShakti", location: "Rural Madhya Pradesh", salary: "3-6 LPA", type: "Full-time" },
];

const locations = ["All", "Rural Rajasthan", "Rural Bihar", "Rural Maharashtra", "Rural Uttar Pradesh", "Rural Karnataka", "Rural Gujarat", "Rural Himachal Pradesh", "Rural Madhya Pradesh"];
const salaryRanges = ["All", "0-3 LPA", "3-6 LPA", "6-10 LPA"];
const jobTypes = ["All", "Internship", "Full-time", "Part-time"];

const CareerPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("All");
  const [salary, setSalary] = useState("All");
  const [type, setType] = useState("All");
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

  const clearFilters = () => {
    setSearchTerm("");
    setLocation("All");
    setSalary("All");
    setType("All");
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = location === "All" ? true : job.location === location;
    const matchesSalary = salary === "All" ? true : job.salary === salary;
    const matchesType = type === "All" ? true : job.type === type;
    return matchesSearch && matchesLocation && matchesSalary && matchesType;
  });

  // Background animation variants
  const backgroundVariants = {
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      transition: {
        duration: 15,
        ease: "linear",
        repeat: Infinity,
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-r from-rose-200 via-fuchsia-200 to-indigo-200"
      initial={{ backgroundPosition: "0% 50%" }}
      animate="animate"
      variants={backgroundVariants}
      style={{ backgroundSize: "400% 400%" }}
    >
      <div className="max-w-7xl mx-auto p-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col md:flex-row justify-between items-center mb-12"
        >
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-pink-600 tracking-tight">
              Rural Girls Empowerment Careers
            </h1>
            <p className="mt-2 text-lg text-gray-700">Opportunities that transform rural communities through women's leadership</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => setShowForm(!showForm)} 
              className="bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white rounded-full px-6 py-2 shadow-md hover:shadow-lg transition-all"
            >
              {showForm ? "✕ Close Form" : <><Sparkles className="mr-2 h-4 w-4" /> Add New Opportunity</>}
            </Button>
          </motion.div>
        </motion.div>

        {/* Add Job Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <motion.form 
                onSubmit={handleAddJob} 
                className="mb-10 p-6 bg-white rounded-2xl shadow-xl border border-pink-200"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold text-pink-600 mb-6 text-center">Create New Opportunity</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    placeholder="Job Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="rounded-lg border-pink-200 focus-visible:ring-pink-400 transition-all"
                  />
                  <Input
                    placeholder="Organization"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                    className="rounded-lg border-pink-200 focus-visible:ring-pink-400 transition-all"
                  />
                  <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                    <SelectTrigger className="rounded-lg border-pink-200">
                      <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {locations.filter(loc => loc !== "All").map((loc) => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Select value={formData.salary} onValueChange={(value) => setFormData({ ...formData, salary: value })}>
                    <SelectTrigger className="rounded-lg border-pink-200">
                      <SelectValue placeholder="Select Salary" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {salaryRanges.filter(s => s !== "All").map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="rounded-lg border-pink-200">
                      <SelectValue placeholder="Select Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {jobTypes.filter(t => t !== "All").map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="submit" 
                    className="w-full mt-6 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    Submit Opportunity
                  </Button>
                </motion.div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10"
        >
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100">
            <h2 className="text-xl font-semibold text-purple-700 mb-4">Find Your Ideal Role</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search roles or organizations"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg border-purple-200 focus-visible:ring-purple-400 transition-all"
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
            <AnimatePresence>
              {(searchTerm || location !== "All" || salary !== "All" || type !== "All") && (
                <motion.div 
                  className="mt-4 flex justify-end"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Button 
                    onClick={clearFilters} 
                    variant="outline" 
                    className="text-purple-600 border-purple-300 hover:bg-purple-50 text-sm"
                  >
                    Clear Filters
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-lg text-gray-700">
            Found <span className="font-bold text-pink-600">{filteredJobs.length}</span> opportunities for rural empowerment
          </p>
        </motion.div>

        {/* Job Cards */}
        <AnimatePresence mode="wait">
          {filteredJobs.length > 0 ? (
            <motion.div 
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: { 
                  transition: { 
                    staggerChildren: 0.1 
                  } 
                },
                hidden: {}
              }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                  }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <Card className="overflow-hidden bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
                    <div className="h-2 bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400"></div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h2 className="text-xl font-bold text-gray-800">{job.title}</h2>
                        <Badge variant="outline" className={`${
                          job.type === 'Internship' 
                            ? 'border-pink-300 text-pink-600 bg-pink-50' 
                            : job.type === 'Part-time'
                            ? 'border-blue-300 text-blue-600 bg-blue-50'
                            : 'border-purple-300 text-purple-600 bg-purple-50'
                        }`}>
                          {job.type}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-700 font-medium">{job.company}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <CreditCard className="w-4 h-4 mr-1" />
                          {job.salary}
                        </div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button 
                            variant="default" 
                            className="w-full mt-4 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg rounded-lg"
                            onClick={() => handleApply(job)}
                          >
                            Apply Now
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="text-center p-12 bg-white rounded-2xl shadow-lg"
            >
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">No opportunities found</h3>
              <p className="text-gray-500">Try adjusting your search filters</p>
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="mt-4"
              >
                <Button 
                  onClick={clearFilters} 
                  className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 text-white rounded-lg hover:opacity-90 shadow-md hover:shadow-lg"
                >
                  Clear All Filters
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Apply Dialog */}
        <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl bg-white">
            <motion.div 
              className="h-2 bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5 }}
            ></motion.div>
            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-pink-600">Apply for {selectedJob?.title}</DialogTitle>
                <div className="flex items-center text-gray-500 mt-1">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {selectedJob?.company} • {selectedJob?.location}
                </div>
              </DialogHeader>
              <form onSubmit={submitApplication} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <Input
                    placeholder="Enter your full name"
                    value={application.name}
                    onChange={(e) => setApplication({ ...application, name: e.target.value })}
                    required
                    className="rounded-lg border-pink-200 focus-visible:ring-pink-400"
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
                    className="rounded-lg border-pink-200 focus-visible:ring-pink-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Resume Link</label>
                  <Input
                    placeholder="https://drive.google.com/..."
                    value={application.resume}
                    onChange={(e) => setApplication({ ...application, resume: e.target.value })}
                    required
                    className="rounded-lg border-pink-200 focus-visible:ring-pink-400"
                  />
                  <p className="text-xs text-gray-500">Link to your resume on Drive, Dropbox, etc.</p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full mt-6 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 text-white hover:opacity-90 transition-all py-2 rounded-lg shadow-md hover:shadow-lg"
                  >
                    Submit Application
                  </Button>
                </motion.div>
              </form>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </motion.div>
  );
};

export default CareerPage;